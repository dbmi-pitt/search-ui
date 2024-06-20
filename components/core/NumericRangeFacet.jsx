import { useContext, useEffect, useState } from 'react'
import SearchUIContext from './SearchUIContext'
import Slider from '@mui/material/Slider'
import Histogram from './Histogram'

const NumericRangeFacet = ({ field, facet }) => {
    const {
        registerFilterChangeCallback,
        unregisterFilterChangeCallback,
        filters,
        getFilter,
        setFilter,
        removeFiltersForField,
        aggregations
    } = useContext(SearchUIContext)

    const valueInterval =
        typeof facet.uiInterval == 'function'
            ? facet.uiInterval(filters)
            : (facet.uiInterval || 1)

    const [valueRange, setValueRange] = useState(facet.uiRange || [0, 100])
    const [values, setValues] = useState(getInitialValues())
    const [histogramData, setHistogramData] = useState([])

    useEffect(() => {
        if (aggregations && aggregations.hasOwnProperty(field)) {
            const buckets = aggregations[field]['buckets'] || []
            const max = Math.max(...buckets.map((b) => b.key))
            const filledBuckets = fillZeroBuckets(buckets, valueInterval, max)
            setHistogramData(filledBuckets)
            if (facet.uiRange === undefined && max) {
                // If the range is not set in the config, automatically set it to the max aggregation value
                setValueRange([0, max])
            }
        }
    }, [aggregations])

    useEffect(() => {
        setValues(getInitialValues())
    }, [valueRange])

    const round = (num, decimalPlace=1) => {
        return Math.round(num * decimalPlace) / decimalPlace
    }

    const fillZeroBuckets = (buckets, interval, max) => {
        const decimalPlace = interval < 1 ? 10 : 1

        // Fill in the missing buckets with 0 doc_count.
        // This is necessary because the aggregation may not return buckets with 0 doc_count.
        // This is required to ensure the histogram lines up with the slider.
        const filledBuckets = []
        let i = 0
        while (i <= max) {
            const bucket = buckets.find((b) => b.key === i)
            if (bucket) {
                filledBuckets.push(bucket)
            } else {
                filledBuckets.push({ key: i, doc_count: 0 })
            }
            // Round to avoid floating point problems
            i = round(i + interval, decimalPlace)
        }

        return filledBuckets
    }

    function getInitialValues() {
        const filter = getFilter(field)
        if (!filter) return valueRange
        return [
            filter.values[0].from || valueRange[0],
            filter.values[0].to || valueRange[1]
        ]
    }

    useEffect(() => {
        registerFilterChangeCallback(field, (value, changedBy) => {
            if (changedBy === field) return
            setValues(getInitialValues())
        })
        return () => {
            unregisterFilterChangeCallback(field)
        }
    }, [])

    const marks = () => [
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
            <div className='mx-1 me-5 js-gtm--numericFacets'>
                <Histogram data={histogramData} values={values} />
                <Slider
                    onChangeCommitted={handleSliderCommitted}
                    style={{ color: '#0d6efd' }}
                    size='small'
                    getAriaLabel={() => {
                        facet.label
                    }}
                    marks={marks()}
                    step={valueInterval ?? 1}
                    value={values}
                    min={valueRange[0]}
                    max={valueRange[1]}
                    onChange={handleSliderChange}
                    valueLabelDisplay='auto'
                    getAriaValueText={valueText}
                />
            </div>
        </>
    )
}

export default NumericRangeFacet
