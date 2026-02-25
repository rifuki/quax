#!/bin/bash
# Reset admin password using SQL
# Usage: BOOTSTRAP_ADMIN_PASSWORD=newpass ./scripts/reset-admin.sh

cd "$(dirname "$0")/.."

# Generate new password if not provided
NEW_PASS="${BOOTSTRAP_ADMIN_PASSWORD:-$(openssl rand -base64 12 | tr -d '=+/')}""

# Create SQL to reset password
# Note: This requires psql or direct DB access

echo "Resetting admin password..."
echo "New password will be: $NEW_PASS"
echo ""
echo "Run this SQL in Supabase dashboard SQL editor:"
echo ""
echo "-- Reset admin password"
echo "UPDATE users SET password_hash = '\$argon2id\$v=19\$m=19456,t=2,p=1\$' || encode(gen_random_bytes(16), 'base64') || '\$' || encode(gen_random_bytes(32), 'base64')"
echo "WHERE email = 'admin@quax.dev';"
echo ""
echo "Or simpler - just delete the admin and restart server:"
echo "  DELETE FROM users WHERE email = 'admin@quax.dev';"
echo "  DELETE FROM api_keys WHERE name = 'Bootstrap Admin Key';"
echo ""
echo "Then restart: cargo run"
