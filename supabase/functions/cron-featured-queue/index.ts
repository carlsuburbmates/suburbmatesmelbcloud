import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

console.log('Hello from Featured Queue Cron!')

Deno.serve(async (req) => {
    try {
        const supabase = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        // 1. Process Queue & Identify Notifications
        console.log('Invoking process_daily_queue...')
        const { data: notifications, error } = await supabase.rpc('process_daily_queue')

        if (error) {
            console.error('RPC Error:', error)
            throw error
        }

        // 2. Handle Notifications
        if (notifications && notifications.length > 0) {
            console.log(`Processing ${notifications.length} notifications...`)

            // Note: For actual email sending in a real Edge Function, 
            // you would use the Resend API or another provider.
            // Since we are documenting implementation, we'll demonstrate the logic.

            for (const note of notifications) {
                console.log(`[${note.action_type}] Sending email to ${note.user_email} for ${note.listing_name}`)

                // LOGIC:
                // if (note.action_type === 'activation') { ... sendFeaturedActiveEmail ... }
                // if (note.action_type === 'reminder') { ... sendFeaturedExpiryUpcomingEmail ... }
            }
        }

        console.log('Queue processed successfully')

        return new Response(JSON.stringify({
            message: 'Queue processed successfully',
            notification_count: notifications?.length || 0
        }), {
            headers: { 'Content-Type': 'application/json' },
            status: 200,
        })
    } catch (err: any) {
        console.error('Cron Failed:', err.message)
        return new Response(JSON.stringify({ error: err.message }), {
            headers: { 'Content-Type': 'application/json' },
            status: 500,
        })
    }
})
