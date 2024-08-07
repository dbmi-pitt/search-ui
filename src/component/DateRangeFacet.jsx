import React from 'react'
import { useSearchUIContext } from '../context/SearchUIContext.jsx'
import { formatValue } from '../util/string'

/**
 * @typedef {import('../types').FacetConfig} FacetConfig
 * @typedef {import('../types').RangeFilter} RangeFilter
 */

const DEFAULT_MIN_DATE = '1970-01-01'
const DEFAULT_MAX_DATE = '2300-01-01'

/**
 * Converts a timestamp to a date string in the format 'YYYY-MM-DD'.
 *
 * @param {number} timestamp - The timestamp to convert.
 * @returns {string} The formatted date string.
 */
function convertTimestampToString(timestamp) {
    return new Date(timestamp).toISOString().split('T')[0]
}

/**
 * Converts a date string in the format 'YYYY-MM-DD' to a timestamp.
 *
 * @param {string} dateString - The date string to convert.
 * @returns {number} The timestamp.
 */
function convertStringToTimestamp(dateString) {
    return Date.parse(`${dateString}T00:00:00.000Z`)
}

/**
 * @typedef {Object} DateRangeFacetProps
 * @property {FacetConfig} config - The configuration for the facet.
 */

/**
 * A component that renders a date range facet for filtering search results.
 *
 * @param {DateRangeFacetProps} props - The properties for the component.
 * @returns {JSX.Element} The rendered component.
 */
export default function DateRangeFacet({ config }) {
    const { getFilter, addFilter, removeFilter } = useSearchUIContext()

    // JSDoc cast the filter to a RangeFilter type.
    const filter = /** @type {RangeFilter} */ (getFilter(config.name))

    /**
     * Handles the change of date input and updates the filter accordingly.
     *
     * @param {string} value - The date value as a string.
     * @param {'start' | 'end'} type - The type of date being changed, either 'start' or 'end'.
     */
    function handleDateChange(value, type) {
        let newFilter = filter
        if (!newFilter || newFilter.type !== 'range') {
            newFilter = { type: 'range', field: config.field }
        }

        if (type === 'start') {
            newFilter.gte =
                value !== '' ? convertStringToTimestamp(value) : undefined
        } else {
            newFilter.lte =
                value !== '' ? convertStringToTimestamp(value) : undefined
        }

        if (!newFilter.gte && !newFilter.lte) {
            removeFilter(config.name)
            return
        }

        addFilter(config.name, newFilter)
    }

    /**
     * Gets the start date value.
     * @returns {string} The start date value as a string or a blank string if start date doesn't exist.
     */
    function getStartValue() {
        if (filter?.gte) {
            return convertTimestampToString(filter.gte)
        }
        return ''
    }

    /**
     * Gets the start date maximum value.
     * @returns {string} The maximum start date as a string.
     */
    function getStartMax() {
        if (filter?.lte) {
            return convertTimestampToString(filter.lte)
        }
        return DEFAULT_MAX_DATE
    }

    /**
     * Gets the end date value.
     * @returns {string} The end date value as a string or a blank string if end date doesn't exist.
     */
    function getEndValue() {
        if (filter?.lte) {
            return convertTimestampToString(filter.lte)
        }
        return ''
    }

    /**
     * Gets the end date minimum value.
     * @returns {string} The minimum end date as a string.
     */
    function getEndMin() {
        if (filter?.gte) {
            return convertTimestampToString(filter.gte)
        }
        return DEFAULT_MIN_DATE
    }

    return (
        <>
            <div className='my-1 me-5 d-flex justify-content-between js-gtm--dateFacets'>
                <span className='sui-multi-checkbox-facet'>Start Date</span>
                <input
                    data-transaction-name={`facet - ${config.label}`}
                    id={`sui-facet--${formatValue(config.label)}-startdate`}
                    className='sui-multi-checkbox-facet'
                    type='date'
                    value={getStartValue()}
                    min={DEFAULT_MIN_DATE}
                    max={getStartMax()}
                    onChange={(e) => handleDateChange(e.target.value, 'start')}
                    required
                    pattern='\d{4}-\d{2}-\d{2}'
                />
            </div>
            <div className='my-1 me-5 d-flex justify-content-between js-gtm--dateFacets'>
                <span className='sui-multi-checkbox-facet'>End Date</span>
                <input
                    data-transaction-name={`facet - ${config.label}`}
                    id={`sui-facet--${formatValue(config.label)}-enddate`}
                    className='sui-multi-checkbox-facet'
                    type='date'
                    value={getEndValue()}
                    min={getEndMin()}
                    max={DEFAULT_MAX_DATE}
                    onChange={(e) => handleDateChange(e.target.value, 'end')}
                    required
                    pattern='\d{4}-\d{2}-\d{2}'
                />
            </div>
        </>
    )
}
