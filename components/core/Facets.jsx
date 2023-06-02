import React from 'react'
import log from "loglevel"
import CollapsableFacet from "./CollapsableFacet";
import DateRangeFacet from "./DateRangeFacet";

const Facets = ({fields, filters, transformFunction, clearInputs}) => {
    log.info('FACETS component props', fields, filters)

    return (<>
        {Object.entries(fields.facets)
            .map(facet => {
                if (facet[1].uiType === 'daterange') {
                    return <DateRangeFacet 
                        key={facet[0]}
                        filters={filters}
                        facet={facet}
                        clearInputs={clearInputs} />
                } else {
                    return <CollapsableFacet
                        key={facet[0]}
                        facet={facet}
                        fields={fields}
                        filters={filters}
                        transformFunction={transformFunction} />
                }
            }
        )}
    </>)
}

export default Facets;