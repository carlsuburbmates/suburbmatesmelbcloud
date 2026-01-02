import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import BottomNavBar from './BottomNavBar';

describe('BottomNavBar Component', () => {
  it('should render the Home link', () => {
    render(<BottomNavBar />);
    const homeLink = screen.getByRole('link', { name: /home/i });
    expect(homeLink).toBeInTheDocument();
  });
});