import HierarchyOptionFacet from './HierarchyOptionFacet'
import { useSearchUIContext } from './SearchUIContext'
import TermOptionFacet from './TermOptionFacet'

/**
 * @typedef {import('../types').TermFacetConfig} TermFacetConfig
 */

/**
 * @typedef {Object} TermOption
 * @property {string} value - The value of the term option.
 * @property {number} count - The count of the term option.
 */

/**
 * @typedef {Object} TermFacetProps
 * @property {TermFacetConfig} config - The configuration for the facet.
 */

/**
 * A component that renders a term facet.
 *
 * @param {TermFacetProps} props - The properties for the component.
 * @returns {JSX.Element} The rendered component.
 */
export default function HierarchyFacet({
    facet,
    field,
    formatVal,
    transformFunction
}) {
    const { aggregations, authState, filters } = useSearchUIContext()
    const options = aggregations[field]?.buckets ?? []

    return (
        <fieldset className='sui-facet js-gtm--facets'>
            <div className='sui-multi-checkbox-facet'>
                {options.length < 1 && <div>No matching options</div>}

                {options.map((option) => {
                    const isOptionVisible =
                        (typeof facet.isOptionVisible === 'function'
                            ? facet.isOptionVisible(
                                  option,
                                  filters,
                                  aggregations,
                                  authState
                              )
                            : facet.isOptionVisible) ?? true

                    if (!isOptionVisible) {
                        return null
                    }

                    let isHierarchical = facet.isHierarchyOption ?? true
                    if (typeof isHierarchical === 'function') {
                        isHierarchical = isHierarchical(option.key)
                    }

                    if (!isHierarchical) {
                        const firstBucket = option.subagg.buckets[0]
                        return (
                            <TermOptionFacet
                                key={option.key}
                                facet={facet}
                                field={field}
                                formatVal={formatVal}
                                transformFunction={transformFunction}
                                value={firstBucket.key}
                                count={firstBucket.doc_count}
                            />
                        )
                    }

                    return (
                        <HierarchyOptionFacet
                            key={option.key}
                            facet={facet}
                            field={field}
                            formatVal={formatVal}
                            transformFunction={transformFunction}
                            value={option.key}
                            count={option.doc_count}
                            subValues={option.subagg.buckets}
                        />
                    )
                })}
            </div>
        </fieldset>
    )
}
