import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Header from './Header';

describe('Header Component', () => {
  it('should render the site title', () => {
    render(<Header />);
    const title = screen.getByText(/suburbmates/i);
    expect(title).toBeInTheDocument();
  });
});