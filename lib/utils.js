/**
 * Converts a comma-separated string to an array. If the input is already an array, it returns the input as is.
 *
 * @param {string|string[]} data - The comma-separated string or an array.
 * @returns {string[]} - The resulting array.
 */
export function convertListToArray(data) {
    if (Array.isArray(data))
        return data

    const array =  data.split(",")
    for (let i = 0; i < array.length; i++) {
        array[i] = array[i].trim()
    }
    return array
}

/**
 * Removes accents from a string by normalizing it to NFD (Normalization Form D) and removing diacritical marks.
 *
 * @param {string} str - The input string that may contain accented characters.
 * @returns {string} - The resulting string with accents removed.
 * 
 * @example
 * accentFold("LÒpez") => "Lopez"
 * 
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/normalize}
 */
export function accentFold(str) {
    return typeof str === "string"
        ? str.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        : "";
}