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

    const getGroupedOptions = (opts) => {
        opts = getSortedOptions(opts)

        if (!facet.groupedOptions) {
            return opts
        }

        return opts.reduce((acc, option) => {
            if (facet.groupedOptions[option.value]) {
                const group = facet.groupedOptions[option.value]
                if (!acc[group]) {
                    acc[group] = []
                }
                acc[group].push(option)
            } else {
                acc[option.value] = option
            }

            return acc
        }, {})
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

                {Object.entries(getGroupedOptions(options)).map(
                    ([key, option]) => {
                        // check if the option is an array
                        if (Array.isArray(option)) {
                            return (
                                <HierarchicalCheckboxOptionFacet
                                    key={`${key}`}
                                    field={field}
                                    options={option}
                                    label={key}
                                    formatVal={formatVal}
                                    transformFunction={transformFunction}
                                />
                            )
                        } else {
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
                        }
                    }
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
