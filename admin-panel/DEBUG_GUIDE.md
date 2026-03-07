# Final Debug Guide - Communities Page Issue

## Step 1: Enable Browser Console Logging
1. Open browser DevTools: **F12**
2. Go to **Console** tab
3. You should see detailed logs like:
   ```
   [getStoredTokens] Access token exists: true, Refresh token exists: true
   [API] GET /api/proxy/api/admin/communities?page=1&page_size=20
   [getAdminCommunities] Fetching page=1, pageSize=20
   [API RESPONSE] /api/proxy/api/admin/communities?page=1&page_size=20 -> 200 OK
   ```

## Step 2: Check Network Traffic
1. Go to **Network** tab in DevTools
2. Click on Communities page
3. Look for the request to `/api/proxy/api/admin/communities`
4. Check these details:
   - **Status**: Should be 200 (success) or show actual error code
   - **Headers**: Look for `Authorization: Bearer <token>`
   - **Response**: Should show `{items: [...], total: N, page: 1, page_size: 20}`

## Step 3: Check Token Storage
1. Go to **Application** tab → **Local Storage** → `http://localhost:3000`
2. Look for:
   - `access_token` - Should have a long JWT string
   - `refresh_token` - Should have another JWT string
   - `user` - Should have JSON with user info
3. If any missing: **You're logged out**, need to login again

## Step 4: Check API Server Status
1. Open a terminal and run:
   ```bash
   curl -X GET http://172.21.11.121:8080/api/admin/health
   ```
2. Should respond with:
   ```json
   {"status":"ok"}
   ```
3. If connection refused: **API server is down**

## Step 5: Test Communities Endpoint Directly
1. Get your access token from browser console:
   ```javascript
   localStorage.getItem('access_token')
   ```
   Copy the entire token (paste it somewhere safe)

2. In terminal, run (replace TOKEN with copied token):
   ```bash
   curl -X GET http://172.21.11.121:8080/api/admin/communities?page=1&page_size=20 \
     -H "Authorization: Bearer TOKEN" \
     -H "Content-Type: application/json"
   ```
3. Should respond with data or clear error message

## Step 6: Interpret Console Logs

### Good Scenario (Should see):
```
[getStoredTokens] Access token exists: true, Refresh token exists: true
[API] GET /api/proxy/api/admin/communities... { hasToken: true, tokenPrefix: 'eyJhbGciOi...' }
[API RESPONSE] /api/proxy/api/admin/communities -> 200 OK
[getAdminCommunities] Response status: 200
[getAdminCommunities] Success response: {items: [...], total: 5, page: 1, page_size: 20}
[getAdminCommunities] Returning: {items: [...], total: 5, page: 1, page_size: 20}
[CommunitiesPage] Loaded successfully: {items: [...], total: 5, page: 1}
```

### No Token Scenario (Should see):
```
[getStoredTokens] Access token exists: false, Refresh token exists: false
[API] GET /api/proxy/api/admin/communities { hasToken: false, tokenPrefix: 'none' }
[API RESPONSE] /api/proxy/api/admin/communities -> 401 Unauthorized
```
**Fix**: Login again

### Permission Error Scenario (Should see):
```
[API RESPONSE] /api/proxy/api/admin/communities -> 403 Forbidden
[getAdminCommunities] Error response body: {"detail":"SUPER_ADMIN role required"}
[getAdminCommunities] Final error message: SUPER_ADMIN role required
[CommunitiesPage] Error caught: Failed to load communities: SUPER_ADMIN role required
```
**Fix**: Use a SUPER_ADMIN user account

### API Server Down Scenario (Should see):
```
[API] GET /api/proxy/api/admin/communities...
[Error] Failed to fetch
[CommunitiesPage] Error caught: Failed to fetch
```
**Fix**: Start the API server at http://172.21.11.121:8080

## Step 7: Check Proxy Configuration
The app uses a proxy at `/api/proxy/[...path]` route. 

Verify in [src/middleware.ts](src/middleware.ts) and [app/api/proxy/[...path]/route.ts](app/api/proxy/%5B...path%5D/route.ts):
- API base URL should be `http://172.21.11.121:8080`
- Tokens should be forwarded in Authorization header
- CORS should be handled correctly

## Debugging Checklist
- [ ] Browser console shows token check logs
- [ ] Network tab shows request with Authorization header
- [ ] Local Storage has access_token, refresh_token, user
- [ ] curl health check passes
- [ ] curl communities endpoint with token works
- [ ] Console logs show 200 status
- [ ] Communities page displays data

## Common Issues

| Symptom | Cause | Fix |
|---------|-------|-----|
| "Loading..." spinner never stops | API server down or wrong URL | Check API is running at 172.21.11.121:8080 |
| "Authentication failed" error | No token or token expired | Log in again |
| "You need SUPER_ADMIN role" | User account doesn't have SUPER_ADMIN | Use a SUPER_ADMIN user account |
| Blank page with no logs | JavaScript error | Check console for red errors |
| Network shows 500 error | API service error | Check API server logs |
| No Authorization header | Token not stored | Check localStorage has tokens |

## Next Steps
1. Open browser DevTools (F12)
2. Go to Communities page
3. Check Console tab for logs starting with `[getStoredTokens]`
4. Report what you see in the console and network tabs
5. Message me the output from console and any error messages shown
