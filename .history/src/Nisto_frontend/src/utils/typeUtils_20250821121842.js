// Simple timestamp formatting
export function formatTimestamp(timestamp) {
  if (!timestamp) return '';
  try {
    const date = new Date(Number(timestamp));
    return date.toISOString();
  } catch {
    return '';
  }
}

// Convert BigInt to strings
export function convertLargeNumbers(value) {
  if (value === null || value === undefined) return value;
  if (typeof value === 'bigint') return value.toString();
  if (Array.isArray(value)) return value.map(convertLargeNumbers);
  if (typeof value === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      out[k] = convertLargeNumbers(v);
    }
    return out;
  }
  return value;
}

// Sanitize for serialization
export function sanitizeForSerialization(obj) {
  const converted = convertLargeNumbers(obj);
  const stampKeys = ['createdAt', 'updatedAt', 'lastLoginAt', 'timestamp'];
  
  function transform(value, key) {
    if (value === null || value === undefined) return value;
    if (key && stampKeys.includes(key)) {
      const iso = formatTimestamp(value);
      return iso || String(value);
    }
    if (Array.isArray(value)) return value.map(v => transform(v));
    if (typeof value === 'object') {
      const out = {};
      for (const [k, v] of Object.entries(value)) {
        out[k] = transform(v, k);
      }
      return out;
    }
    return value;
  }
  
  return transform(converted);
}

// Auth sanitizer
export function sanitizeForAuth(obj) {
  return sanitizeForSerialization(obj);
}