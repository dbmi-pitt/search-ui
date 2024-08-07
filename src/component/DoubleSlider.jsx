import React, { useState } from 'react'
import '../css/slider.css'
import SliderBubble from './SliderBubble'

/**
 * @typedef {Object} DoubleSliderProps
 * @property {{ min: number; max: number; step?: number }} range - The range of the slider.
 * @property {number} minValue - The current minimum value of the slider.
 * @property {function(number): void} setMinValue - Function to set the minimum value.
 * @property {number} maxValue - The current maximum value of the slider.
 * @property {function(number): void} setMaxValue - Function to set the maximum value.
 * @property {function({ min: number; max: number }): void} [onRangeChange] - Optional callback when the range changes.
 */

/**
 * DoubleSlider component
 *
 * @param {DoubleSliderProps} props - The properties for the DoubleSlider component.
 * @returns {JSX.Element} The rendered DoubleSlider component.
 */
export default function DoubleSlider({
    range,
    minValue,
    setMinValue,
    maxValue,
    setMaxValue,
    onRangeChange
}) {
    /**@type {[number | undefined, React.Dispatch<React.SetStateAction<number | undefined>>]} */
    const [bubbleValue, setBubbleValue] = useState()

    /**
     * Handles the change event for the slider input.
     * @param {React.ChangeEvent<HTMLInputElement>} e - The change event from the slider input.
     */
    function handleSliderChange(e) {
        const { name, value } = e.target
        const newValue = parseInt(value)
        if (name === 'min') {
            if (newValue < maxValue) {
                setMinValue(newValue)
                setBubbleValue(newValue)
            }
        } else {
            if (newValue > minValue) {
                setMaxValue(newValue)
                setBubbleValue(newValue)
            }
        }
    }

    /**
     * Handles the start event for the slider input.
     * @param {React.MouseEvent | React.TouchEvent | React.KeyboardEvent} e - The start event from the slider input.
     */
    function handleSliderStart(e) {
        const target = /** @type {HTMLInputElement} */ (e.target)
        const { name } = target
        if (name === 'min') {
            setBubbleValue(minValue)
        } else {
            setBubbleValue(maxValue)
        }
    }

    /**
     * Handles the end event for the slider input.
     * @param {React.MouseEvent | React.TouchEvent | React.KeyboardEvent} e - The end event from the slider input.
     */
    function handleSliderEnd(e) {
        setBubbleValue(undefined)
        onRangeChange?.({ min: minValue, max: maxValue })
    }

    return (
        <div className='slider-container'>
            <input
                name='min'
                type='range'
                min={range.min}
                max={range.max}
                step={range.step || 1}
                value={minValue}
                onMouseDown={handleSliderStart}
                onTouchStart={handleSliderStart}
                onKeyDown={handleSliderStart}
                onChange={handleSliderChange}
                onMouseUp={handleSliderEnd}
                onTouchEnd={handleSliderEnd}
                onKeyUp={handleSliderEnd}
            />
            <input
                name='max'
                type='range'
                min={range.min}
                max={range.max}
                step={range.step || 1}
                value={maxValue}
                onChange={handleSliderChange}
                onMouseDown={handleSliderStart}
                onTouchStart={handleSliderStart}
                onKeyDown={handleSliderStart}
                onMouseUp={handleSliderEnd}
                onTouchEnd={handleSliderEnd}
                onKeyUp={handleSliderEnd}
            />
            {bubbleValue !== undefined && (
                <SliderBubble
                    value={bubbleValue}
                    position={`calc(${
                        bubbleValue / (range.max - range.min)
                    } * (100% - var(--thumb-size)) - (var(--bubble-size) - var(--thumb-size)) / 2)`}
                />
            )}
            <div className='slider-background'></div>
            <div
                className='slider-fill'
                style={{
                    left: `calc(${
                        minValue / (range.max - range.min)
                    } * (100% - var(--thumb-size)) + var(--thumb-size) / 2)`,
                    width: `calc(${
                        (maxValue - minValue) / (range.max - range.min)
                    } * (100% - var(--thumb-size)))`
                }}
            ></div>
        </div>
    )
}
