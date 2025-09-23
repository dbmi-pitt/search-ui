import { useState } from 'react'
import CollapsibleLayout from './CollapsibleLayout'
import { useSearchUIContext } from './SearchUIContext'

const CollapsibleGroupContainer = ({ field, facet, formatVal, children }) => {
    const { isFacetExpanded, setFacetExpanded } = useSearchUIContext()

    const [isExpanded, setIsExpanded] = useState(isFacetExpanded(field))

    const handleSetIsExpanded = (isExpanded) => {
        setIsExpanded(isExpanded)
        setFacetExpanded(field, isExpanded)
    }

    return (
        <CollapsibleLayout
            isExpanded={isExpanded}
            setIsExpanded={handleSetIsExpanded}
            label={facet.label}
            tooltipText={facet.tooltipText}
            formatVal={formatVal}
        >
            {children}
        </CollapsibleLayout>
    )
}

export default CollapsibleGroupContainer
