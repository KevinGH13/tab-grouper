/**
 * Matches a condition against a tab.
 * - Patterns with '*' are treated as glob (wildcard) matches.
 * - Patterns without '*' are case-insensitive substring matches.
 */
function matchesCondition(tab, condition) {
  const value = condition.type === 'url'
    ? (tab.url ?? '')
    : (tab.title ?? '');

  const { pattern } = condition;

  if (pattern.includes('*')) {
    const regex = new RegExp(
      pattern.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*'),
      'i'
    );
    return regex.test(value);
  }

  return value.toLowerCase().includes(pattern.toLowerCase());
}

/**
 * Returns the first matching rule for a tab, or null if none match.
 */
export function evaluateTab(tab, rules) {
  for (const rule of rules) {
    if (!rule.enabled) continue;
    if (rule.conditions.some(c => matchesCondition(tab, c))) return rule;
  }
  return null;
}
