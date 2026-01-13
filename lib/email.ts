import { Resend } from 'resend';

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = 'SuburbMates <hello@suburbmates.com.au>';

// Helper: Common Styles for HTML Email
const emailStyles = `
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    line-height: 1.6;
    color: #1a1a1a;
    max-width: 600px;
    margin: 0 auto;
`;

const buttonStyles = `
    display: inline-block;
    background-color: #000;
    color: #fff;
    padding: 12px 24px;
    border-radius: 6px;
    text-decoration: none;
    font-weight: 600;
    margin-top: 16px;
`;

const footerStyles = `
    margin-top: 32px;
    padding-top: 24px;
    border-top: 1px solid #eaeaea;
    color: #666;
    font-size: 12px;
`;

/**
 * Send a generic transactional email
 */
export async function sendEmail(to: string, subject: string, htmlContent: string) {
    if (!process.env.RESEND_API_KEY) {
        console.warn('RESEND_API_KEY missing. Skipping email to:', to);
        return;
    }

    try {
        const { data, error } = await resend.emails.send({
            from: FROM_EMAIL,
            to: [to],
            // bcc: 'audit@suburbmates.com.au', // Optional: Operator BCC
            subject: subject,
            html: `
                <div style="${emailStyles}">
                    <h1 style="font-size: 24px; font-weight: 800; margin-bottom: 24px;">SuburbMates</h1>
                    ${htmlContent}
                    <div style="${footerStyles}">
                        <p>© ${new Date().getFullYear()} SuburbMates Melbourne. <br>System Generated Notification.</p>
                    </div>
                </div>
            `,
        });

        if (error) {
            console.error('Email Error:', error);
        } else {
            console.log(`Email sent to ${to}: ${data?.id}`);
        }
    } catch (err) {
        console.error('Email Exception:', err);
    }
}

// ----------------------------------------------------
// 1. Onboarding & Claiming
// ----------------------------------------------------

export async function sendWelcomeEmail(to: string, name: string) {
    const html = `
        <p>Hi ${name},</p>
        <p>Welcome to SuburbMates. Your account has been created.</p>
        <p>You can now browse the directory or claim a listing to start managing your commercial presence.</p>
    `;
    await sendEmail(to, 'Welcome to SuburbMates', html);
}

export async function sendListingClaimedEmail(to: string, listingName: string) {
    const html = `
        <p><strong>Listing Claimed Successfully</strong></p>
        <p>You are now the owner of <strong>${listingName}</strong>.</p>
        <p>Your Studio dashboard is ready. You can now update your details, add products, and verify your business.</p>
        <a href="${process.env.NEXT_PUBLIC_SITE_URL}/studio" style="${buttonStyles}">Go to Studio</a>
    `;
    await sendEmail(to, 'Listing Claimed ✅', html);
}

// ----------------------------------------------------
// 2. Verification & Triage
// ----------------------------------------------------

export async function sendListingApprovedEmail(to: string, listingName: string, slug: string) {
    const link = `${process.env.NEXT_PUBLIC_SITE_URL}/u/${slug}`;
    const html = `
        <p>Good news,</p>
        <p>Your listing <strong>${listingName}</strong> has been <strong>Approved</strong>.</p>
        <p>It is now publicly visible on the directory.</p>
        <a href="${link}" style="${buttonStyles}">View Live Listing</a>
    `;
    await sendEmail(to, 'Listing Approved 🟢', html);
}

export async function sendListingRejectedEmail(to: string, listingName: string, reason: string) {
    const html = `
        <p>Regarding <strong>${listingName}</strong>,</p>
        <p>Our automated systems or triage team have flagged your listing. It is currently <strong>Hidden</strong> due to the following:</p>
        <blockquote style="background: #fff5f5; border-left: 4px solid #e53e3e; padding: 12px; margin: 16px 0;">${reason}</blockquote>
        <p>Please log in to your Studio to resolve this issue.</p>
        <a href="${process.env.NEXT_PUBLIC_SITE_URL}/studio" style="${buttonStyles}">Fix Listing</a>
    `;
    await sendEmail(to, 'Action Required: Listing Hidden 🔴', html);
}

// ----------------------------------------------------
// 3. Monetization (Pro & Featured)
// ----------------------------------------------------

export async function sendProActivatedEmail(to: string) {
    const html = `
        <p><strong>You are now a Pro Member! 🌟</strong></p>
        <p>Your subscription is active. You have unlocked:</p>
        <ul>
            <li>Pro Mini-site & Gold Badge</li>
            <li>10 Product Inventory Limit</li>
            <li>Advanced Analytics</li>
        </ul>
        <a href="${process.env.NEXT_PUBLIC_SITE_URL}/studio" style="${buttonStyles}">Open Studio</a>
    `;
    await sendEmail(to, 'Pro Activated', html);
}

export async function sendProExpiryUpcomingEmail(to: string, expiryDate: string) {
    const html = `
        <p>Your Pro subscription will renew/expire on <strong>${expiryDate}</strong>.</p>
        <p>Ensure your payment details are up to date to avoid service interruption.</p>
    `;
    await sendEmail(to, 'Subscription Notice', html);
}

