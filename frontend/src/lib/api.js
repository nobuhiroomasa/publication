export async function fetchJson(url, signal) {
  const response = await fetch(url, { signal });
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`);
  }
  return response.json();
}
