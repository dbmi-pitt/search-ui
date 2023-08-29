import React, { Fragment, useContext } from 'react'
import SearchUIContext from './SearchUIContext'
import CollapsibleFacetContainer from './CollapsibleFacetContainer'
import CheckboxFacet from './CheckboxFacet'
import DateRangeFacet from './DateRangeFacet'

const Facets = ({ transformFunction }) => {
    const { getFacets, getConditionalFacets, filters } = useContext(SearchUIContext)

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

                if (facet.uiType === 'daterange') {
                    return (
                        <CollapsibleFacetContainer
                            key={field}
                            field={field}
                            facet={facet}
                            transformFunction={transformFunction}
                            formatVal={formatVal}
                            view={DateRangeFacet}
                        />
                    )
                } else if (facet.uiType === 'numrange') {
                    return <Fragment key={field}></Fragment>
                } else {
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
                }
            })}
        </>
    )
}

export default Facets
