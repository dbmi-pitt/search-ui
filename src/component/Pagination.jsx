import React from 'react'
import { useSearchUIContext } from '../context/SearchUIContext'
import { appendClassName } from '../util/view'

export default function Pagination({ className, ...rest }) {
    const {
        loading,
        pageNumber,
        pageSize,
        pageSizeOptions,
        setPageNumber,
        setPageSize,
        totalHits
    } = useSearchUIContext()

    const start = (pageNumber - 1) * pageSize + 1
    const end = Math.min(pageNumber * pageSize, totalHits)
    const lastPageNumber = Math.ceil(totalHits / pageSize)

    let filteredOptions = pageSizeOptions.filter((opt) => opt <= totalHits)
    if (filteredOptions.length === 0) {
        filteredOptions = [Math.min(...pageSizeOptions)]
    }

    function handlePrevPageClick() {
        setPageNumber(pageNumber - 1)
    }

    function handleNextPageClick() {
        setPageNumber(pageNumber + 1)
    }

    function handleFirstPageClick() {
        setPageNumber(1)
    }

    function handleLastPageClick() {
        setPageNumber(lastPageNumber)
    }

    /**
     * Handles the event when a new page size is selected.
     *
     * @param {import('react').ChangeEvent<HTMLSelectElement>} e - The event object for the select element.
     */
    function handlePageSizeSelect(e) {
        e.preventDefault()
        const selectedPageSize = parseInt(e.target.value)
        setPageSize(selectedPageSize)
    }

    if (loading) {
        return null
    }

    return (
        <nav className={appendClassName('sui-pagination', className)} {...rest}>
            <span className='rows-per-page'>Rows per page:</span>
            <div className='rows-dropdown'>
                <select
                    aria-label='Rows per page:'
                    value={pageSize}
                    onChange={handlePageSizeSelect}
                >
                    {filteredOptions.map((option) => (
                        <option key={option} value={option}>
                            {option}
                        </option>
                    ))}
                </select>
                <svg
                    xmlns='http://www.w3.org/2000/svg'
                    width='24'
                    height='24'
                    viewBox='0 0 24 24'
                >
                    <path d='M7 10l5 5 5-5z'></path>{' '}
                    <path d='M0 0h24v24H0z' fill='none'></path>
                </svg>
            </div>
            <span className='range'>
                {start}-{end} of {totalHits}
            </span>
            <div className='btn-container'>
                <button
                    id='pagination-first-page'
                    type='button'
                    aria-label='First Page'
                    aria-disabled={pageNumber === 1}
                    disabled={pageNumber === 1}
                    onClick={handleFirstPageClick}
                >
                    <svg
                        xmlns='http://www.w3.org/2000/svg'
                        width='24'
                        height='24'
                        viewBox='0 0 24 24'
                        aria-hidden='true'
                        role='presentation'
                    >
                        <path d='M18.41 16.59L13.82 12l4.59-4.59L17 6l-6 6 6 6zM6 6h2v12H6z'></path>
                        <path fill='none' d='M24 24H0V0h24v24z'></path>
                    </svg>
                </button>
                <button
                    id='pagination-previous-page'
                    type='button'
                    aria-label='Previous Page'
                    aria-disabled={pageNumber === 1}
                    disabled={pageNumber === 1}
                    onClick={handlePrevPageClick}
                >
                    <svg
                        xmlns='http://www.w3.org/2000/svg'
                        width='24'
                        height='24'
                        viewBox='0 0 24 24'
                        aria-hidden='true'
                        role='presentation'
                    >
                        <path d='M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z'></path>
                        <path d='M0 0h24v24H0z' fill='none'></path>
                    </svg>
                </button>
                <button
                    id='pagination-next-page'
                    type='button'
                    aria-label='Next Page'
                    aria-disabled={pageNumber === lastPageNumber}
                    disabled={pageNumber === lastPageNumber}
                    onClick={handleNextPageClick}
                >
                    <svg
                        xmlns='http://www.w3.org/2000/svg'
                        width='24'
                        height='24'
                        viewBox='0 0 24 24'
                        aria-hidden='true'
                        role='presentation'
                    >
                        <path d='M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z'></path>
                        <path d='M0 0h24v24H0z' fill='none'></path>
                    </svg>
                </button>
                <button
                    id='pagination-last-page'
                    type='button'
                    aria-label='Last Page'
                    aria-disabled={pageNumber === lastPageNumber}
                    disabled={pageNumber === lastPageNumber}
                    onClick={handleLastPageClick}
                >
                    <svg
                        xmlns='http://www.w3.org/2000/svg'
                        width='24'
                        height='24'
                        viewBox='0 0 24 24'
                        aria-hidden='true'
                        role='presentation'
                    >
                        <path d='M5.59 7.41L10.18 12l-4.59 4.59L7 18l6-6-6-6zM16 6h2v12h-2z'></path>
                        <path fill='none' d='M0 0h24v24H0V0z'></path>
                    </svg>
                </button>
            </div>
        </nav>
    )
}
