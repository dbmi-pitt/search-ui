import React, { Fragment, useContext } from 'react'
import SearchUIContext from './SearchUIContext'
import CollapsibleFacetContainer from './CollapsibleFacetContainer'
import CheckboxFacet from './CheckboxFacet'

const Facets = ({ transformFunction }) => {
    const { getFacets, getConditionalFacets, getFilters } = useContext(SearchUIContext)

    function formatVal(id) {
        if (typeof id === 'string') {
            return id.replace(/\W+/g, '')
        }
        return id
    }

    function isFacetVisible(field) {
        const conditionalFacets = getConditionalFacets()
        if (conditionalFacets.hasOwnProperty(field)) {
            const predicate = conditionalFacets[field]
            const filters = getFilters()
            if (filters) {
                return predicate({ filters })
            } else {
                return false
            }
        }
        return true
    }

    return (
        <>
            {Object.entries(getFacets()).map(([field, facet]) => {
                if (!isFacetVisible(field)) {
                    return <Fragment key={field}></Fragment>
                }

                if (!facet.uiType) {
                    return (
                        <CollapsibleFacetContainer
                            key={field}
                            field={field}
                            facet={facet}
                            transformFunction={transformFunction}
                            formatVal={formatVal}
                            view={CheckboxFacet}
                        />
                    )
                } else {
                    return <Fragment key={field}></Fragment>
                }
            })}
        </>
    )
}

export default Facets
