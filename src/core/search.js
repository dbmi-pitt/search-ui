import esb from 'elastic-builder'

/**
 * @typedef {import('../types').Config} Config
 * @typedef {import('../types').Filter} Filter
 * @typedef {import('../types').SearchParams} SearchParams
 * @typedef {import('../types').SearchResponse} SearchResponse
 * @typedef {import('../types').SortConfig} SortConfig
 */

/**
 * Executes a search query with the given filters, configuration, and parameters.
 *
 * @param {Filter[]} filters - An array of filters to apply to the search query.
 * @param {Config} config - Configuration object containing connection details.
 * @param {SearchParams} params - Parameters for the search query including sorting, starting index, and size.
 * @returns {Promise<SearchResponse>} - A promise that resolves to the response of the search query.
 */
export async function executeSearch(filters, config, params) {
    const body = createSearchBody(filters, config, params)

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
 * Creates the search body for a search request.
 *
 * @param {Filter[]} filters - An array of filter objects to apply to the search.
 * @param {Config} config - The configuration object containing connection details.
 * @param {SearchParams} params - The search parameters to include in the request.
 * @returns {string} The search body as a JSON string.
 */
function createSearchBody(filters, config, params) {
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
        const included = mapFilters(config.include)
        query = query.must(included)
    } else {
        query = query.must(esb.matchAllQuery())
    }

    // Exclude
    if (config.exclude && config.exclude.length > 0) {
        const excluded = mapFilters(config.exclude)
        query = query.mustNot(excluded)
    }

    // Aggregations
    let aggs = undefined
    if (config.facets) {
        aggs = []
        for (const facet of config.facets) {
            if (facet.aggregation) {
                // Check if facet is active
                const isActive =
                    (typeof facet.aggregation.isActive === 'function'
                        ? facet.aggregation.isActive(filters)
                        : facet.aggregation.isActive) ?? true
                if (!isActive) {
                    continue
                }

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

    body = body.from(params.from)
    body = body.size(params.size)
    if (params.sort) {
        const sort = esb.sort(params.sort.field, params.sort.order)
        body = body.sort(sort)
    }

    if (config.trackTotalHits) {
        body = body.trackTotalHits(config.trackTotalHits)
    }

    console.log('Search body created in', performance.now() - start, 'ms')

    return JSON.stringify(body.toJSON(), null, 2)
}

/**
 * Maps an array of filters to an array of Elasticsearch queries.
 *
 * @param {Filter[]} filters - The array of filters to map.
 * @returns {esb.Query[]} The array of mapped Elasticsearch queries.
 */
function mapFilters(filters) {
    const f = Array(filters.length)
    for (let i = 0; i < filters.length; i++) {
        f[i] = mapFilter(filters[i])
    }
    return f
}

/**
 * Maps a single filter to an Elasticsearch query.
 *
 * @param {Filter} filter - The filter to map.
 * @returns {esb.Query} The mapped Elasticsearch query.
 */
function mapFilter(filter) {
    switch (filter.type) {
        case 'term':
            const termFilter = filter
            return esb.termQuery(termFilter.field, termFilter.value)

        case 'exists':
            return esb.existsQuery(filter.field)

        case 'range':
        case 'histogram':
            const rangeFilter = filter
            const rangeQuery = esb.rangeQuery(rangeFilter.field)
            if (rangeFilter.gte !== undefined) {
                rangeQuery.gte(rangeFilter.gte)
            }
            if (rangeFilter.lte !== undefined) {
                rangeQuery.lte(rangeFilter.lte)
            }
            return rangeQuery
    }
}
