(async () => {
  try {
    const logs = await apiGet('/api/logs');
    const body = document.querySelector('#logs-table tbody');

    logs.forEach(log => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${log.from}</td>
        <td>${log.to}</td>
        <td>${log.amount}</td>
        <td>${log.tax}</td>
        <td>${new Date(log.createdAt).toLocaleString()}</td>
      `;
      body.appendChild(tr);
    });
  } catch (e) {
    console.warn('Logs not allowed');
  }
})();