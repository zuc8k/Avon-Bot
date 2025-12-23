const page = document.getElementById('page');

/* ================== STORAGE ================== */
function setGuild(id) {
  localStorage.setItem('guildId', id);
  loadDashboard();
}

function getGuild() {
  return localStorage.getItem('guildId');
}

function clearGuild() {
  localStorage.removeItem('guildId');
  loadGuilds();
}

/* ================== AUTH ================== */
async function getMe() {
  const res = await fetch('/api/me');
  if (res.status === 401) return null;
  return await res.json();
}

/* ================== LOGIN ================== */
function renderLogin() {
  page.innerHTML = `
    <div class="login-page">
      <h1>AVON Dashboard</h1>
      <a class="discord-btn" href="/auth/discord">Login with Discord</a>
    </div>
  `;
}

/* ================== GUILDS ================== */
async function loadGuilds() {
  const me = await getMe();
  if (!me) return renderLogin();

  page.innerHTML = `
    <div class="header">
      <h2>Select Server</h2>
      <a href="/auth/logout">Logout</a>
    </div>
    <div class="grid">
      ${me.user.guilds.map(g => `
        <div class="card" onclick="setGuild('${g.id}')">
          <h3>${g.name}</h3>
        </div>
      `).join('')}
    </div>
  `;
}

/* ================== LAYOUT ================== */
function renderLayout() {
  page.innerHTML = `
    <div class="layout">
      <aside class="sidebar">
        <h2>AVON</h2>
        <ul>
          <li onclick="loadOverview()">Overview</li>
          <li onclick="loadCredits()">Credits</li>
          <li onclick="loadPremium()">Premium</li>
          <li onclick="loadBotStatus()">Bot Status</li>
          <li onclick="loadCommands()">Commands</li>
          <li onclick="loadCreditSettings()">Credit Settings</li>
          <li onclick="loadCreditLogs()">Credit Logs</li>
          <li onclick="clearGuild()">Change Server</li>
        </ul>
      </aside>
      <main class="content">
        <div id="view"></div>
      </main>
    </div>
  `;
}

/* ================== DASHBOARD ================== */
async function loadDashboard() {
  const me = await getMe();
  if (!me) return renderLogin();

  const guildId = getGuild();
  if (!guildId) return loadGuilds();

  renderLayout();
  loadOverview();
}

/* ================== OVERVIEW ================== */
async function loadOverview() {
  const guildId = getGuild();
  const r = await fetch(`/api/me?guildId=${guildId}`);
  const d = await r.json();

  document.getElementById('view').innerHTML = `
    <h2>Overview</h2>
    <p><b>User:</b> ${d.user.username}</p>
    <p><b>Role:</b> ${d.role}</p>
    <p><b>Credits:</b> ${d.credits}</p>
    <p><b>Plan:</b> ${d.premium.plan}</p>
    <p><b>GPT:</b> ${d.gpt.used} / ${d.gpt.limit}</p>
  `;
}

/* ================== CREDITS ================== */
async function loadCredits() {
  const guildId = getGuild();
  const r = await fetch(`/api/credits?guildId=${guildId}`);
  const d = await r.json();

  document.getElementById('view').innerHTML = `
    <h2>Credits</h2>
    <p>Balance: ${d.balance}</p>
  `;
}

/* ================== PREMIUM ================== */
async function loadPremium() {
  const guildId = getGuild();
  const r = await fetch(`/api/premium?guildId=${guildId}`);
  const d = await r.json();

  document.getElementById('view').innerHTML = `
    <h2>Premium</h2>
    <p>Plan: ${d.plan}</p>
    <p>Status: ${d.active ? 'Active' : 'Inactive'}</p>
  `;
}

/* ================== BOT STATUS ================== */
async function loadBotStatus() {
  const r = await fetch('/api/bot-status');
  const d = await r.json();

  if (!d.online) {
    document.getElementById('view').innerHTML = `
      <h2>Bot Status</h2>
      <p style="color:red">Bot is Offline</p>
    `;
    return;
  }

  document.getElementById('view').innerHTML = `
    <h2>Bot Status</h2>
    <p><b>Status:</b> <span style="color:#4caf50">Online</span></p>
    <p><b>Bot:</b> ${d.username}</p>
    <p><b>Ping:</b> ${d.ping} ms</p>
    <p><b>Servers:</b> ${d.guilds}</p>
    <p><b>Commands:</b> ${d.commands}</p>
  `;
}

/* ================== CREDIT SETTINGS ================== */
async function loadCreditSettings() {
  const guildId = getGuild();

  const meRes = await fetch(`/api/me?guildId=${guildId}`);
  const me = await meRes.json();

  if (!['owner', 'admin'].includes(me.role)) {
    document.getElementById('view').innerHTML =
      '<h2>Credit Settings</h2><p>Permission denied</p>';
    return;
  }

  const r = await fetch(`/api/credits-settings?guildId=${guildId}`);
  const d = await r.json();

  document.getElementById('view').innerHTML = `
    <h2>Credit Transfer Channel</h2>
    <p>Current Channel ID:</p>
    <input id="channelId" value="${d.transferChannelId || ''}" />
    <br/><br/>
    <button onclick="saveCreditChannel()">Save</button>
  `;
}

async function saveCreditChannel() {
  const guildId = getGuild();
  const channelId = document.getElementById('channelId').value;

  await fetch('/api/credits-settings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ guildId, channelId })
  });

  alert('Saved successfully');
}

/* ================== CREDIT LOGS ================== */
async function loadCreditLogs() {
  const guildId = getGuild();
  const r = await fetch(`/api/credit-logs?guildId=${guildId}`);

  if (r.status === 403) {
    document.getElementById('view').innerHTML =
      '<h2>Credit Logs</h2><p>Permission denied</p>';
    return;
  }

  const logs = await r.json();

  document.getElementById('view').innerHTML = `
    <h2>Credit Logs</h2>
    ${logs.map(l => `
      <div class="card">
        <p><b>From:</b> ${l.from}</p>
        <p><b>To:</b> ${l.to}</p>
        <p><b>Amount:</b> ${l.amount}</p>
        <p><b>Tax:</b> ${l.tax}</p>
        <p><b>Received:</b> ${l.received}</p>
        <small>${new Date(l.createdAt).toLocaleString()}</small>
      </div>
    `).join('')}
  `;
}

/* ================== INIT ================== */
loadDashboard();