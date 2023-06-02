import React, {useEffect, useState} from 'react';
import styles from '../../css/collapsableFacets.module.css'
import {ChevronDown, ChevronRight} from "react-bootstrap-icons";
import {Col, Row} from 'react-bootstrap'
import {Facet} from "@elastic/react-search-ui";
import CheckboxFacet from './CheckboxFacet';

const CollapsableFacet = ({fields, filters, facet, transformFunction}) => {
    const conditional_facets = fields.conditionalFacets
    const facet_key = facet[0]
    const label = facet[1]["label"]
    const [isExpanded, setIsExpanded] = useState(facet[1].hasOwnProperty("isExpanded") ? facet[1]["isExpanded"] : true)
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

    const formatVal = (id) => id.replace(/\W+/g, "")

    const formatClassName = (label) => {
        return `sui-facet__title sui-facet__title--${formatVal(label)}`
    }

    return (<>
        {isVisible &&
            <Facet
                key={facet_key}
                field={facet_key}
                filterType={facet[1]["filterType"]}
                isFilterable={facet[1]["isFilterable"]}
                className='js-gtm--facets'
                // This utilizes search-ui's MultiCheckboxFacet function, but we override the values to support
                // transforming organ codes to their full text names
                view={({
                           className,
                           onMoreClick,
                           onRemove,
                           onSelect,
                           options,
                           showMore,
                           showSearch,
                           onSearch,
                           searchPlaceholder
                       }) => (
                    <>
                        {options.length > 0 &&
                            <Row className={'pt-4'}>
                                <Col className={'col-9'}>
                                    {isExpanded &&
                                        <>
                                            <legend className={`${formatClassName(label)} ${styles.facetsHover}`}
                                                    onClick={handleClick} tabIndex={0}>{label}</legend>
                                            <fieldset className={"sui-facet " + className}>

                                                {showSearch && (
                                                    <div className="sui-facet-search">
                                                        <input
                                                            className="sui-facet-search__text-input"
                                                            type="search"
                                                            placeholder={searchPlaceholder || "Search"}
                                                            onChange={(e) => {
                                                                onSearch(e.target.value);
                                                            }}
                                                        />
                                                    </div>
                                                )}

                                                <div className="sui-multi-checkbox-facet">
                                                    {options.length < 1 && <div>No matching options</div>}
                                                    {options.map((option) => {
                                                        return <CheckboxFacet
                                                                    key={`${(option.value)}`}
                                                                    label={label}
                                                                    option={option}
                                                                    transformFunction={transformFunction}
                                                                    formatVal={formatVal}
                                                                    onRemove={onRemove}
                                                                    onSelect={onSelect}
                                                                 />
                                                    })}
                                                </div>

                                                {showMore && (
                                                    <button
                                                        type="button"
                                                        className="sui-facet-view-more"
                                                        onClick={onMoreClick}
                                                        aria-label="Show more options"
                                                    >
                                                        + More
                                                    </button>
                                                )}
                                            </fieldset>
                                        </>
                                    }
                                    {!isExpanded &&
                                        <legend className={`${formatClassName(label)} ${styles.contracted}`}
                                                onClick={handleClick} tabIndex={0}>{label}</legend>
                                    }
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
                            </Row>
                        }
                    </>
                )}
            />
        }
    </>);
};

export default CollapsableFacet;