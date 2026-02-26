#!/bin/bash
# Hard reset database - NO CONFIRMATION (use with caution!)
# Usage: ./scripts/migrate-reset-hard.sh

set -e

cd "$(dirname "$0")/.."

echo "🔄 Hard resetting database..."

# Revert migration 004 (drops tables)
cargo sqlx migrate revert --source migrations 2>/dev/null || true

# Run migration 004 again (recreates tables)
cargo sqlx migrate run --source migrations --target-version 004

echo "✅ Database reset complete!"
echo ""
echo "🚀 Run: cargo run"
echo "   Bootstrap will create new admin + API key"
