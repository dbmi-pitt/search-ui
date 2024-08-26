import React, { useEffect } from 'react'
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
    const { getFilter, addFilter, removeFilter } = useSearchUIContext()

    const filter = /** @type {TermFilter} */ (getFilter(config.name))

    function handleCheckboxChange() {
        if (filter === undefined || filter.values.length === 0) {
            // Create a new filter if one doesn't exist
            /** @type {TermFilter} */
            const filter = {
                type: 'term',
                name: config.name,
                field: config.field,
                values: [value]
            }
            // setFilter(filter)
            addFilter(filter)
            return
        }

        if (filter.values.length === 1 && filter.values[0] === value) {
            // Remove the filter if it only contains this value
            removeFilter(config.name)
            return
        }

        if (filter.values.includes(value)) {
            // Remove this value from the filter if there are multiple values
            const newFilter = {
                ...filter,
                values: filter.values.filter((v) => v !== value)
            }
            addFilter(newFilter)
        } else {
            // Add this value to the filter if it doesn't already exist
            const newFilter = {
                ...filter,
                values: [...filter.values, value]
            }
            addFilter(newFilter)
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
                    checked={filter?.values.includes(value) ?? false}
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
