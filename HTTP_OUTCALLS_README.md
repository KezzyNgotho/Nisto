# HTTP Outcalls in Motoko - Correct Implementation

## Overview
HTTP outcalls in Motoko require specific function signatures and types. This document explains the correct implementation based on the Internet Computer documentation.

## Transform Function Signature

The transform function for HTTP outcalls should be defined as:

```motoko
shared query func transform(raw: OutCall.TransformationInput): async OutCall.TransformationOutput {
  {
    status = raw.response.status;
    headers = raw.response.headers;
    body = raw.response.body;
  }
}
```

## Key Points:

1. **Function Type**: Must be `shared query`
2. **Parameter**: Takes `OutCall.TransformationInput`
3. **Return Type**: Returns `async OutCall.TransformationOutput`
4. **Return Structure**: Must return an object with `status`, `headers`, and `body`

## Usage in HTTP Requests

When calling `OutCall.httpPostRequest`, pass the transform function:

```motoko
let response = await OutCall.httpPostRequest(
  url,
  headers,
  requestBody,
  await transform  // Note: must use await
);
```

## Common Mistakes to Avoid:

1. ❌ Don't make it `private` - must be `shared query`
2. ❌ Don't define it as regular `func` - must be `shared query func`
3. ❌ Don't forget to `await` the transform function call
4. ❌ Don't return just `input.response` - must return the full structure

## Example Implementation:

```motoko
// Correct transform function
shared query func transform(raw: OutCall.TransformationInput): async OutCall.TransformationOutput {
  {
    status = raw.response.status;
    headers = raw.response.headers;
    body = raw.response.body;
  }
};

// Usage in HTTP call
let response = await OutCall.httpPostRequest(
  "https://api.example.com/endpoint",
  [
    { name = "Content-Type"; value = "application/json" },
    { name = "Authorization"; value = "Bearer " # token }
  ],
  requestBody,
  await transform
);
```

## Error Messages and Solutions:

### Error: "a shared function cannot be private"
**Solution**: Remove `private` keyword, keep only `shared query func`

### Error: "expected async type, but expression has type..."
**Solution**: Make sure to use `await` when calling the transform function

### Error: "cannot produce expected type"
**Solution**: Ensure the transform function returns the correct `OutCall.TransformationOutput` structure with `status`, `headers`, and `body` fields

## Deployment

After implementing the correct transform function signature:

1. Build: `dfx build Nisto_backend`
2. Deploy: `dfx deploy Nisto_backend`
3. Access: `http://localhost:4943/?canisterId=<canister-id>`

The HTTP outcalls should now work correctly for the AuthSignal API integration.
