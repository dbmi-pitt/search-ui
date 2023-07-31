import { useState } from "react";
import { withSearch } from "@elastic/react-search-ui";
import { Facet } from "@elastic/react-search-ui";
import CollapsableLayout from "./CollapsableLayout";
import { Sui } from "../../lib/search-tools";
import Slider from '@mui/material/Slider';

const NumericRangeFacet = ({label, field, facetKey, valueRange, formatVal, filters, onChange, onRemove}) => {
    const [values, setValues] = useState(getInitialValues());

    function getInitialValues() {
        const filters = Sui.getFilters()
        const min = filters[`${facetKey}.min`] ?? valueRange[0]
        const max = filters[`${facetKey}.max`] ?? valueRange[1]
        return [min, max]
    }

    function updateFilters(values) {
        const minValue = values[0] !== "" ? values[0] : valueRange[0]
        const maxValue = values[1] !== "" ? values[1] : valueRange[1]

        let f = Sui.getFilters()
        f[`${facetKey}.min`] = minValue
        f[`${facetKey}.max`] = maxValue
        Sui.saveFilters(f)

        const filter = {}
        if (minValue !== valueRange[0]) {
            filter.from = minValue
        }

        if (maxValue !== valueRange[1]) {
            filter.to = maxValue
        }
        
        if (Object.keys(filter).length < 1) {
            const found = filters.find((f) => f.field === field)
            if (found) {
                onRemove(found)
            }
        } else {
            filter.name = field
            onChange(filter)
        }
    }

    function handleSliderChange(_, newValues) {
        setValues(newValues);
    }

    function handleSliderCommitted(_, newValues) {
        updateFilters(newValues)
    }

    function handleInputChange(newValue, whichInput) {
        if (whichInput === "min") {
            setValues([newValue, values[1]]);
        } else {
            setValues([values[0], newValue]);
        }
    }

    function handleInputSubmit(event, whichInput, unfocused = false) {
        if (unfocused || event.key === 'Enter') {
            if (whichInput === "min") {
                updateFilters([event.target.value, values[1]])
            } else {
                updateFilters([values[0], event.target.value])
            }
        }
    };

    function valueText(value) {
        return `${value}`;
    }

    return (
        <>
            <div>
                <div className="mx-1">
                    <Slider
                        onChangeCommitted={handleSliderCommitted}
                        style={{color: "#0d6efd"}}
                        size="small"
                        getAriaLabel={() => {label}}
                        value={values}
                        min={valueRange[0]}
                        max={valueRange[1]}
                        onChange={handleSliderChange}
                        valueLabelDisplay="auto"
                        getAriaValueText={valueText} />
                </div>
                <div className="d-flex justify-content-between ">
                    <input
                        data-transaction-name={`facet - ${label} - min`}
                        id={`sui-facet--${formatVal(label)}-min`}
                        className={"sui-multi-checkbox-facet mt-0"}
                        type="number"
                        value={values[0]}
                        min={valueRange[0]}
                        max={valueRange[1]}
                        onKeyDown={(e) => handleInputSubmit(e, "min")}
                        onBlur={(e) => handleInputSubmit(e, "min", true)}
                        onChange={(e) => handleInputChange(e.target.value, "min")}
                        required
                    />
                    <input
                        data-transaction-name={`facet - ${label} - max`}
                        id={`sui-facet--${formatVal(label)}-max`}
                        className={"sui-multi-checkbox-facet mt-0"}
                        type="number"
                        value={values[1]}
                        min={valueRange[0]}
                        max={valueRange[1]}
                        onKeyDown={(e) => handleInputSubmit(e, "max")}
                        onBlur={(e) => handleInputSubmit(e, "max", true)}
                        onChange={(e) => handleInputChange(e.target.value, "max")}
                        required
                    />
                </div>
            </div>
        </>
    )
}

const CollapsableNumericRangeFacet = ({facet, formatVal, filters}) => {
    const label = facet[1].label;
    const field = facet[1].field.replace(".keyword", "");
    const facetKey = facet[0];
    const [isExpanded, setIsExpanded] = useState(Sui.isExpandedNumericCategory(facet, facetKey));
  
    const handleExpanded = () => {
        let f = Sui.getFilters()
        f[facetKey] = !isExpanded
        Sui.saveFilters(f)
        setIsExpanded(!isExpanded)
    }

    return <Facet
        key={facetKey}
        field={facetKey}
        filterType={facet[1]["filterType"]}
        isFilterable={facet[1]["isFilterable"]}
        className="js-gtm--facets"
        view={({
            className,
            onChange,
            onRemove,
        }) => (
            <CollapsableLayout
                key={facet[0]}
                isExpanded={isExpanded}
                setIsExpanded={handleExpanded}
                label={label}
                formatVal={formatVal}>

                <fieldset className={"sui-facet " + className}>
                    <div className="sui-multi-checkbox-facet">
                        <NumericRangeFacet
                             label={label}
                             field={field}
                             facetKey={facetKey}
                             valueRange={facet[1].uiRange}
                             formatVal={formatVal}
                             filters={filters}
                             onChange={onChange}
                             onRemove={onRemove} />
                    </div>
                </fieldset>

            </CollapsableLayout>
        )}
      />
};

export default withSearch(({ filters, setFilter, removeFilter }) => ({
    filters,
    setFilter,
    removeFilter,
}))(CollapsableNumericRangeFacet)
