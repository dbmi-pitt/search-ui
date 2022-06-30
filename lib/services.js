import { getSearchEndPoint, getAuth } from '../../config/config';
import { simple_query_builder } from "./search-tools"; 

// save and update function for ES
export function save_update(uuid, body, action="update") {
	
	var myHeaders = new Headers();
	myHeaders.append("Content-Type", "application/json");
	myHeaders.append("Authorization", "Bearer " + getAuth())

  // // for Opensearch updates they must be wrapped in a "doc"
  // if (action === "update") {
  //   body = {"doc": body}
  // }

	var raw = JSON.stringify(body);
	var url = getSearchEndPoint() + (action==='create'? "add" : "update") + "/" + uuid
	var method = (action==='create' ? "POST" : "PUT")

	var requestOptions = {
  		method: method,
  		headers: myHeaders,
  		body: raw,
//  		redirect: 'follow'
	};

	console.log("save_update", requestOptions)

fetch(url, requestOptions)
  .then(response => response.text())
  .then(result => {
  	console.log('SAVE_UPDATE', result)
  	return true
  })
  .catch(error => console.log('error', error));


}

export function find(uuid) {

  var error_messages = [{msg: "Error has occurred"}, {msg: "UUID Not found"}]
  //console.log(req)

      // need to convert into a ES ready query
      let queryBody = simple_query_builder("uuid", uuid)
      console.log('QUERY',JSON.stringify(queryBody))
      var myHeaders = new Headers();
            myHeaders.append("Authorization", "Bearer " + getAuth());
            myHeaders.append("Content-Type", "application/json");
      var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: JSON.stringify(queryBody)
            //redirect: 'follow'
      };
  
      fetch(getSearchEndPoint() + "/search", requestOptions)
        .then(response => response.json())
        .then(result => {
            console.log('FIND', result)
         
            var total = result["hits"]["total"]["value"]
            console.debug('TOTAL', total)
            if (total === 1) {  
              var entity = result["hits"]["hits"][0]["_source"]
              console.debug('ENTITY', entity)
              return entity
            } else {
              return error_messages[1]
            }
          })
        .catch(error => { 
          console.log(error)
           return error_messages[0]
        });

}