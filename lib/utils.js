import { v4 as uuidv4 } from 'uuid';


export default function build_globus_url_for_directory(endpoint_uuid, new_directory) {
    encoded_path = encodeURIComponent(new_directory)
    ret_string = 'https://app.globus.org/file-manager?origin_id=' + endpoint_uuid + '&origin_path=' + encoded_path
    return ret_string
}


// convert an array of objects (for multlsel) 
export function convertFacetArrayToStringArray(arr) {
    var ret_string = []

    if (arr === undefined) return ret_string

    arr.forEach((value) => {  
        console.log(value)
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

    console.log("convertStringArrayMultiselectionData", values)

    values.forEach((value) => {
        ret_string.push({'value': value.trim(), 'label': value.trim()})
    })

    return ret_string;
}

// this needs replaced with the uuid-api
export function getUUID() {
    return uuidv4();
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
