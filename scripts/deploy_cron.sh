#!/bin/bash

# Deploy the Featured Queue Cron Job
# Usage: ./scripts/deploy_cron.sh

echo "Deploying 'cron-featured-queue' to Supabase Edge Functions..."
echo "Ensure you are logged in via 'npx supabase login' first."

# Deploy with no-verify-jwt because it's a scheduled internal task
npx supabase functions deploy cron-featured-queue --no-verify-jwt

echo "✅ Function deployed."
echo "⚠️  CRITICAL: You must now set up the cron schedule in the Supabase Dashboard or via pg_net."
echo "   Go to: https://supabase.com/dashboard/project/_/functions/cron-featured-queue"
echo "   Or run this SQL in SQL Editor:"
echo "   select cron.schedule('0 0 * * *', $$select net.http_post(url:='https://<PROJECT_REF>.supabase.co/functions/v1/cron-featured-queue', headers:='{\"Content-Type\": \"application/json\", \"Authorization\": \"Bearer <SERVICE_ROLE_KEY>\"}'::jsonb)$$);"
