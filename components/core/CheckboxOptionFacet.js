import {Sui} from "../../lib/search-tools";

const CheckboxOptionFacet = ({
                                 label,
                                 option,
                                 transformFunction,
                                 formatVal,
                                 onSelect,
                                 onRemove,
                                 conditionalFacets
                             }) => {
    const value = option.value;

    const getChecked = () => {
        let filters = Sui.getFilters()
        const selected = filters[option.value]?.selected || option.selected
        filters[option.value] = {selected, key: option.key}
        Sui.saveFilters(filters)
        return selected
    }

    const clearCheck = (value) => {
        let filters = Sui.getFilters()
        filters[value].selected = false
        Sui.saveFilters(filters)
        if (Sui.removeFilter) {
            Sui.removeFilter(option.key, value)
        }

        // Remove selected filters if the facet that this is conditional has been deselected
        for (const filter in filters) {
            if (filters[filter].selected === true) {
                if (conditionalFacets.hasOwnProperty(filters[filter].key)) {
                    filters[filter].selected = false
                    Sui.saveFilters(filters)
                    if (Sui.removeFilter) {
                        Sui.removeFilter(filters[filter].key, filter)
                    }
                    onRemove(filter)
                }
            }
        }
        onRemove(value)
    }

    const setCheck = (value) => {
        let filters = Sui.getFilters()
        filters[value].selected = true
        Sui.saveFilters(filters)
        onSelect(value)
    }

    return (
        <label
            htmlFor={`sui-facet--${formatVal(label)}-${formatVal(option.value)}`}
            className='sui-multi-checkbox-facet__option-label'
        >
            <div className='sui-multi-checkbox-facet__option-input-wrapper'>
                <input
                    data-transaction-name={`facet - ${label}`}
                    id={`sui-facet--${formatVal(label)}-${formatVal(option.value)}`}
                    type='checkbox'
                    className='sui-multi-checkbox-facet__checkbox'
                    checked={getChecked()}
                    onChange={() => (getChecked() ? clearCheck(value) : setCheck(value))}
                />
                <span className='sui-multi-checkbox-facet__input-text'>
                    {transformFunction ? transformFunction(option.value) : option.value}
                </span>
            </div>
            <span className='sui-multi-checkbox-facet__option-count'>
                {option.count.toLocaleString('en')}
            </span>
        </label>
    )
}

export default CheckboxOptionFacet