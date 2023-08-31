import { createContext, useContext, useEffect, useState } from 'react'
import { SearchContext } from '@elastic/react-search-ui'

const SearchUIContext = createContext()

// Filter type from SearchContext
//
// value filter
// {
//     field: "entity_type",
//     type: "all",
//     values: ["Dataset"]
// }
//
// range filter
// {
//     field: "created_timestamp",
//     type: "all",
//     values: [
//         { from: 1690156800000, to: 1692921599999, name: "created_timestamp" }
//     ]
// }
//

// Filter type returns from useSearchUI
//
// value filter
// {
//     field: "entity_type",
//     filterType: "all",
//     label: "Entity Type",
//     type: "value",
//     uiType: "checkbox",
//     values: ["Dataset"]
// }
//
// range filter
// {
//     field: "created_timestamp",
//     filterType: "all",
//     label: "Created Timestamp",
//     type: "range",
//     uiType: "date",
//     values: [
//         { from: 1690156800000, to: 1692921599999, name: "created_timestamp" }
//     ]
// }
//

export function SearchUIProvider({ children, name = 'new.entities' }) {
    const { driver } = useContext(SearchContext)

    const [filters, setFilters] = useState(getFilters())
    const [aggregations, setAggregations] = useState({})
    const [wasSearched, setWasSearched] = useState(false)

    const [filterChangeCallbacks, setFilterChangeCallbacks] = useState({})

    useEffect(() => {
        if (driver.state.filters && driver.state.filters.length > 0) return
        const localFilters = getLocalFilters()
        console.log('=====Loading filters from local storage=====', localFilters)
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
        setWasSearched(driver.state.wasSearched)
        localStorage.setItem(`${name}.filters`, JSON.stringify(driver.state.filters))
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

    function getFacets() {
        return driver.searchQuery.facets || {}
    }

    function getConditionalFacets() {
        return driver.searchQuery.conditionalFacets || {}
    }

    function getFacetData() {
        return driver.state.facets
    }

    // Filters

    function registerFilterChangeCallback(field, callback) {
        setFilterChangeCallbacks({ ...filterChangeCallbacks, [field]: callback })
    }

    function unregisterFilterChangeCallback(field) {
        setFilterChangeCallbacks(current => {
            delete current[field]
            return current;
        })
    }

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

    function addFilter(field, value, changedBy) {
        const facets = driver.searchQuery.facets || {}
        const facet = facets[field]
        if (!facet) return
        driver.actions.addFilter(field, value, facet.filterType)
        if (filterChangeCallbacks.hasOwnProperty(field)) {
            filterChangeCallbacks[field](value, changedBy || field)
        }
    }

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
     *
     * @example
     * // Remove the filter value "Dataset" from the "entity_type" facet
     * removeFilter("entity_type", "Dataset")
     *
     * // Remove the range filter value from the "created_timestamp" facet
     * removeFilter("created_timestamp", { from: 1690156800000, to: 1692921599999, name: "created_timestamp" }})
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

    function getLocalFilters() {
        return JSON.parse(localStorage.getItem(`${name}.filters`)) || []
    }

    function getLocalSettings() {
        return JSON.parse(localStorage.getItem(`${name}.settings`)) || {}
    }

    function isFacetExpanded(field) {
        const settings = getLocalSettings()
        if (settings.hasOwnProperty(field)) {
            return settings[field].isExpanded || driver.searchQuery.facets[field].isExpanded
        } else {
            return driver.searchQuery.facets[field].isExpanded
        }
    }

    function setFacetExpanded(field, value) {
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
                wasSearched,
                clearSearchTerm,
                aggregations,
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
