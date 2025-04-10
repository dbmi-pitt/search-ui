import CollapsibleFacetContainer from './CollapsibleFacetContainer'
import DateRangeFacet from './DateRangeFacet'
import HierarchyFacet from './HierarchyFacet'
import HistogramFacet from './HistogramFacet'
import { useSearchUIContext } from './SearchUIContext'
import TermFacet from './TermFacet'

const DEFAULT_FACET_VISIBLE = true

const Facets = ({ transformFunction }) => {
    const { aggregations, authState, facetConfig, filters } =
        useSearchUIContext()

    function formatVal(id) {
        if (typeof id === 'string') {
            return id.replace(/\W+/g, '')
        }
        return id
    }

    function setTransformFunction(facetConfig) {
         if (!facetConfig.transformFunction) {
            return transformFunction
        }
         return facetConfig.transformFunction
    }

    function isFacetVisible(facetConfig) {
        if (!facetConfig.isFacetVisible) {
            return DEFAULT_FACET_VISIBLE
        }
        const predicate = facetConfig.isFacetVisible
        if (typeof predicate === 'function') {
            return predicate(filters, aggregations, authState)
        } else if (typeof predicate === 'boolean') {
            return predicate
        } else {
            throw new Error(
                'Facet isFacetVisible must be a boolean or a function'
            )
        }
    }

    function createFacet(name, facet) {
        switch (facet.facetType) {
            case 'term':
                return (
                    <CollapsibleFacetContainer
                        key={name}
                        facet={facet}
                        field={name}
                        formatVal={formatVal}
                        transformFunction={setTransformFunction(facet)}
                        view={TermFacet}
                    />
                )
            case 'hierarchy':
                return (
                    <CollapsibleFacetContainer
                        key={name}
                        field={name}
                        facet={facet}
                        transformFunction={setTransformFunction(facet)}
                        formatVal={formatVal}
                        view={HierarchyFacet}
                    />
                )
            case 'daterange':
                return (
                    <CollapsibleFacetContainer
                        key={name}
                        field={name}
                        facet={facet}
                        transformFunction={setTransformFunction(facet)}
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
                        transformFunction={setTransformFunction(facet)}
                        formatVal={formatVal}
                        view={HistogramFacet}
                    />
                )
            default:
                return null
        }
    }

    return (
        <>
            {Object.entries(facetConfig).map(([name, facet]) => {
                if (!isFacetVisible(facet)) {
                    return null
                }

                return createFacet(name, facet)
            })}
        </>
    )
}

export default Facets
