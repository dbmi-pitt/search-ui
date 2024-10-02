import { getFacets, getResults, transformResults } from "./responseAdapters";

export default function adaptResponse(response, indexName, state) {

  // transform from pure ES results
  const transFormedResults = transformResults(response, indexName, state);

  const results = getResults(transFormedResults.records, indexName, state);
  const totalPages = transFormedResults.info[indexName].num_pages;
  const totalResults = transFormedResults.info[indexName].total_result_count;
  const requestId = "";
  //const facets = getFacets(transFormedResults.info[indexName]);
  const facets = getFacets(response);

  //log.info("facets", facets)
  return {
    rawResponse: transFormedResults,
    results,
    totalPages,
    totalResults,
    requestId,
    ...(Object.keys(facets).length > 0 && { facets })
  };
}
