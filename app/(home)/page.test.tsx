import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Home from './page';
import * as listings from '@/lib/listings';

// Mock child components
vi.mock('@/components/home/Hero', () => ({
  Hero: () => <div>Hero Mock</div>,
}));
vi.mock('@/components/home/Directory', () => ({
  Directory: vi.fn(() => <div>Directory Mock</div>),
}));
vi.mock('@/components/home/Marketplace', () => ({
  Marketplace: () => <div>Marketplace Mock</div>,
}));
vi.mock('@/components/home/InfoDock', () => ({
  InfoDock: () => <div>InfoDock Mock</div>,
}));

// Mock the listings library
vi.mock('@/lib/listings');

describe('Home Page', () => {
  it('should fetch listings and pass them to the Directory component', async () => {
    // Given
    const mockListings = [
      { id: '1', name: 'Test Studio 1', slug: 'test-studio-1' },
      { id: '2', name: 'Test Studio 2', slug: 'test-studio-2' },
    ];
    vi.mocked(listings.getListings).mockResolvedValue(mockListings as any);
    const { Directory } = await import('@/components/home/Directory');

    // When
    const Page = await Home();
    render(Page);

    // Then
    expect(listings.getListings).toHaveBeenCalledOnce();
    expect(Directory).toHaveBeenCalledWith({ listings: mockListings }, {});
  });
});