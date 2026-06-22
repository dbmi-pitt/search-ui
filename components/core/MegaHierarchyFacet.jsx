import MegaHierarchyOptionFacet from './MegaHierarchyOptionFacet'
import { useSearchUIContext } from './SearchUIContext'
import TermOptionFacet from './TermOptionFacet'

export default function MegaHierarchyFacet({
    facet,
    field,
    formatVal,
    transformFunction
}) {
    const { aggregations, authState, filters } = useSearchUIContext()

    // The root agg is keyed by the first hierarchyField in the ES response
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

                    if (!isOptionVisible) return null

                    // leaf field is the last in hierarchyFields (used for filtering)
                    const leafField = facet.hierarchyFields.at(-1)

                    // Remaining levels below the root
                    const childFields = facet.hierarchyFields.slice(1)

                    // Child buckets are nested under the agg named after the next field
                    const childBuckets = option[childFields[0]]?.buckets ?? []

                    // If only one level remains (or no children), render as a plain term option
                    if (childFields.length === 0 || childBuckets.length === 0) {
                        return (
                            <TermOptionFacet
                                key={option.key}
                                data={option}
                                facet={facet}
                                field={leafField}
                                formatVal={formatVal}
                                transformFunction={transformFunction}
                                value={option.key}
                                count={option.doc_count}
                            />
                        )
                    }

                    return (
                        <MegaHierarchyOptionFacet
                            key={option.key}
                            facet={facet}
                            remainingFields={childFields}
                            leafField={leafField}
                            formatVal={formatVal}
                            transformFunction={transformFunction}
                            value={option.key}
                            count={option.doc_count}
                            childBuckets={childBuckets}
                            depth={0}
                        />
                    )
                })}
            </div>
        </fieldset>
    )
}
