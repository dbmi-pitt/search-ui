import { useContext } from 'react'
import SearchUIContext from './SearchUIContext'

const CheckboxOptionFacet = ({ field, option, label, formatVal, transformFunction }) => {
    const { filterExists, addFilter, removeFilter } = useContext(SearchUIContext)

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
                    // data-transaction-name={`facet - ${label}`}
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
            <span className='sui-multi-checkbox-facet__option-count'>{option.count.toLocaleString('en')}</span>
        </label>
    )
}

const CheckboxFacet = ({
    field,
    options,
    facet,
    formatVal,
    transformFunction,
    showMore,
    showSearch,
    searchPlaceholder,
    onSearch,
    onMoreClick
}) => {
    const getSortedOptions = () => {
        if (options.length == 2 && options[0].value == 'false' && options[1].value == 'true') {
            return [...options].reverse()
        }
        return options
    }

    return (
        <fieldset className={'sui-facet js-gtm--facets'}>
            {showSearch && (
                <div className='sui-facet-search'>
                    <input
                        className='sui-facet-search__text-input'
                        type='search'
                        placeholder={searchPlaceholder || 'Search'}
                        onChange={(e) => {
                            onSearch(e.target.value)
                        }}
                    />
                </div>
            )}

            <div className='sui-multi-checkbox-facet'>
                {options.length < 1 && <div>No matching options</div>}
                {getSortedOptions().map((option) => {
                    return (
                        <CheckboxOptionFacet
                            key={`${option.value}`}
                            field={field}
                            option={option}
                            label={facet.label}
                            formatVal={formatVal}
                            transformFunction={transformFunction}
                        />
                    )
                })}
            </div>

            {showMore && (
                <button
                    type='button'
                    className='sui-facet-view-more'
                    onClick={onMoreClick}
                    aria-label='Show more options'
                >
                    + More
                </button>
            )}
        </fieldset>
    )
}

export default CheckboxFacet
