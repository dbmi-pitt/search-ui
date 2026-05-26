import { useState } from 'react'
import styles from '../../css/collapsableFacets.module.css'
import { useSearchUIContext } from './SearchUIContext'
import TermOptionFacet from './TermOptionFacet'

const INDENT_PX = 20

export default function MegaHierarchyOptionFacet({
    facet,
    remainingFields, // fields below this node ['organ.keyword'] or ['middle.keyword', 'leaf.keyword']
    leafField, // always the last of hierarchyFields (ES filter field)
    formatVal,
    transformFunction,
    value,
    count,
    childBuckets,
    depth
}) {
    const { filters, addFilter, removeFilter, stateProps } =
        useSearchUIContext()
    const [isExpanded, setIsExpanded] = useState(false)

    const filter = filters.find((f) => f.field === leafField)

    // Collect all leaf keys under this node recursively
    function collectLeafKeys(buckets, fields) {
        if (fields.length <= 1) {
            return buckets.map((b) => b.key)
        }
        const nextField = fields[1]
        return buckets.flatMap((b) =>
            collectLeafKeys(b[nextField]?.buckets ?? [], fields.slice(1))
        )
    }

    const leafKeys =
        remainingFields.length === 1
            ? childBuckets.map((b) => b.key)
            : collectLeafKeys(childBuckets, remainingFields)

    function getCheckedState() {
        if (!filter || filter.values.length === 0) return false
        return leafKeys.every((k) => filter.values.includes(k))
    }

    function handleCheckboxChange(e) {
        e.preventDefault()
        if (getCheckedState()) {
            leafKeys.forEach((k) => removeFilter(leafField, k))
        } else {
            leafKeys.forEach((k) => {
                if (!filter?.values.includes(k)) addFilter(leafField, k)
            })
        }
    }

    const indentStyle = { marginLeft: `${depth * INDENT_PX}px` }
    const isLeafLevel = remainingFields.length === 1

    return (
        <div className={`d-flex flex-column align-items-start sui-megaFacet--d${depth}`}>
            {/* This node's row */}
            <div
                className='sui-multi-checkbox-facet__option-input-wrapper d-flex flex-row'
                style={indentStyle}
            >
                <label
                    htmlFor={`sui-facet--${formatVal(value)}--depth${depth}`}
                    className={`sui-multi-checkbox-facet__option-label sui-facet__${formatVal(value)} w-100`}
                >
                    <input
                        id={`sui-facet--${formatVal(value)}--depth${depth}`}
                        type='checkbox'
                        className='sui-multi-checkbox-facet__checkbox'
                        checked={getCheckedState()}
                        onChange={handleCheckboxChange}
                        {...(stateProps[facet.hierarchyFields[depth]] || {})}
                    />
                    <span className='sui-multi-checkbox-facet__input-text flex-grow-1'>
                        {transformFunction(value, facet)}
                    </span>
                    <span
                        className='sui-multi-checkbox-facet__option-count'
                        style={{ marginRight: '1.95rem' }}
                    >
                        {count.toLocaleString('en')}
                    </span>
                </label>
                <i
                    onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        setIsExpanded(!isExpanded)
                    }}
                    className={`bi ${isExpanded ? 'bi-chevron-down' : 'bi-chevron-right'} align-top ps-1 ${styles.facetsHover}`}
                />
            </div>

            {/* Children */}
            {isExpanded &&
                childBuckets.map((child) => {
                    const grandchildField = remainingFields[1]
                    const grandchildBuckets = grandchildField
                        ? (child[grandchildField]?.buckets ?? [])
                        : []

                    // A plain checkbox if at the leaf level or no further children
                    if (isLeafLevel || grandchildBuckets.length === 0) {
                        return (
                            <div
                                className={`sui-megaFacet__leaf sui-megaFacet--d${depth + 1}`}
                                key={child.key}
                                style={{
                                    marginLeft: `${(depth + 1) * INDENT_PX}px`,
                                    width: '100%'
                                }}
                            >
                                <TermOptionFacet
                                    data={child}
                                    facet={facet}
                                    field={leafField}
                                    formatVal={formatVal}
                                    transformFunction={transformFunction}
                                    value={child.key}
                                    count={child.doc_count}
                                />
                            </div>
                        )
                    }

                    // Otherwise, recursively render MegaHierarchyOptionFacet for the next level
                    return (
                        <MegaHierarchyOptionFacet
                            key={child.key}
                            facet={facet}
                            remainingFields={remainingFields.slice(1)}
                            leafField={leafField}
                            formatVal={formatVal}
                            transformFunction={transformFunction}
                            value={child.key}
                            count={child.doc_count}
                            childBuckets={grandchildBuckets}
                            depth={depth + 1}
                        />
                    )
                })}
        </div>
    )
}
