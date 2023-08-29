import { useContext, useEffect, useState } from 'react'
import SearchUIContext from './SearchUIContext'
import Slider from '@mui/material/Slider'
import Histogram from './Histogram'

const NumericRangeFacet = ({ field, label, facet }) => {
    const valueRange = facet.uiRange
    const { getFilter, setFilter, removeFiltersForField, aggregations } = useContext(SearchUIContext)

    const [values, setValues] = useState(getInitialValues())
    const [histogramData, setHistogramData] = useState([])

    useEffect(() => {
        if (aggregations && aggregations.hasOwnProperty(`${field}_histogram`)) {
            setHistogramData(aggregations[`${field}_histogram`]['buckets'] || [])
        }
    }, [aggregations])

    function getInitialValues() {
        const filter = getFilter(field)
        if (!filter) return facet.uiRange
        return [filter.values[0].from || facet.uiRange[0], filter.values[0].to || facet.uiRange[1]]
    }

    const marks = [
        {
            value: valueRange[0],
            label: valueRange[0]
        },
        {
            value: valueRange[1],
            label: valueRange[1]
        }
    ]

    function updateFilters(newValues) {
        const minValue = newValues[0] !== '' ? newValues[0] : valueRange[0]
        const maxValue = newValues[1] !== '' ? newValues[1] : valueRange[1]

        const filter = {}
        if (minValue !== valueRange[0]) {
            filter.from = minValue
        }

        if (maxValue !== valueRange[1]) {
            filter.to = maxValue
        }

        if (Object.keys(filter).length === 0) {
            // remove filter
            removeFiltersForField(field)
        } else {
            // set new filter
            filter.name = field
            setFilter(field, filter)
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
                <div className='mx-1'>
                    <Histogram data={histogramData} values={values} />
                    <Slider
                        onChangeCommitted={handleSliderCommitted}
                        style={{ color: '#0d6efd' }}
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

export default NumericRangeFacet
