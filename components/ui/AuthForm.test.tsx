import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import AuthForm from './AuthForm';
import * as auth from '@/lib/auth';

vi.mock('@/lib/auth', () => ({
  signInWithMagicLink: vi.fn(),
}));

describe('AuthForm Component', () => {
  it('should call signInWithMagicLink when submitted', async () => {
    const mockSignIn = vi.spyOn(auth, 'signInWithMagicLink');
    mockSignIn.mockResolvedValue({ data: {}, error: null } as any);

    render(<AuthForm />);

    const input = screen.getByPlaceholderText(/your email/i);
    const button = screen.getByRole('button', { name: /send magic link/i });

    fireEvent.change(input, { target: { value: 'test@example.com' } });
    fireEvent.click(button);

    expect(mockSignIn).toHaveBeenCalledWith('test@example.com', undefined);
  });
});
