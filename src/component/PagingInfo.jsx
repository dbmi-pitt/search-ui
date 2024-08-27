import React from 'react'
import { appendClassName } from '../util/view'
import { useSearchUIContext } from '../context/SearchUIContext'

/**
 * @typedef {Object} PagingInfoProps
 * @property {string | undefined} className - Additional class names to apply to the paging info.
 * @property {React.HTMLAttributes<HTMLDivElement>} [rest] - Additional properties to apply to the main paging info div.
 */

/**
 * PagingInfo component renders a message indicating the current page and total hits.
 *
 * @param {PagingInfoProps} props - The properties for the component.
 * @returns {JSX.Element} The rendered search box component.
 */
export default function PagingInfo({ className, ...rest }) {
    const { pageNumber, pageSize, searchTerm, totalHits } = useSearchUIContext()

    const start = (pageNumber - 1) * pageSize + 1
    const end = Math.min(pageNumber * pageSize, totalHits)

    return (
        <div
            className={appendClassName('sui-paging-info', className)}
            {...rest}
        >
            Showing{' '}
            <strong>
                {start} - {end}
            </strong>{' '}
            out of <strong>{totalHits}</strong>
            {searchTerm && (
                <>
                    {' '}
                    for: <em>{searchTerm}</em>
                </>
            )}
        </div>
    )
}
