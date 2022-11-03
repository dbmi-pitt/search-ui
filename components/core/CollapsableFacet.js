import React, {useEffect, useState} from 'react';
import styles from '../../css/collapsableFacets.module.css'
import {ChevronDown, ChevronRight} from "react-bootstrap-icons";
import {Col, Row} from 'react-bootstrap'
import {Facet} from "@elastic/react-search-ui";

const CollapsableFacet = ({fields, filters, facet}) => {
    const conditional_facets = fields.conditionalFacets
    const facet_key = facet[0]
    const label = facet[1]["label"]
    const [isExpanded, setIsExpanded] = useState(true)
    const [isVisible, setIsVisible] = useState(true)

    const handleClick = () => {
        setIsExpanded(previous => !previous)
    }

    function isConditionalFacet(facet_key) {
        return conditional_facets.hasOwnProperty(facet_key)
    }

    function getConditionalFacet(facet_key) {
        return conditional_facets[facet_key]
    }

    function isFacetVisible(facet_key) {
        let result = true
        if (isConditionalFacet(facet_key)) {
            const predicate = getConditionalFacet(facet_key)
            if (filters) {
                result = predicate({filters})
            } else {
                result = false
            }
        }
        return result
    }

    function updateConditionalFacetVisibility(facet_key) {
        if (filters) {
            const b = isFacetVisible(facet_key)
            if (b !== isVisible) {
                setIsVisible(b)
            }
        }
    }

    useEffect(() => {
        updateConditionalFacetVisibility(facet_key)
    })

    const column1Style = isExpanded ? 'col-9' : 'col-9 d-flex align-items-center'
    const column2Style = isExpanded ? 'text-end d-flex justify-content-end' : 'text-end d-flex align-items-center justify-content-end'

    return (<>
        {isVisible && <Row className={`${styles.background} p-2 mt-4 shadow-sm`}>
            <Col className={column1Style}>

                {isExpanded && <>
                    <legend className={`sui-facet__title hurmeFontSemiBold text-capitalize text-nowrap ${styles.onHoverCursorPointer} ${styles.fs7} ${styles.legendColor}`}
                            onClick={handleClick}>{label}</legend>
                    <Facet
                        key={facet_key}
                        field={facet_key}
                        filterType={facet[1]["filterType"]}
                        isFilterable={facet[1]["isFilterable"]}
                        className='js-gtm--facets'
                    />
                </>}
                {!isExpanded && <legend className={`sui-facet__title hurmeFontSemiBold text-capitalize text-nowrap ${styles.onHoverCursorPointer} ${styles.fs7} ${styles.legendColor} mb-0`}
                                        onClick={handleClick}>{label}</legend>}
            </Col>

            <Col className={column2Style}>
                {isExpanded && <ChevronDown
                    onClick={handleClick}
                    className={`align-top ${styles.onHoverCursorPointer}`}
                />}
                {!isExpanded && <ChevronRight
                    onClick={handleClick}
                    className={styles.onHoverCursorPointer}
                />}
            </Col>
        </Row>}
    </>);
};

export default CollapsableFacet;