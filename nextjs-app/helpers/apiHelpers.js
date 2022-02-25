const handleFetchErrors = (response) => {
  if (!response.ok) {
    throw Error(response.statusText);
  }
  return response;
};

export const fetchExternalData = async (requestOptions, url) => {
  const response = await fetch(url, requestOptions)
    .then(handleFetchErrors)
    .then((response) => {
      return response.json();
    })
    .catch((error) => console.error(error));

  return response;
};
