import { useContext, useEffect, useState } from 'react'
import SearchUIContext from './SearchUIContext'
import styles from '../../css/collapsableFacets.module.css'

const DateRangeFacet = ({ field, facet, formatVal }) => {
    // default dates
    const DEFAULT_MIN_DATE = '1970-01-01'
    const DEFAULT_MAX_DATE = '2300-01-01'

    const label = facet.label

    const { registerFilterChangeCallback, unregisterFilterChangeCallback, getFilter, setFilter, removeFiltersForField, filterExists } = useContext(SearchUIContext)

    const [values, setValues] = useState(getValuesFromFilter())
    const [errorValues, setErrorValues] = useState({
        start: '',
        end: ''
    })
    const [dateConstraints, setDateConstraints] = useState({
        startMax: DEFAULT_MAX_DATE,
        endMin: DEFAULT_MIN_DATE
    })

    useEffect(() => {
        registerFilterChangeCallback(field, (value, changedBy) => {
            if (changedBy === field) return
            handleDateChange(getValuesFromFilter(), 'start')
        })
        return () => { unregisterFilterChangeCallback(field) }
    }, [])

    function getValuesFromFilter() {
        const filter = getFilter(field)
        if (!filter) return { start: '', end: '' }
        return {
            start: convertTimestampToString(filter.values[0].from),
            end: convertTimestampToString(filter.values[0].to)
        }
    }

    function convertTimestampToString(timestamp) {
        if (!timestamp) return ''
        return new Date(timestamp).toISOString().split('T')[0]
    }

    function convertStringToTimestamp(dateString) {
        return Date.parse(`${dateString}T00:00:00.000Z`)
    }

    function handleDateChange(newValues, targetName) {
        const filter = { name: field }

        const startTimestamp = convertStringToTimestamp(newValues.start)
        if (startTimestamp && startTimestamp >= 0) {
            filter.from = startTimestamp
        }

        const endTimestamp = convertStringToTimestamp(newValues.end)
        if (endTimestamp && endTimestamp >= 0) {
            // Add 24 hours minus 1 ms to the end date so inclusive of the end date
            filter.to = endTimestamp + 24 * 60 * 60 * 1000 - 1
        }

        if (filter.from && filter.to && filter.from > filter.to) {
            // values are invalid
            if (targetName === 'start') {
                setErrorValues({ start: 'Start date must be before end date', end: '' })
            } else {
                setErrorValues({ end: 'End date must be after start date', start: '' })
            }
        } else {
            // values are valid
            if (!filter.from && !filter.to) {
                // remove filter
                removeFiltersForField(field)
            } else {
                // set new filter if it doesn't exist
                if (!filterExists(field, filter)) { 
                    setFilter(field, filter)
                }
            }
            setErrorValues({ start: '', end: '' })
            setDateConstraints({
                startMax: filter.to ? newValues.end : DEFAULT_MAX_DATE,
                endMin: filter.from ? newValues.start : DEFAULT_MIN_DATE
            })
        }

        setValues(newValues)
    }

    return (
        <>
            <div className='my-1 d-flex justify-content-between'>
                <span className='sui-multi-checkbox-facet'>Start Date</span>
                <input
                    data-transaction-name={`facet - ${label}`}
                    id={`sui-facet--${formatVal(label)}-startdate`}
                    className={`${errorValues.start ? styles.inputWarning : ''} sui-multi-checkbox-facet`}
                    type='date'
                    value={values.start}
                    min={DEFAULT_MIN_DATE}
                    max={dateConstraints.startMax}
                    onChange={(e) => handleDateChange({ ...values, start: e.target.value }, 'start')}
                    required
                    pattern='\d{4}-\d{2}-\d{2}'
                />
            </div>
            <div className='my-1 d-flex justify-content-between'>
                <span className='sui-multi-checkbox-facet'>End Date</span>
                <input
                    data-transaction-name={`facet - ${label}`}
                    id={`sui-facet--${formatVal(label)}-enddate`}
                    className={`${errorValues.end ? styles.inputWarning : ''} sui-multi-checkbox-facet`}
                    type='date'
                    value={values.end}
                    min={dateConstraints.endMin}
                    max={DEFAULT_MAX_DATE}
                    onChange={(e) => handleDateChange({ ...values, end: e.target.value }, 'end')}
                    required
                    pattern='\d{4}-\d{2}-\d{2}'
                />
            </div>
            <div>
                {Object.values(errorValues).map((error, idx) => {
                    return <span key={idx} className='sui-multi-checkbox-facet text-danger'>{error}</span>
                })}
            </div>
        </>
    )
}

export default DateRangeFacet
