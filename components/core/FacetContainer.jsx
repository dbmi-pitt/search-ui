import React from "react";
import { MultiCheckboxFacet } from "@elastic/react-search-ui-views";
import { helpers } from "@elastic/search-ui";

import { withSearch } from "@elastic/react-search-ui"
import { accentFold } from "../../lib/utils";

const { markSelectedFacetValuesFromFilters } = helpers;

export class FacetContainer extends React.Component {
  static defaultProps = {
    filterType: "all",
    isFilterable: false,
    show: 5
  };

  constructor(props) {
    super(props);
    this.state = {
      more: props.show,
      searchTerm: ""
    };
  }

  handleSetIsExpanded = (isExpanded) => {
    this.setState({ isExpanded })
  }

  handleClickMore = (totalOptions) => {
    this.setState(({ more }) => {
      let visibleOptionsCount = more + 10;
      const showingAll = visibleOptionsCount >= totalOptions;
      if (showingAll) visibleOptionsCount = totalOptions;

      this.props.a11yNotify("moreFilters", { visibleOptionsCount, showingAll });

      return { more: visibleOptionsCount };
    });
  };

  handleFacetSearch = (searchTerm) => {
    this.setState({ searchTerm });
  };

  render() {
    const { more, searchTerm } = this.state;
    const {
      addFilter,
      className,
      facets,
      field,
      filterType,
      filters,
      label,
      removeFilter,
      setFilter,
      view,
      isFilterable,
      a11yNotify,
      uiType,
      ...rest
    } = this.props;
    const facetsForField = facets[field];

    if (!facetsForField) return null;

    // By using `[0]`, we are currently assuming only 1 facet per field. This will likely be enforced
    // in future version, so instead of an array, there will only be one facet allowed per field.
    const facet = facetsForField[0];

    let facetValues = markSelectedFacetValuesFromFilters(
      facet,
      filters,
      field,
      filterType
    ).data;
    
    let selectedValues = facetValues
    if (uiType !== "daterange" && uiType !== "numrange") {
      // Checkbox
      selectedValues = facetValues
        .filter((fv) => fv.selected)
        .map((fv) => fv.value);
  
      if (!facetValues.length && !selectedValues.length) return null;
    }

    if (searchTerm.trim()) {
      facetValues = facetValues.filter((option) => {
        let valueToSearch;
        switch (typeof option.value) {
          case "string":
            valueToSearch = accentFold(option.value).toLowerCase();
            break;
          case "number":
            valueToSearch = option.value.toString();
            break;
          case "object":
            valueToSearch =
              typeof option?.value?.name === "string"
                ? accentFold(option.value.name).toLowerCase()
                : "";
            break;

          default:
            valueToSearch = "";
            break;
        }
        return valueToSearch.includes(accentFold(searchTerm).toLowerCase());
      });
    }

    const View = view || MultiCheckboxFacet;

    const viewProps = {
      className,
      filters: filters,
      label: label,
      onMoreClick: this.handleClickMore.bind(this, facetValues.length),
      onRemove: (value) => {
        removeFilter(field, value, filterType);
      },
      onChange: (value) => {
        setFilter(field, value, filterType);
      },
      onSelect: (value) => {
        addFilter(field, value, filterType);
      },
      options: facetValues.slice(0, more),
      showMore: facetValues.length > more,
      values: selectedValues,
      showSearch: isFilterable,
      onSearch: (value) => {
        this.handleFacetSearch(value);
      },
      searchPlaceholder: `Filter ${label}`,
      ...rest
    };

    return <View {...viewProps} />;
  }
}

export default withSearch(
  ({ filters, facets, addFilter, removeFilter, setFilter, a11yNotify }) => ({
    filters,
    facets,
    addFilter,
    removeFilter,
    setFilter,
    a11yNotify
  })
)(FacetContainer);
