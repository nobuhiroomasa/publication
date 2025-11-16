export function parseExtraInfo(text) {
  if (!text || typeof text !== 'string') {
    return {};
  }
  return text
    .split(/\r?\n|\|/)
    .map((part) => part.trim())
    .filter(Boolean)
    .reduce((acc, part) => {
      const [key, ...rest] = part.split('=');
      if (key && rest.length) {
        acc[key.trim()] = rest.join('=').trim();
      }
      return acc;
    }, {});
}

export function formatDateTime(value) {
  if (!value) {
    return '';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value.replace('T', ' ');
  }
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const h = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  return `${y}-${m}-${d} ${h}:${min}`;
}
