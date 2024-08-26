import React from 'react'

/**
 * Represents a single bin in the histogram.
 * @typedef {Object} HistogramBin
 * @property {number} start - The start value of the bin.
 * @property {number} end - The end value of the bin.
 * @property {number} count - The count of items in the bin.
 */

/**
 * Props for the Histogram component.
 * @typedef {Object} HistogramProps
 * @property {HistogramBin[]} bins - The array of histogram bins.
 * @property {number} minValue - The minimum value to highlight in the histogram.
 * @property {number} maxValue - The maximum value to highlight in the histogram.
 */

/**
 * A component that renders a histogram.
 * @param {HistogramProps} props - The props for the component.
 * @returns {JSX.Element} The rendered histogram component.
 */
export default function Histogram({ bins, minValue, maxValue }) {
    const binWidth = 100 / bins.length
    const heightMultiplier = 100 / Math.max(...bins.map((bin) => bin.count))

    return (
        <div className='d-flex flex-row align-items-end w-100' style={{height: '8em'}}>
            {bins.map((bin, index) => (
                <div
                    key={index}
                    className='bg-primary'
                    style={{
                        width: `${binWidth}%`,
                        height: `${Math.floor(heightMultiplier * bin.count)}%`,
                        opacity:
                            bin.start >= minValue && bin.end <= maxValue
                                ? 1
                                : 0.5
                    }}
                />
            ))}
        </div>
    )
}
