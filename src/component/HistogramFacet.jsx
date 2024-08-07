import React, { useState } from 'react'
import { useSearchUIContext } from '../context/SearchUIContext'
import Histogram from './Histogram'
import DoubleSlider from './DoubleSlider'

/**
 * @typedef {import('../types').FacetConfig} FacetConfig
 * @typedef {import('../types').HistogramAggregation} HistogramAggregation
 * @typedef {import('./Histogram').HistogramBin} HistogramBin
 * @typedef {import('../types').RangeFilter} RangeFilter
 */

/**
 * @typedef {Object} HistogramFacetProps
 * @property {FacetConfig} config - The configuration for the facet.
 */

/**
 * A component that renders a histogram facet.
 *
 * @param {HistogramFacetProps} props - The properties for the component.
 * @returns {JSX.Element} The rendered component.
 */
export default function HistogramFacet({ config }) {
    const { aggregations, getFilter, addFilter, removeFilter } =
        useSearchUIContext()

    const aggregation = /** @type {HistogramAggregation} */ (config.aggregation)
    const buckets = aggregations[config.name] || []
    const interval = aggregation.interval
    const bins = getBins()

    const [minValue, setMinValue] = useState(0)
    const [maxValue, setMaxValue] = useState(bins[bins.length - 1].end)

    /**
     * Generates bins based on the provided buckets and interval. Each bin represents a range of values and the count of items within that range.
     *
     * @returns {Array<HistogramBin>} An array of bins, each containing the start value, end value, and count of items in that range.
     */
    function getBins() {
        let endValue = 0
        const bucketMap = {}
        for (const bucket of buckets) {
            bucketMap[bucket.value] = bucket.count
            const value = parseInt(bucket.value)
            if (value > endValue) {
                endValue = value
            }
        }

        // Must fill in the potential gaps between the buckets with buckets that have a count of 0
        const bins = Array((endValue + interval) / interval)
        let idx = 0
        for (let i = 0; i < endValue; i += interval) {
            const count = bucketMap[i] || 0
            bins[idx] = {
                start: i,
                end: i + interval,
                count: count
            }
            idx++
        }
        return bins
    }

    /**
     * Handles the change in the range of the histogram. Called when the slider is released.
     *
     * @param {{ min: number; max: number }} range - The new range values.
     */
    function onRangeChange(range) {
        let gte = undefined
        if (range.min !== 0) {
            gte = range.min
        }

        let lte = undefined
        if (range.max !== bins[bins.length - 1].end) {
            lte = range.max
        }

        if (gte === undefined && lte === undefined) {
            removeFilter(config.name)
            return
        }

        /** @type {RangeFilter} */
        const filter = {
            type: 'range',
            field: config.field,
            gte: gte,
            lte: lte
        }
        addFilter(config.name, filter)
    }

    return (
        <div className='mx-1 me-5 js-gtm--numericFacets'>
            <Histogram bins={bins} minValue={minValue} maxValue={maxValue} />
            <DoubleSlider
                range={{
                    min: 0,
                    max: bins[bins.length - 1].end,
                    step: interval
                }}
                minValue={minValue}
                setMinValue={setMinValue}
                maxValue={maxValue}
                setMaxValue={setMaxValue}
                onRangeChange={onRangeChange}
            />
        </div>
    )
}
