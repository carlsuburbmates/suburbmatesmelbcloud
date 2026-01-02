import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Directory from './Directory';

describe('Directory Component', () => {
  it('should render the Directory heading', () => {
    render(<Directory />);
    const heading = screen.getByRole('heading', {
      name: /directory/i,
    });
    expect(heading).toBeInTheDocument();
  });
});