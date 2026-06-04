#!/bin/bash

# This script runs the Prisma migration interactively
# It will prompt you to confirm the migration

cd "$(dirname "$0")"

echo "Running Prisma migration: remove_monthly_collection_model"
echo "This will remove the APPROVED enum value from RequestStatus"
echo ""

npx prisma migrate dev --name remove_monthly_collection_model --config prisma/prisma.config.js

echo ""
echo "Migration completed!"
