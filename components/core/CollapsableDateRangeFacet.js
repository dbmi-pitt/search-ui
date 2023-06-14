import React, { useEffect, useState } from "react";
import { withSearch } from "@elastic/react-search-ui";
import styles from "../../css/collapsableFacets.module.css";
import CollapsableLayout from "./CollapsableLayout";

const CollapsableDateRangeFacet = ({ facet, clearInputs, formatVal, filters, setFilter, removeFilter }) => {
    const label = facet[1].label;
    const field = facet[1].field.split(".")[0];
    const [isExpanded, setIsExpanded] = useState(facet[1].hasOwnProperty("isExpanded") ? facet[1]["isExpanded"] : true);

    // default dates
    const DEFAULT_MIN_DATE = "1970-01-01";
    const DEFAULT_MAX_DATE = "2300-01-01";

    // States
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    // These initial values constrain the date input to 4 digit years. Inputs will change widths without them.
    const [startMaxDate, setStartMaxDate] = useState(DEFAULT_MAX_DATE);
    const [endMinDate, setEndMinDate] = useState(DEFAULT_MIN_DATE);

    const [startDateError, setStartDateError] = useState("");
    const [endDateError, setEndDateError] = useState("");

    useEffect(() => {
        filters.forEach((filter) => {
            if (filter.field === field) {
                filter.values.forEach((value) => {
                    if (value.hasOwnProperty("from")) {
                        let date = new Date(value.from)
                        setStartDate(date.toISOString().split("T")[0])
                    }
                    if (value.hasOwnProperty("to")) {
                        let date = new Date(value.to)
                        setEndDate(date.toISOString().split("T")[0])
                    }
                })
            }
        })
    }, [])

    useEffect(() => {
        if (clearInputs) {
            setStartDate("")
            setEndDate("")
            setStartMaxDate(DEFAULT_MAX_DATE)
            setEndMinDate(DEFAULT_MIN_DATE)
        }
    }, [clearInputs])

    useEffect(() => {
        const filter = {}

        const startTimestamp = Date.parse(`${startDate}T00:00:00.000Z`)
        if (startTimestamp && startTimestamp >= 0) {
            filter.from = startTimestamp
        }

        const endTimestamp = Date.parse(`${endDate}T00:00:00.000Z`)
        if (endTimestamp && endTimestamp >= 0) {
            // Add 24 hours minus 1 ms to the end date so inclusive of the end date
            filter.to = endTimestamp + 24 * 60 * 60 * 1000 - 1
        }

        if (Object.keys(filter).length < 1) {
            const found = filters.find((f) => f.field === field)
            if (found) {
                removeFilter(field)
            }
        } else {
            filter.name = field
            setFilter(field, filter)
        }
    }, [startDate, endDate])

    function handleDateChange(targetName, dateStr) {
        // Validate date
        const timestamp = Date.parse(`${dateStr}T00:00:00.000Z`)
        const otherTimestamp = Date.parse(`${targetName === "startdate" ? endDate : startDate}T00:00:00.000Z`)

        if (timestamp && otherTimestamp) {
            if (targetName === "startdate") {
                if (timestamp > otherTimestamp) {
                    setStartDateError("Start date must be before end date")
                    setEndDateError("")
                } else {
                    setStartDateError("")
                    setEndDateError("")
                }
            }

            if (targetName === "enddate") {
                if (timestamp < otherTimestamp) {
                    setStartDateError("")
                    setEndDateError("End date must be after start date")
                } else {
                    setStartDateError("")
                    setEndDateError("")
                }
            }
        }

        if (targetName === "startdate") {
            setStartDate(dateStr)
            if (timestamp) {
                setEndMinDate(dateStr)
            }
        } else {
            setEndDate(dateStr)
            if (timestamp) {
                setStartMaxDate(dateStr)
            }
        }
    }

    return (
        <CollapsableLayout
            key={facet[0]}
            isExpanded={isExpanded}
            setIsExpanded={setIsExpanded}
            label={label}
            formatVal={formatVal}>

            <div className="my-1 d-flex justify-content-between">
                <span className="sui-multi-checkbox-facet">Start Date</span>
                <input
                    data-transaction-name={`facet - ${label}`}
                    id={`sui-facet--${formatVal(label)}-startdate`}
                    className={`${startDateError ? styles.inputWarning : ""} sui-multi-checkbox-facet`}
                    type="date"
                    value={startDate}
                    min={DEFAULT_MIN_DATE}
                    max={startMaxDate}
                    onChange={(e) => handleDateChange("startdate", e.target.value)}
                    required
                    pattern="\d{4}-\d{2}-\d{2}"
                />
            </div>
            <div className="my-1 d-flex justify-content-between">
                <span className="sui-multi-checkbox-facet">End Date</span>
                <input
                    data-transaction-name={`facet - ${label}`}
                    id={`sui-facet--${formatVal(label)}-enddate`}
                    className={`${endDateError ? styles.inputWarning : ""} sui-multi-checkbox-facet`}
                    type="date"
                    value={endDate}
                    min={endMinDate}
                    max={DEFAULT_MAX_DATE}
                    onChange={(e) => handleDateChange("enddate", e.target.value)}
                    required
                    pattern="\d{4}-\d{2}-\d{2}"
                />
            </div>
            <div>
                {startDateError && <span className="sui-multi-checkbox-facet text-danger">{startDateError}</span>}
                {endDateError && <span className="sui-multi-checkbox-facet text-danger">{endDateError}</span>}
            </div>
        </CollapsableLayout>
    )
}

export default withSearch(({ filters, setFilter, removeFilter }) => ({
    filters,
    setFilter,
    removeFilter,
}))(CollapsableDateRangeFacet)
