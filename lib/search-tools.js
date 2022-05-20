// Search APIs tools
// uses the elastic-builder to construct an Elasticsearch DSL query
export const esb = require('elastic-builder');

/*
 * Elasticsearch query builder helper
 *
 */
export function es_query_builder(request, from, size, queryConfig) {

  let query = request.searchTerm
//  console.log('searchfields:', queryConfig.search_fields)
  let CURRENT = from-1 //request.current
  let SIZE = size
  let SEARCHABLE_FIELDS = Object.keys(queryConfig.search_fields)
  let FACETS = Object.entries(queryConfig.facets)
  let RESULT_FIELDS = []
  try {
    RESULT_FIELDS = Object.keys(queryConfig.result_fields)
  } catch {

  }
  let FILTERS = Object.entries(request.filters)
  let SORT_FIELDS = request.sortList
  
  //console.log(SORT_FIELDS)

  let requestBody =  esb.requestBodySearch();
  let boolQuery = esb.boolQuery();

  //boolQuery.must(esb.matchQuery('description', query)); 
  if (query.length > 0 && query != "*") {
    boolQuery.must(esb.multiMatchQuery(SEARCHABLE_FIELDS, query));
  } else {
    boolQuery.must(esb.matchAllQuery());
  }
  
  // get the filters from the request which are the clicked facet list
  FILTERS.forEach((f) => {
    console.log(f[1])
    let field = f[1].field + '.keyword'
    let values = f[1].values
    values.forEach((v) => {
      boolQuery.filter(esb.termQuery(field, v))
    })
    
  });

  requestBody
    .query(boolQuery)
    .from(CURRENT)
    .size(SIZE)
    .trackTotalHits(true)

    // add sort if selected
    SORT_FIELDS.forEach((f) => {
      console.log(f)
      requestBody.sort(esb.sort(f.field, f.direction));
    })
    // if (request.sortField) {
    //     requestBody.sort(esb.sort(request.sortField), 'asc');
    // }
 
  //  .source(colFields);  

 
  // add any defined facets to aggregation query
  FACETS.forEach((f) => { 
      requestBody.agg(esb.termsAggregation(f[0], f[1].field))

  });

  // add any defined result_fields from configuration.  if not result_fields
  // is found it just returns all the fields in the index
  if (RESULT_FIELDS.length > 0) {
    requestBody.source(RESULT_FIELDS);
  }

  //console.debug(requestBody.toJSON());
  return requestBody.toJSON();
}


export function simple_query_builder(field, query)  {
  console.log(field, query)
  let requestBody =  esb.requestBodySearch()
                        .query(
                          esb.boolQuery()
                          .must(esb.matchQuery(field, query))
                      )
  console.debug(requestBody.toJSON());
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
