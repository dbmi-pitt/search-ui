import React from 'react'
import { helpers } from '@elastic/search-ui'

import { withSearch } from '@elastic/react-search-ui'
import SearchUIContext from './SearchUIContext'
import CollapsibleLayout from './CollapsibleLayout'
import CheckboxFacet from './CheckboxFacet'
import { accentFold } from '../../lib/utils'

const { markSelectedFacetValuesFromFilters } = helpers

export class CollapsibleFacetContainer extends React.Component {
    static contextType = SearchUIContext

    static defaultProps = {
        filterType: 'all',
        isFilterable: false,
        show: 5
    }

    constructor(props) {
        super(props)
        this.state = {
            more: props.show,
            searchTerm: '',
            isExpanded: false
        }
    }

    componentDidMount() {
        this.setState({ isExpanded: this.context.isFacetExpanded(this.props.field) })
    }

    handleSetIsExpanded = (isExpanded) => {
        this.setState({ isExpanded })
        this.context.setFacetExpanded(this.props.field, isExpanded)
    }

    handleClickMore = (totalOptions) => {
        this.setState(({ more }) => {
            let visibleOptionsCount = more + 10
            const showingAll = visibleOptionsCount >= totalOptions
            if (showingAll) visibleOptionsCount = totalOptions

            this.context.a11yNotify('moreFilters', { visibleOptionsCount, showingAll })

            return { more: visibleOptionsCount }
        })
    }

    handleFacetSearch = (searchTerm) => {
        this.setState({ searchTerm })
    }

    isFacetVisible(facet, options) {
        if (facet.type == 'range') {
            return true
        }
        if (options.length < 1) {
            return false
        }
        if (options.length == 1 && options[0].value == '') {
            return false
        }
        return true
    }

    render() {
        const { more, searchTerm } = this.state
        const {
            field,
            facet,
            transformFunction,
            formatVal,
            view,
            ...rest
        } = this.props
        const facets = this.context.getFacetData()
        const facetsForField = facets[field];

        if (!facetsForField) return null;

        const facetData = facetsForField[0];

        // markSelectedFacetValuesFromFilters looks for type to compare filterType
        const filters = this.context.filters.map((filter) => {
            return {
                field: filter.field,
                type: filter.filterType,
                values: filter.values
            }
        })

        let facetValues = markSelectedFacetValuesFromFilters(facetData, filters, field, facet.filterType).data

        if (searchTerm.trim()) {
            facetValues = facetValues.filter((option) => {
                let valueToSearch
                switch (typeof option.value) {
                    case 'string':
                        valueToSearch = accentFold(option.value).toLowerCase()
                        break
                    case 'number':
                        valueToSearch = option.value.toString()
                        break
                    case 'object':
                        valueToSearch =
                            typeof option?.value?.name === 'string' ? accentFold(option.value.name).toLowerCase() : ''
                        break

                    default:
                        valueToSearch = ''
                        break
                }
                return valueToSearch.includes(accentFold(searchTerm).toLowerCase())
            })
        }

        const View = view || CheckboxFacet

        const viewProps = {
            field: field,
            facet: facet,
            options: facetValues.slice(0, more),
            formatVal: formatVal,
            transformFunction: transformFunction,
            showMore: facetValues.length > more,
            showSearch: facet.isFilterable,
            searchPlaceholder: `Filter ${facet.label}`,
            onSearch: (value) => {
                this.handleFacetSearch(value)
            },
            onMoreClick: this.handleClickMore.bind(this, facetValues.length),
            ...rest
        }

        return (
            this.isFacetVisible(field, viewProps.options) && (
                <CollapsibleLayout
                    isExpanded={this.state.isExpanded}
                    setIsExpanded={this.handleSetIsExpanded}
                    label={facet.label}
                    formatVal={formatVal}
                >
                    <View {...viewProps} />
                </CollapsibleLayout>
            )
        )
    }
}

export default withSearch(({ facets }) => ({ facets }))(CollapsibleFacetContainer);
