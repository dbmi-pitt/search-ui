import { useState } from "react";
import CheckboxOptionFacet from "./CheckboxOptionFacet";
import CollapsableLayout from "./CollapsableLayout";
import {Sui} from "../../lib/search-tools";
import FacetContainer from "./FacetContainer";

const CollapsableCheckboxFacet = ({facet, transformFunction, formatVal}) => {
    const label = facet[1].label;
    const facetKey = facet[0];
    const [isExpanded, setIsExpanded] = useState(Sui.isExpandedFacetCategory(facet, facetKey));

    return <FacetContainer
        key={facetKey}
        field={facetKey}
        filterType={facet[1]["filterType"]}
        isFilterable={facet[1]["isFilterable"]}
        className="js-gtm--facets"
        view={({
            filters,
            className,
            onMoreClick,
            onRemove,
            onSelect,
            options,
            showMore,
            showSearch,
            onSearch,
            searchPlaceholder,
        }) => (
            options.length > 0 && 
                <CollapsableLayout
                    key={facet[0]}
                    isExpanded={isExpanded}
                    setIsExpanded={setIsExpanded}
                    label={label}
                    formatVal={formatVal}>

                    <fieldset className={"sui-facet " + className}>
                        {showSearch && (
                            <div className="sui-facet-search">
                                <input
                                    className="sui-facet-search__text-input"
                                    type="search"
                                    placeholder={searchPlaceholder || "Search"}
                                    onChange={(e) => {
                                        onSearch(e.target.value);
                                    }}
                                />
                            </div>
                        )}

                        <div className="sui-multi-checkbox-facet">
                            {options.length < 1 && <div>No matching options</div>}
                            {options.map((option) => {
                                return <CheckboxOptionFacet
                                    key={`${(option.value)}`}
                                    label={label}
                                    option={{...option, key: facetKey}}
                                    transformFunction={transformFunction}
                                    formatVal={formatVal}
                                    onSelect={onSelect}
                                    onRemove={onRemove}
                                />
                            })}
                        </div>

                        {showMore && (
                            <button
                                type="button"
                                className="sui-facet-view-more"
                                onClick={onMoreClick}
                                aria-label="Show more options"
                            >
                                + More
                            </button>
                        )}
                    </fieldset>
                </CollapsableLayout>
        )}
      />
};

export default CollapsableCheckboxFacet;