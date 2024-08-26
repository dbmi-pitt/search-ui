import React, { createContext, useContext, useEffect, useState } from 'react'
import { executeSearch } from '../core/search'

/**
 * @typedef {import('../types').AggregationBucket} AggregationBucket
 * @typedef {import('../types').AuthenticationState} AuthenticationState
 * @typedef {import('../types').Config} Config
 * @typedef {import('../types').FacetConfig} FacetConfig
 * @typedef {import('../types').Filter} Filter
 * @typedef {import('../types').SearchParams} SearchParams
 * @typedef {import('../types').SearchResponse} SearchResponse
 * @typedef {import('../types').SortConfig} SortConfig
 */

/**
 * @typedef {Object} SearchUIContent
 * @property {Config} config
 * @property {Record<string, FacetConfig>} facetConfig
 * @property {AuthenticationState} authentication
 * @property {boolean} initialized
 * @property {boolean} loading
 * @property {Record<string, Filter>} filters
 * @property {Record<string, AggregationBucket[]>} aggregations
 * @property {Record<string, any>[]} hits
 * @property {SearchUIOutputState} results
 * @property {number} totalHits
 * @property {SortConfig} [sort]
 * @property {number} pageNumber
 * @property {number} pageSize
 * @property {string} [searchTerm]
 * @property {(name: string) => Filter | undefined} getFilter
 * @property {(name: string) => boolean} hasFilter
 * @property {(filter: Filter) => void} addFilter
 * @property {(name: string) => void} removeFilter
 * @property {() => void} clearFilters
 * @property {(sortConfig: SortConfig) => void} setSort
 * @property {(page: number) => void} setPageNumber
 * @property {(size: number) => void} setPageSize
 * @property {(term: string) => void} setSearchTerm
 * @property {(clearFilters?: boolean) => void} clearSearchTerm
 */

/**
 * Context for managing the state and behavior of the search UI.
 *
 * @type {React.Context<SearchUIContent | undefined>}
 */
const SearchUIContext = createContext(undefined)

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

/**
 * @typedef {Object} SearchUIInputState
 * @property {Record<string, Filter>} filters
 * @property {number} pageNumber
 * @property {number} pageSize
 * @property {string | undefined} searchTerm
 * @property {SortConfig | undefined} sort
 */

/**
 * @typedef {Object} SearchUIOutputState
 * @property {Record<string, AggregationBucket[]>} aggregations
 * @property {Record<string, any>[]} hits
 * @property {number} totalHits
 */

/**
 * Provider component for the SearchUIContext.
 *
 * @param {Object} props - The properties object.
 * @param {Config} props.config - The configuration object for the search UI.
 * @param {AuthenticationState} props.authentication- Indicates if the user is authenticated and authorized.
 * @param {React.ReactNode} props.children - The child components to be wrapped by the provider.
 *
 * @returns {JSX.Element} The provider component that wraps its children with the SearchUIContext.
 */
