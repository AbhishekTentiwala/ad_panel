#!/bin/bash
# Complete API debugging and testing script

API_BASE="http://172.21.11.121:8080"
TOKEN="${1:-}"

echo "════════════════════════════════════════════════════════════════════════════════"
echo " Campus Assist API - Complete Diagnostic Tests"
echo "════════════════════════════════════════════════════════════════════════════════"
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Health Check
echo -e "${YELLOW}[TEST 1]${NC} Health Check - Testing if API is reachable"
echo "────────────────────────────────────────────────────────────────────────────────"
HEALTH=$(curl -s -w "\n%{http_code}" -X GET "$API_BASE/api/admin/health")
HTTP_CODE=$(echo "$HEALTH" | tail -1)
HEALTH_BODY=$(echo "$HEALTH" | head -1)

if [ "$HTTP_CODE" = "200" ]; then
  echo -e "${GREEN}✓ PASS${NC} - API admin service is responding"
  echo "Response: $HEALTH_BODY" | head -c 200
  echo ""
else
  echo -e "${RED}✗ FAIL${NC} - API returned HTTP $HTTP_CODE"
  echo "Response: $HEALTH_BODY" | head -c 200
  echo ""
  echo -e "${RED}ERROR: API server not responding correctly. Cannot proceed with authentication tests.${NC}"
  exit 1
fi
echo ""

# Test 2: No Token - Should fail on admin endpoints
if [ -z "$TOKEN" ]; then
  echo -e "${YELLOW}[TEST 2]${NC} No token provided - Cannot test authenticated endpoints"
  echo "────────────────────────────────────────────────────────────────────────────────"
  echo "To run full diagnostic:"
  echo "  1. Login to the app at http://localhost:3000/login"
  echo "  2. Open browser DevTools (F12) → Console"
  echo "  3. Run: localStorage.getItem('access_token')"
  echo "  4. Copy the entire token and run:"
  echo "     ./scripts/debug-complete.sh '<PASTE_TOKEN_HERE>'"
  echo ""
  exit 0
fi

echo -e "${YELLOW}[TEST 2]${NC} Token Validation"
echo "────────────────────────────────────────────────────────────────────────────────"
TOKEN_PREFIX=$(echo "$TOKEN" | cut -c1-30)
echo "Token provided: ${TOKEN_PREFIX}..."
echo "Token length: ${#TOKEN}"
echo ""

# Test 3: Test Admin Communities Endpoint (Service-specific)
echo -e "${YELLOW}[TEST 3]${NC} Communities Endpoint - /api/community/admin/list"
echo "────────────────────────────────────────────────────────────────────────────────"
COMMUNITIES=$(curl -s -w "\n%{http_code}" -X GET "$API_BASE/api/community/admin/list?page=1&page_size=20" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")

HTTP_CODE=$(echo "$COMMUNITIES" | tail -1)
COMMUNITIES_BODY=$(echo "$COMMUNITIES" | head -1)

echo "Request: GET $API_BASE/api/community/admin/list?page=1&page_size=20"
echo "HTTP Status: $HTTP_CODE"
echo "Response:"
echo "$COMMUNITIES_BODY" | jq . 2>/dev/null || echo "$COMMUNITIES_BODY" | head -c 500
echo ""

case "$HTTP_CODE" in
  200)
    echo -e "${GREEN}✓ PASS${NC} - Service-specific community endpoint working"
    ITEMS=$(echo "$COMMUNITIES_BODY" | jq '.items | length' 2>/dev/null || echo "unknown")
    echo "Items returned: $ITEMS"
    ;;
  401)
    echo -e "${RED}✗ FAIL${NC} - Unauthorized (token invalid or expired)"
    ;;
  403)
    echo -e "${RED}✗ FAIL${NC} - Forbidden (user doesn't have SUPER_ADMIN role)"
    ;;
  *)
    echo -e "${RED}✗ FAIL${NC} - Unexpected status"
    ;;
esac
echo ""

