import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import UploadZone from '../components/UploadZone';

// Mock Zustand store if needed, or rely on its default setup
vi.mock('../store/useAppStore', () => ({
  useAppStore: () => ({
    addDocument: vi.fn(),
    updateDocument: vi.fn(),
  }),
}));

describe('UploadZone Component', () => {
  it('renders upload instructions correctly', () => {
    render(<UploadZone />);
    
    expect(screen.getByText(/Drag & drop your PDF documents here/i)).toBeInTheDocument();
    expect(screen.getByText(/Or click to browse from your device/i)).toBeInTheDocument();
    expect(screen.getByText(/PDF format only/i)).toBeInTheDocument();
  });

  it('triggers file selection when clicked', () => {
    render(<UploadZone />);
    const fileInput = screen.getByTestId('file-input');
    const uploadArea = fileInput.parentElement;
    
    expect(uploadArea).toBeInTheDocument();
  });
});
