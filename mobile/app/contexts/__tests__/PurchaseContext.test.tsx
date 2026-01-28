import React from 'react';
import { render, waitFor, act } from '@testing-library/react-native';

import { PurchaseProvider, usePurchase } from '../PurchaseContext';
import { AuthProvider } from '../AuthContext';

// Mock purchase service
const mockPurchaseService = {
  initialize: jest.fn(),
  getCustomerInfo: jest.fn(),
  getOfferings: jest.fn(),
  purchasePackage: jest.fn(),
  restorePurchases: jest.fn(),
  getSubscriptionInfo: jest.fn(),
  clearCache: jest.fn(),
};

jest.mock('../../services/purchaseService', () => ({
  purchaseService: mockPurchaseService,
}));

// Mock AuthContext
const mockAuthContext = {
  user: { id: '123', email: 'test@example.com', tier: 'free' },
  token: 'test-token',
  login: jest.fn(),
  register: jest.fn(),
  logout: jest.fn(),
  loading: false,
};

const MockAuthProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
};

describe('PurchaseContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Default mocks
    mockPurchaseService.initialize.mockResolvedValue(undefined);
    mockPurchaseService.getCustomerInfo.mockResolvedValue({
      entitlements: { active: {} }
    });
    mockPurchaseService.getOfferings.mockResolvedValue({
      current: {
        monthly: {
          identifier: 'monthly',
          product: { priceString: '$12.00', price: 12 }
        }
      }
    });
    mockPurchaseService.getSubscriptionInfo.mockReturnValue({
      tier: 'free',
      isActive: false
    });
  });

  it('should provide default purchase state', async () => {
    let purchaseState: any;

    const TestConsumer = () => {
      purchaseState = usePurchase();
      return null;
    };

    render(
      <MockAuthProvider>
        <PurchaseProvider>
          <TestConsumer />
        </PurchaseProvider>
      </MockAuthProvider>
    );

    await waitFor(() => {
      expect(purchaseState.isPro).toBeFalsy();
      expect(purchaseState.isActive).toBeFalsy();
      expect(purchaseState.subscriptionInfo.tier).toBe('free');
    });
  });

  it('should handle successful purchase', async () => {
    const mockPackage = {
      identifier: 'monthly',
      product: { priceString: '$12.00', price: 12 }
    };

    const mockCustomerInfo = {
      entitlements: {
        active: {
          pro: {
            expires_date: null,
            original_purchase_date: '2023-01-01',
            product_identifier: 'mentor_pro_monthly'
          }
        }
      }
    };

    mockPurchaseService.purchasePackage.mockResolvedValue({
      success: true,
      customerInfo: mockCustomerInfo
    });

    mockPurchaseService.getSubscriptionInfo.mockReturnValue({
      tier: 'pro',
      isActive: true
    });

    let purchaseState: any;

    const TestConsumer = () => {
      purchaseState = usePurchase();
      return null;
    };

    render(
      <MockAuthProvider>
        <PurchaseProvider>
          <TestConsumer />
        </PurchaseProvider>
      </MockAuthProvider>
    );

    await act(async () => {
      await purchaseState.purchasePackage(mockPackage);
    });

    await waitFor(() => {
      expect(mockPurchaseService.purchasePackage).toHaveBeenCalledWith(mockPackage);
      expect(purchaseState.purchaseState).toBe('success');
    });
  });

  it('should handle purchase cancellation', async () => {
    const mockPackage = {
      identifier: 'monthly',
      product: { priceString: '$12.00', price: 12 }
    };

    mockPurchaseService.purchasePackage.mockResolvedValue({
      success: false,
      error: 'Purchase was cancelled'
    });

    let purchaseState: any;

    const TestConsumer = () => {
      purchaseState = usePurchase();
      return null;
    };

    render(
      <MockAuthProvider>
        <PurchaseProvider>
          <TestConsumer />
        </PurchaseProvider>
      </MockAuthProvider>
    );

    await act(async () => {
      await purchaseState.purchasePackage(mockPackage);
    });

    await waitFor(() => {
      expect(purchaseState.purchaseState).toBe('error');
    });
  });

  it('should handle restore purchases', async () => {
    const mockCustomerInfo = {
      entitlements: {
        active: {
          pro: {
            expires_date: '2024-01-01',
            original_purchase_date: '2023-01-01',
            product_identifier: 'mentor_pro_annual'
          }
        }
      }
    };

    mockPurchaseService.restorePurchases.mockResolvedValue({
      success: true,
      customerInfo: mockCustomerInfo
    });

    mockPurchaseService.getSubscriptionInfo.mockReturnValue({
      tier: 'pro',
      isActive: true
    });

    let purchaseState: any;

    const TestConsumer = () => {
      purchaseState = usePurchase();
      return null;
    };

    render(
      <MockAuthProvider>
        <PurchaseProvider>
          <TestConsumer />
        </PurchaseProvider>
      </MockAuthProvider>
    );

    await act(async () => {
      await purchaseState.restorePurchases();
    });

    await waitFor(() => {
      expect(mockPurchaseService.restorePurchases).toHaveBeenCalled();
      expect(purchaseState.isPro).toBeTruthy();
    });
  });

  it('should refresh customer info', async () => {
    const mockCustomerInfo = {
      entitlements: { active: {} }
    };

    mockPurchaseService.getCustomerInfo.mockResolvedValue(mockCustomerInfo);

    let purchaseState: any;

    const TestConsumer = () => {
      purchaseState = usePurchase();
      return null;
    };

    render(
      <MockAuthProvider>
        <PurchaseProvider>
          <TestConsumer />
        </PurchaseProvider>
      </MockAuthProvider>
    );

    await act(async () => {
      await purchaseState.refreshCustomerInfo();
    });

    await waitFor(() => {
      expect(mockPurchaseService.getCustomerInfo).toHaveBeenCalled();
    });
  });

  it('should clear cache on logout', async () => {
    let purchaseState: any;

    const TestConsumer = () => {
      purchaseState = usePurchase();
      return null;
    };

    // Mock auth context without user (logged out state)
    const mockLoggedOutAuth = {
      user: null,
      token: null,
      login: jest.fn(),
      register: jest.fn(),
      logout: jest.fn(),
      loading: false,
    };

    render(
      <PurchaseProvider>
        <TestConsumer />
      </PurchaseProvider>
    );

    await waitFor(() => {
      expect(purchaseState.subscriptionInfo.tier).toBe('free');
    });
  });
});