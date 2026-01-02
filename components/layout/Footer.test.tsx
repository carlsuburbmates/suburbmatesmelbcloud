import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Footer from './Footer';

describe('Footer Component', () => {
  it('should render the copyright notice', () => {
    render(<Footer />);
    const copyright = screen.getByText(/© 2026 Melb/i);
    expect(copyright).toBeInTheDocument();
  });
});