# Test 4: Test Admin Service Communities Endpoint
echo -e "${YELLOW}[TEST 4]${NC} Admin Service Communities - /api/admin/communities"
echo "────────────────────────────────────────────────────────────────────────────────"
ADMIN_COMMUNITIES=$(curl -s -w "\n%{http_code}" -X GET "$API_BASE/api/admin/communities?page=1&page_size=20" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")

HTTP_CODE=$(echo "$ADMIN_COMMUNITIES" | tail -1)
ADMIN_COMMUNITIES_BODY=$(echo "$ADMIN_COMMUNITIES" | head -1)

echo "Request: GET $API_BASE/api/admin/communities?page=1&page_size=20"
echo "HTTP Status: $HTTP_CODE"
echo "Response:"
echo "$ADMIN_COMMUNITIES_BODY" | jq . 2>/dev/null || echo "$ADMIN_COMMUNITIES_BODY" | head -c 500
echo ""

case "$HTTP_CODE" in
  200)
    echo -e "${GREEN}✓ PASS${NC} - Admin unified communities endpoint working"
    ITEMS=$(echo "$ADMIN_COMMUNITIES_BODY" | jq '.items | length' 2>/dev/null || echo "unknown")
    echo "Items returned: $ITEMS"
    ;;
  401)
    echo -e "${RED}✗ FAIL${NC} - Unauthorized (token invalid or expired)"
    ;;
  403)
    echo -e "${RED}✗ FAIL${NC} - Forbidden (user doesn't have SUPER_ADMIN role)"
    ;;
  500)
    echo -e "${RED}✗ FAIL${NC} - Internal Server Error (backend issue)"
    ;;
  *)
    echo -e "${RED}✗ FAIL${NC} - Unexpected status"
    ;;
esac
echo ""

# Test 5: Test Colleges Endpoint
echo -e "${YELLOW}[TEST 5]${NC} Colleges Endpoint - /api/college/admin/list"
echo "────────────────────────────────────────────────────────────────────────────────"
COLLEGES=$(curl -s -w "\n%{http_code}" -X GET "$API_BASE/api/college/admin/list?page=1&page_size=20" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")

HTTP_CODE=$(echo "$COLLEGES" | tail -1)
COLLEGES_BODY=$(echo "$COLLEGES" | head -1)

echo "Request: GET $API_BASE/api/college/admin/list?page=1&page_size=20"
echo "HTTP Status: $HTTP_CODE"
echo "Response:"
echo "$COLLEGES_BODY" | jq . 2>/dev/null || echo "$COLLEGES_BODY" | head -c 500
echo ""

case "$HTTP_CODE" in
  200)
    echo -e "${GREEN}✓ PASS${NC} - Colleges endpoint working"
    ITEMS=$(echo "$COLLEGES_BODY" | jq 'if type == "array" then length else .data | length end' 2>/dev/null || echo "unknown")
    echo "Items returned: $ITEMS"
    ;;
  *)
    echo -e "${RED}✗ FAIL${NC} - HTTP $HTTP_CODE"
    ;;
esac
echo ""

# Test 6: Test College Communities (per-college, no SUPER_ADMIN needed)
if echo "$COLLEGES_BODY" | jq -e '.data[0].id' > /dev/null 2>&1; then
  FIRST_COLLEGE_ID=$(echo "$COLLEGES_BODY" | jq -r '.data[0].id')
  echo -e "${YELLOW}[TEST 6]${NC} Per-College Communities - /api/college/{id}/communities"
  echo "────────────────────────────────────────────────────────────────────────────────"
  
  COLLEGE_COMMUNITIES=$(curl -s -w "\n%{http_code}" -X GET "$API_BASE/api/college/$FIRST_COLLEGE_ID/communities?page=1&page_size=20" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json")
  
  HTTP_CODE=$(echo "$COLLEGE_COMMUNITIES" | tail -1)
  COLLEGE_COMMUNITIES_BODY=$(echo "$COLLEGE_COMMUNITIES" | head -1)
  
  echo "College ID: $FIRST_COLLEGE_ID"
  echo "Request: GET $API_BASE/api/college/$FIRST_COLLEGE_ID/communities"
  echo "HTTP Status: $HTTP_CODE"
  echo "Response:"
  echo "$COLLEGE_COMMUNITIES_BODY" | jq . 2>/dev/null || echo "$COLLEGE_COMMUNITIES_BODY" | head -c 300
  echo ""
  
  case "$HTTP_CODE" in
    200)
      echo -e "${GREEN}✓ PASS${NC} - Per-college communities endpoint working"
      ;;
    *)
      echo -e "${RED}✗ FAIL${NC} - HTTP $HTTP_CODE"
      ;;
  esac
else
  echo -e "${YELLOW}[TEST 6]${NC} No colleges found - skipping per-college test"
fi
echo ""

# Summary
echo "════════════════════════════════════════════════════════════════════════════════"
echo " Test Summary"
echo "════════════════════════════════════════════════════════════════════════════════"
echo ""
echo "What to look for:"
echo "  1. If Test 1 (Health) fails → API server is down"
echo "  2. If Test 3 or 4 return 401 → Token is invalid/expired"
echo "  3. If Test 3 or 4 return 403 → User account doesn't have SUPER_ADMIN role"
echo "  4. If Test 3 or 4 return 500 → Backend service error (check API logs)"
echo "  5. If Test 5 returns data → Colleges are accessible"
echo ""
echo "════════════════════════════════════════════════════════════════════════════════"
