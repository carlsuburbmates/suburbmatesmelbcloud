import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import StudioPageModal from './StudioPageModal';
import { Database } from '@/types/supabase';

type Listing = Database['public']['Tables']['listings']['Row'];

describe('StudioPageModal Component', () => {
  it('should render the View Full Studio Page button', () => {
    const creator: Listing = {
      id: '1',
      name: 'Test Creator',
      description: 'Test Description',
      location: 'Test Location',
      category_id: 1,
      is_verified: true,
      tier: 'Pro',
      status: 'claimed',
      featured_until: null,
      created_at: '',
      updated_at: '',
      owner_id: 'user_1'
    };

    render(<StudioPageModal isOpen={true} onClose={() => {}} creator={creator} />);
    const button = screen.getByRole('button', { name: /view full studio page/i });
    expect(button).toBeInTheDocument();
  });
});
