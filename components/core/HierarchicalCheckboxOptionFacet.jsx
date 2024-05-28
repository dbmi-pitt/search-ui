import { useContext, useState } from 'react'
import styles from '../../css/collapsableFacets.module.css'
import SearchUIContext from './SearchUIContext'

const HierarchicalCheckboxOptionFacet = ({
    field,
    options,
    label,
    formatVal,
    transformFunction
}) => {
    const { filterExists, addFilter, removeFilter } =
        useContext(SearchUIContext)

    const [isExpanded, setIsExpanded] = useState(true)

    const getLabelCheckedState = () => {
        let checked = true
        for (const option of options) {
            if (!filterExists(field, option.value)) {
                checked = false
                break
            }
        }
        return checked
    }

    const handleExpandClick = () => {
        setIsExpanded(!isExpanded)
    }

    const handleLabelCheckboxChange = (event) => {
        event.preventDefault()
        event.stopPropagation()
        for (const option of options) {
            if (filterExists(field, option.value)) {
                removeFilter(field, option.value)
            } else {
                addFilter(field, option.value)
            }
        }
    }

    const handleOptionCheckboxChange = (event, option) => {
        event.preventDefault()
        event.stopPropagation()
        if (filterExists(field, option.value)) {
            removeFilter(field, option.value)
        } else {
            addFilter(field, option.value)
        }
    }

    const doesFilterExist = (field, value) => {
        const exists = filterExists(field, value)
        return exists
    }

    const optionStyles = {
        marginLeft: '1.25rem'
    }

    return (
        <label
            htmlFor={`sui-facet--${formatVal(label)}}`}
            className='sui-multi-checkbox-facet__option-label d-flex flex-column align-items-start w-100'
        >
            <div className='d-flex flex-row justify-content-between w-100'>
                <div className='sui-multi-checkbox-facet__option-input-wrapper'>
                    <input
                        id={`sui-facet--${formatVal(label)}`}
                        type='checkbox'
                        className='sui-multi-checkbox-facet__checkbox'
                        checked={getLabelCheckedState()}
                        onChange={handleLabelCheckboxChange}
                    />
                    <span className='sui-multi-checkbox-facet__input-text'>
                        {transformFunction ? transformFunction(label) : label}
                    </span>
                </div>
                {isExpanded && (
                    <i
                        onClick={handleExpandClick}
                        className={`bi bi-chevron-down align-top ps-1 ${styles.facetsHover}`}
                    />
                )}
                {!isExpanded && (
                    <i
                        onClick={handleExpandClick}
                        className={`bi bi-chevron-right align-top ps-1 ${styles.contracted}`}
                    />
                )}
            </div>

            {isExpanded && (
                <>
                    {options.map((option) => (
                        <label
                            key={option.value}
                            htmlFor={`sui-facet--${formatVal(label)}-${formatVal(option.value)}`}
                            className='sui-multi-checkbox-facet__option-label d-flex flex-row w-100'
                        >
                            <div className='sui-multi-checkbox-facet__option-input-wrapper'>
                                <input
                                    id={`sui-facet--${formatVal(label)}-${formatVal(option.value)}`}
                                    type='checkbox'
                                    className='sui-multi-checkbox-facet__checkbox'
                                    style={optionStyles}
                                    checked={doesFilterExist(
                                        field,
                                        option.value
                                    )}
                                    onChange={(e) =>
                                        handleOptionCheckboxChange(e, option)
                                    }
                                />
                                <span className='sui-multi-checkbox-facet__input-text'>
                                    {transformFunction
                                        ? transformFunction(option.value)
                                        : option.value}
                                </span>
                            </div>
                            <span className='sui-multi-checkbox-facet__option-count'>
                                {option.count.toLocaleString('en')}
                            </span>
                        </label>
                    ))}
                </>
            )}
        </label>
    )
}

export default HierarchicalCheckboxOptionFacet
