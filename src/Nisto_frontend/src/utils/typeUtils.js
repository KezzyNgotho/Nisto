// Utility function to format timestamps as readable date/time strings
export function formatTimestamp(timestamp) {
  if (!timestamp) return '';
  const date = new Date(Number(timestamp));
  return date.toLocaleString();
}

// Dummy implementation: just return the object as-is
export function convertLargeNumbers(obj) {
  return obj;
}

export function sanitizeForSerialization(obj) {
  return obj;
}

export function sanitizeForAuth(obj) {
  return obj;
} 