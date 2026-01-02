import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Hero from './Hero';

describe('Hero Component', () => {
  it('should render the main heading', () => {
    render(<Hero />);
    const heading = screen.getByRole('heading', {
      name: /local truth/i,
    });
    expect(heading).toBeInTheDocument();
  });
});