import log from "loglevel";

export default function build_globus_url_for_directory(endpoint_uuid, new_directory) {
    var encoded_path = encodeURIComponent(new_directory)
    return 'https://app.globus.org/file-manager?origin_id=' + endpoint_uuid + '&origin_path=' + encoded_path
}


// convert an array of objects (for multlsel) 
export function convertFacetArrayToStringArray(arr) {
    var ret_string = []

    if (arr === undefined) return ret_string

    arr.forEach((value) => {  
        log.info(value)
        try {
            
            ret_string.push(value["label"])
        } catch {
            ret_string.push(value)
        }
    })
    return ret_string;
}

// converts an array of string to the array of objects that are sutiable for multiselection 
// widget:   ["value": xxxx, "label": xxxx]
export function convertStringArrayMultiselectionData(data) {
    var ret_string = []

    if (data === undefined) return ret_string
        
    var values =  (typeof data === "object") ? data :  data.split(",")

    log.info("convertStringArrayMultiselectionData", values)

    values.forEach((value) => {
        ret_string.push({'value': value.trim(), 'label': value.trim()})
    })

    return ret_string;
}

// converts a comma separated string to array
export function convertListToArray(data) {

    // just check to make sure that this is not an array object already
    if (typeof data === "object") return data

    var ret_string = []
    var tokens =  data.split(",")

    tokens.forEach((value) => {
        ret_string.push(value.trim())
    })

    return ret_string;
}

// LÒpez => Lopez
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/normalize
export function accentFold(str) {
    return typeof str === "string"
        ? str.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        : "";
}