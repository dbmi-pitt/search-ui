import log from "loglevel";

const addEachKeyValueToObject = (acc, [key, value]) => ({
  ...acc,
  [key]: value
});

export function getFacets(results) {
  // this follows the Elasticsearch DSL return results
  if (!results.aggregations) return {};

  log.info('aggs', results.aggregations)
  let facet = {}

  let agg_list = Object.entries(results.aggregations);

  agg_list.forEach((agg) => {
      let aggregate = []
      let facet_name = agg[0]
      let buckets = null
      if(agg[1].hasOwnProperty("buckets")) {
          buckets = agg[1].buckets
      } else if (agg[1].hasOwnProperty(facet_name)) {
          buckets = agg[1][facet_name].buckets
      } else {
          let keys = Object.keys(agg[1])
          keys = keys.filter(val => val !== "doc_count" && val !== "meta");
          buckets = agg[1][keys[0]].buckets
      }

      let bucket_list = [];
      let i = 0
      let compound = {}

      if (Array.isArray(buckets)) {
        buckets.forEach((b) => {
          const k = b["key"]
          const c = b["doc_count"]
          bucket_list[i] = {"value": k, "count": c};

          if (b.hasOwnProperty("subagg")) {
            const sub_aggs = b["subagg"].buckets
            const sub_bucket_list = sub_aggs.map((sb) => {
              return {"value": sb["key"], "count": sb["doc_count"]}; 
            });
            bucket_list[i]["subvalues"] = sub_bucket_list
          }

          i += 1
        });
      } else if (typeof buckets === 'object' && buckets !== null) {
        Object.entries(buckets).forEach(([key, value]) => {
          const k = key
          const c = value["doc_count"]
          bucket_list[i] = {"value": k, "count": c};
          i += 1
        });
      }

      compound["field"] = facet_name
      compound["data"] = bucket_list
      compound["type"] = "value"
      aggregate[0] = compound
      facet[facet_name] = aggregate
  });

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

  const aggs = {}
  for (const [key, value] of Object.entries(records.aggregations)) {
    if (value.hasOwnProperty(key)) {
      // Aggregations that create post filters (histogram) will have an inner object with the name as key
      aggs[key] = value[key]
    } else {
      aggs[key] = value
    }
  }
  result["aggregations"] = aggs

  // set info block
  let info = new Object();
  info[indexName] = {
    "total_result_count": total,
      "query": "test",
      "current_page": state.current,
      "num_pages": total/state.resultsPerPage,
      "per_page": state.resultsPerPage,
      "facets": {}
  }
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