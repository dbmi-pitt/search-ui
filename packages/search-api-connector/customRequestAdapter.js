import { es_query_builder, esQueryBuilder } from '../../lib/search-tools';

/**
 * @typedef {import('../../lib/search-tools').QueryConfig} QueryConfig
 * @typedef {import('../../lib/search-tools').RequestState} RequestState
 */

/**
 * Custom adapter function to transform a search request using the provided query configuration and state.
 *
 * @param {RequestState} request - The original search request object.
 * @param {QueryConfig} queryConfig - The configuration for the query.
 * @returns {Object} - The transformed search request object.
 */
export default function customAdaptRequest(request, queryConfig) {
  return esQueryBuilder(request, queryConfig);
}