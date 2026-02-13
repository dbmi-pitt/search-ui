import { useState } from 'react'
import { cls } from '../../lib/utils'
import CollapsibleLayout from './CollapsibleLayout'
import { useSearchUIContext } from './SearchUIContext'

const CollapsibleFacetContainer = ({
    facet,
    field,
    formatVal,
    transformFunction,
    view,
    className
}) => {
    const { isFacetExpanded, setFacetExpanded } = useSearchUIContext()

    const [isExpanded, setIsExpanded] = useState(isFacetExpanded(field))

    const View = view

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
            className={cls(`mt-4 facetContainer facetContainer--${facet.field?.replaceAll('.', '-')}`, className)}
        >
            <View
                facet={facet}
                field={field}
                formatVal={formatVal}
                transformFunction={transformFunction}
            />
        </CollapsibleLayout>
    )
}

export default CollapsibleFacetContainer
