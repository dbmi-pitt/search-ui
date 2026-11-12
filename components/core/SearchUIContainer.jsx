import { SearchProvider, WithSearch } from '@elastic/react-search-ui'
import { SearchUIProvider } from './SearchUIContext'
import { compressToEncodedURIComponent } from 'lz-string';

const routingOptions = {
    readUrl: () => window.location.pathname + window.location.search,

    writeUrl: (url, { replaceUrl }) => {
        const method = replaceUrl ? "replaceState" : "pushState";
        window.history[method](null, "", url);
    },

    // 1. Serialize and compress the search state into a single ?s= parameter
    stateToUrl: (state) => {
        const params = new URLSearchParams(window.location.search);

        // Build a clean object with only non-empty values (and exclude unwanted fields)
        const cleanState = {};
        if (state.searchTerm) cleanState.q = state.searchTerm;
        if (state.current && state.current > 1) cleanState.p = state.current;
        if (state.resultsPerPage) cleanState.n = state.resultsPerPage;
        if (state.sort?.length) cleanState.sort = state.sort;
        if (state.filters?.length) cleanState.f = state.filters;

        if (Object.keys(cleanState).length > 0) {
            const json = JSON.stringify(cleanState);
            const compressed = compressToEncodedURIComponent(json);
            params.set("s", compressed);
        } else {
            params.delete("s");
        }

        const queryString = params.toString();
        return `${window.location.pathname}${queryString ? `?${queryString}` : ""}`;
    },

    // 2. Decompress the ?s= parameter back into Search UI state
    urlToState: (url) => {
        const parsedUrl = new URL(url, window.location.origin);
        const compressed = parsedUrl.searchParams.get("s");

        if (!compressed) return {};

        try {
            const json = LZString.decompressFromEncodedURIComponent(compressed);
            if (!json) return {};

            const parsed = JSON.parse(json);
            const state = {};

            if (parsed.q) state.searchTerm = parsed.q;
            if (parsed.p) state.current = parsed.p;
            if (parsed.n) state.resultsPerPage = parsed.n;
            if (parsed.sort) state.sort = parsed.sort;
            if (parsed.f) state.filters = parsed.f;

            return state;
        } catch (error) {
            // Fallback safely if a user modifies or truncates the URL manually
            return {};
        }
    }
};

function SearchUIContainer({ config, name, authState, children }) {
    config.apiConnector.authState = authState
    config.routingOptions = routingOptions
    return (
        <SearchProvider config={config}>
            <WithSearch mapContextToProps={({ filters, wasSearched, rawResponse }) => ({ filters, wasSearched, rawResponse })} >
                {({ filters, wasSearched, rawResponse }) => {
                    return <SearchUIProvider name={name} authState={authState}>{children}</SearchUIProvider>
                }}
            </WithSearch>
        </SearchProvider>
    )
}

export default SearchUIContainer
