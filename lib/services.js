import { getSearchEndPoint, getAuth } from '../../config/config';
import { simple_query_builder } from "./search-tools";
import log from "loglevel";

// save and update function for ES
export function save_update(uuid, body, action="update", router) {
	
	var myHeaders = new Headers();
	myHeaders.append("Content-Type", "application/json");
	myHeaders.append("Authorization", "Bearer " + getAuth())

  // // for Opensearch updates they must be wrapped in a "doc"
  // if (action === "update") {
  //   body = {"doc": body}
  // }

	var raw = JSON.stringify(body);
	var url = getSearchEndPoint() + (action==='create'? "add" : "update") + "/" + uuid + "?async=True"
	var method = (action==='create' ? "POST" : "PUT")

	var requestOptions = {
  		method: method,
  		headers: myHeaders,
  		body: raw,
//  		redirect: 'follow'
	};

	log.info("save_update", requestOptions)

fetch(url, requestOptions)
  .then(response => response.text())
  .then(result => {
  	log.info('SAVE_UPDATE', result)
    if (result) {
  	   // temp: NEED A BETTER WAY TO rout back to after save
      router.push('/search?size=n_20_n')
    }
  })
  .catch(error => log.info('error', error));


}

export function find(uuid) {

  var error_messages = [{msg: "Error has occurred"}, {msg: "UUID Not found"}]
  //log.info(req)

      // need to convert into a ES ready query
      let queryBody = simple_query_builder("uuid", uuid)
      log.info('QUERY',JSON.stringify(queryBody))
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
            log.info('FIND', result)
         
            var total = result["hits"]["total"]["value"]
            log.debug('TOTAL', total)
            if (total === 1) {  
              var entity = result["hits"]["hits"][0]["_source"]
              log.debug('ENTITY', entity)
              return entity
            } else {
              return error_messages[1]
            }
          })
        .catch(error => { 
          log.info(error)
           return error_messages[0]
        });

}