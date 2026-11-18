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

                    // Collapse into a single plain term option when there are no children
                    const collapseSingle =
                        (facet.collapseSingleChild ?? false) &&
                        childBuckets.length === 1 &&
                        transformFunction(childBuckets[0].key) === transformFunction(option.key)
                    if (
                        childFields.length === 0 ||
                        childBuckets.length === 0 ||
                        collapseSingle
                    ) {
                        // With a single child, filter on that child's key/count
                        // since the filter is applied to the leaf field.
                        const termOption = collapseSingle ? childBuckets[0] : option

                        return (
                            <TermOptionFacet
                                key={option.key}
                                data={termOption}
                                facet={facet}
                                field={leafField}
                                formatVal={formatVal}
                                transformFunction={transformFunction}
                                value={termOption.key}
                                count={termOption.doc_count}
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
