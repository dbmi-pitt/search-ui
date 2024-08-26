import React from 'react'
import { useSearchUIContext } from '../context/SearchUIContext'

/**
 * @typedef {Object} SearchBoxProps
 * @property {string | undefined} placeholder - The placeholder text for the search input.
 */

/**
 * SearchBox component renders a search input box.
 *
 * @param {SearchBoxProps} props - The properties for the component.
 * @returns {JSX.Element} The rendered search box component.
 */
export default function SearchBox({ placeholder }) {
    const { searchTerm, setSearchTerm, clearSearchTerm } = useSearchUIContext()

    /**
     * Handles the key down event for the input element.
     *
     * @param {React.KeyboardEvent<HTMLInputElement>} e - The keyboard event object.
     */
    function handleKeyDown(e) {
        if (e.key === 'Enter') {
            const target = /** @type {HTMLInputElement} */ (e.target)
            const searchTerm = target.value.trim()
            if (searchTerm === '') {
                clearSearchTerm()
            } else {
                setSearchTerm(searchTerm)
            }
        }
    }

    return (
        <div className='react-es-searchbox'>
            <input
                type='text'
                value={searchTerm || ''}
                onKeyDown={handleKeyDown}
                placeholder={placeholder || 'search…'}
            />
        </div>
    )
}
