(async () => {
  try {
    const data = await apiGet('/api/credits');
    document.getElementById('credits-balance').innerText =
      data.balance.toLocaleString();
  } catch (e) {
    console.error(e);
  }
})();