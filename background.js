import { getRules, isAutoGroupEnabled } from './lib/storage.js';
import { evaluateTab } from './lib/rules-engine.js';

const IGNORED_SCHEMES = ['chrome://', 'chrome-extension://', 'about:', 'edge://', 'devtools://'];

function isIgnoredTab(tab) {
  return !tab?.url || IGNORED_SCHEMES.some(s => tab.url.startsWith(s));
}

async function processTab(tab) {
  if (isIgnoredTab(tab)) return;
  if (!(await isAutoGroupEnabled())) return;

  const rules = await getRules();
  const rule = evaluateTab(tab, rules);
  if (!rule) return;

  const existingGroups = await chrome.tabGroups.query({ title: rule.name, windowId: tab.windowId });
  if (existingGroups.length > 0 && tab.groupId === existingGroups[0].id) return;

  try {
    if (existingGroups.length > 0) {
      await chrome.tabs.group({ tabIds: [tab.id], groupId: existingGroups[0].id });
    } else {
      const groupId = await chrome.tabs.group({ tabIds: [tab.id] });
      await chrome.tabGroups.update(groupId, { title: rule.name, color: rule.color });
    }
  } catch (err) {
    console.error('[Tab Grouper] Error al agrupar pestaña:', err);
  }
}

const debounceMap = new Map();

function debouncedProcess(tab, delay = 600) {
  if (debounceMap.has(tab.id)) clearTimeout(debounceMap.get(tab.id));
  const timeoutId = setTimeout(() => {
    debounceMap.delete(tab.id);
    processTab(tab);
  }, delay);
  debounceMap.set(tab.id, timeoutId);
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    debouncedProcess(tab);
  }
});

chrome.tabs.onCreated.addListener((tab) => {
  debouncedProcess(tab, 1000);
});


chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'GROUP_ALL_TABS') {
    chrome.tabs.query({ currentWindow: true }, async (tabs) => {
      for (const tab of tabs) await processTab(tab);
      sendResponse({ ok: true });
    });
    return true;
  }
});
