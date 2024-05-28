import { useContext } from 'react'
import SearchUIContext from './SearchUIContext'

const CheckboxOptionFacet = ({
    field,
    option,
    label,
    formatVal,
    transformFunction
}) => {
    const { filterExists, addFilter, removeFilter } =
        useContext(SearchUIContext)

    const value = option.value

    const handleCheckboxChange = (event) => {
        event.preventDefault()
        event.stopPropagation()
        if (filterExists(field, value)) {
            removeFilter(field, value)
        } else {
            addFilter(field, value)
        }
    }

    const doesFilterExist = () => {
        const exists = filterExists(field, value)
        return exists
    }

    return (
        <label
            htmlFor={`sui-facet--${formatVal(label)}-${formatVal(option.value)}`}
            className='sui-multi-checkbox-facet__option-label'
        >
            <div className='sui-multi-checkbox-facet__option-input-wrapper'>
                <input
                    id={`sui-facet--${formatVal(label)}-${formatVal(option.value)}`}
                    type='checkbox'
                    className='sui-multi-checkbox-facet__checkbox'
                    checked={doesFilterExist()}
                    onChange={handleCheckboxChange}
                />
                <span className='sui-multi-checkbox-facet__input-text'>
                    {transformFunction ? transformFunction(value) : value}
                </span>
            </div>
            <span className='sui-multi-checkbox-facet__option-count'>
                {option.count.toLocaleString('en')}
            </span>
        </label>
    )
}

export default CheckboxOptionFacet
