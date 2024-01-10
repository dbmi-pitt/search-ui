import { createContext, useContext, useEffect, useState } from 'react'
import { SearchContext } from '@elastic/react-search-ui'

const SearchUIContext = createContext()

/**
 * Provider to get access to the SearchUIContext
 * @param {string} name The name of the search UI. This is used to namespace local storage. If not provided, local storage will not be used.
 */
export function SearchUIProvider({ name, children }) {
    // Used to check if local storage should be cleared
    const LOCAL_SCHEMA_VERSION = 1

    const { driver } = useContext(SearchContext)

    const [filters, setFilters] = useState(getFilters())
    const [aggregations, setAggregations] = useState({})
    const [rawResponse, setRawResponse] = useState(driver.state.rawResponse)
    const [wasSearched, setWasSearched] = useState(driver.state.wasSearched)

    const [filterChangeCallbacks, setFilterChangeCallbacks] = useState({})

    useEffect(() => {
        checkLocalStorageSchema()
        if (driver.state.filters && driver.state.filters.length > 0) return
        const localFilters = getLocalFilters()
        localFilters.forEach((filter) => {
            filter.values.forEach((value) => {
                addFilter(filter.field, value)
            })
        })
    }, [])

    useEffect(() => {
        if (driver.state.isLoading) return

        setFilters(getFilters())
        setAggregations(driver.state.rawResponse.aggregations || {})
        setRawResponse(driver.state.rawResponse)
        setWasSearched(driver.state.wasSearched)

        if (name) {
            localStorage.setItem(`${name}.filters`, JSON.stringify(driver.state.filters))
        }
        removeInvalidConditionalFacets()
    }, [driver.state])

    function removeInvalidConditionalFacets() {
        const conditionalFacets = driver.searchQuery.conditionalFacets
        const filters = getFilters()
        filters.forEach((filter) => {
            if (conditionalFacets.hasOwnProperty(filter.field)) {
                const predicate = conditionalFacets[filter.field]
                if (!predicate({ filters })) {
                    filter.values.forEach((value) => {
                        removeFilter(filter.field, value)
                    })
                }
            }
        })
    }

    // Facets

    /**
     * Get an object of all facets. Facets are defined in the search config file passed to SearchUIContainer or SearchProvider.
     * @return {object} An object of facet objects.
     */
    function getFacets() {
        return driver.searchQuery.facets || {}
    }

    /**
     * Get an object of all conditional facets. Conditional facets are defined in the search config file passed to SearchUIContainer or SearchProvider.
     * @return {object} An object of conditional facet objects.
     */
    function getConditionalFacets() {
        return driver.searchQuery.conditionalFacets || {}
    }

    /**
     * Get an object of all facet data. Facet data is returned from the search API.
     * @returns {object} An object of facet data objects. See SearchState.facets in @elastic/search-ui for object structure.
     */
    function getFacetData() {
        return driver.state.facets
    }

    // Filters

    /**
     * 
     * @param {string} field The facet field to receive callbacks for
     * @param {function} callback The callback function to be called when a filter value changes
     * Callback function should have the following signature:
     * 
     * See filterExists for value structure. changedBy is the identifier of the calling component.
     * @example
     * (value: (string|object), changedBy: string) => {}
     */
    function registerFilterChangeCallback(field, callback) {
        setFilterChangeCallbacks({ ...filterChangeCallbacks, [field]: callback })
    }

    /**
     * 
     * @param {string} field The facet field to unregister callbacks for
     */
    function unregisterFilterChangeCallback(field) {
        setFilterChangeCallbacks(current => {
            delete current[field]
            return current;
        })
    }

    /**
     * Get an array of all filters
     * @return {Array} An array of filter objects. See getFilter for object structure.
     */
    function getFilters() {
        const facets = driver.searchQuery.facets || {}
        return driver.state.filters.map((filter) => {
            const facet = facets[filter.field]
            return {
                ...filter,
                type: facet.type,
                filterType: facet.filterType,
                label: facet.label,
                uiType: facet.uiType || 'checkbox'
            }
        })
    }

    /**
     * Get an specific filter by field
     * @param  {string} field The facet field
     * @return {object|null} The specific filter or null if doesn't exist
     * 
     * Values filters will have a structure similar to:
     * {
     *     field: "entity_type",
     *     filterType: "all",
     *     label: "Entity Type",
     *     type: "value",
     *     uiType: "checkbox",
     *     values: ["Dataset"]
     * }
     * 
     * Range filters will have a structure similar to:
     * {
     *     field: "created_timestamp",
     *     filterType: "all",
     *     label: "Created Timestamp",
     *     type: "range",
     *     uiType: "date",
     *     values: [
     *         // object will have either from or to; or both
     *         { from: 1690156800000, to: 1692921599999, name: "created_timestamp" }
     *     ]
     * }
     */
    function getFilter(field) {
        const filter = driver.state.filters.find((f) => f.field === field)
        if (!filter) return null
        const facets = driver.searchQuery.facets || {}
        const facet = facets[filter.field]
        return {
            ...filter,
            type: facet.type,
            filterType: facet.filterType,
            label: facet.label,
            uiType: facet.uiType || 'checkbox'
        }
    }

    /**
     * Check if a specific filter value exists for a given field
     * @param  {string} field The facet field
     * @param  {string | object} value The specific filter value to check for
     * 
     * Values filter values should a have structure similar to:
     * "Dataset"
     * 
     * Range filters will have a structure similar to:
     * Object can have either from or to; or both
     * { from: 1690156800000, to: 1692921599999, name: "created_timestamp" }
     */
    function filterExists(field, value) {
        const filter = getFilter(field)
        if (!filter) return false
        let includes = false
        if (filter.type === 'range') {
            // compare range values manually because JavaScript
            includes = filter.values.some((range) => {
                return range.name == value.name && range.from === value.from && range.to === value.to
            })
        } else {
            includes = filter.values.includes(value)
        }
        return includes
    }

    /**
     * Add a specific filter value for a given field 
     * @param  {string} field The facet field
     * @param  {string | object} value The specific filter value to add. See filterExists for object structure.
     * @param  {string} changedBy The identifier of the calling component. This is used for filterChangeCallback.
     * 
     * @example
     * // Add the filter value "Dataset" from the "entity_type" facet
     * addFilter("entity_type", "Dataset", "MyComponent")
     *
     * // Add the range filter value from the "created_timestamp" facet
     * addFilter("created_timestamp", { from: 1690156800000, to: 1692921599999, name: "created_timestamp" }, "MyComponent")
     */
    function addFilter(field, value, changedBy) {
        const facets = driver.searchQuery.facets || {}
        const facet = facets[field]
        if (!facet) return
        driver.actions.addFilter(field, value, facet.filterType)
        if (filterChangeCallbacks.hasOwnProperty(field)) {
            filterChangeCallbacks[field](value, changedBy || field)
        }
    }

    /**
     * Clear the search term and optionally clear all filters
     * @param  {boolean} shouldClearFilters Whether or not to clear all filters (default: true)
     */
    function clearSearchTerm(shouldClearFilters = true) {
        driver.actions.setSearchTerm("", {shouldClearFilters})
        if (!shouldClearFilters) return

        filters.forEach((filter) => {
            if (filterChangeCallbacks.hasOwnProperty(filter.field)) {
                filter.values.forEach((value) => {
                    filterChangeCallbacks[filter.field](value, "clearSearchTerm")
                })
            }
        })
    }

    /**
     * Remove a specific filter value in a given field
     * @param  {string} field The facet field
     * @param  {string} value The filter value to be removed
     * @param  {string} changedBy The identifier of the calling component. This is used for filterChangeCallback.
     *
     * @example
     * // Remove the filter value "Dataset" from the "entity_type" facet
     * removeFilter("entity_type", "Dataset", "MyComponent")
     *
     * // Remove the range filter value from the "created_timestamp" facet
     * removeFilter("created_timestamp", { from: 1690156800000, to: 1692921599999, name: "created_timestamp" }, "MyComponent")
     */
    function removeFilter(field, value, changedBy) {
        const facets = driver.searchQuery.facets || {}
        const facet = facets[field]
        if (!facet) return
        driver.actions.removeFilter(field, value, facet.filterType)
        if (filterChangeCallbacks.hasOwnProperty(field)) {
            filterChangeCallbacks[field](value, changedBy || field)
        }
    }

    /**
     * Remove all filter values associated with a given field
     * @param  {string} field The facet field
     * @param  {string} changedBy The identifier of the calling component. This is used for filterChangeCallback.
     */
    function removeFiltersForField(field, changedBy) {
        const filter = getFilter(field)
        if (!filter) return
        filter.values.forEach((value) => {
            removeFilter(field, value)
        })
        if (filterChangeCallbacks.hasOwnProperty(field)) {
            const value = filter.values[0]
            filterChangeCallbacks[field](value, changedBy || field)
        }
    }

    /**
     * Set a specific filter value in a given field
     * @param  {string} field The facet field
     * @param  {string} value The filter value to be set
     * @param  {string} changedBy The identifier of the calling component. This is used for filterChangeCallback.
     *
     * @example
     * // Set the filter value "Dataset" from the "entity_type" facet
     * setFilter("entity_type", "Dataset", "MyComponent")
     *
     * // Set the range filter value from the "created_timestamp" facet
     * setFilter("created_timestamp", { from: 1690156800000, to: 1692921599999, name: "created_timestamp" }, "MyComponent")
     */
    function setFilter(field, value, changedBy) {
        const facets = driver.searchQuery.facets || {}
        const facet = facets[field]
        if (!facet) return
        driver.actions.setFilter(field, value, facet.filterType)
        if (filterChangeCallbacks.hasOwnProperty(field)) {
            filterChangeCallbacks[field](value, changedBy || field)
        }
    }

    // Local storage functions

    function checkLocalStorageSchema() {
        const schemaVersion = localStorage.getItem('schemaVersion') || 0
        if (schemaVersion < LOCAL_SCHEMA_VERSION) {
            Object.keys(localStorage).forEach((key) => {
                if (key.endsWith('.filters') || key.endsWith('.settings')) {
                    localStorage.removeItem(key)
                }
            })
            localStorage.setItem('schemaVersion', LOCAL_SCHEMA_VERSION)
        }
    }

    /**
     * Get the local filters from local storage in the given namespace
     * @return {Array} An array of ES filter objects. See filterExists for object structures.
     */
    function getLocalFilters() {
        if (!name) return []
        const localFilters = JSON.parse(localStorage.getItem(`${name}.filters`)) || []
        if (!Array.isArray(localFilters)) return []
        return localFilters
    }

    function getLocalSettings() {
        if (!name) return {}
        return JSON.parse(localStorage.getItem(`${name}.settings`)) || {}
    }
    
    /**
     * @param {string} field The facet field
     * @returns {boolean} Whether or not the facet is expanded 
     */
    function isFacetExpanded(field) {
        const settings = getLocalSettings()
        if (settings.hasOwnProperty(field)) {
            return settings[field].isExpanded || driver.searchQuery.facets[field].isExpanded
        } else {
            return driver.searchQuery.facets[field].isExpanded
        }
    }

    /**
     * @param {string} field The facet field
     * @param {boolean} value Whether or not the facet should be expanded
     */
    function setFacetExpanded(field, value) {
        if (!name) return
        const settings = getLocalSettings()
        settings[field] = { isExpanded: value }
        localStorage.setItem(`${name}.settings`, JSON.stringify(settings))
    }

    return (
        <SearchUIContext.Provider
            value={{
                getFacets,
                getConditionalFacets,
                getFacetData,
                registerFilterChangeCallback,
                unregisterFilterChangeCallback,
                filters,
                getFilter,
                filterExists,
                addFilter,
                removeFilter,
                removeFiltersForField,
                setFilter,
                isLoading: driver.state.isLoading,
                wasSearched,
                clearSearchTerm,
                aggregations,
                rawResponse,
                isFacetExpanded,
                setFacetExpanded,
                a11yNotify: driver.a11yNotify,
            }}
        >
            {children}
        </SearchUIContext.Provider>
    )
}

export default SearchUIContext
