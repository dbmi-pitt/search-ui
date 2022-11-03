import React from "react";
import {withSearch} from "@elastic/react-search-ui";
import styles from '../../css/clearSearchBox.module.css'
import {ArrowCounterclockwise} from 'react-bootstrap-icons'


function ClearSearchBox({setSearchTerm}, shouldClearFilters) {
    return (
        <div className="sui-search-box__close d-flex justify-content-center">
            <button className={`${styles.clearSearchBox} mb-4 btn px-4 rounded-pill shadow`} onClick={() => setSearchTerm("", {shouldClearFilters: true})}>
                <ArrowCounterclockwise/>{' '}
                Clear filters
            </button>
        </div>
    );
}

export default withSearch(({setSearchTerm, shouldClearFilters}) => ({
    setSearchTerm, shouldClearFilters
}))(ClearSearchBox);