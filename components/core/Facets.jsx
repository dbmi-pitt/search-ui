import React, { Fragment } from "react";
import log from "loglevel";
import { withSearch } from "@elastic/react-search-ui";
import CollapsableCheckboxFacet from "./CollapsableCheckboxFacet";
import CollapsableDateRangeFacet from "./CollapsableDateRangeFacet";
import {Sui} from "../../lib/search-tools";

const Facets = ({fields, filters, rawResponse, transformFunction, clearInputs, removeFilter}) => {
    log.info("FACETS component props", fields, filters);

    const conditionalFacets = fields.conditionalFacets;
    const conditionalFacetDefinitions = fields.conditionalFacetDefinitions;

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
            let suiFilters = Sui.getFilters()
            if(suiFilters.hasOwnProperty(filterKey)) {
                suiFilters[filterKey].selected = false
                Sui.saveFilters(suiFilters)
                Sui.removeFilter(filterKey)
            }
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