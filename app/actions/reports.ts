'use server';

import { createClient } from '@/utils/supabase/server';
import { z } from 'zod';

const ReportSchema = z.object({
    listingId: z.string().uuid(),
    reporterEmail: z.string().email('Please enter a valid email'),
    reason: z.string().min(1, 'Please select a reason'),
    details: z.string().optional(),
});

export async function submitReport(formData: FormData) {
    const supabase = await createClient();

    const raw = {
        listingId: formData.get('listingId'),
        reporterEmail: formData.get('reporterEmail'),
        reason: formData.get('reason'),
        details: formData.get('details'),
    };

    const validation = ReportSchema.safeParse(raw);
    if (!validation.success) {
        return { error: validation.error.errors[0].message };
    }

    const { listingId, reporterEmail, reason, details } = validation.data;

    const { error } = await supabase.from('reports').insert({
        listing_id: listingId,
        reporter_email: reporterEmail,
        reason,
        details,
    });

    if (error) {
        return { error: 'Failed to submit report. Please try again later.' };
    }

    // New: Send Confirmation Email
    // We explicitly fetch the listing name to personalize the email.
    // This runs after insertion, so if email fails, report is still saved (non-blocking ideally, but await here is fine for now).
    // Note: We suppress email errors to not fail the UI action.
    try {
        const { data: listing } = await supabase
            .from('listings')
            .select('name')
            .eq('id', listingId)
            .single();

        const listingName = listing?.name || 'the listing';

        // Dynamically import to avoid circular dep issues if any (though lib/email is standalone)
        const { sendReportReceivedEmail } = await import('@/lib/email');
        await sendReportReceivedEmail(reporterEmail, listingName);

    } catch (emailErr) {
        console.error('Failed to send report confirmation email:', emailErr);
        // Do not return error to user, as report IS submitted.
    }

    return { success: true };
}
