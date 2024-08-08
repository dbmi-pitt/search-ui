import React from 'react'

/**
 * @typedef {Object} SliderBubbleProps
 * @property {number} value - The value to be displayed inside the bubble.
 * @property {string} position - The CSS left position of the bubble.
 */

/**
 * SliderBubble component displays a bubble with a value and a triangle at the bottom.
 *
 * @param {SliderBubbleProps} props - The properties for the SliderBubble component.
 * @returns {JSX.Element} The rendered SliderBubble component.
 */
export default function SliderBubble({ value, position }) {
    return (
        <div className='bubble' style={{ left: position }}>
            <span className='bubble-text'>{value}</span>
            <div className='triangle'></div>
        </div>
    )
}
