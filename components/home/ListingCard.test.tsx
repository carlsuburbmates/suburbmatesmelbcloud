import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, afterEach } from 'vitest';
import { ListingCard } from './ListingCard';

describe('ListingCard Component', () => {
  afterEach(() => {
    cleanup();
  });

  const baseListing = {
    id: '1',
    name: 'Test Studio',
    category: { name: 'Design' },
    location: 'Melbourne',
    featured_until: null,
    is_verified: false,
  };

  it('should display a "Featured" badge if featured_until is set', () => {
    const featuredListing = { ...baseListing, featured_until: '2027-01-01' };
    render(<ListingCard listing={featuredListing} />);
    expect(screen.getByText('Featured')).toBeInTheDocument();
  });

  it('should display a "Verified" badge if is_verified is true', () => {
    const verifiedListing = { ...baseListing, is_verified: true };
    render(<ListingCard listing={verifiedListing} />);
    expect(screen.getByText('Verified')).toBeInTheDocument();
  });

  it('should not display badges if they are not applicable', () => {
    render(<ListingCard listing={baseListing} />);
    expect(screen.queryByText('Featured')).not.toBeInTheDocument();
    expect(screen.queryByText('Verified')).not.toBeInTheDocument();
  });
});
