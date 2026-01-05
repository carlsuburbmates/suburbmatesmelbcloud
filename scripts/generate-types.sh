#!/bin/bash
# Script to generate Supabase types
# Usage: ./scripts/generate-types.sh

PROJECT_ID="nhkmhgbbbcgfbudszfqj"

echo "Generating types from local database..."
npx supabase gen types typescript --local > types/supabase.ts

if [ $? -eq 0 ]; then
  echo "Types generated successfully in types/supabase.ts"
else
  echo "Error generating types. Ensure you are logged in via 'npx supabase login'."
fi
