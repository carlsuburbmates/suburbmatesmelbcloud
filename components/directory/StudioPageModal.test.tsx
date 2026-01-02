import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import StudioPageModal from './StudioPageModal';

describe('StudioPageModal Component', () => {
  it('should render the View Full Studio Page button', () => {
    const creator = {
      id: '1',
      title: 'Test Creator',
      desc: 'Test Description',
      img: 'https://via.placeholder.com/150',
      badge: 'Pro',
      loc: 'Test Location',
      cat: 'Test Category',
    };

    render(<StudioPageModal isOpen={true} onClose={() => {}} creator={creator} />);
    const button = screen.getByRole('button', { name: /view full studio page/i });
    expect(button).toBeInTheDocument();
  });
});