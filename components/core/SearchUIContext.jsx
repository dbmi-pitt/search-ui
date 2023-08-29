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
        const includes = filter.values.includes(value)
        return includes
    }

    function addFilter(field, value) {
        const facets = driver.searchQuery.facets || {}
        const facet = facets[field]
        if (!facet) return
        driver.actions.addFilter(field, value, facet.filterType)
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
    function removeFilter(field, value) {
        const facets = driver.searchQuery.facets || {}
        const facet = facets[field]
        if (!facet) return
        driver.actions.removeFilter(field, value, facet.filterType)
    }

    /**
     * Remove all filter values associated with a given field
     * @param  {string} field The facet field
     */
    function removeFiltersForField(field) {
        const filter = getFilter(field)
        if (!filter) return
        filter.values.forEach((value) => {
            removeFilter(field, value)
        })
    }

    function setFilter(field, value) {
        const facets = driver.searchQuery.facets || {}
        const facet = facets[field]
        if (!facet) return
        driver.actions.setFilter(field, value, facet.filterType)
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
                filters,
                getFilter,
                filterExists,
                addFilter,
                removeFilter,
                removeFiltersForField,
                setFilter,
                aggregations,
                isFacetExpanded,
                setFacetExpanded,
                a11yNotify: driver.a11yNotify
            }}
        >
            {children}
        </SearchUIContext.Provider>
    )
}

export default SearchUIContext
