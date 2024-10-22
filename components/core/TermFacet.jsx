import React, { useState } from 'react'
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
export default function TermFacet({
    facet,
    field,
    formatVal,
    transformFunction
}) {
    const { aggregations, authState, filters } = useSearchUIContext()
    const options = aggregations[field]?.buckets ?? []

    const [moreExpanded, setMoreExpanded] = useState(false)

    function handleMoreClick() {
        setMoreExpanded(!moreExpanded)
    }

    return (
        <fieldset className='sui-facet js-gtm--facets'>
            <div className='sui-multi-checkbox-facet'>
                {options.map((option, idx) => {
                    if (idx >= 5 && !moreExpanded) {
                        return null
                    }

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
                        <TermOptionFacet
                            key={option.key}
                            facet={facet}
                            field={field}
                            formatVal={formatVal}
                            transformFunction={transformFunction}
                            value={option.key}
                            count={option.doc_count}
                        />
                    )
                })}
            </div>

            {/* More button */}
            {options.length > 5 && !moreExpanded && (
                <button
                    type='button'
                    className='sui-facet-view-more'
                    aria-label='Show more options'
                    onClick={handleMoreClick}
                >
                    + More
                </button>
            )}
        </fieldset>
    )
}
