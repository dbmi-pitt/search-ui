import esb from 'elastic-builder';
import log from 'loglevel';

/**
 * @typedef {import('@elastic/search-ui').QueryConfig} QueryConfig
 * @typedef {import('@elastic/search-ui').RequestState} RequestState
 */

// Default number of terms to return for term facets, default value is arbitrary
const DEFAULT_TERM_SIZE = 40

/**
 * Builds an Elasticsearch query based on the provided request, pagination, and query configuration.
 *
 * @param {RequestState} request - The original search request object containing search term, filters, and sort options.
 * @param {QueryConfig} config - The configuration for the query, including fields to search, facets, and other options.
 * @returns {Object} - The constructed Elasticsearch request body object.
 */
export function esQueryBuilder(request, config, authState) {
    const facetConfigs = config.facets;

    // Filters
    let queryFilters = undefined
    let postFilters = undefined

    if (request.filters && request.filters.length > 0) {
        queryFilters = []
        postFilters = []
        for (const filter of request.filters) {
            const facetConfig = facetConfigs[filter.field]
            if (!facetConfig) {
                continue
            }

            const esFilter = mapFilter(filter, facetConfig)
            if (facetConfig.facetType === 'histogram') {
                postFilters.push(esFilter)
            } else {
                queryFilters.push(esFilter)
            }
        }
    }

    // Query
    let query = esb.boolQuery()
    if (queryFilters && queryFilters.length > 0) {
        query = query.filter(queryFilters)
    }

    const hasSearchTerm = request.searchTerm && request.searchTerm.length > 0

    // Include
    let includeQueries = undefined
    if (config.includeFilters && config.includeFilters.length > 0) {
        const includeFilters = config.includeFilters
        const f = Array(includeFilters.length)
        for (let i = 0; i < includeFilters.length; i++) {
            // Only support term filter for now
            f[i] = esb.termsQuery(includeFilters[i].field, includeFilters[i].values)
        }

        if (hasSearchTerm) {
            // wait to apply the filters with the search term
            includeQueries = f
        } else {
            query = query.should(f)
        }
    } else {
        query = query.must(esb.matchAllQuery())
    }

    // Search term
    if (hasSearchTerm) {
        const fields = Object.keys(config.search_fields)
        const search = esb.multiMatchQuery(fields, request.searchTerm)

        if (includeQueries) {
            // If there are include filters, we want to apply them with the search term
            query = query.must([search, esb.boolQuery().should(includeQueries)])
        } else {
            // If no include filters, we just apply the search term
            query = query.must(search)
        }
    }

    // Exclude
    if (config.excludeFilters && config.excludeFilters.length > 0) {
        const excludeFilters = config.excludeFilters
        const f = Array(excludeFilters.length)
        for (let i = 0; i < excludeFilters.length; i++) {
            switch (excludeFilters[i].type) {
                case 'term':
                    f[i] = esb.termsQuery(excludeFilters[i].field, excludeFilters[i].values)
                    break;
                case 'exists':
                    f[i] = esb.existsQuery(excludeFilters[i].field)
                    break;
                default:
                    throw new Error('Unsupported exclude filter type')
            }
        }
        query = query.mustNot(f)
    }

    // Aggregations
    let aggs = undefined
    if (config.facets) {
        aggs = []

        for (const [name, facetConfig] of Object.entries(config.facets)) {
            if (facetConfig.facetType === 'daterange') {
                continue
            }

            // Check if facet is active, default to true
            let isAggregationActive = true
            if (Array.isArray(facetConfig.isAggregationActive)) {
                // Array of functions
                isAggregationActive = facetConfig.isAggregationActive.some((f) => f(request.filters, authState))
            } else if (typeof facetConfig.isAggregationActive === 'function') {
                // Function
                isAggregationActive = facetConfig.isAggregationActive(request.filters, authState)
            } else if (typeof facetConfig.isAggregationActive === 'boolean') {
                // Boolean
                isAggregationActive = facetConfig.isAggregationActive
            }

            if (!isAggregationActive) {
                continue
            }

            switch (facetConfig.facetType) {
                case 'term':
                    // Used for regular term facets
                    const termAgg = esb.termsAggregation(name, facetConfig.field)
                    termAgg.size(facetConfig.aggregationSize ?? DEFAULT_TERM_SIZE)
                    if (postFilters && postFilters.length > 0) {
                        const f = esb.filterAggregation(name)
                            .filter(esb.boolQuery().filter(postFilters))
                            .agg(termAgg)
                        aggs.push(f)
                    } else {
                        aggs.push(termAgg)
                    }
                    break

                case 'hierarchy':
                    // Used for hierarchical term facets
                    if (!facetConfig.groupByField) {
                        throw new Error('groupByField is required for hierarchy facets')
                    }

                    // Primary aggregation
                    const hierAgg = esb.termsAggregation(name, facetConfig.groupByField)
                    hierAgg.size(facetConfig.aggregationSize ?? DEFAULT_TERM_SIZE)

                    // Sub-aggregation
                    const subAgg = esb.termsAggregation("subagg", facetConfig.field)
                    subAgg.size(facetConfig.aggregationSize ?? DEFAULT_TERM_SIZE)

                    hierAgg.agg(subAgg)

                    if (postFilters && postFilters.length > 0) {
                        const f = esb
                            .filtersAggregation(name)
                            .filters(postFilters)
                            .agg(hierAgg)
                        aggs.push(f)
                    } else {
                        aggs.push(hierAgg)
                    }
                    break

                case 'histogram':
                    // interval can be a number, function, or undefined, defaulting to 1
                    let interval = facetConfig.aggregationInterval ?? 1
                    if (typeof interval === 'function') {
                        interval = interval(request.filters)
                    }
                    const histAgg = esb.histogramAggregation(name, facetConfig.field, interval)
                    aggs.push(histAgg)
                    break
            }
        }
    }

    let body = esb.requestBodySearch().query(query)

    if (postFilters && postFilters.length > 0) {
        const post = esb.boolQuery().filter(postFilters)
        body = body.postFilter(post)
    }

    if (aggs) {
        body = body.aggregations(aggs)
    }
    if (config.source_fields) {
        body = body.source({'includes': config.source_fields})
    }

    body = body.from((request.current - 1) * request.resultsPerPage)
    body = body.size(request.resultsPerPage)
    if (request.sortList && request.sortList.length > 0) {
        for (const sortConfig of request.sortList) {
            const sort = esb.sort(sortConfig.field, sortConfig.direction)
            body = body.sort(sort)
        }
    }

    body = body.trackTotalHits(config.trackTotalHits)

    return body.toJSON()
}

