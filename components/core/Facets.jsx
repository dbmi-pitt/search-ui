import CollapsibleFacetContainer from './CollapsibleFacetContainer'
import CollapsibleGroupContainer from './CollapsibleGroupContainer'
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

    function createFacet(name, facet, className) {
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
                        className={className}
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
                        className={className}
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
                        className={className}
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
                        className={className}
                    />
                )
            case 'group':
                return (
                    <CollapsibleGroupContainer
                        key={name}
                        field={name}
                        facet={facet}
                        formatVal={formatVal}
                    >
                        {Object.entries(facet.facets).map(
                            ([name, childFacet]) => {
                                if (!isFacetVisible(childFacet)) {
                                    return null
                                }
                                return createFacet(name, childFacet, 'ms-2')
                            }
                        )}
                    </CollapsibleGroupContainer>
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
