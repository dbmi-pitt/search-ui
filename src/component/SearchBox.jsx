import React, { useState } from 'react'

/**
 * @typedef {Object} SearchBoxProps
 * @property {string | undefined} initialValue - The initial value of the search input.
 * @property {string | undefined} placeholder - The placeholder text for the search input.
 */

/**
 * SearchBox component renders a search input box.
 *
 * @param {SearchBoxProps} props - The properties for the component.
 * @returns {JSX.Element} The rendered search box component.
 */
export default function SearchBox({ initialValue, placeholder }) {
    const [value, setValue] = useState(initialValue || '')

    /**
     * Handles the change event for the input element.
     *
     * @param {React.ChangeEvent<HTMLInputElement>} e - The change event object.
     */
    function handleInputChange(e) {
        setValue(e.target.value)
    }

    return (
        <div className='react-es-searchbox'>
            <input
                type='text'
                value={value}
                onChange={handleInputChange}
                placeholder={placeholder || 'search…'}
            />
        </div>
    )
}
