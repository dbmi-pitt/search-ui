import React, { Fragment } from "react";
import { withSearch } from "@elastic/react-search-ui";
import CollapsableCheckboxFacet from "./CollapsableCheckboxFacet";
import CollapsableDateRangeFacet from "./CollapsableDateRangeFacet";
import CollapsableNumericRangeFacet from "./CollapsableNumericRangeFacet";
import {Sui} from "../../lib/search-tools";

const Facets = ({fields, filters, rawResponse, transformFunction, clearInputs, removeFilter}) => {
    const conditionalFacets = fields.conditionalFacets;

    function formatVal(id) {
        if (typeof id === "string") {
          return id.replace(/\W+/g, "")
        }
        return id
    }

    function isConditionalFacet(facetKey) {
        return conditionalFacets.hasOwnProperty(facetKey)
    }

    function getConditionalFacet(facetKey) {
        return conditionalFacets[facetKey]
    }

    function isFacetVisible(facetKey) {
        let result = true
        if (isConditionalFacet(facetKey)) {
            const predicate = getConditionalFacet(facetKey)
            if (filters) {
                result = predicate({filters})
            } else {
                result = false
            }
        }
        if (!result && filters && filters.filter(e => e.field === facetKey).length > 0) {
            let filterKey = filters.filter(e => e.field === facetKey)[0].values[0]
            if (filterKey.hasOwnProperty("name")) {
                // Date or numeric range facet
                filterKey = filterKey.name
            }
            const suiFilters = Sui.getFilters()
            if (suiFilters.hasOwnProperty(`${facetKey}.${filterKey}`)) {
                // Checkbox facet
                suiFilters[`${facetKey}.${filterKey}`].selected = false
                Sui.saveFilters(suiFilters)
            } else if (suiFilters.hasOwnProperty(filterKey)) {
                // Date or numeric range facet
                delete suiFilters[filterKey]["from"]
                delete suiFilters[filterKey]["to"]
            }
            Sui.saveFilters(suiFilters)
            removeFilter(facetKey)
        }
        return result
    }

    return (<>
        {Object.entries(fields.facets)
            .map(facet => {
                if (!isFacetVisible(facet[0])) {
                    return <Fragment key={facet[0]}></Fragment>
                }

                if (facet[1].uiType === "daterange") {
                    return <CollapsableDateRangeFacet
                        key={facet[0]}
                        facet={facet}
                        clearInputs={clearInputs}
                        formatVal={formatVal} />
                } else if (facet[1].uiType === "numrange") {
                    return <CollapsableNumericRangeFacet
                        key={facet[0]}
                        facet={facet}
                        rawResponse={rawResponse}
                        formatVal={formatVal} />
                } else {
                    return <CollapsableCheckboxFacet
                        key={facet[0]}
                        facet={facet}
                        transformFunction={transformFunction}
                        formatVal={formatVal}
                    />
                }
            }
        )}
    </>)
}

export default withSearch(({ removeFilter }) => ({
    removeFilter
}))(Facets)
