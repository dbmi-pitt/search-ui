import CheckboxOptionFacet from './CheckboxOptionFacet'
import HierarchicalCheckboxOptionFacet from './HierarchicalCheckboxOptionFacet'

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
    const getSortedOptions = (opts) => {
        if (
            opts.length == 2 &&
            opts[0].value == 'false' &&
            opts[1].value == 'true'
        ) {
            opts.reverse()
        }
        return opts
    }

    const isHierarchicalOption = (option) => {
        if (option.subvalues.length == 1 && option.value == transformFunction(option.subvalues[0].value)) {
            return false
        }
        return true
    }

    return (
        <fieldset className='sui-facet js-gtm--facets'>
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

                {options.length > 0 && options[0].subvalues ? (
                    <>
                        {options.map((option) => {
                            if (isHierarchicalOption(option)) {
                                return <HierarchicalCheckboxOptionFacet
                                    key={`${option.value}`}
                                    field={field}
                                    option={option}
                                    label={option.value}
                                    formatVal={formatVal}
                                    transformFunction={transformFunction} />
                            }
                            return <CheckboxOptionFacet
                                key={`${option.value}`}
                                field={field}
                                option={option.subvalues[0]}
                                label={option.value}
                                formatVal={formatVal}
                                transformFunction={transformFunction} />
                        })}
                    </>
                ) : (
                    <>
                        {getSortedOptions(options).map((option) => {
                            if (option.value == '') {
                                return null
                            }
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
                    </>
                )}
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
