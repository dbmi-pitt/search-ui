import log from "loglevel";

const addEachKeyValueToObject = (acc, [key, value]) => ({
  ...acc,
  [key]: value
});

// export function getFacetsORG(docInfo) {
//   if (!docInfo.facets) return {};

// return Object.entries(docInfo.facets)
//     .map(([facetName, facetValue]) => {
//       return [
//         facetName,
//         [
//           {
//             field: facetName,
//             data: Object.entries(facetValue).map(([value, count]) => ({
//               value,
//               count
//             })),
//             // Site Search does not support any other type of facet
//             type: "value"
//           }
//         ]
//       ];
//     })
//     .reduce(addEachKeyValueToObject, {});
// }

// transforms the standard ES DSL 'aggregate' element into format that search-ui format:'
// {
//     "experimental_approach": [
//         {
//             "field": "experimental_approach",
//             "data": [
//                 {
//                     "value": "RNAseq",
//                     "count": 1
//                 }
//             ],
//             "type": "value"
//         }
//     ]
// }
export function getFacets(results) {

  // this follows the Elasticsearch DSL return results
  if (!results.aggregations) return {};

  log.info('aggs', results.aggregations)
  //let facets =  []
  let facet = {}

  let agg_list = Object.entries(results.aggregations);
  
  let cnt = 0
  agg_list.forEach((agg) => {
      let aggregate = []
      let facet_name = agg[0]
      let buckets = null
      if(agg[1].hasOwnProperty("buckets")) {
          buckets = agg[1].buckets
      } else {
          let keys = Object.keys(agg[1])
          keys = keys.filter(val => val !== "doc_count");
          buckets = agg[1][keys[0]].buckets
      }


      let bucket_list = [];
      let i = 0
      let compound = {}
      buckets.forEach((b) => {
        let x = {}
        let k = b["key"]
        let c = b["doc_count"]
        //x[k] = t;
        bucket_list[i] = {"value": k, "count": c};

        i += 1
      });
      compound["field"] = facet_name
      compound["data"] = bucket_list
      compound["type"] = "value"
      aggregate[0] = compound
    //facets[cnt++] = aggregate
    facet[facet_name] = aggregate

  });

  //log.info(facet)
  return facet
}


// take the ES DSL results and transform them into the form search-ui expects
export function transformResults(records, indexName, state) {
  log.info("transformResults", records)
  let result = new Object();
  let docType = new Object();
  let total = records["hits"]["total"].value;

  result["record_count"] = total;
 
  // set the records
  let hits = records["hits"]["hits"].map(transform);
  docType[indexName] = hits
  result["records"] = docType
  result["aggregations"] = records.aggregations

  // set info block
  let info = new Object();
  info[indexName] = {"total_result_count": total, 
          "query": "test", 
          "current_page": state.current,
          "num_pages": total/state.resultsPerPage,
          "per_page": state.resultsPerPage,
          "facets": {}}
  result["info"] = info
  result["errors"] = {}

  log.info("result", result)
  return result;

}

// you must have an "id" field for search-ui to uniquely display the records
// so just add it from _id;  change this field depending on the key
export function transform(item, index) {
  
  let data = item["_source"]
  data["id"] = item["_id"]   
  return data
}

export function getResults(records, indexName) {
  const isMetaField = key => key.startsWith("_");
  const toObjectWithRaw = value => ({ raw: value });

  return records[indexName].map(record => {
    const { highlight, sort, ...rest } = record; //eslint-disable-line

    const result = Object.entries(rest)
      .filter(([fieldName]) => !isMetaField(fieldName))
      .map(([fieldName, fieldValue]) => [
        fieldName,
        toObjectWithRaw(fieldValue)
      ])
      .reduce(addEachKeyValueToObject, {});

      if (highlight) {
        Object.entries(highlight).forEach(([key, value]) => {
          result[key].snippet = value;
        });
     
      }
      return result;
  });

  
}



