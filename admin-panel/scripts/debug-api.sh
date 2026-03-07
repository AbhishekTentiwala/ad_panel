#!/bin/bash
# Debug script to test API endpoints

API_BASE="http://172.21.11.121:8080"
TOKEN="${1:-}"

echo "=========================================="
echo "Communities API Debug Script"
echo "=========================================="
echo ""

# Step 1: Health check
echo "Step 1: Health Check"
echo "---"
echo "Request: GET $API_BASE/api/admin/health"
HEALTH=$(curl -s -w "\n%{http_code}" -X GET "$API_BASE/api/admin/health")
HTTP_CODE=$(echo "$HEALTH" | tail -1)
HEALTH_BODY=$(echo "$HEALTH" | head -1)
echo "Status: $HTTP_CODE"
echo "Response: $HEALTH_BODY"
echo ""

if [ "$HTTP_CODE" != "200" ]; then
  echo "❌ API server not responding correctly"
  exit 1
fi

echo "✅ API server is responding"
echo ""

# Step 2: Check if token provided
if [ -z "$TOKEN" ]; then
  echo "⚠️  No token provided. Skipping authentication tests."
  echo ""
  echo "To test authenticated endpoints, run:"
  echo "  ./scripts/debug-api.sh 'YOUR_ACCESS_TOKEN'"
  echo ""
  echo "Get your token from:"
  echo "  1. Open browser DevTools (F12)"
  echo "  2. Console tab: localStorage.getItem('access_token')"
  exit 0
fi

# Step 3: Test communities endpoint
echo "Step 2: Test Communities Endpoint"
echo "---"
echo "Request: GET $API_BASE/api/admin/communities?page=1&page_size=20"
echo "Auth: Bearer ${TOKEN:0:20}..."
echo ""

COMMUNITIES=$(curl -s -w "\n%{http_code}" -X GET "$API_BASE/api/admin/communities?page=1&page_size=20" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")

HTTP_CODE=$(echo "$COMMUNITIES" | tail -1)
COMMUNITIES_BODY=$(echo "$COMMUNITIES" | head -1)

echo "Status: $HTTP_CODE"
echo "Response:"
echo "$COMMUNITIES_BODY" | jq . 2>/dev/null || echo "$COMMUNITIES_BODY"
echo ""

case "$HTTP_CODE" in
  200)
    echo "✅ Communities endpoint working"
    TOTAL=$(echo "$COMMUNITIES_BODY" | jq '.total' 2>/dev/null || echo "?")
    echo "   Found $TOTAL communities"
    ;;
  401)
    echo "❌ Unauthorized - token is invalid or expired"
    echo "   Solution: Login again to get a fresh token"
    ;;
  403)
    echo "❌ Forbidden - you don't have SUPER_ADMIN role"
    echo "   Solution: Use a SUPER_ADMIN user account"
    ;;
  *)
    echo "❌ Unexpected status code"
    ;;
esac
echo ""

# Step 4: Test colleges endpoint
echo "Step 3: Test Colleges Endpoint"
echo "---"
echo "Request: GET $API_BASE/api/college/admin/list?page=1&page_size=20"
echo ""

COLLEGES=$(curl -s -w "\n%{http_code}" -X GET "$API_BASE/api/college/admin/list?page=1&page_size=20" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")

HTTP_CODE=$(echo "$COLLEGES" | tail -1)
COLLEGES_BODY=$(echo "$COLLEGES" | head -1)

echo "Status: $HTTP_CODE"
echo "Response:"
echo "$COLLEGES_BODY" | jq . 2>/dev/null || echo "$COLLEGES_BODY"
echo ""

case "$HTTP_CODE" in
  200)
    echo "✅ Colleges endpoint working"
    TOTAL=$(echo "$COLLEGES_BODY" | jq '.data | length' 2>/dev/null || echo "?")
    echo "   Found $TOTAL colleges"
    ;;
  *)
    echo "⚠️  Colleges endpoint check: $HTTP_CODE"
    ;;
esac
echo ""

echo "=========================================="
echo "Debug Complete"
echo "=========================================="
