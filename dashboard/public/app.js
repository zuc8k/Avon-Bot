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
          <li onclick="loadTaxCalculator()">Tax Calculator</li>
          <li onclick="loadFreezePage()">Freeze Accounts</li>
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

/* ================== FREEZE PAGE ================== */
async function loadFreezePage() {
  const guildId = getGuild();

  const meRes = await fetch(`/api/me?guildId=${guildId}`);
  const me = await meRes.json();

  if (!['owner', 'admin'].includes(me.role)) {
    document.getElementById('view').innerHTML =
      '<h2>Freeze Accounts</h2><p>❌ Permission denied</p>';
    return;
  }

  const r = await fetch(`/api/credit-freeze?guildId=${guildId}`);
  const list = await r.json();

  if (!list.length) {
    document.getElementById('view').innerHTML = `
      <h2>Freeze Accounts</h2>
      <p>✅ No frozen accounts</p>
    `;
    return;
  }

  document.getElementById('view').innerHTML = `
    <h2>Freeze Accounts</h2>

    ${list.map(f => `
      <div class="card">
        <p><b>User ID:</b> ${f.userId}</p>
        <p><b>Reason:</b> ${f.reason}</p>
        <p><b>Frozen By:</b> ${f.frozenBy}</p>
        <p><b>Since:</b> ${new Date(f.createdAt).toLocaleString()}</p>

        <button onclick="unfreezeUser('${f.userId}')">
          ❄️ UnFreeze
        </button>
      </div>
    `).join('')}
  `;
}

/* ================== UNFREEZE ================== */
async function unfreezeUser(userId) {
  const guildId = getGuild();

  if (!confirm('Are you sure you want to unfreeze this user?')) return;

  await fetch('/api/credit-freeze/unfreeze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ guildId, userId })
  });

  alert('✅ User Unfrozen');
  loadFreezePage();
}

/* ================== INIT ================== */
loadDashboard();