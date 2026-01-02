import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Marketplace from './Marketplace';

describe('Marketplace Component', () => {
  it('should render the Marketplace heading', () => {
    render(<Marketplace />);
    const heading = screen.getByRole('heading', {
      name: /marketplace/i,
    });
    expect(heading).toBeInTheDocument();
  });
});