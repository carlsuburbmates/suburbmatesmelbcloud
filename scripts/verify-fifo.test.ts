import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock server-only
vi.mock('server-only', () => { return {}; });

import { POST } from '@/app/api/stripe/webhook/route';
import { NextRequest } from 'next/server';

// Hoisted mocks
const { mockSendFeaturedActive, mockSendFeaturedQueued, mockInsert } = vi.hoisted(() => ({
    mockSendFeaturedActive: vi.fn(),
    mockSendFeaturedQueued: vi.fn(),
    mockInsert: vi.fn(() => ({ error: null }))
}));

// Mock Email with explicit hoist
vi.mock('@/lib/email', async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...actual as any,
        sendFeaturedActiveEmail: mockSendFeaturedActive,
        sendFeaturedQueuedEmail: mockSendFeaturedQueued,
        sendProActivatedEmail: vi.fn(),
        sendPaymentFailedEmail: vi.fn(),
        sendProExpiryUpcomingEmail: vi.fn(),
        sendProExpiredEmail: vi.fn()
    };
});

// Mock Stripe
vi.mock('@/lib/stripe', () => ({
    stripe: {
        webhooks: {
            constructEvent: (body: any) => JSON.parse(body)
        }
    }
}));

// Mock Supabase
const mockSingleListing = vi.fn();
const mockSelectQueue = vi.fn();

vi.mock('@/utils/supabase/admin', () => {
    // We need stateful mocks to handle "full" vs "empty" scenarios
    let queueCount = 0;

    return {
        _setQueueCount: (c: number) => { queueCount = c; },
        createAdminClient: () => ({
            from: (table: string) => {
                if (table === 'listings') {
                    return {
                        select: () => ({
                            eq: () => ({
                                single: () => Promise.resolve({ data: { id: 'listing-123', name: 'Cool Cafe', location: 'Stonnington' } })
                            })
                        })
                    };
                }
                if (table === 'featured_queue') {
                    return {
                        select: (fields: any, opts: any) => {
                            // If counting
                            if (opts?.count === 'exact') {
                                return {
                                    eq: () => ({
                                        eq: () => Promise.resolve({ count: queueCount })
                                    })
                                }
                            }
                            // If finding earliest expiry
                            return {
                                eq: () => ({
                                    eq: () => ({
                                        order: () => ({
                                            limit: () => ({
                                                single: () => Promise.resolve({ data: { ends_at: '2026-02-01T00:00:00Z' } })
                                            })
                                        })
                                    })
                                })
                            }
                        },
                        insert: mockInsert
                    };
                }
                // Default fallbacks
                return { select: () => ({ eq: () => ({ single: () => ({}) }) }), update: () => ({ eq: () => ({}) }) };
            },
            auth: {
                admin: {
                    getUserById: () => ({ data: { user: { email: 'creator@test.com' } } })
                }
            }
        })
    };
});

// Helper to access the hidden setter
import * as supabaseMock from '@/utils/supabase/admin';

describe('FIFO Queue Logic', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // @ts-ignore
        if (supabaseMock._setQueueCount) supabaseMock._setQueueCount(0);
    });

    it('should insert as ACTIVE if queue < 5', async () => {
        // @ts-ignore
        supabaseMock._setQueueCount(2);

        const event = {
            type: 'checkout.session.completed',
            data: {
                object: {
                    mode: 'payment',
                    metadata: { supabase_user_id: 'user-123', purchase_type: 'featured_placement' },
                    customer: 'cus_123'
                }
            }
        };

        const req = new NextRequest('http://localhost:3000/api/stripe/webhook', {
            method: 'POST',
            body: JSON.stringify(event),
            headers: { 'stripe-signature': 'test-sig' }
        });

        await POST(req);

        // Verify Insert
        expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({
            status: 'active',
            location: 'Stonnington'
        }));

        // Verify Email
        expect(mockSendFeaturedActive).toHaveBeenCalled();
        expect(mockSendFeaturedQueued).not.toHaveBeenCalled();
    });

    it('should insert as PENDING if queue >= 5', async () => {
        // @ts-ignore
        supabaseMock._setQueueCount(5);

        const event = {
            type: 'checkout.session.completed',
            data: {
                object: {
                    mode: 'payment',
                    metadata: { supabase_user_id: 'user-123', purchase_type: 'featured_placement' },
                    customer: 'cus_123'
                }
            }
        };

        const req = new NextRequest('http://localhost:3000/api/stripe/webhook', {
            method: 'POST',
            body: JSON.stringify(event),
            headers: { 'stripe-signature': 'test-sig' }
        });

        await POST(req);

        // Verify Insert
        expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({
            status: 'pending',
            location: 'Stonnington'
        }));

        // Verify Email
        expect(mockSendFeaturedQueued).toHaveBeenCalled();
        expect(mockSendFeaturedActive).not.toHaveBeenCalled();
    });
});
