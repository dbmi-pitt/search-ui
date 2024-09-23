import React from 'react'
import CollapsibleLayout from './CollapsibleLayout'

const CollapsibleFacetContainer2 = ({ facet, field, transformFunction, formatVal, view }) => {
    const { setFacetExpanded } = useContext(SearchUIContext)

    const [isExpanded, setIsExpanded] = useState(facet.isExpanded || false);

    const View = view;

    const handleSetIsExpanded = (isExpanded) => {
        setIsExpanded(isExpanded)
        setFacetExpanded(field, isExpanded)
    }

    return (
        <CollapsibleLayout
            isExpanded={isExpanded}
            setIsExpanded={handleSetIsExpanded}
            label={facet.label}
            formatVal={formatVal}
        >
            <View />
        </CollapsibleLayout>
    )
}

export default CollapsibleFacetContainer2;