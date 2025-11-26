import React from 'react'
import { useSearchUIContext } from './SearchUIContext'

/**
 * @typedef {import('../types').FacetConfig} FacetConfig
 * @typedef {import('../types').TermFilter} TermFilter
 */

/**
 * @typedef {Object} TermOptionFacetProps
 * @property {FacetConfig} config - The configuration for the facet.
 * @property {string} value - The value of the term facet option.
 * @property {number} count - The count of the term facet option.
 */

/**
 * A component that renders a term facet option.
 *
 * @param {TermOptionFacetProps} props - The properties for the component.
 * @returns {JSX.Element} The rendered component.
 */
export default function TermOptionFacet({
    facet,
    field,
    formatVal,
    transformFunction,
    value,
    count
}) {
    const { filters, addFilter, removeFilter, stateProps } = useSearchUIContext()

    const filter = filters.find((f) => f.field === field)

    function handleCheckboxChange(e) {
        e.preventDefault()
        if (filter === undefined || filter.values.length === 0) {
            // Create a new filter if one doesn't exist
            addFilter(field, value)
            return
        }

        if (filter.values.length === 1 && filter.values[0] === value) {
            // Remove the filter if it only contains this value
            removeFilter(field, value)
            return
        }

        if (filter.values.includes(value)) {
            // Remove this value from the filter if there are multiple values
            removeFilter(field, value)
        } else {
            // Add this value to the existing filter if it doesn't already exist
            addFilter(field, value)
        }
    }

    return (
        <label
            htmlFor={`sui-facet--${formatVal(facet.label)}-${formatVal(value)}`}
            className={`sui-multi-checkbox-facet__option-label sui-facet__${formatVal(facet.label)}`}
        >
            <div className='sui-multi-checkbox-facet__option-input-wrapper'>
                <input
                    id={`sui-facet--${formatVal(facet.label)}-${formatVal(value)}`}
                    type='checkbox'
                    className='sui-multi-checkbox-facet__checkbox'
                    checked={filter?.values.includes(value) ?? false}
                    onChange={handleCheckboxChange}
                    {...stateProps[facet.field] || {}}
                />
                <span className='sui-multi-checkbox-facet__input-text'>
                    {transformFunction(facet, value)}
                </span>
            </div>
            <span className='sui-multi-checkbox-facet__option-count me-5'>
                {count.toLocaleString('en')}
            </span>
        </label>
    )
}
