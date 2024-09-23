export default async function request(engineKey, method, path, params, token, indexUrl, indexName) {
  const headers = new Headers({
    "Content-Type": "application/json"
  });
  if (token) {
    headers.set("Authorization", "Bearer " + token);
  }

  const response = await fetch(`${indexUrl}${indexName}${path}`, {
      method,
      headers,
      body: JSON.stringify({
        ...params
      })
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
