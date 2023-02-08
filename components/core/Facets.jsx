import React from 'react'
import log from "loglevel"
import CollapsableFacet from "./CollapsableFacet";

const Facets = ({fields, filters, transformFunction}) => {
    log.info('FACETS component props', fields, filters)

    return (<>
        {Object.entries(fields.facets)
            .map(facet => (<CollapsableFacet
                key={facet[0]}
                facet={facet}
                fields={fields}
                filters={filters}
                transformFunction={transformFunction}
            />))}
    </>)
}

export default Facets;