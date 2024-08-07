import React from 'react'
import { useSearchUIContext } from '../context/SearchUIContext'
import { formatValue } from '../util/string'

/**
 * @typedef {import('../types').FacetConfig} FacetConfig
 * @typedef {import('../types').TermFilter} TermFilter
 */

/**
 * @typedef {Object} TermFacetOptionProps
 * @property {FacetConfig} config - The configuration for the facet.
 * @property {string} value - The value of the term facet option.
 * @property {number} count - The count of the term facet option.
 */

/**
 * A component that renders a term facet option.
 *
 * @param {TermFacetOptionProps} props - The properties for the component.
 * @returns {JSX.Element} The rendered component.
 */
export default function TermFacetOption({ config, value, count }) {
    const { hasFilter, addFilter, removeFilter } = useSearchUIContext()

    const name = `${config.name}_${value}`
    const isChecked = hasFilter(name)

    function handleCheckboxChange() {
        if (isChecked) {
            removeFilter(name)
        } else {
            /** @type {TermFilter} */
            const filter = {
                type: 'term',
                field: config.field,
                value
            }
            addFilter(name, filter)
        }
    }

    return (
        <label
            htmlFor={`sui-facet--${formatValue(config.label)}-${formatValue(value)}`}
            className={`sui-multi-checkbox-facet__option-label sui-facet__${formatValue(config.label)}`}
        >
            <div className='sui-multi-checkbox-facet__option-input-wrapper'>
                <input
                    id={`sui-facet--${formatValue(config.label)}-${formatValue(value)}`}
                    type='checkbox'
                    className='sui-multi-checkbox-facet__checkbox'
                    checked={isChecked}
                    onChange={handleCheckboxChange}
                />
                <span className='sui-multi-checkbox-facet__input-text'>
                    {config.transformFunction !== undefined
                        ? config.transformFunction(value)
                        : value}
                </span>
            </div>
            <span className='sui-multi-checkbox-facet__option-count me-5'>
                {count.toLocaleString('en')}
            </span>
        </label>
    )
}
