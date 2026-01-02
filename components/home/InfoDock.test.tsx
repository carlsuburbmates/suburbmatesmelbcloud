import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import InfoDock from './InfoDock';

describe('InfoDock Component', () => {
  it('should render the Protocol button', () => {
    render(<InfoDock />);
    const protocolButton = screen.getByText(/protocol/i);
    expect(protocolButton).toBeInTheDocument();
  });
});