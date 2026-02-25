#!/bin/bash
# Reset database - Drops all tables and recreates fresh
# Usage: ./scripts/migrate-reset.sh

set -e

cd "$(dirname "$0")/.."

echo "⚠️  WARNING: This will DELETE ALL DATA in the database!"
echo ""
read -p "Are you sure? Type 'yes' to continue: " confirm

if [ "$confirm" != "yes" ]; then
    echo "❌ Cancelled"
    exit 1
fi

echo ""
echo "🔄 Running reset migration..."
echo ""

# Run the up migration (drops and recreates)
cargo sqlx migrate run --source migrations --target-version 004

echo ""
echo "✅ Database reset complete!"
echo ""
echo "🚀 Next steps:"
echo "   1. Run the server: cargo run"
echo "   2. Bootstrap akan otomatis membuat admin user + API key"
echo ""
