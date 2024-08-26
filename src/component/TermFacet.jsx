import React from 'react'
import { useSearchUIContext } from '../context/SearchUIContext'
import TermFacetOption from './TermFacetOption'

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
export default function TermFacet({ config }) {
    const { aggregations, authentication, filters } = useSearchUIContext()
    const options = aggregations[config.name] ?? []

    return (
        <fieldset className='sui-facet js-gtm--facets'>
            <div className='sui-multi-checkbox-facet'>
                {options.map((option) => {
                    const isOptionVisible =
                        (typeof config.isOptionVisible === 'function'
                            ? config.isOptionVisible(
                                  option,
                                  filters,
                                  aggregations,
                                  authentication
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
