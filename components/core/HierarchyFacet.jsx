import HierarchyOptionFacet from './HierarchyOptionFacet'
import { useSearchUIContext } from './SearchUIContext'

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
                    return (
                        <HierarchyOptionFacet
                            key={option.value}
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