export async function sendProExpiredEmail(to: string) {
    const html = `
        <p><strong>Pro Features Paused</strong></p>
        <p>We couldn't renew your subscription. Your account has been downgraded to <strong>Basic</strong>.</p>
        <p>Your Pro Mini-site is hidden, but your data is safe. Reactivate anytime to restore full access.</p>
        <a href="${process.env.NEXT_PUBLIC_SITE_URL}/studio/billing" style="${buttonStyles}">Reactivate Pro</a>
    `;
    await sendEmail(to, 'Subscription Ended', html);
}

export async function sendPaymentFailedEmail(to: string) {
    const html = `
        <p><strong>Payment Failed</strong></p>
        <p>We attempted to process your subscription renewal but it failed.</p>
        <p>We will retry automatically. Please check your card details.</p>
        <a href="${process.env.NEXT_PUBLIC_SITE_URL}/studio/billing" style="${buttonStyles}">Update Billing</a>
    `;
    await sendEmail(to, 'Action Required: Payment Failed', html);
}

// FIFO Queue Emails
export async function sendFeaturedActiveEmail(to: string, listingName: string, location: string, expiryDate: string) {
    const html = `
        <p><strong>You are Live! 🚀</strong></p>
        <p>Your Featured Placement for <strong>${listingName}</strong> in <strong>${location}</strong> is now ACTIVE.</p>
        <p>You are occupying one of the top 5 slots. This placement expires on <strong>${expiryDate}</strong>.</p>
    `;
    await sendEmail(to, 'Featured Placement Active', html);
}

export async function sendFeaturedQueuedEmail(to: string, listingName: string, location: string, estimatedStartDate: string) {
    const html = `
        <p><strong>Placement Reserved (Queue Position #1)</strong></p>
        <p>The <strong>${location}</strong> Council area is currently full (5/5 slots).</p>
        <p>You have successfully reserved the next available spot.</p>
        <p><strong>Estimated Start:</strong> ${estimatedStartDate}</p>
        <p>We will email you automatically when your slot goes live.</p>
    `;
    await sendEmail(to, 'Placement Reserved', html);
}

export async function sendFeaturedExpiryUpcomingEmail(to: string, listingName: string, location: string, expiryDate: string) {
    const html = `
        <p><strong>Your Featured Placement is Expiring Soon ⏰</strong></p>
        <p>Your placement for <strong>${listingName}</strong> in <strong>${location}</strong> will expire on <strong>${expiryDate}</strong>.</p>
        <p>To retain your top spot, you can re-purchase a placement in your Studio dashboard.</p>
        <a href="${process.env.NEXT_PUBLIC_SITE_URL}/studio/promote" style="${buttonStyles}">Renew Placement</a>
    `;
    await sendEmail(to, 'Featured Placement Expiring Soon', html);
}

export async function sendFeaturedSlotAvailableEmail(to: string, listingName: string) {
    // This would be used if we had a manual "Invite" system, but keeping for completeness
    const html = `
        <p>Great news! A spot has opened up for <strong>${listingName}</strong>.</p>
    `;
    await sendEmail(to, 'Slot Available', html);
}

// ----------------------------------------------------
// 4. Safety & Trust (Notifications)
// ----------------------------------------------------

export async function sendReportReceivedEmail(to: string, listingName: string) {
    const html = `
        <p>We received your report regarding <strong>${listingName}</strong>.</p>
        <p>Our team (and automated safety systems) will review this shortly.</p>
        <p>We do not provide updates on the outcome of reports to protect privacy, but we take every report seriously.</p>
        <p>Thank you for keeping SuburbMates safe.</p>
    `;
    await sendEmail(to, 'Report Received', html);
}

// ----------------------------------------------------
// 5. Enforcement Ladder
// ----------------------------------------------------

export async function sendEnforcementWarningEmail(to: string, reason: string) {
    const html = `
        <p><strong>⚠️ Official Warning</strong></p>
        <p>Your account has been flagged for violating our Platform Standards.</p>
        <p><strong>Reason:</strong> ${reason}</p>
        <p>Please review your listings immediately. Continued violations will result in suspension.</p>
    `;
    await sendEmail(to, 'Platform Warning', html);
}

export async function sendEnforcementSuspensionEmail(to: string, reason: string) {
    const html = `
        <p><strong>⛔ Account Suspended</strong></p>
        <p>Your access to SuburbMates has been temporarily suspended.</p>
        <p><strong>Reason:</strong> ${reason}</p>
        <p>Your listings are hidden. Please contact support to resolve this.</p>
    `;
    await sendEmail(to, 'Account Suspended', html);
}

export async function sendEnforcementEvictionEmail(to: string, reason: string) {
    const html = `
        <p><strong>⛔ Account Terminated (Final Notice)</strong></p>
        <p>Your account has been permanently closed due to severe violations.</p>
        <p><strong>Reason:</strong> ${reason}</p>
        <p>Active subscriptions have been cancelled.</p>
        <hr />
        <p><strong>Appeals:</strong> If you believe this is a system error, you may reply to this email within 7 days. Note that valid enforcement actions are rarely overturned.</p>
    `;
    await sendEmail(to, 'Account Terminated', html);
}
