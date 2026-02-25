#!/bin/bash
# Seed script to create dummy accounts
# Usage: ./scripts/seed.sh [API_URL]

set -e

API_URL="${1:-http://localhost:8080}"

echo "🌱 Seeding database with dummy accounts..."
echo "API URL: $API_URL"
echo ""

# Create admin user
echo "Creating admin user..."
curl -s -X POST "$API_URL/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@quax.dev",
    "username": "admin",
    "name": "Administrator",
    "password": "admin123"
  }' | grep -q '"success":true' && echo "✅ Admin user created" || echo "⚠️ Admin may already exist"

# Create regular user
echo "Creating regular user..."
curl -s -X POST "$API_URL/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@quax.dev",
    "username": "johndoe",
    "name": "John Doe",
    "password": "user123"
  }' | grep -q '"success":true' && echo "✅ User created" || echo "⚠️ User may already exist"

# Create test user (Hello World)
echo "Creating test user..."
curl -s -X POST "$API_URL/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "hello@mail.com",
    "username": "hatsunemiku",
    "name": "Hello World",
    "password": "Hatsunemiku"
  }' | grep -q '"success":true' && echo "✅ Test user created" || echo "⚠️ Test user may already exist"

echo ""
echo "✨ Seeding complete!"
echo ""
echo "Accounts:"
echo "  Admin: admin@quax.dev / admin123"
echo "  User:  user@quax.dev / user123"
echo "  Test:  hello@mail.com / Hatsunemiku"
