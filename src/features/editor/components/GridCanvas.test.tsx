import { render, screen } from '@testing-library/react';
import { GridCanvas } from './GridCanvas';
import { useInvoiceStore } from '@/store/useInvoiceStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Mock } from 'vitest';

// Mock dependencies
vi.mock('@/store/useInvoiceStore');
vi.mock('@/store/useSettingsStore');
vi.mock('@/features/editor/hooks/useGridLayout', () => ({
  useGridLayout: () => ({
    pages: [[
       { item: { id: 'item1', width: 4, height: 3 }, x: 0, y: 0, w: 4, h: 3 }
    ]],
    totalPages: 1
  })
}));
vi.mock('@/features/editor/hooks/useAutoResize', () => ({
  useAutoResize: vi.fn()
}));
vi.mock('@/features/editor/components/FileItem', () => ({
  FileItem: () => <div data-testid="file-item">File Item</div>
}));
vi.mock('@/features/voucher/components/Voucher', () => ({
  Voucher: () => <div data-testid="voucher">Voucher</div>
}));

describe('GridCanvas', () => {
  beforeEach(() => {
    (useInvoiceStore as unknown as Mock).mockReturnValue({
      items: [
        { id: 'item1', width: 4, height: 3, workspaceId: 'payment' }
      ],
      selectItem: vi.fn(),
      selectedId: null,
      isVoucherVisible: true
    });
    
    (useSettingsStore as unknown as Mock).mockReturnValue({
      settings: {
        appMode: 'payment',
        invoiceLayout: 'cross'
      }
    });
  });

  it('renders without crashing', () => {
    render(<GridCanvas />);
    expect(screen.getByText('Page 1')).toBeInTheDocument();
  });
  
  it('renders items when they match appMode', () => {
    // Configured in beforeEach to match 'payment'
    render(<GridCanvas />);
    // Since useGridLayout is mocked to return 1 item, it should render 1 FileItem
    expect(screen.getAllByTestId('file-item')).toHaveLength(1);
  });
});
