import { es_query_builder } from "../../lib/search-tools";


export default function customAdaptRequest(request, queryConfig, state) {

  let payload = es_query_builder(request, state.current, state.resultsPerPage, queryConfig);

  return payload;
}
