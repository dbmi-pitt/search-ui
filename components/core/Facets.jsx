import React from 'react';
import {
  Facet
} from "@elastic/react-search-ui";



const Facets = props => {

//console.log('FACETS', props.fields)
  return (
      props.fields.filter(field => field.facet.active === true)
        .map((field) => {
        return (
         <Facet
          key={field["_uid"]}
          field={field["field"]}
          label={field["label"]}
          filterType={field["facet"]["filterType"]}
          isFilterable={field["facet"]["isFilterable"]}
        />
        );
      })
  );
};

export default Facets;