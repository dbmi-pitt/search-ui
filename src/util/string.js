/**
 * Formats the given value by removing non-word characters if it's a string,
 * or converting it to a string if it's a number.
 *
 * @param {string | number} value - The value to format.
 * @returns {string} - The formatted string.
 */
export function formatValue(value) {
    if (typeof value === 'string') {
        return value.replace(/\W+/g, '')
    }
    return value.toString()
}
