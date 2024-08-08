import React, { useEffect, useState } from 'react'
import { formatValue } from '../util/string'

/**
 * @typedef {import('../types').FacetConfig} FacetConfig
 */

/**
 * @typedef {Object} FacetContainerProps
 * @property {FacetConfig} facet - The configuration object for the facet.
 * @property {React.ReactNode} children - The child components to be rendered inside the container.
 */

/**
 * A container component for displaying a facet with expandable functionality.
 *
 * @param {FacetContainerProps} props - The properties for the FacetContainer component.
 * @returns {JSX.Element} The rendered FacetContainer component.
 */
export default function FacetContainer({ facet, children }) {
    const [isExpanded, setIsExpanded] = useState(true)

    useEffect(() => {
        if (facet.onExpandedStateChange) {
            facet.onExpandedStateChange(isExpanded)
        }
    }, [isExpanded])

    /**
     * Formats the class name for the facet title based on the provided label.
     *
     * @param {string} label - The label of the facet.
     * @returns {string} The formatted class name.
     */
    function formatClassName(label) {
        return `sui-facet__title sui-facet__title--${formatValue(label)}`
    }

    /**
     * Toggles the expanded state of the facet container.
     */
    function handleExpandClick() {
        setIsExpanded(!isExpanded)
    }

    return (
        <>
            <div className='pt-4 d-flex flex-row'>
                <div
                    className={`sui-facet__${formatValue(facet.label)} flex-grow-1`}
                >
                    <legend
                        className={`${formatClassName(facet.label)} ${isExpanded ? 'facetsHover' : 'contracted'}`}
                        onClick={handleExpandClick}
                        tabIndex={0}
                    >
                        {facet.label}
                    </legend>
                </div>
                <div>
                    {isExpanded ? (
                        <i
                            className='bi bi-chevron-down align-top facetsHover'
                            onClick={handleExpandClick}
                        />
                    ) : (
                        <i
                            className='bi bi-chevron-right align-top contracted'
                            onClick={handleExpandClick}
                        />
                    )}
                </div>
            </div>
            {isExpanded && children}
        </>
    )
}
