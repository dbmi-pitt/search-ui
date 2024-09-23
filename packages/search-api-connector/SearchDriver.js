import { SearchDriver, helpers } from '@elastic/search-ui'

export default class SearchUISearchDriver extends SearchDriver {
    constructor({
        apiConnector,
        autocompleteQuery = {},
        plugins = [],
        debug,
        initialState,
        onSearch,
        onAutocomplete,
        onResultClick,
        onAutocompleteResultClick,
        searchQuery = {},
        trackUrlState = true,
        routingOptions = {},
        urlPushDebounceLength = 500,
        hasA11yNotifications = false,
        a11yNotificationMessages = {},
        alwaysSearchOnInitialLoad = false
    }) {
        super({
            apiConnector,
            autocompleteQuery,
            plugins,
            debug,
            initialState,
            onSearch,
            onAutocomplete,
            onResultClick,
            onAutocompleteResultClick,
            searchQuery,
            trackUrlState,
            routingOptions,
            urlPushDebounceLength,
            hasA11yNotifications,
            a11yNotificationMessages,
            alwaysSearchOnInitialLoad
        })
        this._updateSearchResults = this._updateSearchResults.bind(this);
    }

    _updateSearchResults = (
        searchParameters,
        { skipPushToUrl = false, replaceUrl = false } = {}
    ) => {
        const {
            current,
            filters,
            resultsPerPage,
            searchTerm,
            sortDirection,
            sortField,
            sortList
        } = {
            ...this.state,
            ...searchParameters
        }

        // State updates should always be applied in the order that they are made. This function, _updateSearchResults,
        // makes state updates.
        // In the case where a call to "_updateSearchResults" was made and delayed for X amount of time using
        // `debounceManager.runWithDebounce`, and a subsequent call is made _updateSearchResults before that delay ends, we
        // want to make sure that outstanding call to "_updateSearchResults" is cancelled, as it would apply state updates
        // out of order.
        this.debounceManager.cancelByName('_updateSearchResults')

        this._setState({
            current,
            error: '',
            filters,
            resultsPerPage,
            searchTerm,
            sortDirection,
            sortField,
            sortList
        })

        this._makeSearchRequest({
            skipPushToUrl,
            replaceUrl
        })
    }

    _makeSearchRequest = this.debounceManager.constructor.debounce(
        0,
        ({ skipPushToUrl, replaceUrl }) => {
            const {
                current,
                filters,
                resultsPerPage,
                searchTerm,
                sortDirection,
                sortField,
                sortList
            } = this.state

            this._setState({
                isLoading: true
            })

            const requestId = this.searchRequestSequencer.next()

            const queryConfig = this.searchQuery

            const requestState = {
                ...this.state,
                filters: helpers.mergeFilters(filters, this.searchQuery.filters)
            }

            return this.events.search(requestState, queryConfig).then(
                (resultState) => {
                    if (this.searchRequestSequencer.isOldRequest(requestId))
                        return
                    this.searchRequestSequencer.completed(requestId)
                    const { totalResults } = resultState

                    this.events.emit({
                        type: 'SearchQuery',
                        filters: this.state.filters,
                        query: this.state.searchTerm,
                        currentPage: requestState.current,
                        resultsPerPage: requestState.resultsPerPage,
                        totalResults: totalResults
                    })

                    // Results paging start & end
                    const start =
                        totalResults === 0
                            ? 0
                            : (current - 1) * resultsPerPage + 1
                    const end =
                        totalResults < start + resultsPerPage
                            ? totalResults
                            : start + resultsPerPage - 1

                    this._setState({
                        isLoading: false,
                        resultSearchTerm: searchTerm,
                        pagingStart: start,
                        pagingEnd: end,
                        ...resultState,
                        wasSearched: true
                    })

                    if (this.hasA11yNotifications) {
                        const messageArgs = {
                            start,
                            end,
                            totalResults,
                            searchTerm
                        }
                        this.actions.a11yNotify('searchResults', messageArgs)
                    }

                    if (!skipPushToUrl && this.trackUrlState) {
                        // We debounce here so that we don't get a lot of intermediary
                        // URL state if someone is updating a UI really fast, like typing
                        // in a live search box for instance.
                        this.debounceManager.runWithDebounce(
                            this.urlPushDebounceLength,
                            'pushStateToURL',
                            this.URLManager.pushStateToURL.bind(
                                this.URLManager
                            ),
                            {
                                current,
                                filters,
                                resultsPerPage,
                                searchTerm,
                                sortDirection,
                                sortField,
                                sortList
                            },
                            { replaceUrl }
                        )
                    }
                },
                (error) => {
                    if (error.message === INVALID_CREDENTIALS) {
                        // The connector should have invalidated the credentials in its state by now
                        // Getting the latest state from the connector
                        this._setState({
                            ...(this.apiConnector?.state && {
                                ...this.apiConnector.state
                            })
                        })
                        // Stop execution of request
                        // and let the consuming application handle the missing credentials
                        return
                    }

                    this._setState({
                        error: `An unexpected error occurred: ${error.message}`
                    })
                }
            )
        }
    )
}
