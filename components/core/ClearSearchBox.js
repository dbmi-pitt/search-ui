import React from "react";
import {withSearch} from "@elastic/react-search-ui";

function ClearSearchBox({setSearchTerm}, shouldClearFilters) {
    return (
        <div className="sui-search-box__close">
            <button className="btn btn-link" onClick={() => setSearchTerm("", {shouldClearFilters: true})}>Clear filters
            </button>
        </div>
    );
}

export default withSearch(({setSearchTerm, shouldClearFilters}) => ({
    setSearchTerm, shouldClearFilters
}))(ClearSearchBox);