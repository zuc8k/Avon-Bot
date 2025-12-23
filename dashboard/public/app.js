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

/* ================== PREMIUM PAGE ================== */
async function loadPremium() {
  const guildId = getGuild();
  const r = await fetch(`/api/premium?guildId=${guildId}`);
  const d = await r.json();

  document.getElementById('view').innerHTML = `
    <h2>Membership Plans</h2>

    <div class="grid">
      ${renderPlan('Plus', '5$', 'Lower tax & more GPT', 'plus', d.plan)}
      ${renderPlan('Premium', '20$', 'No tax & high limits', 'premium', d.plan)}
      ${renderPlan('Max', '50$', 'Unlimited power', 'max', d.plan)}
    </div>

    <p style="margin-top:20px;color:#aaa">
      Current Plan: <b>${d.plan}</b>
    </p>
  `;
}

function renderPlan(name, price, desc, key, current) {
  const active = current === key;
  return `
    <div class="card">
      <h3>${name}</h3>
      <p>${desc}</p>
      <h2>${price}</h2>
      ${active
        ? `<p style="color:#4caf50">Active</p>`
        : `<button onclick="requestPlan('${key}')">Request</button>`
      }
    </div>
  `;
}

function requestPlan(plan) {
  alert(
    `Request sent for ${plan} plan.\nAdmin will activate it for you.`
  );
}

/* ================== LOGS ================== */
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

/* ================== GPT ================== */
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

/* ================== INIT ================== */
loadDashboard();