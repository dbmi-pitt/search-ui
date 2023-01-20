import React from 'react'
import log from "loglevel"
import CollapsableFacet from "./CollapsableFacet";
import {getOrganTypeFullName} from "../../../components/custom/js/functions";

const Facets = ({fields, filters}) => {
    log.info('FACETS component props', fields, filters)

    return (<>
        {Object.entries(fields.facets)
            .map(facet => (<CollapsableFacet
                key={facet[0]}
                facet={facet}
                fields={fields}
                filters={filters}
                transformFunction={getOrganTypeFullName}
            />))}
    </>)
}

export default Facets;