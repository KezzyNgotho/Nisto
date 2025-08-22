// Convert timestamp to milliseconds
function toMilliseconds(epochLike) {
  if (epochLike === null || epochLike === undefined) return null;
  
  let n = 0;
  if (typeof epochLike === 'bigint') {
    const str = epochLike.toString();
    n = Number(str.length > 15 ? str.slice(0, 16)) * Math.pow(10, str.length - 16);
  } else if (typeof epochLike === 'number') {
    n = epochLike;
  } else if (typeof epochLike === 'string') {
    const cleaned = epochLike.trim();
    if (!/^\d+$/.test(cleaned)) return null;
    n = Number(cleaned);
  } else {
    return null;
  }

  // Unit detection
  if (n >= 1e17) return n / 1e6; // nanoseconds to ms
  if (n >= 1e14) return n / 1e3; // microseconds to ms
  if (n >= 1e12) return n; // milliseconds
  if (n >= 1e10) return n * 1e3; // seconds to ms
  return n; // fallback
}

// Format timestamp to ISO string
export function formatTimestamp(timestamp) {
  const ms = toMilliseconds(timestamp);
  if (ms === null || Number.isNaN(ms) || !Number.isFinite(ms)) return '';
  try {
    return new Date(ms).toISOString();
  } catch {
    return '';
  }
}

// Convert BigInt to strings
export function convertLargeNumbers(value) {
  if (value === null || value === undefined) return value;

  if (typeof value === 'bigint') {
    return value.toString();
  }

  if (Array.isArray(value)) {
    return value.map(convertLargeNumbers);
  }

  if (typeof value === 'object') {
    if (typeof value.toText === 'function') {
      try { 
        return value.toText(); 
      } catch { 
        // ignore 
      }
    }
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      out[k] = convertLargeNumbers(v);
    }
    return out;
  }

  return value;
}

// Sanitize object for serialization
export function sanitizeForSerialization(obj) {
  const converted = convertLargeNumbers(obj);

  const stampKeys = new Set([
    'createdAt',
    'updatedAt', 
    'lastLoginAt',
    'timestamp',
    'created_at',
    'updated_at',
    'last_login_at'
  ]);

  function transform(value, key) {
    if (value === null || value === undefined) return value;

    if (key && stampKeys.has(key)) {
      const iso = formatTimestamp(value);
      return iso || (typeof value === 'string' ? value : String(value));
    }

    if (Array.isArray(value)) {
      return value.map((v) => transform(v, undefined));
    }
    
    if (typeof value === 'object') {
      const out = {};
      for (const [k, v] of Object.entries(value)) {
        out[k] = transform(v, k);
      }
      return out;
    }
    
    return value;
  }

  return transform(converted, undefined);
}

// Auth sanitizer
export function sanitizeForAuth(obj) {
  return sanitizeForSerialization(obj);
}