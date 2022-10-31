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

    const formatClassName = (label) => {
        label = label.replace(/\s/g, '-')
        return `sui-facet__title sui-facet__title--${label}`
    }

    return (<>
        {isVisible && <Row className={'pt-4'}>
            <Col className={'col-9'}>

                {isExpanded && <>
                    <legend className={`${formatClassName(label)} ${styles.facetsHover}`}
                            onClick={handleClick} tabIndex={0}>{label}</legend>
                    <Facet
                        
                        key={facet_key}
                        field={facet_key}
                        filterType={facet[1]["filterType"]}
                        isFilterable={facet[1]["isFilterable"]}
                        className='js-gtm--facets'
                    />
                </>}
                {!isExpanded && <legend className={`${formatClassName(label)} ${styles.contracted}`}
                                        onClick={handleClick} tabIndex={0}>{label}</legend>}
            </Col>

            <Col className={'text-end'}>
                {isExpanded && <ChevronDown
                    onClick={handleClick}
                    className={`align-top ${styles.facetsHover}`}
                />}
                {!isExpanded && <ChevronRight
                    onClick={handleClick}
                    className={`align-top ${styles.contracted}`}
                />}
            </Col>
        </Row>}
    </>);
};

export default CollapsableFacet;