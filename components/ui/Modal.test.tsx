import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Modal from './Modal';

describe('Modal Component', () => {
  it('should render its children and title', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} title="Test Modal">
        <div>Modal Content</div>
      </Modal>
    );
    const content = screen.getByText(/modal content/i);
    const title = screen.getByRole('heading', { name: /test modal/i });
    
    expect(content).toBeInTheDocument();
    expect(title).toBeInTheDocument();
  });

  it('should not render when isOpen is false', () => {
    const { container } = render(
      <Modal isOpen={false} onClose={() => {}} title="Test Modal">
        <div>Modal Content</div>
      </Modal>
    );
    expect(container.firstChild).toBeNull();
  });
});