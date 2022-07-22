import { getFacets, getResults, transformResults } from "./responseAdapters";
import log from "loglevel";

export default function adaptResponse(response, indexName) {
  
  // transform from pure ES results
  const transFormedResults = transformResults(response, indexName);

  const results = getResults(transFormedResults.records, indexName);
  const totalPages = transFormedResults.info[indexName].num_pages;
  const totalResults = transFormedResults.info[indexName].total_result_count;
  const requestId = "";
  //const facets = getFacets(transFormedResults.info[indexName]);
  const facets = getFacets(response);

  //log.trace("facets", facets)
  return {
    rawResponse: transFormedResults,
    results,
    totalPages,
    totalResults,
    requestId,
    ...(Object.keys(facets).length > 0 && { facets })
  };
}
