/**
 * Basic setup test to verify Jest configuration is working
 */
describe('Test Setup', () => {
  it('should pass basic test', () => {
    expect(1 + 1).toBe(2);
  });

  it('should handle async operations', async () => {
    const asyncOperation = () => Promise.resolve('success');
    const result = await asyncOperation();
    expect(result).toBe('success');
  });

  it('should mock functions', () => {
    const mockFn = jest.fn();
    mockFn('test');
    expect(mockFn).toHaveBeenCalledWith('test');
  });
});