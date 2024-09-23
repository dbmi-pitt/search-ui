import { SearchProvider, WithSearch } from '@elastic/react-search-ui'
import SearchUISearchDriver from '../../packages/search-api-connector/SearchDriver'
import { SearchUIProvider } from './SearchUIContext'

function SearchUIContainer({ config, name, authState, children }) {
    return (
        <SearchProvider config={config} driver={new SearchUISearchDriver(config)}>
            <WithSearch mapContextToProps={({ filters, wasSearched, rawResponse }) => ({ filters, wasSearched, rawResponse })} >
                {({ filters, wasSearched, rawResponse }) => {
                    return <SearchUIProvider name={name} authState={authState}>{children}</SearchUIProvider>
                }}
            </WithSearch>
        </SearchProvider>
    )
}

export default SearchUIContainer
