import React from 'react'
import { useSearchUIContext } from '../context/SearchUIContext'
import TermFacetOption from './TermFacetOption'

/**
 * @typedef {import('../types').FacetConfig} FacetConfig
 */

/**
 * @typedef {Object} TermOption
 * @property {string} value - The value of the term option.
 * @property {number} count - The count of the term option.
 */

/**
 * @typedef {Object} TermFacetProps
 * @property {FacetConfig} config - The configuration for the facet.
 */

/**
 * A component that renders a term facet.
 *
 * @param {TermFacetProps} props - The properties for the component.
 * @returns {JSX.Element} The rendered component.
 */
export default function TermFacet({ config }) {
    const { filters, aggregations } = useSearchUIContext()
    const options = aggregations[config.field] ?? []

    return (
        <fieldset className='sui-facet js-gtm--facets'>
            <div className='sui-multi-checkbox-facet'>
                {options.map((option) => {
                    const isOptionVisible =
                        (typeof config.isOptionVisible === 'function'
                            ? config.isOptionVisible(
                                  option,
                                  filters,
                                  aggregations
                              )
                            : config.isOptionVisible) ?? true

                    if (!isOptionVisible) {
                        return null
                    }
                    return (
                        <TermFacetOption
                            key={option.value}
                            config={config}
                            value={option.value}
                            count={option.count}
                        />
                    )
                })}
            </div>
        </fieldset>
    )
}
