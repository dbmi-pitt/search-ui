import adaptRequest from "./requestAdapter";
import customAdaptRequest from "./customRequestAdapter";
import adaptResponse from "./responseAdapter";
import request from "./request";
import log from "loglevel";

function _get(engineKey, path, params) {
  const query = Object.entries({ engine_key: engineKey, ...params })
    .map(([paramName, paramValue]) => {
      return `${paramName}=${encodeURIComponent(paramValue)}`;
    })
    .join("&");

  return fetch(
    `https://search-api.swiftype.com/api/v1/public/${path}?${query}`,
    {
      method: "GET",
      credentials: "include"
    }
  );
}

class SearchAPIConnector {
  /**
   * @callback next
   * @param {Object} updatedQueryOptions The options to send to the API
   */

  /**
   * @callback hook
   * @param {Object} queryOptions The options that are about to be sent to the API
   * @param {next} next The options that are about to be sent to the API
   */

  /**
   * @typedef Options
   * @param  {string} indexName Document Type found in your Site Search Dashboard
   * @param  {string} engineKey Credential found in your Site Search Dashboard
   * @param  {hook} beforeSearchCall=(queryOptions,next)=>next(queryOptions) A hook to amend query options before the request is sent to the
   *   API in a query on an "onSearch" event.
   * @param  {hook} beforeAutocompleteResultsCall=(queryOptions,next)=>next(queryOptions) A hook to amend query options before the request is sent to the
   *   API in a "results" query on an "onAutocomplete" event.
   */

  /**
   * @param {Options} options
   */
  constructor({
    indexName,
    indexUrl, 
    accessToken, 
    engineKey,
    beforeSearchCall = (queryOptions, next) => next(queryOptions),
    beforeAutocompleteResultsCall = (queryOptions, next) => next(queryOptions)
  }) {
    this.indexName = indexName;
    this.indexUrl = indexUrl;
    this.accessToken = accessToken;
    this.engineKey = engineKey;
    this.beforeSearchCall = beforeSearchCall;
    this.beforeAutocompleteResultsCall = beforeAutocompleteResultsCall;
    this.request = request.bind(this, engineKey);
    this._get = _get.bind(this, engineKey);
  }

  onResultClick({ query, documentId, tags }) {
    if (tags && tags.length > 0) {
      log.warn(
        "search-ui-site-search-connector: Site Search does not support tags on click"
      );
    }
    this._get("analytics/pc", {
      t: new Date().getTime(),
      q: query,
      doc_id: documentId
    });
  }

  onAutocompleteResultClick({ query, documentId, tags }) {
    if (tags) {
      log.warn(
        "search-ui-site-search-connector: Site Search does not support tags on autocompleteClick"
      );
    }
    this._get("analytics/pas", {
      t: new Date().getTime(),
      q: query,
      doc_id: documentId
    });
  }

  onSearch(state, queryConfig) {

    //const options = adaptRequest(state, queryConfig, this.indexName);
    const options = customAdaptRequest(state, queryConfig, state);
 
    log.info("I'm HERE:  onSearch", options)
    return this.beforeSearchCall(options, newOptions =>
      this.request("POST", "/search", newOptions, this.accessToken, this.indexUrl, this.indexName).then(json =>
        adaptResponse(json, this.indexName, state)
      )
    );
  }

  async onAutocomplete({ searchTerm }, queryConfig) {
    if (queryConfig.results) {
      const options = adaptRequest(
        { searchTerm },
        queryConfig.results,
        this.indexName
      );
      //const options = customAdaptRequest(state, queryConfig);

      return this.beforeAutocompleteResultsCall(options, newOptions =>
        //this.request("POST", "engines/suggest.json", newOptions).then(json => ({
        this.request("POST", "/search", newOptions, this.accessToken, this.indexUrl, this.indexName).then(json => ({
          autocompletedResults: adaptResponse(json, this.indexName).results
        }))
      );
    }
    if (queryConfig.suggestions) {
      log.warn(
        "search-ui-site-search-connector: Site Search does support query suggestions on autocomplete"
      );
    }
  }
}

export default SearchAPIConnector;
