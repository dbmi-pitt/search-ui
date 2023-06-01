import React, { useEffect, useState } from 'react'
import { withSearch } from '@elastic/react-search-ui'
import styles from '../../css/collapsableFacets.module.css'
import { ChevronDown, ChevronRight } from 'react-bootstrap-icons'
import { Col, Row } from 'react-bootstrap'

const DateRangeFacet = ({ facet, clearInputs, filters, setFilter, removeFilter }) => {
    const label = facet[1]['label']
    const field = facet[1]['field'].split('.')[0]

    // States

    const [isExpanded, setIsExpanded] = useState(facet[1].hasOwnProperty('isExpanded') ? facet[1]['isExpanded'] : true)

    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')

    const [endMinDate, setEndMinDate] = useState('1970-01-01')

    useEffect(() => {
        if (clearInputs) {
            setStartDate('')
            setEndDate('')
            setEndMinDate('1970-01-01')
        }
    }, [clearInputs])

    useEffect(() => {
        const filter = {}

        const startTimestamp = Date.parse(startDate)
        if (startTimestamp && startTimestamp >= 0) {
            filter.from = startTimestamp
        }

        const endTimestamp = Date.parse(endDate)
        if (endTimestamp && endTimestamp >= 0) {
            // Add 24 hours to the end date so inclusive of the end date
            filter.to = endTimestamp + 24 * 60 * 60 * 1000
        }

        if (Object.keys(filter).length < 1) {
            const found = filters.find((f) => f.field === field)
            if (found) {
                removeFilter(field)
            }
        } else {
            filter.name = field
            setFilter(field, filter)
        }
    }, [startDate, endDate])

    const formatVal = (id) => id.replace(/\W+/g, '')

    const formatClassName = (label) => {
        return `sui-facet__title sui-facet__title--${formatVal(label)}`
    }

    const handleExpandClick = () => {
        setIsExpanded((previous) => !previous)
    }

    function handleDateChange(targetName, dateStr) {
        if (targetName === 'startdate') {
            setStartDate(dateStr)
            setEndMinDate(dateStr)
        } else {
            setEndDate(dateStr)
        }
    }

    return (
        <Row className={'pt-4'}>
            <Col className={'col-9'}>
                {isExpanded && (
                    <>
                        <legend
                            className={`${formatClassName(label)} ${styles.facetsHover}`}
                            onClick={handleExpandClick}
                            tabIndex={0}
                        >
                            {label}
                        </legend>
                        <div className='my-1 d-flex justify-content-lg-between'>
                            <span className='sui-multi-checkbox-facet'>Start Date</span>
                            <input
                                data-transaction-name={`facet - ${label}`}
                                id={`sui-facet--${formatVal(label)}-startdate`}
                                className={'sui-multi-checkbox-facet'}
                                type='date'
                                value={startDate}
                                onChange={(e) => handleDateChange('startdate', e.target.value)}
                                required
                                pattern='\d{4}-\d{2}-\d{2}'
                            />
                        </div>
                        <div className='my-1 d-flex justify-content-lg-between'>
                            <span className='sui-multi-checkbox-facet'>End Date</span>
                            <input
                                data-transaction-name={`facet - ${label}`}
                                id={`sui-facet--${formatVal(label)}-enddate`}
                                className={'sui-multi-checkbox-facet'}
                                type='date'
                                value={endDate}
                                min={endMinDate}
                                onChange={(e) => handleDateChange('enddate', e.target.value)}
                                required
                                pattern='\d{4}-\d{2}-\d{2}'
                            />
                        </div>
                    </>
                )}

                {!isExpanded && (
                    <legend
                        className={`${formatClassName(label)} ${styles.contracted}`}
                        onClick={handleExpandClick}
                        tabIndex={0}
                    >
                        {label}
                    </legend>
                )}
            </Col>
            <Col className={'text-end'}>
                {isExpanded && (
                    <ChevronDown onClick={handleExpandClick} className={`align-top ${styles.facetsHover}`} />
                )}
                {!isExpanded && (
                    <ChevronRight onClick={handleExpandClick} className={`align-top ${styles.contracted}`} />
                )}
            </Col>
        </Row>
    )
}

export default withSearch(({ filters, setFilter, removeFilter }) => ({
    filters,
    setFilter,
    removeFilter,
}))(DateRangeFacet)
