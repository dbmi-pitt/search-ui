/**
 * Returns a string of class names. If the input is an array, it filters out any falsy values and joins the remaining values with a space.
 * If the input is a string, it returns the string as is.
 *
 * @param {string | string[]} newClassName - The new class name(s) to process.
 * @returns {string} - A single string of class names.
 */
function getNewClassName(newClassName) {
    if (!Array.isArray(newClassName)) return newClassName

    return newClassName.filter((name) => name).join(' ')
}

/**
 * Appends new class names to a base class name. Handles cases where either or both inputs can be strings or arrays of strings.
 *
 * @param {string | string[] | undefined} baseClassName - The base class name(s) to append to.
 * @param {string | string[] | undefined} newClassName - The new class name(s) to append.
 * @returns {string} - A single string of combined class names.
 */
export function appendClassName(baseClassName, newClassName) {
    if (!newClassName)
        return (
            (Array.isArray(baseClassName)
                ? baseClassName.join(' ')
                : baseClassName) || ''
        )

    if (!baseClassName) return getNewClassName(newClassName) || ''
    return `${baseClassName} ${getNewClassName(newClassName)}`
}
