import Slider from '@mui/material/Slider'
import { useEffect, useState } from 'react'
import Histogram from './Histogram'
import { useSearchUIContext } from './SearchUIContext'

export default function HistogramFacet({
    facet,
    field,
    formatVal,
    transformFunction
}) {
    const { aggregations, filters, setFilter, removeFilter } =
        useSearchUIContext()

    const filter = filters.find((f) => f.field === field)

    let interval = facet.aggregationInterval ?? 1
    if (typeof interval === 'function') {
        interval = interval(request.filters)
    }

    const buckets = aggregations[field].buckets || []
    const bins = getBins()
    const min = 0
    const max = bins[bins.length - 1].key

    // These are controlled by the DoubleSlider component.
    const [values, setValues] = useState([
        filter?.values[0]?.from || min,
        filter?.values[0]?.to || max
    ])

    useEffect(() => {
        // This accounts for the case where the filter is removed from a non-facet component.
        if (filter && filter.values.length > 0) {
            const value = filter.values[0]
            setValues([
                value.from || min,
                value.to || max
            ])
        } else {
            setValues([
                min,
                max
            ])
        }
    }, [filters])

    function marks() {
        return [
            {
                value: min,
                label: min
            },
            {
                value: max,
                label: max
            }
        ]
    }

    function getBins() {
        let endValue = 0
        const bucketMap = {}
        for (const bucket of buckets) {
            bucketMap[bucket.key] = bucket.doc_count
            const value = parseInt(bucket.key)
            if (value > endValue) {
                endValue = value
            }
        }

        // Must fill in the potential gaps between the buckets with buckets that have a count of 0
        const bins = Array(endValue / interval)
        let idx = 0
        for (let i = 0; i < endValue; i += interval) {
            const count = bucketMap[i] || 0
            bins[idx] = {
                key: i,
                doc_count: count
            }
            idx++
        }
        return bins
    }

    function handleSliderChange(_, range) {
        setValues(range)
    }

    function handleSliderCommitted(_, range) {
        let newValue = { field: field }
        if (filter && filter.values.length > 0) {
            newValue = { ...filter.values[0] }
        }

        if (range[0] !== min) {
            newValue.from = range[0]
        } else {
            delete newValue.from
        }

        if (range[1] !== max) {
            newValue.to = range[1]
        } else {
            delete newValue.to
        }

        if (!newValue.from && !newValue.to) {
            // Remove the filter value if both dates are empty
            for (const value of filter?.values || []) {
                removeFilter(field, value)
            }
            return
        }

        setFilter(field, newValue)
    }

    return (
        <div className='mx-1 me-5 js-gtm--numericFacets'>
            <Histogram data={bins} values={values} />
            <Slider
                style={{ color: '#0d6efd' }}
                size='small'
                marks={marks()}
                step={interval}
                value={values}
                min={min}
                max={max}
                onChange={handleSliderChange}
                onChangeCommitted={handleSliderCommitted}
                valueLabelDisplay='auto'
                getAriaLabel={() => {
                    return facet.label
                }}
                getAriaValueText={(value) => {
                    return `${value}`
                }}
            />
        </div>
    )
}
