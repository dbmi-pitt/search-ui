import esb from "elastic-builder";
import log from "loglevel";

/**
 * @typedef {import('@elastic/search-ui').QueryConfig} QueryConfig
 * @typedef {import('@elastic/search-ui').RequestState} RequestState
 */

/**
 * Builds an Elasticsearch query based on the provided request, pagination, and query configuration.
 *
 * @param {RequestState} request - The original search request object containing search term, filters, and sort options.
 * @param {QueryConfig} queryConfig - The configuration for the query, including fields to search, facets, and other options.
 * @returns {Object} - The constructed Elasticsearch request body object.
 */
export function es_query_builder(request, queryConfig) {
    const from = request.current
    const size = request.resultsPerPage

    let query = request.searchTerm
    let CURRENT = from - 1 //request.current
    let SIZE = size
    let SOURCE_FIELDS = queryConfig.source_fields
    let SEARCHABLE_FIELDS = Object.keys(queryConfig.search_fields)
    let FACETS = Object.entries(queryConfig.facets)
    let GROUP_BY = queryConfig.groupBy
    let EXCLUDE_FILTERS = queryConfig.excludeFilters
    let INCLUDE_FILTERS = queryConfig.includeFilters
    let DISJUNCTIVE_FACETS = queryConfig.disjunctiveFacets
    let RESULT_FIELDS = []
    try {
        RESULT_FIELDS = Object.keys(queryConfig.result_fields)
    } catch {

    }
    let FILTERS = Object.entries(request.filters)
    let SORT_FIELDS = request.sortList

    log.info('FILTERS', FILTERS)

    let requestBody = esb.requestBodySearch();
    let boolQuery = esb.boolQuery();

    if (query.length > 0 && query != "*") {
        boolQuery.must(esb.multiMatchQuery(SEARCHABLE_FIELDS, query));
        // Remove default sorting when a user is searching for something using the input search bar
        SORT_FIELDS = []
    } else {
        boolQuery.must(esb.matchAllQuery());
    }

    if (EXCLUDE_FILTERS) {
        EXCLUDE_FILTERS.forEach(exclude_filter => {
            if (Array.isArray(exclude_filter['value'])) {
                exclude_filter['value'].forEach(exclude_filter_subfilter => {
                    boolQuery.mustNot(esb.termQuery(exclude_filter['keyword'], exclude_filter_subfilter))
                })
            } else {
                boolQuery.mustNot(esb.termQuery(exclude_filter['keyword'], exclude_filter['value']))
            }
        });
    }
    // We need to hid previous versions of published entities from the main search page
    boolQuery.mustNot(esb.existsQuery("next_revision_uuid"))

    if (INCLUDE_FILTERS) {
        INCLUDE_FILTERS.forEach(include_filter => {
            boolQuery.should((esb.termQuery(include_filter['keyword'], include_filter['value'])))
        });
        boolQuery.minimumShouldMatch(1)
    }

    // get the filters from the request which are the clicked facet list
    let post_filter_agg = null
    const includeExistAggs = {}
    FILTERS.forEach((f) => {
        const values = f[1].values

        const filterBoolQuery = esb.boolQuery();

        values.forEach((v) => {
            const facet_info = checkFilterType(f[1].field, FACETS)
            if (facet_info[1] && facet_info[1]["type"] === 'range') {
                const element = createRangeQuery(v, facet_info)

                // If the field is a disjunctive facet and multiple items are selected we need to wrap those options
                // in a `should` boolean query
                if (values.length > 1) {
                    boolQuery.filter(esb.rangeQuery(f[1].field)
                        .gte(element["from"])
                        .lte(element["to"]))
                } else {
                    post_filter_agg = esb.rangeQuery(f[1].field)
                        .gte(element["from"])
                        .lte(element["to"]);
                    requestBody.postFilter(esb.rangeQuery(f[1].field)
                        .gte(element["from"])
                        .lte(element["to"]))
                }
            } else if (facet_info[1] && facet_info[1]["type"] === 'exists') {
                if (v === "true") {
                    boolQuery.filter(esb.boolQuery().must(esb.existsQuery(f[1].field)))
                } else if (v === "false") {
                    boolQuery.filter(esb.boolQuery().mustNot(esb.existsQuery(f[1].field)))
                }
                includeExistAggs[f[1].field] = [v]
            } else {
                const name = f[1].field
                const field = queryConfig.facets[name].field

                // If the field is a disjunctive facet and multiple items are selected we need to wrap those options
                // in a `should` boolean query
                if (values.length > 1) {
                    filterBoolQuery.should(esb.termQuery(field, v))
                } else {
                    post_filter_agg = esb.termQuery(field, v)
                    boolQuery.filter(esb.termQuery(field, v))
                }
            }
        })
        if (values.length > 1) {
            boolQuery.filter(filterBoolQuery)
        }
    });

    requestBody
        .query(boolQuery)
        .from(CURRENT * SIZE)
        .size(SIZE)
        .trackTotalHits(true)

    // add fields if specified
    if (SOURCE_FIELDS) {
        requestBody.source({'includes': SOURCE_FIELDS})
    }

    // add sort if selected
    SORT_FIELDS.forEach((f) => {
        // log.info(f)
        requestBody.sort(esb.sort(f.field, f.direction).unmappedType('long'));
    })


    // add the aggregations defined for the facets
    let aggregation = []
    FACETS.map((field) => {
        if (field[1].type === "value") {   // normal value aggs
            let termAgg = null
            // Check if the field is listed as a disjunctiveFacet in config, if so add minDocCount(0) so that all buckets
            // (i.e. all possible results for this facet) get returned by the aggregation query
            if (DISJUNCTIVE_FACETS && DISJUNCTIVE_FACETS.includes(field[0])) {
                termAgg = esb.termsAggregation(field[0], field[1].field).minDocCount(0)
            } else if (field[1].groupBy !== undefined) {
                // Create a sub-aggregation for the groupBy field
                termAgg = esb.termsAggregation(field[0], field[1].groupBy).size(40)
                    .agg(esb.termsAggregation("sub_aggs", field[1].field).size(40))
            } else {
                // Set size 40 (default returns only 10) to show more items in the list of faceted search options.
                // We may need to increase this size later
                termAgg = esb.termsAggregation(field[0], field[1].field).size(40)
            }

            if (post_filter_agg != null) {
                aggregation.push(esb.filterAggregation(field[0], post_filter_agg).agg(termAgg))
            } else {
                aggregation.push(termAgg)
            }
        } else if (field[1].type === "exists") {
            const aggValues = includeExistAggs[field[0]] || ["true", "false"]
            let aggs = esb.filtersAggregation(field[1].field)

            if (aggValues.includes("false")) {
                aggs = aggs.filter("false", esb.boolQuery().mustNot(esb.existsQuery(field[1].field)))
            }

            if (aggValues.includes("true")) {
                aggs = aggs.filter("true", esb.boolQuery().must(esb.existsQuery(field[1].field)))
            }

            aggregation.push(aggs)
        } else if (field[1].type === "range") {
            if (field[1]["ranges"]) {
                // aggregate facets that are 'range'
                requestBody.agg(esb.rangeAggregation(field[0], field[0]).ranges([
                    {
                        to: field[1]["ranges"][0]["from"],
                        key: field[1]["ranges"][0]["name"]
                    },
                    {
                        from: field[1]["ranges"][1]["from"],
                        to: field[1]["ranges"][1]["to"],
                        key: field[1]["ranges"][1]["name"]
                    },
                    {
                        from: field[1]["ranges"][2]["from"],
                        key: field[1]["ranges"][2]["name"]
                    }
                ]));
            } else if (field[1]["uiType"] === "daterange") {
                // Don't add any aggregation for date range facets
            } else {
                if (field[1]["uiType"] === "numrange") {
                    const interval = typeof field[1]["uiInterval"] === "function"
                        ? field[1]["uiInterval"](request.filters)
                        : field[1]["uiInterval"]
                    requestBody.agg(esb.histogramAggregation(field[0], field[0], interval ?? 1));
                } else {
                    requestBody.agg(esb.termsAggregation(field[0], field[1].field))
                }
            }
        }
    });

    requestBody.aggregations(aggregation)

    if (GROUP_BY) {
        requestBody.agg(esb.termsAggregation(GROUP_BY, GROUP_BY).size(SIZE).agg(esb.topHitsAggregation('hits').source({includes: SOURCE_FIELDS})))
    }


    // add any defined result_fields from configuration.  if not result_fields
    // is found it just returns all the fields in the index
    if (RESULT_FIELDS.length > 0) {
        requestBody.source(RESULT_FIELDS);
    }

    return requestBody.toJSON();
}

function createRangeQuery(value, facet_info) {
    log.info('createRangeQuery', value, facet_info)

    var RANGES = facet_info[1]["ranges"] ?? []

    log.info('RANGES', RANGES, value)
    var found = RANGES.find(function (element, index) {

        log.info('LOOKING..', element);
        if (element["name"] === value["name"]) {
            log.info("VALUES", element)
            return element
        }
    });
    return found ?? value
}


// returns the filter type of the submitted field against the master facet dictionary
// note: filter (specified on the url) does not contain the type
function checkFilterType(field, facets) {

    var found = facets.find(function (element, index) {

        //log.info(element[0], field);
        if (element[0] === field)
            //return element[1]["type"];
            return element;
    });

    //log.info('YEP ITS HERE', found)
    if (found) {
        //return found[1]["type"]
        return found
    }
    return ""
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
