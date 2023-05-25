import React, { useState } from 'react'
import styles from '../../css/collapsableFacets.module.css'
import { ChevronDown, ChevronRight } from 'react-bootstrap-icons'
import { Col, Row } from 'react-bootstrap'

const DateRangeFacet = ({ facet }) => {
    const label = facet[1]['label']

    const [isExpanded, setIsExpanded] = useState(facet[1].hasOwnProperty('isExpanded') ? facet[1]['isExpanded'] : true)
    
    const formatVal = (id) => id.replace(/\W+/g, "")

    const formatClassName = (label) => {
        return `sui-facet__title sui-facet__title--${formatVal(label)}`
    }

    const handleClick = () => {
        setIsExpanded((previous) => !previous)
    }

    return (
        <Row className={'pt-4'}>
            <Col className={'col-9'}>
                {isExpanded && (
                    <>
                        <legend
                            className={`${formatClassName(label)} ${styles.facetsHover}`}
                            onClick={handleClick}
                            tabIndex={0}
                        >
                            {label}
                        </legend>
                    </>
                )}

                {!isExpanded && (
                    <legend
                        className={`${formatClassName(label)} ${styles.contracted}`}
                        onClick={handleClick}
                        tabIndex={0}
                    >
                        {label}
                    </legend>
                )}
            </Col>
            <Col className={'text-end'}>
                {isExpanded && <ChevronDown onClick={handleClick} className={`align-top ${styles.facetsHover}`} />}
                {!isExpanded && <ChevronRight onClick={handleClick} className={`align-top ${styles.contracted}`} />}
            </Col>
        </Row>
    )
}

export default DateRangeFacet
