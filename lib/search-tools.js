import log from "loglevel";
// Search APIs tools
// uses the elastic-builder to construct an Elasticsearch DSL query
export const esb = require('elastic-builder');

/*
 * Elasticsearch query builder helper
 *
 */
export function es_query_builder(request, from, size, queryConfig) {

    let query = request.searchTerm
    // log.info('searchfields:', queryConfig.search_fields)
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

    //boolQuery.must(esb.matchQuery('description', query));
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

    if (INCLUDE_FILTERS) {
        INCLUDE_FILTERS.forEach(include_filter => {
            boolQuery.should((esb.termQuery(include_filter['keyword'], include_filter['value'])))
        });
        boolQuery.minimumShouldMatch(1)
    }

    // get the filters from the request which are the clicked facet list
    FILTERS.forEach((f) => {
        //log.info(f[1])
        let field = f[1].field + '.keyword'
        let values = f[1].values

        let filterBoolQuery = esb.boolQuery();

        values.forEach((v) => {
            var facet_info = checkFilterType(f[1].field, FACETS)
            if (facet_info[1] && facet_info[1]["type"] === 'range') {
                var element = createRangeQuery(v, facet_info)

                // If the field is a disjunctive facet and multiple items are selected we need to wrap those options
                // in a `should` boolean query
                if (values.length > 1) {
                    filterBoolQuery.should(esb.rangeQuery(f[1].field)
                        .gte(element["from"])
                        .lte(element["to"]))
                } else {
                    boolQuery.filter(esb.rangeQuery(f[1].field)
                        .gte(element["from"])
                        .lte(element["to"]))
                }

            } else {
                // If the field is a disjunctive facet and multiple items are selected we need to wrap those options
                // in a `should` boolean query
                if (values.length > 1) {
                    filterBoolQuery.should(esb.termQuery(field, v))
                } else {
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
    if (SOURCE_FIELDS){
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
            // Check if the field is listed as a disjunctiveFacet in config, if so add minDocCount(0) so that all buckets
            // (i.e. all possible results for this facet) get returned by the aggregation query
            if (DISJUNCTIVE_FACETS && DISJUNCTIVE_FACETS.includes(field[0])) {
                aggregation.push(esb.termsAggregation(field[0], field[1].field).minDocCount(0))
            } else {
                aggregation.push(esb.termsAggregation(field[0], field[1].field))
            }
        } else if (field[1].type === "range" && field[1]["ranges"]) {  
            // aggregate facets that are 'range'
           aggregation.push(esb.rangeAggregation(field[0], field[0]).ranges([
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
        }
    });

    if (GROUP_BY) {
        requestBody.agg(esb.termsAggregation(GROUP_BY, GROUP_BY).agg(esb.topHitsAggregation('hits').source({includes: SOURCE_FIELDS})))
    } else {
        requestBody.aggregations(aggregation)
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
export function simple_query_builder(field, query) {
    log.info(field, query)
    let requestBody = esb.requestBodySearch()
        .query(
            esb.boolQuery()
                .must(esb.matchQuery(field, query))
        )
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

export class Sui  {
    static removeFilter;
    static keyPrefix  = 'entities'

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
        let isExpanded = false
        for (let f in filters) {
            if (f === `${category}.startdate` || f === `${category}.enddate`) {
                isExpanded = true
                break
            }
        }
        return filters[category] || isExpanded || Sui.expandDefault(facet)
    }

    static expandDefault(facet) {
        return (facet[1].hasOwnProperty("isExpanded") ? facet[1]["isExpanded"] : true)
    }

    static applyFilters(addFilter, _removeFilter, prefix = 'entities') {
        Sui.keyPrefix = prefix
        const filters = Sui.getFilters()
        Sui.removeFilter = _removeFilter
        for (let f in filters) {
            if (filters[f].selected) {
                addFilter(filters[f].key, f)
            }
        }
    }
}