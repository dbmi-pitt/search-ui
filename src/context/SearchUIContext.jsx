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
     * State variable for loading status.
     *
     * @type {[boolean, React.Dispatch<React.SetStateAction<boolean>>]}
     */
    const [loading, setLoading] = useState(false)

    /**
     * State variable for storing search filters.
     *
     * @type {[Record<string, Filter>, React.Dispatch<React.SetStateAction<Record<string, Filter>>>]}
     * @default {Record<string, Filter>} {}
     */
    const [filters, setFilters] = useState(config.initial?.filters ?? {})

    /**
     * State variable for storing aggregation buckets.
     *
     * @type {[Record<string, AggregationBucket[]>, React.Dispatch<React.SetStateAction<Record<string, AggregationBucket[]>>>]}
     */
    const [aggregations, setAggregations] = useState({})

    /**
     * State variable for storing search hits.
     *
     * @type {[Record<string, any>[], React.Dispatch<React.SetStateAction<Record<string, any>[]>>]}
     */
    const [hits, setHits] = useState([])

    /**
     * State variable for storing the total number of hits.
     *
     * @type {[number, React.Dispatch<React.SetStateAction<number>>]}
     */
    const [totalHits, setTotalHits] = useState(0)

    /**
     * State variable for storing the sort configuration.
     *
     * @type {[SortConfig, React.Dispatch<React.SetStateAction<SortConfig>>]}
     */
    const [sort, setSort] = useState(config.initial?.sort)

    /**
     * State variable for storing the current page number.
     *
     * @type {[number, React.Dispatch<React.SetStateAction<number>>]}
     */
    const [pageNumber, setPageNumber] = useState(
        config.initial?.pageNumber ?? 0
    )

    /**
     * State variable for storing the current page size.
     *
     * @type {[number, React.Dispatch<React.SetStateAction<number>>]}
     */
    const [pageSize, setPageSize] = useState(config.initial?.pageSize ?? 10)

    useEffect(() => {
        searchWithCurrentState()
    }, [filters, sort, pageNumber, pageSize])

    /**
     * Gets the filter by name.
     * @param {string} name - The name of the filter.
     * @returns {Filter | undefined} The filter value.
     */
    function getFilter(name) {
        return filters[name]
    }

    /**
     * Checks if a filter exists.
     * @param {string} name - The name of the filter.
     * @returns {boolean} True if the filter exists, false otherwise.
     */
    function hasFilter(name) {
        return filters.hasOwnProperty(name)
    }

    /**
     * Adds a filter.
     * @param {string} name - The name of the filter.
     * @param {Filter} filter - The value of the filter.
     */
    function addFilter(name, filter) {
        const newFilters = { ...filters, [name]: filter }
        setFilters(newFilters)
    }

    /**
     * Adds multiple filters.
     * @param {Record<string, Filter>} newFilters - An object containing filter names and values.
     */
    function addFilters(newFilters) {
        const mergedFilters = { ...filters, ...newFilters }
        setFilters(mergedFilters)
    }

    /**
     * Removes a filter.
     * @param {string} name - The name of the filter to remove.
     */
    function removeFilter(name) {
        if (!hasFilter(name)) return
        const newFilters = { ...filters }
        delete newFilters[name]
        setFilters(newFilters)
    }

    /**
     * Removes multiple filters.
     * @param {string[]} names - An array of filter names to remove.
     */
    function removeFilters(names) {
        const newFilters = { ...filters }
        for (const name of names) {
            delete newFilters[name]
        }
        setFilters(newFilters)
    }

    /**
     * Clears all filters.
     */
    function clearFilters() {
        setFilters({})
    }

    /**
     * Initiates a search using the current state of filters, configuration, and pagination.
     *
     * This function collects the current filters, configuration, and pagination details,
     * and then calls the `search` function with these parameters.
     */
    function searchWithCurrentState() {
        search(Object.values(filters), config, {
            sort,
            from: pageNumber * pageSize,
            size: pageSize
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
        setLoading(true)
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

                setAggregations(newAggregations)
                setHits(newHits)
                setTotalHits(numberOfHits)
                setLoading(false)
            })
            .catch((error) => {
                console.error(error)
                setLoading(false)
            })
    }

    return (
        <SearchUIContext.Provider
            value={{
                config,
                loading,
                filters,
                aggregations,
                hits,
                totalHits,
                sort,
                pageNumber,
                pageSize,
                getFilter,
                hasFilter,
                addFilter,
                addFilters,
                removeFilter,
                removeFilters,
                clearFilters,
                setSort,
                setPageNumber,
                setPageSize
            }}
        >
            {children}
        </SearchUIContext.Provider>
    )
}

export default SearchUIProvider
