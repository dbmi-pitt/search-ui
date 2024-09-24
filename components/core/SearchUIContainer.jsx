import { SearchProvider, WithSearch } from '@elastic/react-search-ui'
import { SearchUIProvider } from './SearchUIContext'

function SearchUIContainer({ config, name, authState, children }) {
    config.apiConnector.authState = authState
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
