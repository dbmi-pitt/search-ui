export default async function request(engineKey, method, path, params, token, indexUrl, indexName) {
  const headers = (token ? (
      new Headers({
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token
      })
  ) : (new Headers({
        "Content-Type": "application/json"
      })
  ));

  const response = await fetch(
     `${indexUrl}${indexName}${path}`,
    {
      method,
      headers,
      body: JSON.stringify({
   //     engine_key: engineKey,
        ...params
      })
//      credentials: "include"
    }
  );

  let json;
  try {
    json = await response.json();
  } catch (error) {
    // Nothing to do here, certain responses won't have json
  }

  if (response.status >= 200 && response.status < 300) {
    return json;
  } else {
    const message = json && json.error ? json.error : response.status;
    throw new Error(message);
  }
}
