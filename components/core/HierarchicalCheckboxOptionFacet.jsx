import { useContext, useState } from 'react'
import styles from '../../css/collapsableFacets.module.css'
import SearchUIContext from './SearchUIContext'

const HierarchicalCheckboxOptionFacet = ({
    field,
    option,
    label,
    formatVal,
    transformFunction
}) => {
    const { filterExists, addFilter, removeFilter } = useContext(SearchUIContext)
    const [isExpanded, setIsExpanded] = useState(true)

    const getOptionCheckedState = () => {
        let checked = true
        for (const subval of option.subvalues) {
            if (!filterExists(field, subval.value)) {
                checked = false
                break
            }
        }
        return checked
    }

    const handleOptionCheckboxChange = (event) => {
        event.preventDefault()
        event.stopPropagation()
        const currentlyChecked = getOptionCheckedState()
        if (currentlyChecked) {
            for (const subval of option.subvalues) {
                if (filterExists(field, subval.value)) {
                    removeFilter(field, subval.value)
                }
            }
        } else {
            for (const subval of option.subvalues) {
                if (!filterExists(field, subval.value)) {
                    addFilter(field, subval.value)
                }
            }
        }
    }

    const getSuboptionCheckedState = (suboption) => {
        const exists = filterExists(field, suboption.value)
        return exists
    }

    const handleSuboptionCheckboxChange = (event, suboption) => {
        event.preventDefault()
        event.stopPropagation()
        if (filterExists(field, suboption.value)) {
            removeFilter(field, suboption.value)
        } else {
            addFilter(field, suboption.value)
        }
    }

    const handleExpandClick = () => {
        setIsExpanded(!isExpanded)
    }

    return (
        <label
            htmlFor={`sui-facet--${formatVal(label)}}`}
            className='sui-multi-checkbox-facet__option-label d-flex flex-column align-items-start w-100'
        >
            {/* Label and checkbox */}
            <div className='sui-multi-checkbox-facet__option-input-wrapper d-flex flex-row w-100'>
                <input
                    id={`sui-facet--${formatVal(label)}`}
                    type='checkbox'
                    className='sui-multi-checkbox-facet__checkbox'
                    checked={getOptionCheckedState()}
                    onChange={handleOptionCheckboxChange}
                />
                <span className='sui-multi-checkbox-facet__input-text flex-grow-1'>
                    {transformFunction ? transformFunction(label) : label}
                </span>
                <span
                    className='sui-multi-checkbox-facet__option-count'
                    style={{ marginRight: '1.95rem' }}
                >
                    {option.count.toLocaleString('en')}
                </span>
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
                    {option.subvalues.map((suboption) => (
                        <label
                            key={suboption.value}
                            htmlFor={`sui-facet--${formatVal(label)}-${formatVal(suboption.value)}`}
                            className='sui-multi-checkbox-facet__option-label d-flex flex-row w-100'
                        >
                            <div className='sui-multi-checkbox-facet__option-input-wrapper'>
                                <input
                                    id={`sui-facet--${formatVal(label)}-${formatVal(suboption.value)}`}
                                    type='checkbox'
                                    className='sui-multi-checkbox-facet__checkbox'
                                    style={{
                                        marginLeft: '1.25rem'
                                    }}
                                    checked={getSuboptionCheckedState(suboption)}
                                    onChange={(e) => handleSuboptionCheckboxChange(e, suboption)}
                                />
                                <span className='sui-multi-checkbox-facet__input-text'>
                                    {transformFunction
                                        ? transformFunction(suboption.value)
                                        : suboption.value}
                                </span>
                            </div>
                            <span className='sui-multi-checkbox-facet__option-count me-4'>
                                {suboption.count.toLocaleString('en')}
                            </span>
                        </label>
                    ))}
                </>
            )}
        </label>
    )
}

export default HierarchicalCheckboxOptionFacet
