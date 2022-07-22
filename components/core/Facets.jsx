import React from 'react';
import {
  Facet
} from "@elastic/react-search-ui";
import log from "loglevel"
import { MultiCheckboxFacet } from "@elastic/react-search-ui-views";

const Facets = props => {

  log.info('FACETS comp', props)
  return (
      <div>
      {Object.entries(props.fields.facets)
        .map((facet) => {
          //log.info(facet)
        return (
         <Facet
          key={facet[0]}
          field={facet[0]}
          label={facet[1]["label"]}
          filterType={facet[1]["filterType"]}
          isFilterable={facet[1]["isFilterable"]}
          //view={MultiCheckboxFacet}
        />
        );
      })
      }
  </div>);
};

export default Facets;