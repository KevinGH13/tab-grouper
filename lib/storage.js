export const DEFAULT_RULES = [
  {
    id: 'rule-aws',
    name: 'AWS',
    color: 'orange',
    enabled: true,
    conditions: [
      { type: 'url', pattern: '*aws.amazon.com*' },
      { type: 'url', pattern: '*amazonaws.com*' }
    ]
  },
  {
    id: 'rule-azure',
    name: 'Azure',
    color: 'blue',
    enabled: true,
    conditions: [
      { type: 'url', pattern: '*portal.azure.com*' },
      { type: 'url', pattern: '*azure.microsoft.com*' }
    ]
  },
  {
    id: 'rule-prs',
    name: 'Pull Requests',
    color: 'purple',
    enabled: true,
    conditions: [
      { type: 'url', pattern: '*/pull/*' },
      { type: 'title', pattern: '*Pull Request*' },
      { type: 'title', pattern: '*· PR #*' }
    ]
  }
];

export async function getRules() {
  const result = await chrome.storage.sync.get(['rules']);
  return result.rules ?? DEFAULT_RULES;
}

export async function saveRules(rules) {
  await chrome.storage.sync.set({ rules });
}

export async function isAutoGroupEnabled() {
  const result = await chrome.storage.sync.get(['autoGroupEnabled']);
  return result.autoGroupEnabled !== false;
}

export async function setAutoGroupEnabled(enabled) {
  await chrome.storage.sync.set({ autoGroupEnabled: enabled });
}