/**
 * Maps a single filter to an Elasticsearch query.
 *
 * @param {Filter} filter - The filter to map.
 * @returns {esb.Query} The mapped Elasticsearch query.
 */
function mapFilter(filter, facetConfig) {
    switch (facetConfig.facetType) {
        case 'term':
        case 'hierarchy':
            return esb.termsQuery(facetConfig.field, filter.values)

        case 'exists':
            return esb.existsQuery(facetConfig.field)

        case 'daterange':
        case 'histogram':
            const rangeQuery = esb.rangeQuery(facetConfig.field)
            const values = filter.values;
            for (const value of values) {
                if (value.from === undefined && value.to === undefined) {
                    continue
                }
                if (value.from) {
                    rangeQuery.gte(value.from)
                }
                if (value.to) {
                    rangeQuery.lte(value.to)
                }
            }
            return rangeQuery
    }
}

// just performs a simple ES search with a field
export function simple_query_builder(field, query, includeProperties=[], excludeProperties=[]) {
    log.info(field, query)
    let requestBody = esb.requestBodySearch();
    requestBody.query(
            esb.boolQuery()
                .must(esb.matchQuery(field, query))
        )

    if (includeProperties) {
        requestBody.source({'includes': includeProperties})
    }

    if (excludeProperties) {
        requestBody.source({'excludes': excludeProperties})
    }
    log.debug(requestBody.toJSON());
    return requestBody.toJSON();
}

