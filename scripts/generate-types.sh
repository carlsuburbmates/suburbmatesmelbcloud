#!/bin/bash
# Script to generate Supabase types
# Usage: ./scripts/generate-types.sh

PROJECT_ID="nhkmhgbbbcgfbudszfqj"

echo "Generating types for project $PROJECT_ID..."
npx supabase gen types typescript --project-id "$PROJECT_ID" > types/supabase.ts

if [ $? -eq 0 ]; then
  echo "Types generated successfully in types/supabase.ts"
else
  echo "Error generating types. Ensure you are logged in via 'npx supabase login'."
fi
