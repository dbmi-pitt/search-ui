import React from 'react'
import { useSearchUIContext } from '../context/SearchUIContext'
import DateRangeFacet from './DateRangeFacet'
import FacetContainer from './FacetContainer'
import HistogramFacet from './HistogramFacet'
import TermFacet from './TermFacet'

/**
 * @typedef {import('../types').FacetConfig} FacetConfig
 */

/**
 * FacetsContainer component renders different types of facets based on the provided configuration.
 *
 * @returns {JSX.Element} The rendered component
 */
export default function FacetsContainer() {
    const { aggregations, authentication, config, filters, initialized } =
        useSearchUIContext()
    const facets = config.facets ?? []

    /**
     * Returns the appropriate facet component based on the facet configuration.
     *
     * @param {FacetConfig} facet - The configuration for the facet
     * @returns {JSX.Element|null} The rendered facet component or null if the facet type is not recognized
     */
    function getFacet(facet) {
        switch (facet.type) {
            case 'term':
                return <TermFacet config={facet} />
            case 'daterange':
                return <DateRangeFacet config={facet} />
            case 'histogram':
                return <HistogramFacet config={facet} />
            default:
                return null
        }
    }

    return (
        <>
            {initialized &&
                facets.map((facet) => {
                    const isFacetVisible =
                        (typeof facet.isVisible === 'function'
                            ? facet.isVisible(
                                  filters,
                                  aggregations,
                                  authentication
                              )
                            : facet.isVisible) ?? true

                    if (!isFacetVisible) {
                        return null
                    }
                    return (
                        <FacetContainer key={facet.name} facet={facet}>
                            {getFacet(facet)}
                        </FacetContainer>
                    )
                })}
        </>
    )
}
