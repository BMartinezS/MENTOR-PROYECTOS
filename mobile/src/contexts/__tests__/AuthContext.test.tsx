import React from 'react';
import { render, waitFor, act } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { AuthProvider, useAuth } from '../AuthContext';

// Mock API
const mockApi = {
  auth: {
    profile: jest.fn(),
    login: jest.fn(),
    register: jest.fn(),
  },
};

jest.mock('../../services/api', () => ({
  api: mockApi,
}));

jest.mock('../../services/apiClient', () => ({
  setAuthToken: jest.fn(),
  clearAuthToken: jest.fn(),
}));

// Test component to use the hook
const TestComponent = () => {
  const auth = useAuth();
  return null;
};

describe('AuthContext', () => {
  beforeEach(() => {
    AsyncStorage.clear();
    jest.clearAllMocks();
  });

  it('should provide default auth state', async () => {
    let authState: any;

    const TestConsumer = () => {
      authState = useAuth();
      return null;
    };

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(authState.user).toBeNull();
      expect(authState.token).toBeNull();
      expect(authState.loading).toBeFalsy();
    });
  });

  it('should restore user session from storage', async () => {
    const mockUser = {
      id: '123',
      email: 'test@example.com',
      name: 'Test User',
      tier: 'free' as const,
    };

    const mockToken = 'test-jwt-token';

    // Mock stored token
    AsyncStorage.setItem('auth.token', mockToken);
    mockApi.auth.profile.mockResolvedValue(mockUser);

    let authState: any;

    const TestConsumer = () => {
      authState = useAuth();
      return null;
    };

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(authState.user).toEqual(mockUser);
      expect(authState.token).toBe(mockToken);
      expect(authState.loading).toBeFalsy();
    });
  });

  it('should handle login successfully', async () => {
    const mockUser = {
      id: '123',
      email: 'test@example.com',
      name: 'Test User',
      tier: 'free' as const,
    };

    const mockToken = 'new-jwt-token';

    mockApi.auth.login.mockResolvedValue({
      user: mockUser,
      token: mockToken,
    });

    let authState: any;

    const TestConsumer = () => {
      authState = useAuth();
      return null;
    };

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await act(async () => {
      await authState.login('test@example.com', 'password');
    });

    await waitFor(() => {
      expect(authState.user).toEqual(mockUser);
      expect(authState.token).toBe(mockToken);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('auth.token', mockToken);
    });
  });

  it('should handle register successfully', async () => {
    const mockUser = {
      id: '123',
      email: 'test@example.com',
      name: 'Test User',
      tier: 'free' as const,
    };

    const mockToken = 'new-jwt-token';

    mockApi.auth.register.mockResolvedValue({
      user: mockUser,
      token: mockToken,
    });

    let authState: any;

    const TestConsumer = () => {
      authState = useAuth();
      return null;
    };

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await act(async () => {
      await authState.register('test@example.com', 'password', 'Test User');
    });

    await waitFor(() => {
      expect(authState.user).toEqual(mockUser);
      expect(authState.token).toBe(mockToken);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('auth.token', mockToken);
    });
  });

  it('should handle logout', async () => {
    // First set up logged in state
    const mockUser = {
      id: '123',
      email: 'test@example.com',
      name: 'Test User',
      tier: 'free' as const,
    };

    const mockToken = 'test-jwt-token';

    let authState: any;

    const TestConsumer = () => {
      authState = useAuth();
      return null;
    };

    const { rerender } = render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    // Simulate logged in state
    act(() => {
      authState.user = mockUser;
      authState.token = mockToken;
    });

    // Now logout
    await act(async () => {
      await authState.logout();
    });

    await waitFor(() => {
      expect(authState.user).toBeNull();
      expect(authState.token).toBeNull();
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('auth.token');
    });
  });

  it('should handle invalid stored token', async () => {
    const mockToken = 'invalid-token';

    // Mock stored token but API call fails
    AsyncStorage.setItem('auth.token', mockToken);
    mockApi.auth.profile.mockRejectedValue(new Error('Invalid token'));

    let authState: any;

    const TestConsumer = () => {
      authState = useAuth();
      return null;
    };

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(authState.user).toBeNull();
      expect(authState.token).toBeNull();
      expect(authState.loading).toBeFalsy();
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('auth.token');
    });
  });
});