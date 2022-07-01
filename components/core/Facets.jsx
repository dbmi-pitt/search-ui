import React from 'react';
import {
  Facet
} from "@elastic/react-search-ui";

import { MultiCheckboxFacet } from "@elastic/react-search-ui-views";

const Facets = props => {

  console.log('FACETS comp', props)
  return (
      <>
      {Object.entries(props.fields.facets)
        .map((facet) => {
          //console.log(facet)
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
  </>);
};

export default Facets;