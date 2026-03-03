import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ContentBridge } from './ContentBridge';

// Mock chrome API
const mockSendMessage = vi.fn();
const mockQuery = vi.fn();

global.chrome = {
  tabs: {
    query: mockQuery,
    sendMessage: mockSendMessage,
  },
} as unknown as typeof chrome;

describe('ContentBridge', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should get selection from active tab', async () => {
    mockQuery.mockResolvedValue([{ id: 123 }]);
    mockSendMessage.mockResolvedValue({ text: 'selected text' });

    const result = await ContentBridge.getSelection();

    expect(mockQuery).toHaveBeenCalledWith({ active: true, currentWindow: true });
    expect(mockSendMessage).toHaveBeenCalledWith(123, { action: 'GET_SELECTION' });
    expect(result).toBe('selected text');
  });

  it('should replace selection in active tab', async () => {
    mockQuery.mockResolvedValue([{ id: 123 }]);
    mockSendMessage.mockResolvedValue({ success: true });

    const result = await ContentBridge.replaceSelection('new text');

    expect(mockSendMessage).toHaveBeenCalledWith(123, { action: 'REPLACE_SELECTION', text: 'new text' });
    expect(result).toBe(true);
  });

  it('should handle no active tab', async () => {
    mockQuery.mockResolvedValue([]);

    await expect(ContentBridge.getSelection()).rejects.toThrow('No active tab found');
  });

  it('should handle send message error', async () => {
    mockQuery.mockResolvedValue([{ id: 123 }]);
    mockSendMessage.mockRejectedValue(new Error('Connection failed'));

    await expect(ContentBridge.getSelection()).rejects.toThrow('Error: Connection failed');
  });
});
