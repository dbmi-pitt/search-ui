import { v4 as uuidv4 } from 'uuid';


export default function build_globus_url_for_directory(endpoint_uuid, new_directory) {
    encoded_path = encodeURIComponent(new_directory)
    ret_string = 'https://app.globus.org/file-manager?origin_id=' + endpoint_uuid + '&origin_path=' + encoded_path
    return ret_string
}

// export function pseudo_request(text) {
//     let request {
//         "current": 1,
//         "filters": [],
//         "resultsPerPage": 1,
//         "searchTerm": text,
//         "sortDirection": "",
//         "sortField": "",
//         "sortList": []
//     }
// }

export function convertFacetArrayToStringArray(arr) {
    var ret_string = []

    console.log("facetArrayToStrings")
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


// this needs replaced with the uuid-api
export function getUUID() {
    return uuidv4();
}

// converts a comma separated string to array
export function convertListToArray(str) {
    var ret_string = []
    var tokens =  str.split(",")

    tokens.forEach((value) => {
        ret_string.push(value.trim())
    })

    return ret_string;
}
