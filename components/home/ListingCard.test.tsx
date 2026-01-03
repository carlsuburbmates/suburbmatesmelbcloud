import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ListingCard } from './ListingCard';

describe('ListingCard Component', () => {
  it('should render the listing name', () => {
    const listing = { name: 'Test Listing' };
    render(<ListingCard listing={listing} />);
    const heading = screen.getByRole('heading', {
      name: /test listing/i,
    });
    expect(heading).toBeInTheDocument();
  });
});
