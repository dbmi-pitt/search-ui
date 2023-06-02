const CheckboxFacet = ({
    label,
    option,
    transformFunction,
    formatVal,
    onSelect,
    onRemove,
}) => {
    const checked = option.selected
    const value = option.value

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
                    checked={checked}
                    onChange={() => (checked ? onRemove(value) : onSelect(value))}
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

export default CheckboxFacet
