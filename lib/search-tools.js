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
//  log.info('searchfields:', queryConfig.search_fields)
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

  log.info('FILTERS', FILTERS)

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
    //log.info(f[1])
    let field = f[1].field + '.keyword'
    let values = f[1].values
    values.forEach((v) => {
   
      var facet_info = checkFilterType(f[1].field, FACETS)
      if (facet_info[1]["type"] === 'range') {
        var element = createRangeQuery(v, facet_info)
      
          //log.info("DEFINE RANGEQ", element)
          boolQuery.filter(esb.rangeQuery(f[1].field)
             .gte(element["from"])
            .lte(element["to"]))

      } else {   // just do a standard term filter
          boolQuery.filter(esb.termQuery(field, v))
      }
    })
    
  });

  requestBody
    .query(boolQuery)
    .from(CURRENT)
    .size(SIZE)
    .trackTotalHits(true)

  // add sort if selected
  SORT_FIELDS.forEach((f) => {
    log.info(f)
    requestBody.sort(esb.sort(f.field, f.direction));
  })


  // add the aggregations defined for the facets
  FACETS.map((field) => {
    if (field[1].type === "value") {   // normal value aggs
      requestBody.agg(esb.termsAggregation(field[0], field[1].field))
    } else if (field[1].type === "range") {  // aggregate facets that are 'range'
       requestBody.agg(esb.rangeAggregation(field[0], field[0]).ranges([
              { to: field[1]["ranges"][0]["from"], key: field[1]["ranges"][0]["name"]},
              { from: field[1]["ranges"][1]["from"], to: field[1]["ranges"][1]["to"], key: field[1]["ranges"][1]["name"] },
              { from: field[1]["ranges"][2]["from"], key: field[1]["ranges"][2]["name"] }]));
      }
  });


  // add any defined result_fields from configuration.  if not result_fields
  // is found it just returns all the fields in the index
  if (RESULT_FIELDS.length > 0) {
    requestBody.source(RESULT_FIELDS);
  }

  //log.debug(requestBody.toJSON());
  return requestBody.toJSON();
}

function createRangeQuery(value, facet_info) {
  log.info('createRangeQuery', value, facet_info)

   var RANGES = facet_info[1]["ranges"]

  log.info('RANGES', RANGES, value)
    var found= RANGES.find(function(element, index) {

      log.info('LOOKING..', element);
      if (element["name"] === value) {
        log.info("VALUES", element)
        return element
      }
    });
    return found
}


// returns the filter type of the submitted field against the master facet dictionary
// note: filter (specified on the url) does not contain the type
function checkFilterType(field, facets) {
   
    var found= facets.find(function(element, index) {

      //log.info(element[0], field);
      if(element[0]=== field)
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
export function simple_query_builder(field, query)  {
  log.info(field, query)
  let requestBody =  esb.requestBodySearch()
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
