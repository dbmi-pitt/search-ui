import React, { createContext, useContext, useEffect, useState } from 'react'
import { executeSearch } from '../core/search'

/**
 * @typedef {import('../types').AggregationBucket} AggregationBucket
 * @typedef {import('../types').Config} Config
 * @typedef {import('../types').Filter} Filter
 * @typedef {import('../types').SearchParams} SearchParams
 * @typedef {import('../types').SearchResponse} SearchResponse
 * @typedef {import('../types').SortConfig} SortConfig
 */

/**
 * @typedef {Object} SearchUIContent
 * @property {Config} config
 * @property {boolean} loading
 * @property {Record<string, Filter>} filters
 * @property {Record<string, AggregationBucket[]>} aggregations
 * @property {Record<string, any>[]} hits
 * @property {number} totalHits
 * @property {SortConfig} [sort]
 * @property {number} pageNumber
 * @property {number} pageSize
 * @property {(name: string) => Filter | undefined} getFilter
 * @property {(name: string) => boolean} hasFilter
 * @property {(name: string, filter: Filter) => void} addFilter
 * @property {(filters: Record<string, Filter>) => void} addFilters
 * @property {(name: string) => void} removeFilter
 * @property {(names: string[]) => void} removeFilters
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
 * @typedef {Object} SearchUIState
 * @property {boolean} loading
 * @property {Record<string, Filter>} filters
 * @property {Record<string, AggregationBucket[]>} aggregations
 * @property {Record<string, any>[]} hits
 * @property {number} totalHits
 * @property {SortConfig | undefined} sort
 * @property {number} pageNumber
 * @property {number} pageSize
 * @property {string | undefined} searchTerm
 */

/**
 * Provider component for the SearchUIContext.
 *
 * @param {Object} props - The properties object.
 * @param {Config} props.config - The configuration object for the search UI.
 * @param {React.ReactNode} props.children - The child components to be wrapped by the provider.
 *
 * @returns {JSX.Element} The provider component that wraps its children with the SearchUIContext.
 */
export function SearchUIProvider({ config, children }) {
    /**
     * State variable for managing the search UI state.
     * @type {[SearchUIState, React.Dispatch<React.SetStateAction<SearchUIState>>]}
     */
    const [state, setState] = useState({
        loading: false,
        filters: config.initial?.filters ?? {},
        aggregations: {},
        hits: [],
        totalHits: 0,
        sort: config.initial?.sort,
        pageNumber: config.initial?.pageNumber ?? 1,
        pageSize: config.initial?.pageSize ?? 10,
        searchTerm: undefined
    })

    useEffect(() => {
        searchWithCurrentState()
    }, [state])

    /**
     * Gets the filter by name.
     * @param {string} name - The name of the filter.
     * @returns {Filter | undefined} The filter value.
     */
    function getFilter(name) {
        return state.filters[name]
    }

    /**
     * Checks if a filter exists.
     * @param {string} name - The name of the filter.
     * @returns {boolean} True if the filter exists, false otherwise.
     */
    function hasFilter(name) {
        return state.filters.hasOwnProperty(name)
    }

    /**
     * Adds a filter.
     * @param {string} name - The name of the filter.
     * @param {Filter} filter - The value of the filter.
     */
    function addFilter(name, filter) {
        const newFilters = { ...state.filters, [name]: filter }
        setState({ ...state, filters: newFilters })
    }

    /**
     * Adds multiple filters.
     * @param {Record<string, Filter>} newFilters - An object containing filter names and values.
     */
    function addFilters(newFilters) {
        const mergedFilters = { ...state.filters, ...newFilters }
        setState({ ...state, filters: mergedFilters })
    }

    /**
     * Removes a filter.
     * @param {string} name - The name of the filter to remove.
     */
    function removeFilter(name) {
        if (!hasFilter(name)) return
        const newFilters = { ...state.filters }
        delete newFilters[name]
        setState({ ...state, filters: newFilters })
    }

    /**
     * Removes multiple filters.
     * @param {string[]} names - An array of filter names to remove.
     */
    function removeFilters(names) {
        const newFilters = { ...state.filters }
        for (const name of names) {
            delete newFilters[name]
        }
        setState({ ...state, filters: newFilters })
    }

    /**
     * Clears all filters.
     */
    function clearFilters() {
        setState({ ...state, filters: {} })
    }

    /**
     * Sets the sort configuration.
     * @param {Object} sortConfig - The configuration for sorting.
     */
    function setSort(sortConfig) {
        setState({ ...state, sort: sortConfig })
    }

    /**
     * Sets the current page number.
     * @param {number} page - The page number to set.
     */
    function setPageNumber(page) {
        setState({ ...state, pageNumber: page })
    }

    /**
     * Sets the number of items per page.
     * @param {number} size - The number of items per page.
     */
    function setPageSize(size) {
        setState({ ...state, pageSize: size })
    }

    /**
     * Initiates a search using the provided search term.
     * @param {string} term - The search term to use.
     */
    function setSearchTerm(term) {
        setState({ ...state, searchTerm: term, filters: {}, sort: undefined })
    }

    /**
     * Clears the search term.
     * @param {boolean} [clearFilters=false] - Whether to clear the filters as well.
     */
    function clearSearchTerm(clearFilters = false) {
        setState({
            ...state,
            filters: clearFilters ? {} : state.filters,
            searchTerm: undefined,
            sort: config.initial?.sort
        })
    }

    /**
     * Initiates a search using the current state of filters, configuration, and pagination.
     *
     * This function collects the current filters, configuration, and pagination details,
     * and then calls the `search` function with these parameters.
     */
    function searchWithCurrentState() {
        search(Object.values(state.filters), config, {
            sort: state.sort,
            from: (state.pageNumber - 1) * state.pageSize,
            size: state.pageSize,
            searchTerm: state.searchTerm
        })
    }

    /**
     * Executes a search with the provided filters, configuration, and search parameters.
     *
     * @param {Filter[]} filters - An array of filter objects to apply to the search.
     * @param {Config} config - The configuration object for the search.
     * @param {SearchParams} params - The search parameters including sort order, pagination details, etc.
     */
    function search(filters, config, params) {
        setState({ ...state, loading: true })
        executeSearch(filters, config, params)
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

                setState({
                    ...state,
                    loading: false,
                    aggregations: newAggregations,
                    hits: newHits,
                    totalHits: numberOfHits
                })
            })
            .catch((error) => {
                console.error(error)
                setState({ ...state, loading: false })
            })
    }

    return (
        <SearchUIContext.Provider
            value={{
                config: config,
                loading: state.loading,
                filters: state.filters,
                aggregations: state.aggregations,
                hits: state.hits,
                totalHits: state.totalHits,
                sort: state.sort,
                pageNumber: state.pageNumber,
                pageSize: state.pageSize,
                getFilter,
                hasFilter,
                addFilter,
                addFilters,
                removeFilter,
                removeFilters,
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
