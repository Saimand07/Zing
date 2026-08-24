export const fetchWithRetry = async (url: string, retries = 3) => {
  return fetch(url);
};
