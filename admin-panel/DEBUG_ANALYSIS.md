# API Debugging - Live OpenAPI Analysis & Fixes

## What I Found

I analyzed the **live OpenAPI specifications** from your API server at `http://172.21.11.121:8080` and discovered:

### ✅ **Working Service-Specific Endpoints**
- **Communities**: `GET /api/community/admin/list?page=1&page_size=20` ← **USING THIS NOW**
- **Colleges**: `GET /api/college/admin/list?page=1&page_size=20`
- **Posts**: `GET /api/posts/admin/list?page=1&page_size=20`
- **Comments**: `GET /api/comments/admin/list?page=1&page_size=20`
- **Attachments**: `GET /api/attachments/admin/list?page=1&page_size=20`

**Status**: All properly documented in OpenAPI with complete response schemas

### ⚠️  **Problematic Admin Service Endpoints**
- `GET /api/admin/communities`
- `GET /api/admin/posts`
- `GET /api/admin/colleges`
- `GET /api/admin/comments`
- `GET /api/admin/attachments`

**Status**: Exist in the OpenAPI spec but response schemas are **undefined (`{}`)**, likely causing 500 errors

## Changes Made

### 1. **Switched Communities Endpoint**
```typescript
// ❌ OLD (causing 500 errors)
const res = await fetchWithAuth(`/api/admin/communities?page=${page}&page_size=${pageSize}`);

// ✅ NEW (fully documented service-specific endpoint)
const res = await fetchWithAuth(`/api/community/admin/list?page=${page}&page_size=${pageSize}`);
```

### 2. **Enhanced Debugging Logs**
- Token storage validation
- Request/response tracing
- Error detail extraction
- Full error context in browser console

### 3. **Created Comprehensive Test Scripts**
- `DEBUG_GUIDE.md` - Manual debugging steps
- `scripts/debug-api.sh` - Automated API test (no auth)
- `scripts/debug-complete.sh` - Full diagnostic with token

## Next Steps - How to Debug

### **Step 1: Build and Start Dev Server**
```bash
cd /home/abhishek/Desktop/ad_panel/admin-panel
npm run build
npm run dev
```

### **Step 2: Login and Get Your Token**
1. Open http://localhost:3000/login
2. Login with your SUPER_ADMIN credentials
3. Open browser DevTools: **F12**
4. Go to **Console** tab
5. Run: `localStorage.getItem('access_token')`
6. Copy the entire token value

### **Step 3: Run Full Diagnostic**
```bash
chmod +x scripts/debug-complete.sh
./scripts/debug-complete.sh 'YOUR_ACCESS_TOKEN_HERE'
```

This will test:
- ✓ API health
- ✓ Token validation  
- ✓ Service-specific community endpoint
- ✓ Admin service endpoint (if needed)
- ✓ Full response format

### **Step 4: Check Browser Console**
When you navigate to Communities page:
1. **DevTools** → **Console** tab
2. Look for logs starting with `[getStoredTokens]`, `[API]`, `[getAdminCommunities]`
3. Share the output showing:
   - Token existence confirmation
   - API request details
   - Response status (200, 401, 403, 500, etc.)
   - Response body or error message

## Expected Console Output (Success Case)

```
[getStoredTokens] Access token exists: true, Refresh token exists: true {accessLength: 256, refreshLength: 256}
[API] GET /api/proxy/api/community/admin/list?page=1&page_size=20 {hasToken: true, tokenPrefix: 'eyJhbGciOi...'}
[API RESPONSE] /api/proxy/api/community/admin/list?page=1&page_size=20 -> 200 OK
[getAdminCommunities] Response status: 200
[getAdminCommunities] Using service-specific endpoint: /api/community/admin/list
[getAdminCommunities] Success response: {items: [...], total: 5, page: 1, page_size: 20}
[getAdminCommunities] Returning: {items: [...], total: 5, page: 1, page_size: 20}
[CommunitiesPage] Loaded successfully: {items: [...], total: 5, page: 1}
```

## Expected Console Output (Error Cases)

### **401 Unauthorized (Token expired)**
```
[getStoredTokens] Access token exists: false, Refresh token exists: false
[API] GET /api/proxy/api/community/admin/list?page=1&page_size=20 {hasToken: false, tokenPrefix: 'none'}
[API RESPONSE] /api/proxy/api/community/admin/list?page=1&page_size=20 -> 401 Unauthorized
[CommunitiesPage] Error caught: Failed to load communities: Not authenticated
```
**Fix**: Login again

### **403 Forbidden (Not SUPER_ADMIN)**
```
[API RESPONSE] /api/proxy/api/community/admin/list?page=1&page_size=20 -> 403 Forbidden
[getAdminCommunities] Error response body: {"detail":"SUPER_ADMIN role required"}
[CommunitiesPage] Error caught: Failed to load communities: SUPER_ADMIN role required
```
**Fix**: Use a SUPER_ADMIN user account

### **500 Internal Server Error**
```
[API RESPONSE] /api/proxy/api/community/admin/list?page=1&page_size=20 -> 500 Internal Server Error
[getAdminCommunities] Error response body: {...backend error...}
```
**Fix**: Check API server logs, likely a backend service issue

## Key Learnings

1. **Admin Service vs Service-Specific**: The admin service (`/api/admin/*`) appears incomplete in OpenAPI specs. Service-specific admin endpoints (e.g., `/api/community/admin/list`) are properly documented.

2. **Response Format**: All paginated endpoints return: `{items: T[], total: number, page: number, page_size: number}`

3. **Token Flow**:
   - Stored in localStorage: `access_token`, `refresh_token`
   - Forwarded via proxy to backend
   - 401 triggers automatic refresh
   - 403 means insufficient role

4. **Proxy Route**: App uses proxy at `/api/proxy/[...path]` to:
   - Forward requests to backend
   - Preserve Authorization headers
   - Handle CORS

## Files Modified

- [src/lib/api.ts](src/lib/api.ts) - Updated `getAdminCommunities` to use service-specific endpoint
- [app/(admin)/communities/page.tsx](app/(admin)/communities/page.tsx) - Enhanced error logging
- [src/lib/api.ts](src/lib/api.ts) - Added token storage debugging

## Files Created

- [DEBUG_GUIDE.md](DEBUG_GUIDE.md) - Manual debugging reference
- [scripts/debug-api.sh](scripts/debug-api.sh) - Basic API health check
- [scripts/debug-complete.sh](scripts/debug-complete.sh) - Full diagnostic with token

## Ready to Test?

1. **Build the app**: `npm run build` (should succeed)
2. **Start dev server**: `npm run dev`
3. **Login**: http://localhost:3000/login with SUPER_ADMIN account
4. **Check communities page**: http://localhost:3000/communities
5. **Open browser DevTools F12** and share console logs

Let me know what you see in the console!
