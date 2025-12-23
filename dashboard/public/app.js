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

/* ================== INIT ================== */
loadDashboard();