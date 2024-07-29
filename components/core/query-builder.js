import { ExistsQuery, TermQuery, RangeQuery } from 'elastic-builder'

// Aggregations

/**
 * @typedef {TermAggregation | HistogramAggregation} Aggregation
 */

/**
 * @typedef {Object} TermAggregation
 * @property {"term"} type - The type of aggregation
 * @property {number} [size] - The optional number of terms to return
 */

/**
 * @typedef {Object} HistogramAggregation
 * @property {"histogram"} type - The type of aggregation
 * @property {count} [interval] - The optional interval to use for the histogram
 */

// Filters

/**
 * @typedef {TermFilter | ExistsFilter | RangeFilter | HistogramFilter} Filter
 */

/**
 * @typedef {Object} TermFilter
 * @property {"term"} type - The type of filter
 * @property {string} field - The field to filter on
 * @property {string} value - The value to filter by
 */

/**
 * @typedef {Object} ExistsFilter
 * @property {"exists"} type - The type of filter
 * @property {string} field - The field to check for existence
 */

/**
 * @typedef {Object} RangeFilter
 * @property {"range"} type - The type of filter
 * @property {string} field - The field to filter on
 * @property {number} [gte] - The optional greater than or equal value
 * @property {number} [lte] - The optional less than or equal value
 */

/**
 * @typedef {Object} HistogramFilter
 * @property {"histogram"} type - The type of filter
 * @property {string} field - The field to filter on
 * @property {number} [gte] - The optional greater than or equal value
 * @property {number} [lte] - The optional less than or equal value
 */

/**
 * @typedef {Object} FacetConfig
 * @property {string} label
 * @property {string} name
 * @property {string} field
 * @property {FacetType} type
 * @property {Aggregation} [aggregation]
 */

/**
 * @typedef {Object} SortConfig
 * @property {string} field
 * @property {"asc" | "desc"} order
 */

/**
 * @typedef {Object} ConnectionConfig
 * @property {string} url
 * @property {(() => (string | undefined)) | string} [token]
 */

/**
 * @typedef {Object} Config
 * @property {FacetConfig[]} [facets]
 * @property {Filter[]} [include]
 * @property {Filter[]} [exclude]
 * @property {string[]} [sourceFields]
 * @property {SortConfig} [sort]
 * @property {number} [from]
 * @property {number} [size]
 * @property {boolean} [trackTotalHits]
 * @property {ConnectionConfig} connection
 */

/**
 * Executes a search query with the given filters and configuration.
 *
 * @param {Filter[]} filters - An array of filters to apply to the search.
 * @param {Config} config - The configuration object for the search.
 * @returns {Promise<SearchResponse>} - A promise that resolves to the search response.
 */
export async function executeSearch(filters, config) {
    const body = createSearchBody(filters, config)

    const token =
        typeof config.connection.token === 'function'
            ? config.connection.token()
            : config.connection.token

    const headers = new Headers()
    headers.append('Content-Type', 'application/json')
    if (token) {
        headers.append('Authorization', `Bearer ${token}`)
    }

    const response = await fetch(config.connection.url, {
        method: 'POST',
        headers: headers,
        body
    })
    return response.json()
}

/**
 * Creates the search body payload with the given filters and configuration.
 *
 * @param {Filter[]} filters - An array of filters to apply to the search.
 * @param {Config} config - The configuration object for the search.
 * @returns {string} - The JSON string search body payload.
 */
export function createSearchBody(filters, config) {
    const start = performance.now()

    // Filters
    let queryFilters = undefined
    let postFilters = undefined

    if (filters.length > 0) {
        queryFilters = []
        postFilters = []
        for (const filter of filters) {
            if (filter.type === 'histogram') {
                postFilters.push(mapFilter(filter))
            } else {
                queryFilters.push(mapFilter(filter))
            }
        }
    }

    // Query
    let query = esb.boolQuery()
    if (queryFilters && queryFilters.length > 0) {
        query = query.filter(queryFilters)
    }

    // Include
    if (config.include && config.include.length > 0) {
        const f = mapFilters(config.include)
        query = query.must(f)
    } else {
        query = query.must(esb.matchAllQuery())
    }

    // Exclude
    if (config.exclude && config.exclude.length > 0) {
        const f = mapFilters(config.exclude)
        query = query.mustNot(f)
    }

    // Aggregations
    let aggs = undefined
    if (config.facets) {
        aggs = []
        for (const facet of config.facets) {
            if (facet.aggregation) {
                switch (facet.aggregation?.type) {
                    case 'term':
                        const termAgg = esb.termsAggregation(
                            facet.name,
                            facet.field
                        )
                        if (facet.aggregation.size !== undefined) {
                            termAgg.size(facet.aggregation.size)
                        }

                        if (postFilters && postFilters.length > 0) {
                            const f = esb
                                .filtersAggregation(facet.name)
                                .filters(postFilters)
                                .agg(termAgg)
                            aggs.push(f)
                        } else {
                            aggs.push(termAgg)
                        }
                        break

                    case 'histogram':
                        const histAgg = esb.histogramAggregation(
                            facet.name,
                            facet.field,
                            facet.aggregation.interval
                        )
                        aggs.push(histAgg)
                        break
                }
            }
        }
    }

    let body = esb.requestBodySearch().query(query)

    if (postFilters && postFilters.length > 0) {
        const postQuery = esb.boolQuery().filter(postFilters)
        body = body.postFilter(postQuery)
    }

    if (aggs) {
        body = body.aggregations(aggs)
    }
    if (config.sourceFields) {
        body = body.source(config.sourceFields)
    }
    if (config.from) {
        body = body.from(config.from)
    }
    if (config.size) {
        body = body.size(config.size)
    }
    if (config.trackTotalHits) {
        body = body.trackTotalHits(config.trackTotalHits)
    }
    if (config.sort) {
        const sort = esb.sort(config.sort.field, config.sort.order)
        body = body.sort(sort)
    }

    console.log('Search body created in', performance.now() - start, 'ms')

    return JSON.stringify(body.toJSON(), null, 2)
}

/**
 * Maps an array of filters to an array of Elasticsearch queries.
 *
 * @param {Filter[]} filters - An array of filters to map.
 * @returns {esb.Query[]} - An array of Elasticsearch queries.
 */
function mapFilters(filters) {
    const f = Array < esb.Query > filters.length
    for (let i = 0; i < filters.length; i++) {
        f[i] = mapFilter(filters[i])
    }
    return f
}

/**
 * Maps a single filter to an Elasticsearch query.
 *
 * @param {Filter} filter - The filter to map.
 * @returns {esb.Query} - The corresponding Elasticsearch query.
 */
function mapFilter(filter) {
    switch (filter.type) {
        case 'term':
            return esb.termQuery(filter.field, filter.value)

        case 'exists':
            return esb.existsQuery(filter.field)

        case 'range':
        case 'histogram':
            const rangeQuery = esb.rangeQuery(filter.field)
            if (filter.gte !== undefined) {
                rangeQuery.gte(filter.gte)
            }
            if (filter.lte !== undefined) {
                rangeQuery.lte(filter.lte)
            }
            return rangeQuery
    }
}
