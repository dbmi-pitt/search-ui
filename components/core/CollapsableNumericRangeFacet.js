import {useState} from "react"
import {withSearch} from "@elastic/react-search-ui"
import CollapsableLayout from "./CollapsableLayout"
import {Sui} from "../../lib/search-tools"
import Slider from "@mui/material/Slider"
import FacetContainer from "./FacetContainer"
import Histogram from "./Histogram";

const NumericRangeFacet = ({
                               label,
                               field,
                               valueRange,
                               aggregations,
                               filters,
                               onChange,
                               onRemove
                           }) => {
    const [values, setValues] = useState(getInitialValues())

    function getInitialValues() {
        const filters = Sui.getFilters()
        const filter = filters[field] ?? {}
        const min = filter.from ?? valueRange[0]
        const max = filter.to ?? valueRange[1]
        return [parseInt(min), parseInt(max)]
    }

    const marks = [
            {
                value: valueRange[0],
                label: valueRange[0],
            },
            {
                value: valueRange[1],
                label: valueRange[1],
            }
        ]

    function updateFilters(values) {
        const minValue = values[0] !== "" ? values[0] : valueRange[0]
        const maxValue = values[1] !== "" ? values[1] : valueRange[1]

        const filter = {}
        if (minValue !== valueRange[0]) {
            filter.from = minValue
        }

        if (maxValue !== valueRange[1]) {
            filter.to = maxValue
        }

        let f = Sui.getFilters()
        if (!f[field]) {
            f[field] = {key: field}
        }

        if (Object.keys(filter).length < 1) {
            delete f[field].from
            delete f[field].to
            Sui.saveFilters(f)
            const found = filters.find((f) => f.field === field)
            if (found) {
                found.values.forEach((val) => onRemove(val))
            }
        } else {
            filter.name = field
            f[field].key = field
            f[field].from = minValue
            f[field].to = maxValue
            Sui.saveFilters(f)
            onChange(filter)
        }
    }

    function handleSliderChange(_, newValues) {
        setValues(newValues)
    }

    function handleSliderCommitted(_, newValues) {
        updateFilters(newValues)
    }

    function valueText(value) {
        return `${value}`
    }

    return (
        <>
            <div>
                <div className='mx-1' style={{boxSizing: "content-box"}}>
                    <Histogram
                        data={aggregations}
                        values={values}
                    />
                    <Slider
                        onChangeCommitted={handleSliderCommitted}
                        style={{color: "#0d6efd"}}
                        size='small'
                        getAriaLabel={() => {
                            label
                        }}
                        marks={marks}
                        value={values}
                        min={valueRange[0]}
                        max={valueRange[1]}
                        onChange={handleSliderChange}
                        valueLabelDisplay='auto'
                        getAriaValueText={valueText}
                    />
                </div>
            </div>
        </>
    )
}

const CollapsableNumericRangeFacet = ({facet, rawResponse, formatVal, filters}) => {
    const label = facet[1].label
    let aggregations = null
    if (rawResponse.hasOwnProperty("aggregations") && rawResponse["aggregations"].hasOwnProperty([facet[0] + "_histogram"])) {
        aggregations = rawResponse["aggregations"][facet[0] + "_histogram"]["buckets"]
    }
    const field = facet[1].field.replace(".keyword", "")
    const facetKey = facet[0]
    const [isExpanded, setIsExpanded] = useState(Sui.isExpandedNumericCategory(facet, facetKey))

    const handleExpanded = () => {
        let f = Sui.getFilters()
        if (!f[field]) {
            f[field] = {key: field}
        }
        f[field].key = field
        f[field].isExpanded = !isExpanded
        Sui.saveFilters(f)
        setIsExpanded(!isExpanded)
    }

    return (
        <FacetContainer
            key={facetKey}
            field={facetKey}
            filterType={facet[1]["filterType"]}
            isFilterable={facet[1]["isFilterable"]}
            className='js-gtm--facets'
            uiType='numrange'
            view={({className, onChange, onRemove}) => (
                <CollapsableLayout
                    key={facet[0]}
                    isExpanded={isExpanded}
                    setIsExpanded={handleExpanded}
                    label={label}
                    formatVal={formatVal}
                >
                    <fieldset className={"sui-facet " + className}>
                        <div className='sui-multi-checkbox-facet'>
                            <NumericRangeFacet
                                label={label}
                                field={field}
                                facetKey={facetKey}
                                valueRange={facet[1].uiRange}
                                aggregations={aggregations}
                                formatVal={formatVal}
                                filters={filters}
                                onChange={onChange}
                                onRemove={onRemove}
                            />
                        </div>
                    </fieldset>
                </CollapsableLayout>
            )}
        />
    )
}

export default withSearch(({filters, setFilter, removeFilter}) => ({
    filters,
    setFilter,
    removeFilter,
}))(CollapsableNumericRangeFacet)
