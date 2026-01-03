import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import Directory from './Directory';

// Mock the ListingCard component
vi.mock('./ListingCard', () => ({
  ListingCard: vi.fn(({ listing }) => <div data-testid="listing-card">{listing.name}</div>),
}));

describe('Directory Component', () => {
  afterEach(() => {
    cleanup();
  });

  it('should render the Directory heading', () => {
    render(<Directory listings={[]} />);
    const heading = screen.getByRole('heading', {
      name: /directory/i,
    });
    expect(heading).toBeInTheDocument();
  });

  it('should render a list of ListingCards', async () => {
    // Given
    const mockListings = [
      { id: '1', name: 'Test Studio 1', slug: 'test-studio-1' },
      { id: '2', name: 'Test Studio 2', slug: 'test-studio-2' },
    ];
    const { ListingCard } = await import('./ListingCard');

    // When
    render(<Directory listings={mockListings} />);

    // Then
    const listingCards = screen.getAllByTestId('listing-card');
    expect(listingCards).toHaveLength(2);
    expect(ListingCard).toHaveBeenCalledTimes(2);
    expect(ListingCard.mock.calls[0][0]).toEqual({ listing: mockListings[0] });
    expect(ListingCard.mock.calls[1][0]).toEqual({ listing: mockListings[1] });
  });

  it('should render a message when no listings are available', () => {
    // When
    render(<Directory listings={[]} />);

    // Then
    const message = screen.getByText('No listings found.');
    expect(message).toBeInTheDocument();
  });
});