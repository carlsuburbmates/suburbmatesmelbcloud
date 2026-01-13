import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock server-only
vi.mock('server-only', () => { return {}; });

import { POST } from '@/app/api/stripe/webhook/route';
// We need imports to be available after mocking
import { NextRequest } from 'next/server';

// Hoist mocks to be accessible in vi.mock
const { mockSendProActivated, mockSendPaymentFailed } = vi.hoisted(() => ({
    mockSendProActivated: vi.fn(),
    mockSendPaymentFailed: vi.fn()
}));

vi.mock('@/lib/email', () => ({
    sendProActivatedEmail: mockSendProActivated,
    sendPaymentFailedEmail: mockSendPaymentFailed,
    sendProExpiryUpcomingEmail: vi.fn(),
    sendProExpiredEmail: vi.fn()
}));

vi.mock('@/lib/stripe', () => ({
    stripe: {
        webhooks: {
            constructEvent: (body: string) => JSON.parse(body)
        }
    }
}));

vi.mock('@/utils/supabase/admin', () => ({
    createAdminClient: () => ({
        from: () => ({
            update: () => ({ eq: () => ({ select: () => ({ single: () => ({ data: { id: 'user-123' } }) }) }) }),
            select: () => ({
                eq: () => ({
                    limit: () => ({ data: [{}] }),
                    single: () => ({ data: { id: 'user-123' } })
                })
            })
        }),
        auth: {
            admin: {
                getUserById: () => ({ data: { user: { email: 'customer@test.com' } } })
            }
        }
    })
}));

describe('Webhook Automation Verification', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test';
    });

    it('should trigger welcome email on checkout.session.completed', async () => {
        const payload = {
            type: 'checkout.session.completed',
            data: {
                object: {
                    mode: 'subscription',
                    metadata: { supabase_user_id: 'user-123' },
                    subscription: 'sub_123',
                    customer: 'cus_123'
                }
            }
        };

        const req = new NextRequest('http://localhost/api/stripe/webhook', {
            method: 'POST',
            body: JSON.stringify(payload),
            headers: { 'stripe-signature': 'test_sig' }
        });

        await POST(req);

        expect(mockSendProActivated).toHaveBeenCalledWith('customer@test.com');
        console.log('✅ PASS: Pro Activation email trigger verified.');
    });

    it('should trigger failure email on invoice.payment_failed', async () => {
        const payload = {
            type: 'invoice.payment_failed',
            data: {
                object: {
                    customer: 'cus_123'
                }
            }
        };

        const req = new NextRequest('http://localhost/api/stripe/webhook', {
            method: 'POST',
            body: JSON.stringify(payload),
            headers: { 'stripe-signature': 'test_sig' }
        });

        await POST(req);

        expect(mockSendPaymentFailed).toHaveBeenCalledWith('customer@test.com');
        console.log('✅ PASS: Payment Failed email trigger verified.');
    });
});
