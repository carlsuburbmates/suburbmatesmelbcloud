import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock server-only to prevent crash
vi.mock('server-only', () => { return {}; });

import { evictUser } from '@/app/actions/admin-users';

// Hoist mocks
const { mockSendEmail } = vi.hoisted(() => ({
    mockSendEmail: vi.fn()
}));

vi.mock('@/lib/email', () => ({
    sendEnforcementEvictionEmail: mockSendEmail,
    sendEnforcementSuspensionEmail: vi.fn()
}));

// Mock Supabase
vi.mock('@/utils/supabase/server', () => ({
    createClient: () => ({
        auth: { getUser: () => ({ data: { user: { id: 'operator-123' } } }) },
        from: () => ({
            select: () => ({ eq: () => ({ single: () => ({ data: { role: 'operator' } }) }) }),
            update: () => ({ eq: () => ({ error: null }) })
        })
    })
}));

vi.mock('@/utils/supabase/admin', () => ({
    createAdminClient: () => ({
        auth: {
            admin: {
                updateUserById: () => ({ error: null }),
                getUserById: () => ({ data: { user: { email: 'victim@test.com' } } })
            }
        }
    })
}));

vi.mock('@/lib/admin/audit', () => ({
    logAudit: vi.fn()
}));

vi.mock('next/cache', () => ({
    revalidatePath: vi.fn()
}));

describe('Eviction Logic Verification', () => {
    it('should trigger an eviction email when evicting a user', async () => {
        await evictUser('victim-123');
        expect(mockSendEmail).toHaveBeenCalledWith('victim@test.com');
        console.log('✅ PASS: Eviction email trigger verified.');
    });
});
