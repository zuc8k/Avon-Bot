async function apiGet(url) {
  const res = await fetch(url, {
    credentials: 'include'
  });

  if (!res.ok) {
    throw new Error('API Error');
  }
  return res.json();
}