import React, { Fragment } from "react";
import log from "loglevel";
import CollapsableCheckboxFacet from "./CollapsableCheckboxFacet";
import CollapsableDateRangeFacet from "./CollapsableDateRangeFacet";
import CollapsableNumericRangeFacet from "./CollapsableNumericRangeFacet";

const Facets = ({fields, filters, transformFunction, clearInputs}) => {
    log.info("FACETS component props", fields, filters);
    
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
                        formatVal={formatVal} />
                } else {
                    return <CollapsableCheckboxFacet
                        key={facet[0]}
                        facet={facet}
                        transformFunction={transformFunction}
                        formatVal={formatVal} />
                }
            }
        )}
    </>)
}

export default Facets;