// fixed ES query for UUID
export function uuid_query(uuid) {
    var data = {
        "query": {
            "bool": {
                "must": [],
                "filter": [
                    {
                        "bool": {
                            "should": [
                                {
                                    "match": {
                                        "uuid": uuid
                                    }
                                }
                            ],
                            "minimum_should_match": 1
                        }
                    }
                ],
                "should": [],
                "must_not": []
            }
        }
    }
    return data
}

export class Sui {
    static removeFilter;
    static keyPrefix = 'entities'

    static getKey() {
        return Sui.keyPrefix + '.filters'
    }

    static saveFilters(filters) {
        localStorage.setItem(Sui.getKey(), JSON.stringify(filters))
    }

    static getFilters() {
        let filters = localStorage.getItem(Sui.getKey())
        return filters ? JSON.parse(filters) : {}
    }

    static clearFilters() {
        localStorage.removeItem(Sui.getKey())
    }

    static isExpandedFacetCategory(facet, category) {
        const filters = Sui.getFilters()
        let isExpanded = false
        for (let f in filters) {
            if (filters[f].key === category) {
                isExpanded = true
                break
            }
        }
        return isExpanded || Sui.expandDefault(facet)
    }

    static isExpandedDateCategory(facet, category) {
        const filters = Sui.getFilters()
        const f = filters[category] ?? {}
        return f.isExpanded === true || f.hasOwnProperty("from") || f.hasOwnProperty("to") || Sui.expandDefault(facet)
    }

    static isExpandedNumericCategory(facet, category) {
        const filters = Sui.getFilters()
        const f = filters[category] ?? {}
        return f.isExpanded === true || f.hasOwnProperty("from") || f.hasOwnProperty("to") || Sui.expandDefault(facet)
    }

    static expandDefault(facet) {
        return (facet[1].hasOwnProperty("isExpanded") ? facet[1]["isExpanded"] : true)
    }

    static applyFilters(addFilter, _removeFilter, filters, prefix = 'entities') {
        Sui.keyPrefix = prefix
        Sui.removeFilter = _removeFilter

        // if filters are passed in, then we are loading a page with filters already applied
        if (filters && filters.length > 0) {
            Sui.clearFilters()
            const fs = {}
            for (const filter of filters) {
                for (const value of filter.values) {
                    if (value.from !== undefined || value.to !== undefined) {
                        fs[filter.field] = {isExpanded: true, key: filter.field}
                        if (value.from !== undefined) {
                            fs[filter.field].from = value.from
                        }
                        if (value.to !== undefined) {
                            fs[filter.field].to = value.to
                        }
                    } else {
                        fs[`${filter.field}.${value}`] = {selected: true, key: filter.field}
                    }
                }
            }
            Sui.saveFilters(fs)
        } else {
            const suiFilters = Sui.getFilters()
            for (let f in suiFilters) {
                if (suiFilters[f].from !== undefined || suiFilters[f].to !== undefined) {
                    // Range filter
                    const rangeFilter = {name: suiFilters[f].key}
                    rangeFilter.name = suiFilters[f].key
                    if (suiFilters[f].from !== undefined) {
                        rangeFilter.from = suiFilters[f].from
                    } 
                    if (suiFilters[f].to !== undefined) {
                        rangeFilter.to = suiFilters[f].to
                    }
                    addFilter(suiFilters[f].key, rangeFilter, 'any')
                } else if (suiFilters[f].selected) {
                    // Value filter
                    addFilter(suiFilters[f].key, f.split('.').pop(), 'any');
                }
            }
        }
    }
}
