// Determine milliseconds from a timestamp that may be in seconds, ms, µs, or ns
function toMilliseconds(epochLike) {
  if (epochLike === null || epochLike === undefined) return null;
  
  let n;
  if (typeof epochLike === 'bigint') {
    // BigInt to Number (may overflow if too large; we handle thresholds before casting)
    const str = epochLike.toString();
    n = Number(str.length > 15 ? str.slice(0, 16)) * Math.pow(10, str.length - 16); // coarse but avoids crash
  } else if (typeof epochLike === 'number') {
    n = epochLike;
  } else if (typeof epochLike === 'string') {
    const cleaned = epochLike.trim();
    if (!/^\d+$/.test(cleaned)) return null;
    n = Number(cleaned);
  } else {
    return null;
  }

  // Heuristics for unit detection
  if (n >= 1e17) {
    // nanoseconds → ms
    return n / 1e6;
  }
  if (n >= 1e14) {
    // microseconds → ms
    return n / 1e3;
  }
  if (n >= 1e12) {
    // milliseconds
    return n;
  }
  if (n >= 1e10) {
    // seconds (>= ~2001)
    return n * 1e3;
  }
  // fallback
  return n;
}

// Utility: format to ISO string (or empty string on failure)
export function formatTimestamp(timestamp) {
  const ms = toMilliseconds(timestamp);
  if (ms === null || Number.isNaN(ms) || !Number.isFinite(ms)) return '';
  try {
    return new Date(ms).toISOString();
  } catch {
    return '';
  }
}

// Convert BigInt deeply to strings; keep Numbers as-is; Principals to text if possible
export function convertLargeNumbers(value) {
  if (value === null || value === undefined) return value;

  if (typeof value === 'bigint') {
    return value.toString();
  }

  if (Array.isArray(value)) {
    return value.map(convertLargeNumbers);
  }

  if (typeof value === 'object') {
    // Principal conversion if applicable
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

// Sanitize object for UI/JSON: BigInt → string, and known timestamp fields → ISO strings
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

    // Convert timestamp-like keys to ISO string
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

// Minimal auth sanitizer: ensure JSON-safe and include ISO conversion for common stamps
export function sanitizeForAuth(obj) {
  return sanitizeForSerialization(obj);
}