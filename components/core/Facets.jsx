import React, { useContext } from 'react'
import SearchUIContext from './SearchUIContext'
import CollapsibleFacetContainer from './CollapsibleFacetContainer'
import CheckboxFacet from './CheckboxFacet'
import DateRangeFacet from './DateRangeFacet'
import NumericRangeFacet from './NumericRangeFacet'

const Facets = ({ transformFunction }) => {
    const { aggregations, authState, getFacets, getConditionalFacets, filters } = useContext(SearchUIContext)

    function formatVal(id) {
        if (typeof id === 'string') {
            return id.replace(/\W+/g, '')
        }
        return id
    }

    function isFacetVisible(name) {
        const conditionalFacets = getConditionalFacets()
        const predicate = conditionalFacets[name]
        if (!predicate) {
            return true
        }
        return predicate({ filters, aggregations, authState })
    }

    function createFacet(name, facet) {
        switch (facet.facetType) {
            case 'term':
                return (
                    <CollapsibleFacetContainer
                        key={name}
                        field={name}
                        facet={facet}
                        transformFunction={transformFunction}
                        formatVal={formatVal}
                        view={CheckboxFacet}
                    />
                )
            case 'daterange':
                return (
                    <CollapsibleFacetContainer
                        key={name}
                        field={name}
                        facet={facet}
                        transformFunction={transformFunction}
                        formatVal={formatVal}
                        view={DateRangeFacet}
                    />
                )
            case 'histogram':
                return (
                    <CollapsibleFacetContainer
                        key={name}
                        field={name}
                        facet={facet}
                        transformFunction={transformFunction}
                        formatVal={formatVal}
                        view={NumericRangeFacet}
                    />
                )
            default:
                return null
        }
    }



    return (
        <>
            {Object.entries(getFacets()).map(([name, facet]) => {
                if (!isFacetVisible(name)) {
                    return null;
                }

                return createFacet(name, facet);
            })}
        </>
    )
}

export default Facets
