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
          <li onclick="loadOverview()">نظرة عامة</li>
          <li onclick="loadCredits()">الرصيد</li>
          <li onclick="loadPremium()">العضوية</li>
          <li onclick="loadBotStatus()">حالة البوت</li>
          <li onclick="loadCommands()">الأوامر</li>
          <li onclick="loadCreditSettings()">إعدادات التحويل</li>
          <li onclick="loadCreditFreeze()">تجميد الحسابات</li>
          <li onclick="loadCreditFreezeLogs()">سجل التجميد</li>
          <li onclick="clearGuild()">تغيير السيرفر</li>
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
    <h2>نظرة عامة</h2>
    <p><b>المستخدم:</b> ${d.user.username}</p>
    <p><b>الدور:</b> ${d.role}</p>
    <p><b>الرصيد:</b> ${d.credits}</p>
    <p><b>الخطة:</b> ${d.premium.plan}</p>
    <p><b>GPT:</b> ${d.gpt.used} / ${d.gpt.limit}</p>
  `;
}

/* ================== CREDITS ================== */
async function loadCredits() {
  const guildId = getGuild();
  const r = await fetch(`/api/credits?guildId=${guildId}`);
  const d = await r.json();

  document.getElementById('view').innerHTML = `
    <h2>الرصيد</h2>
    <p>Balance: ${d.balance}</p>
  `;
}

/* ================== PREMIUM ================== */
async function loadPremium() {
  const guildId = getGuild();
  const r = await fetch(`/api/premium?guildId=${guildId}`);
  const d = await r.json();

  document.getElementById('view').innerHTML = `
    <h2>العضوية</h2>
    <p>الخطة: ${d.plan}</p>
    <p>الحالة: ${d.active ? 'نشطة' : 'غير نشطة'}</p>
  `;
}

/* ================== BOT STATUS ================== */
async function loadBotStatus() {
  const r = await fetch('/api/bot-status');
  const d = await r.json();

  if (!d.online) {
    document.getElementById('view').innerHTML =
      '<h2>حالة البوت</h2><p style="color:red">البوت غير متصل</p>';
    return;
  }

  document.getElementById('view').innerHTML = `
    <h2>حالة البوت</h2>
    <p><b>الحالة:</b> Online</p>
    <p><b>البوت:</b> ${d.username}</p>
    <p><b>Ping:</b> ${d.ping} ms</p>
    <p><b>Servers:</b> ${d.guilds}</p>
    <p><b>Commands:</b> ${d.commands}</p>
  `;
}

/* ================== CREDIT SETTINGS ================== */
async function loadCreditSettings() {
  const guildId = getGuild();
  const r = await fetch(`/api/credits-settings?guildId=${guildId}`);
  const d = await r.json();

  document.getElementById('view').innerHTML = `
    <h2>إعدادات التحويل</h2>
    <input id="channelId" value="${d.transferChannelId || ''}" placeholder="Channel ID" />
    <br/><br/>
    <button onclick="saveCreditChannel()">حفظ</button>
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

  alert('تم الحفظ');
}

/* ================== CREDIT FREEZE ================== */
async function loadCreditFreeze() {
  const guildId = getGuild();
  const r = await fetch(`/api/credit-freeze?guildId=${guildId}`);
  if (r.status === 403) {
    document.getElementById('view').innerHTML =
      '<h2>تجميد الحسابات</h2><p>غير مسموح</p>';
    return;
  }

  const list = await r.json();

  document.getElementById('view').innerHTML = `
    <h2>تجميد حساب</h2>

    <div class="card">
      <input id="freezeUserId" placeholder="User ID" />
      <input id="freezeReason" placeholder="سبب التجميد" />
      <button onclick="freezeUser()">تجميد</button>
    </div>

    <h3>الحسابات المجمدة</h3>
    ${list.map(u => `
      <div class="card">
        <p><b>User:</b> ${u.userId}</p>
        <p><b>السبب:</b> ${u.reason || '-'}</p>
        <button onclick="unfreezeUser('${u.userId}')">فك التجميد</button>
      </div>
    `).join('')}
  `;
}

async function freezeUser() {
  const guildId = getGuild();
  const userId = document.getElementById('freezeUserId').value;
  const reason = document.getElementById('freezeReason').value;

  await fetch('/api/credit-freeze/freeze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ guildId, userId, reason })
  });

  alert('تم تجميد الحساب');
  loadCreditFreeze();
}

async function unfreezeUser(userId) {
  const guildId = getGuild();

  await fetch('/api/credit-freeze/unfreeze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ guildId, userId })
  });

  alert('تم فك التجميد');
  loadCreditFreeze();
}

/* ================== FREEZE LOGS ================== */
async function loadCreditFreezeLogs() {
  const guildId = getGuild();
  const r = await fetch(`/api/credit-freeze/logs?guildId=${guildId}`);

  if (r.status === 403) {
    document.getElementById('view').innerHTML =
      '<h2>سجل التجميد</h2><p>غير مسموح</p>';
    return;
  }

  const logs = await r.json();

  document.getElementById('view').innerHTML = `
    <h2>سجل التجميد</h2>
    ${logs.map(l => `
      <div class="card">
        <p><b>User:</b> ${l.userId}</p>
        <p><b>الإجراء:</b> ${l.action}</p>
        <p><b>السبب:</b> ${l.reason || '-'}</p>
        <p><b>بواسطة:</b> ${l.by}</p>
        <small>${new Date(l.createdAt).toLocaleString()}</small>
      </div>
    `).join('')}
  `;
}

/* ================== INIT ================== */
loadDashboard();