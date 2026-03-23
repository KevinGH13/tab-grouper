import { isAutoGroupEnabled, setAutoGroupEnabled } from '../lib/storage.js';

const COLOR_MAP = {
  grey: '#5f6368', blue: '#4285f4', red: '#ea4335', yellow: '#fbbc04',
  green: '#34a853', pink: '#ff63b8', purple: '#af5cf7', cyan: '#24c1e0', orange: '#ff8c00'
};

async function loadGroups() {
  const list = document.getElementById('groups-list');
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const groups = await chrome.tabGroups.query({ windowId: tab.windowId });

  if (groups.length === 0) {
    list.innerHTML = '<li class="empty-state">Sin grupos activos</li>';
    return;
  }

  const tabsPerGroup = await Promise.all(
    groups.map(g => chrome.tabs.query({ groupId: g.id }))
  );

  list.innerHTML = groups.map((group, i) => `
    <li class="group-item">
      <span class="group-dot" style="background:${COLOR_MAP[group.color] ?? '#5f6368'}"></span>
      <span class="group-name">${group.title || '(sin nombre)'}</span>
      <span class="group-count">${tabsPerGroup[i].length} pestañas</span>
    </li>
  `).join('');
}

async function init() {
  const toggle = document.getElementById('toggle-auto');
  toggle.checked = await isAutoGroupEnabled();

  toggle.addEventListener('change', () => setAutoGroupEnabled(toggle.checked));

  document.getElementById('btn-options').addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });

  document.getElementById('btn-group-all').addEventListener('click', async (e) => {
    e.target.textContent = 'Agrupando...';
    e.target.disabled = true;
    await chrome.runtime.sendMessage({ type: 'GROUP_ALL_TABS' });
    await loadGroups();
    e.target.textContent = 'Agrupar todas las pestañas ahora';
    e.target.disabled = false;
  });

  await loadGroups();
}

init();
