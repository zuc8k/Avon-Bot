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
      <p>Login with Discord to continue</p>
      <a class="discord-btn" href="/auth/discord">Login with Discord</a>
    </div>
  `;
}

/* ================== GUILD SELECT ================== */
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
          <p>ID: ${g.id}</p>
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
          <li onclick="loadLogs()">Logs</li>
          <li onclick="loadGPT()">GPT</li>
          <li onclick="loadBotStatus()">Bot Status</li>
          <li onclick="clearGuild()">Change Server</li>
        </ul>
        <a href="/auth/logout" class="logout-btn">Logout</a>
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

/* ================== VIEWS ================== */
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

async function loadCredits() {
  const guildId = getGuild();
  const r = await fetch(`/api/credits?guildId=${guildId}`);
  const d = await r.json();

  document.getElementById('view').innerHTML = `
    <h2>Credits</h2>
    <p>Balance: ${d.balance}</p>
  `;
}

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

async function loadLogs() {
  const guildId = getGuild();
  const r = await fetch(`/api/logs?guildId=${guildId}`);
  const logs = await r.json();

  document.getElementById('view').innerHTML = `
    <h2>Logs</h2>
    ${logs.map(l => `
      <p>${l.from} → ${l.to} | ${l.amount}</p>
    `).join('')}
  `;
}

async function loadGPT() {
  const guildId = getGuild();
  const r = await fetch(`/api/gpt?guildId=${guildId}`);
  const d = await r.json();

  document.getElementById('view').innerHTML = `
    <h2>AVON GPT</h2>
    <p>Used: ${d.used}</p>
    <p>Limit: ${d.limit}</p>
    <p>Remaining: ${d.remaining}</p>
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

/* ================== INIT ================== */
loadDashboard();