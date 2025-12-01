import { useState } from 'react'
import styles from '../../css/collapsableFacets.module.css'
import { useSearchUIContext } from './SearchUIContext'

export default function HierarchyOptionFacet({
    facet,
    field,
    formatVal,
    transformFunction,
    value,
    count,
    subValues
}) {
    const { filters, addFilter, removeFilter, stateProps } = useSearchUIContext()
    const [isExpanded, setIsExpanded] = useState(false)

    const filter = filters.find((f) => f.field === field)

    function handleExpandClick(e) {
        e.preventDefault()
        e.stopPropagation()
        setIsExpanded(!isExpanded)
    }

    function getValueCheckedState() {
        if (!filter || filter.values.length === 0) {
            return false
        }

        const filterValues = filter.values
        for (const subValue of subValues) {
            if (!filterValues.includes(subValue.key)) {
                return false
            }
        }
        return true
    }

    function handleValueCheckboxChange(e) {
        e.preventDefault()

        const currentlyChecked = getValueCheckedState()
        if (currentlyChecked) {
            // Remove all subvalues
            for (const subValue of subValues) {
                removeFilter(field, subValue.key)
            }
        } else {
            // Check all subvalues
            for (const subValue of subValues) {
                addFilter(field, subValue.key)
            }
        }
    }

    function getSubValueCheckedState(subValue) {
        if (!filter || filter.values.length === 0) {
            return false
        }
        return filter.values.includes(subValue.key)
    }

    function handleSubValueCheckboxChange(e, subValue) {
        e.preventDefault()

        const values = filter?.values || []
        if (values.includes(subValue.key)) {
            // Filter exists, remove it
            removeFilter(field, subValue.key)
            return
        }

        // Filter doesn't exist, add it
        addFilter(field, subValue.key)
    }

    return (
        <div className='d-flex flex-column align-items-start w-100'>
            {/* Label and checkbox */}
            <div className='sui-multi-checkbox-facet__option-input-wrapper d-flex flex-row w-100'>
                <label
                    htmlFor={`sui-facet--${formatVal(value)}`}
                    className={`sui-multi-checkbox-facet__option-label sui-facet__${formatVal(value)} w-100`}>
                    <input
                        id={`sui-facet--${formatVal(value)}`}
                        type='checkbox'
                        className='sui-multi-checkbox-facet__checkbox'
                        checked={getValueCheckedState()}
                        onChange={handleValueCheckboxChange}
                        {...stateProps[facet.groupByField] || {}}
                    />
                    <span className='sui-multi-checkbox-facet__input-text flex-grow-1'>
                        {transformFunction(facet, value)}
                    </span>
                    <span
                        className='sui-multi-checkbox-facet__option-count'
                        style={{ marginRight: '1.95rem' }}>
                        {count.toLocaleString('en')}
                    </span>
                </label>
                {/* Expanding button */}
                {isExpanded ? (
                    <i
                        onClick={handleExpandClick}
                        className={`bi bi-chevron-down align-top ps-1 ${styles.facetsHover}`}
                    />
                ) : (
                    <i
                        onClick={handleExpandClick}
                        className={`bi bi-chevron-right align-top ps-1 ${styles.contracted}`}
                    />
                )}
            </div>

            {/* Options */}
            {isExpanded && (
                <>
                    {subValues.map((subValue) => (
                        <label
                            key={subValue.key}
                            htmlFor={`sui-facet--${formatVal(value)}-${formatVal(subValue.key)}`}
                            className='sui-multi-checkbox-facet__option-label d-flex flex-row w-100'>
                            <div className='sui-multi-checkbox-facet__option-input-wrapper'>
                                <input
                                    id={`sui-facet--${formatVal(value)}-${formatVal(subValue.key)}`}
                                    type='checkbox'
                                    className='sui-multi-checkbox-facet__checkbox'
                                    style={{ marginLeft: '1.25rem' }}
                                    checked={getSubValueCheckedState(subValue)}
                                    onChange={(e) => handleSubValueCheckboxChange(e, subValue)}
                                    {...stateProps[facet.field] || {}}
                                />
                                <span className='sui-multi-checkbox-facet__input-text'>
                                    {transformFunction(facet, subValue.key)}
                                </span>
                            </div>
                            <span className='sui-multi-checkbox-facet__option-count me-4'>
                                {subValue.doc_count.toLocaleString('en')}
                            </span>
                        </label>
                    ))}
                </>
            )}
        </div>
    )
}