import { getRules, saveRules } from '../lib/storage.js';

const COLOR_HEX = {
  grey: '#5f6368', blue: '#4285f4', red: '#ea4335', yellow: '#fbbc04',
  green: '#34a853', pink: '#ff63b8', purple: '#af5cf7', cyan: '#24c1e0', orange: '#ff8c00'
};

let rules = [];
let editingId = null;
let selectedColor = 'blue';

// ── Render ────────────────────────────────────────────────────────────────────

function renderRules() {
  const list = document.getElementById('rules-list');

  if (rules.length === 0) {
    list.innerHTML = `
      <li class="empty-rules">
        <strong>No hay reglas configuradas</strong>
        <p>Crea una regla para empezar a agrupar pestañas automáticamente.</p>
      </li>`;
    return;
  }

  list.innerHTML = rules.map(rule => `
    <li class="rule-card ${rule.enabled ? '' : 'disabled'}" style="--rule-color:${COLOR_HEX[rule.color] ?? '#5f6368'}">
      <div class="rule-body">
        <div class="rule-header">
          <span class="rule-name">${escapeHtml(rule.name)}</span>
        </div>
        <ul class="rule-conditions">
          ${rule.conditions.map(c => `
            <li class="condition-badge">
              <span class="condition-type">${c.type}</span>
              ${escapeHtml(c.pattern)}
            </li>
          `).join('')}
        </ul>
      </div>
      <div class="rule-actions">
        <label class="toggle" title="${rule.enabled ? 'Desactivar' : 'Activar'}">
          <input type="checkbox" class="toggle-rule" data-id="${rule.id}" ${rule.enabled ? 'checked' : ''} />
          <span class="slider"></span>
        </label>
        <button class="btn-icon" data-action="edit" data-id="${rule.id}" title="Editar">✏️</button>
        <button class="btn-icon danger" data-action="delete" data-id="${rule.id}" title="Eliminar">🗑️</button>
      </div>
    </li>
  `).join('');
}

// ── Modal ─────────────────────────────────────────────────────────────────────

function openModal(rule = null) {
  editingId = rule?.id ?? null;
  selectedColor = rule?.color ?? 'blue';

  document.getElementById('modal-title').textContent = rule ? 'Editar regla' : 'Nueva regla';
  document.getElementById('rule-name').value = rule?.name ?? '';

  // Color swatches
  document.querySelectorAll('.color-swatch').forEach(btn => {
    btn.classList.toggle('selected', btn.dataset.color === selectedColor);
  });

  // Conditions
  renderConditions(rule?.conditions ?? [{ type: 'url', pattern: '' }]);

  document.getElementById('modal-overlay').classList.remove('hidden');
  document.getElementById('rule-name').focus();
}

function closeModal() {
  document.getElementById('modal-overlay').classList.add('hidden');
  editingId = null;
}

function renderConditions(conditions) {
  const list = document.getElementById('conditions-list');
  list.innerHTML = conditions.map((c, i) => `
    <li class="condition-row" data-index="${i}">
      <select data-field="type">
        <option value="url"   ${c.type === 'url'   ? 'selected' : ''}>URL</option>
        <option value="title" ${c.type === 'title' ? 'selected' : ''}>Título</option>
      </select>
      <input type="text" data-field="pattern" value="${escapeHtml(c.pattern)}" placeholder="Ej: *aws.amazon.com*" />
      <button class="btn-icon danger" data-action="remove-condition" data-index="${i}" title="Eliminar condición">✕</button>
    </li>
  `).join('');
}

function getConditionsFromDom() {
  return [...document.querySelectorAll('#conditions-list .condition-row')].map(row => ({
    type: row.querySelector('[data-field="type"]').value,
    pattern: row.querySelector('[data-field="pattern"]').value.trim()
  })).filter(c => c.pattern !== '');
}

// ── Save ──────────────────────────────────────────────────────────────────────

async function saveRule() {
  const name = document.getElementById('rule-name').value.trim();
  if (!name) {
    document.getElementById('rule-name').focus();
    return;
  }

  const conditions = getConditionsFromDom();
  if (conditions.length === 0) {
    alert('Agrega al menos una condición con un patrón.');
    return;
  }

  if (editingId) {
    rules = rules.map(r => r.id === editingId
      ? { ...r, name, color: selectedColor, conditions }
      : r
    );
  } else {
    rules.push({
      id: `rule-${Date.now()}`,
      name,
      color: selectedColor,
      enabled: true,
      conditions
    });
  }

  await saveRules(rules);
  renderRules();
  closeModal();
}

// ── Event delegation ──────────────────────────────────────────────────────────

document.getElementById('btn-add-rule').addEventListener('click', () => openModal());
document.getElementById('btn-cancel').addEventListener('click', closeModal);
document.getElementById('btn-save').addEventListener('click', saveRule);

document.getElementById('modal-overlay').addEventListener('click', e => {
  if (e.target === e.currentTarget) closeModal();
});

document.getElementById('btn-add-condition').addEventListener('click', () => {
  const conditions = getConditionsFromDom();
  conditions.push({ type: 'url', pattern: '' });
  renderConditions(conditions);
});

document.getElementById('color-grid').addEventListener('click', e => {
  const swatch = e.target.closest('.color-swatch');
  if (!swatch) return;
  selectedColor = swatch.dataset.color;
  document.querySelectorAll('.color-swatch').forEach(b => b.classList.toggle('selected', b === swatch));
});

document.getElementById('conditions-list').addEventListener('click', e => {
  const btn = e.target.closest('[data-action="remove-condition"]');
  if (!btn) return;
  const conditions = getConditionsFromDom();
  conditions.splice(Number(btn.dataset.index), 1);
  renderConditions(conditions.length > 0 ? conditions : [{ type: 'url', pattern: '' }]);
});

document.getElementById('rules-list').addEventListener('click', async e => {
  const btn = e.target.closest('[data-action]');
  if (!btn) return;

  const { action, id } = btn.dataset;

  if (action === 'edit') {
    openModal(rules.find(r => r.id === id));
  } else if (action === 'delete') {
    if (!confirm(`¿Eliminar la regla "${rules.find(r => r.id === id)?.name}"?`)) return;
    rules = rules.filter(r => r.id !== id);
    await saveRules(rules);
    renderRules();
  }
});

document.getElementById('rules-list').addEventListener('change', async e => {
  const toggle = e.target.closest('.toggle-rule');
  if (!toggle) return;
  rules = rules.map(r => r.id === toggle.dataset.id ? { ...r, enabled: toggle.checked } : r);
  await saveRules(rules);
  renderRules();
});

// ── Init ──────────────────────────────────────────────────────────────────────

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' })[c]);
}

async function init() {
  rules = await getRules();
  renderRules();
}

init();