export function SearchUIProvider({ config, authentication, children }) {
    const facetConfig = createFacetConfig(config)

    const [initialized, setInitialized] = useState(false)
    const [loading, setLoading] = useState(false)

    /**
     * State variable for managing the search UI state.
     * @type {[SearchUIInputState, React.Dispatch<React.SetStateAction<SearchUIInputState>>]}
     */
    const [inputState, setInputState] = useState({
        filters: config.initial?.filters ?? {},
        pageNumber: config.initial?.pageNumber ?? 1,
        pageSize: config.initial?.pageSize ?? 10,
        searchTerm: undefined,
        sort: config.initial?.sort
    })

    /**
     * State variable for managing the search UI data.
     * @type {[SearchUIOutputState, React.Dispatch<React.SetStateAction<SearchUIOutputState>>]}
     */
    const [outputState, setOutputState] = useState({
        aggregations: {},
        hits: [],
        totalHits: 0
    })

    useEffect(() => {
        searchWithCurrentState()
        if (config.onStateChange) {
            config.onStateChange({
                filters: inputState.filters,
                pageNumber: inputState.pageNumber,
                pageSize: inputState.pageSize,
                searchTerm: inputState.searchTerm,
                sort: inputState.sort
            })
        }
    }, [inputState])

    /**
     * Gets the filter by name.
     * @param {string} name - The name of the filter.
     * @returns {Filter | undefined} The filter value.
     */
    function getFilter(name) {
        return inputState.filters[name]
    }

    /**
     * Checks if a filter exists.
     * @param {string} name - The name of the filter.
     * @returns {boolean} True if the filter exists, false otherwise.
     */
    function hasFilter(name) {
        return inputState.filters.hasOwnProperty(name)
    }

    /**
     * Adds a filter.
     * @param {Filter} filter - The value of the filter.
     */
    function addFilter(filter) {
        const newFilters = { ...inputState.filters, [filter.name]: filter }
        setInputState({ ...inputState, filters: newFilters })
    }

    /**
     * Removes a filter.
     * @param {string} name - The name of the filter to remove.
     */
    function removeFilter(name) {
        if (!hasFilter(name)) return
        const newFilters = { ...inputState.filters }
        delete newFilters[name]

        for (const filter of Object.values(newFilters)) {
            const facet = facetConfig[filter.name]

            if (facet?.type === 'term' || facet?.type === 'histogram') {
                let isActive = true
                if (Array.isArray(facet.aggregation.isActive)) {
                    // Array of functions
                    isActive = facet.aggregation.isActive.some((f) =>
                        f(newFilters, authentication)
                    )
                } else if (typeof facet.aggregation.isActive === 'function') {
                    // Function
                    isActive = facet.aggregation.isActive(
                        newFilters,
                        authentication
                    )
                } else {
                    // Boolean
                    isActive = facet.aggregation.isActive
                }
                if (!isActive) {
                    delete newFilters[filter.name]
                }
            }
        }

        setInputState({ ...inputState, filters: newFilters })
    }

    /**
     * Clears all filters.
     */
    function clearFilters() {
        setInputState({ ...inputState, filters: {} })
    }

    /**
     * Sets the sort configuration.
     * @param {Object} sortConfig - The configuration for sorting.
     */
    function setSort(sortConfig) {
        setInputState({ ...inputState, sort: sortConfig })
    }

    /**
     * Sets the current page number.
     * @param {number} page - The page number to set.
     */
    function setPageNumber(page) {
        setInputState({ ...inputState, pageNumber: page })
    }

    /**
     * Sets the number of items per page.
     * @param {number} size - The number of items per page.
     */
    function setPageSize(size) {
        setInputState({ ...inputState, pageSize: size })
    }

    /**
     * Initiates a search using the provided search term.
     * @param {string} term - The search term to use.
     */
    function setSearchTerm(term) {
        if (term === inputState.searchTerm) return
        if (term === '') {
            clearSearchTerm()
            return
        }
        setInputState({
            ...inputState,
            searchTerm: term,
            filters: {},
            sort: undefined
        })
    }

    /**
     * Clears the search term.
     * @param {boolean} [clearFilters=false] - Whether to clear the filters as well.
     */
    function clearSearchTerm(clearFilters = false) {
        if (inputState.searchTerm === undefined) {
            if (clearFilters && Object.keys(inputState.filters).length > 0) {
                setInputState({ ...inputState, filters: {} })
            }
            return
        }
        setInputState({
            ...inputState,
            filters: clearFilters ? {} : inputState.filters,
            searchTerm: undefined,
            sort: config.initial?.sort
        })
    }

    /**
     * Creates a facet configuration object.
     * @param {Config} config - The configuration object.
     * @returns {Record<string, FacetConfig>} The facet configuration object.
     */
    function createFacetConfig(config) {
        /** @type {Record<string, FacetConfig>} */
        const facetConfig = {}
        for (const facet of config.facets) {
            facetConfig[facet.name] = facet
        }
        return facetConfig
    }

    /**
     * Initiates a search using the current state of filters, configuration, and pagination.
     *
     * This function collects the current filters, configuration, and pagination details,
     * and then calls the `search` function with these parameters.
     */
    function searchWithCurrentState() {
        search(
            inputState.filters,
            config,
            {
                sort: inputState.sort,
                from: (inputState.pageNumber - 1) * inputState.pageSize,
                size: inputState.pageSize,
                searchTerm: inputState.searchTerm
            },
            authentication
        )
    }

    /**
     * Executes a search with the provided filters, configuration, and search parameters.
     *
     * @param {Record<string, Filter>} filters - Filter objects to apply to the search.
     * @param {Config} config - The configuration object for the search.
     * @param {SearchParams} params - The search parameters including sort order, pagination details, etc.
     * @param {AuthenticationState} authenticated - Indicates if the user is authenticated and authorized.
     */
    function search(filters, config, params, authenticated) {
        setLoading(true)
        executeSearch(filters, config, params, authenticated)
            .then((res) => {
                /**
                 * @type {Record<string, AggregationBucket[]>}
                 */
                const newAggregations = {}
                for (const [name, agg] of Object.entries(res.aggregations)) {
                    newAggregations[name] = agg.buckets.map((b) => {
                        return {
                            value: b.key,
                            count: b.doc_count
                        }
                    })
                }

                /**
                 * @type {Record<string, any>[]}
                 */
                const newHits = Array(res.hits.hits.length)
                for (let i = 0; i < res.hits.hits.length; i++) {
                    newHits[i] = res.hits.hits[i]._source
                }
                const numberOfHits = res.hits.total?.value ?? newHits.length

                setLoading(false)
                setOutputState({
                    ...outputState,
                    aggregations: newAggregations,
                    hits: newHits,
                    totalHits: numberOfHits
                })
                setInitialized(true)
                if (config.trackUrlState ?? false) {
                    // TODO: Update URL with filters, sort, page, etc.
                }
            })
            .catch((error) => {
                console.error(error)
                setLoading(false)
            })
    }

    return (
        <SearchUIContext.Provider
            value={{
                config: config,
                facetConfig: facetConfig,
                authentication: authentication,
                initialized: initialized,
                loading: loading,
                filters: inputState.filters,
                aggregations: outputState.aggregations,
                hits: outputState.hits,
                totalHits: outputState.totalHits,
                results: outputState,
                sort: inputState.sort,
                pageNumber: inputState.pageNumber,
                pageSize: inputState.pageSize,
                searchTerm: inputState.searchTerm,
                getFilter,
                hasFilter,
                addFilter,
                removeFilter,
                clearFilters,
                setSort,
                setPageNumber,
                setPageSize,
                setSearchTerm,
                clearSearchTerm
            }}
        >
            {children}
        </SearchUIContext.Provider>
    )
}

export default SearchUIProvider
