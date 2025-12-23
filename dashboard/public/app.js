const view = document.getElementById('view');

async function loadOverview() {
  const res = await fetch('/api/me?guildId=123');
  const data = await res.json();

  view.innerHTML = `
    <div class="card">
      <h3>User</h3>
      <p>${data.user.username}</p>
      <p>Role: ${data.role}</p>
    </div>

    <div class="card">
      <h3>Credits</h3>
      <p>${data.credits}</p>
    </div>

    <div class="card">
      <h3>Premium</h3>
      <p>${data.premium.plan}</p>
    </div>

    <div class="card">
      <h3>GPT Usage</h3>
      <p>${data.gpt.used} / ${data.gpt.limit}</p>
    </div>
  `;
}

async function loadCredits() {
  const res = await fetch('/api/credits?guildId=123');
  const data = await res.json();

  view.innerHTML = `
    <div class="card">
      <h3>Your Credits</h3>
      <p>${data.balance}</p>
    </div>
  `;
}

async function loadPremium() {
  const res = await fetch('/api/premium?guildId=123');
  const data = await res.json();

  view.innerHTML = `
    <div class="card">
      <h3>Premium Status</h3>
      <p>Plan: ${data.plan}</p>
      <p>Status: ${data.active ? 'Active' : 'Inactive'}</p>
    </div>
  `;
}

async function loadLogs() {
  const res = await fetch('/api/logs?guildId=123');
  const logs = await res.json();

  view.innerHTML = `
    <div class="card">
      <h3>Credit Logs</h3>
      ${logs.map(l => `
        <p>${l.from} → ${l.to} | ${l.amount}</p>
      `).join('')}
    </div>
  `;
}

async function loadGPT() {
  const res = await fetch('/api/gpt?guildId=123');
  const data = await res.json();

  view.innerHTML = `
    <div class="card">
      <h3>GPT Usage</h3>
      <p>${data.used} / ${data.limit}</p>
      <p>Remaining: ${data.remaining}</p>
    </div>
  `;
}

// load default
loadOverview();