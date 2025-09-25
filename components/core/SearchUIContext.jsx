import { SearchContext } from '@elastic/react-search-ui'
import { createContext, useContext, useEffect, useState } from 'react'
import { findFacet as utilFindFacet } from '../../lib/search-tools'

const SearchUIContext = createContext()

// Used to check if local storage should be cleared
const LOCAL_SCHEMA_VERSION = 1

/**
 * Retrieves filters from local storage for a given namespace.
 *
 * @param {string} name - The namespace used to retrieve filters from local storage.
 * @returns {Array} - An array of filters retrieved from local storage. Returns an empty array if no filters are found or if the name is not provided.
 */
function getLocalStorageFilters(name) {
    if (!name) return []
    const localFilters =
        JSON.parse(localStorage.getItem(`${name}.filters`)) || []
    if (!Array.isArray(localFilters)) return []
    return localFilters
}

/**
 * Retrieves settings from local storage for a given namespace.
 *
 * @param {string} name - The namespace used to retrieve settings from local storage.
 * @returns {Object} - An object containing settings retrieved from local storage. Returns an empty object if no settings are found or if the name is not provided.
 */
function getLocalStorageSettings(name) {
    if (!name) return {}
    return JSON.parse(localStorage.getItem(`${name}.settings`)) || {}
}

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
 * Hook to use the SearchUIContext.
 *
 * @returns {SearchUIContent} The context value.
 * @throws {Error} If the hook is used outside of a SearchUIProvider.
 */
export function useSearchUIContext() {
    const context = useContext(SearchUIContext)
    if (!context) {
        throw new Error(
            'SearchUIContext must be used within a SearchUIProvider'
        )
    }
    return context
}

export function SearchUIProvider({ name, authState, children }) {
    const { driver } = useContext(SearchContext)
    const [aggregations, setAggregations] = useState({})
    const [stateProps, setStateProps] = useState({})

    useEffect(() => {
        checkLocalStorageSchema()
        if (driver.state.filters && driver.state.filters.length > 0) {
            // Remove any filters that are not in the search config
            for (const filter of driver.state.filters) {
                const facet = findFacet(filter.field)
                if (!facet) {
                    for (const value of filter.values) {
                        removeFilter(filter.field, value)
                    }
                }
            }
            return
        }

        const localFilters = getLocalStorageFilters(name)
        for (const filter of localFilters) {
            // Ignore any filters that are not in the search config
            const facet = findFacet(filter.field)
            if (facet) {
                for (const value of filter.values) {
                    addFilter(filter.field, value)
                }
            }
        }
    }, [])

    useEffect(() => {
        if (driver.state.isLoading) return

        setAggregations(driver.state.rawResponse.aggregations || {})

        if (name) {
            localStorage.setItem(
                `${name}.filters`,
                JSON.stringify(driver.state.filters)
            )
        }
        removeInactiveFacets()
    }, [driver.state])

    function removeInactiveFacets() {
        for (const filter of driver.state.filters) {
            const field = filter.field
            const facet = findFacet(filter.field)
            if (!facet) continue

            let isAggregationActive = true
            if (Array.isArray(facet.isAggregationActive)) {
                // Array of functions
                isAggregationActive = facet.isAggregationActive.some((f) =>
                    f(driver.state.filters, authState)
                )
            } else if (typeof facet.isAggregationActive === 'function') {
                // Function
                isAggregationActive = facet.isAggregationActive(
                    driver.state.filters,
                    authState
                )
            } else if (typeof facet.isAggregationActive === 'boolean') {
                // Boolean
                isAggregationActive = facet.isAggregationActive
            }

            if (!isAggregationActive) {
                for (const value of filter.values) {
                    removeFilter(field, value)
                }
            }
        }
    }

    function clearSearchTerm(shouldClearFilters = true) {
        driver.actions.setSearchTerm('', { shouldClearFilters })
    }

    function addFilter(field, value) {
        const facet = findFacet(field)
        if (!facet) return
        driver.actions.addFilter(field, value, facet?.filterType || 'any')
    }

    function setFilter(field, value) {
        const facet = findFacet(field)
        if (!facet) return
        driver.actions.setFilter(field, value, facet?.filterType || 'any')
    }

    function removeFilter(field, value) {
        const facet = findFacet(field)
        if (!facet) return
        driver.actions.removeFilter(field, value, facet?.filterType || 'any')
    }

    function isFacetExpanded(field) {
        const settings = getLocalStorageSettings(name)
        if (settings.hasOwnProperty(field)) {
            return (
                settings[field].isExpanded ||
                findFacet(field)?.isExpanded ||
                false
            )
        } else {
            return findFacet()?.isExpanded || false
        }
    }

    function setFacetExpanded(field, value) {
        if (!name) return
        const settings = getLocalStorageSettings(name)
        settings[field] = { isExpanded: value }
        localStorage.setItem(`${name}.settings`, JSON.stringify(settings))
    }

    function findFacet(field) {
        return utilFindFacet(field, driver.searchQuery.facets)
    }

    return (
        <SearchUIContext.Provider
            value={{
                authState: authState,
                wasSearched: driver.state.wasSearched,
                isLoading: driver.state.isLoading,
                facetConfig: driver.searchQuery.facets || {},
                filters: driver.state.filters || [],
                aggregations: aggregations,
                rawResponse: driver.state.rawResponse || {},

                clearSearchTerm: clearSearchTerm,
                addFilter,
                setFilter,
                removeFilter,

                isFacetExpanded,
                setFacetExpanded,
                findFacet,
                a11yNotify: driver.a11yNotify,
                pageNumber: driver.state.current,
                setPageNumber: driver.actions.setCurrent,
                pageSize: driver.state.resultsPerPage,
                setPageSize: driver.actions.setResultsPerPage,
                sort: driver.state.sort,
                setSort: driver.actions.setSort,

                stateProps,
                setStateProps
            }}
        >
            {children}
        </SearchUIContext.Provider>
    )
}
