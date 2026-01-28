import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { PaperProvider } from 'react-native-paper';

import ProUpgradePrompt from '../ProUpgradePrompt';
import { PAPER_THEME } from '../../../constants/theme';

// Mock router
const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock purchase context
const mockUsePurchase = jest.fn();
jest.mock('../../contexts/PurchaseContext', () => ({
  usePurchase: () => mockUsePurchase(),
}));

// Wrapper component
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <PaperProvider theme={PAPER_THEME}>
    {children}
  </PaperProvider>
);

describe('ProUpgradePrompt', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should not render when user is Pro', () => {
    mockUsePurchase.mockReturnValue({
      isPro: true,
    });

    const { queryByText } = render(
      <TestWrapper>
        <ProUpgradePrompt
          feature="Test Feature"
          description="Test description"
        />
      </TestWrapper>
    );

    expect(queryByText('Test Feature')).toBeNull();
  });

  it('should render full prompt for free users', () => {
    mockUsePurchase.mockReturnValue({
      isPro: false,
    });

    const { getByText } = render(
      <TestWrapper>
        <ProUpgradePrompt
          feature="Advanced Analytics"
          description="Track your progress with detailed charts"
          benefit="Unlock powerful insights and more"
        />
      </TestWrapper>
    );

    expect(getByText('Advanced Analytics')).toBeTruthy();
    expect(getByText('Track your progress with detailed charts')).toBeTruthy();
    expect(getByText('Unlock powerful insights and more')).toBeTruthy();
    expect(getByText('Upgrade a Pro')).toBeTruthy();
  });

  it('should render compact version', () => {
    mockUsePurchase.mockReturnValue({
      isPro: false,
    });

    const { getByText } = render(
      <TestWrapper>
        <ProUpgradePrompt
          feature="Edit Tasks"
          compact
        />
      </TestWrapper>
    );

    expect(getByText('Edit Tasks requiere Pro')).toBeTruthy();
    expect(getByText('Upgrade')).toBeTruthy();
  });

  it('should navigate to paywall when upgrade button is pressed', () => {
    mockUsePurchase.mockReturnValue({
      isPro: false,
    });

    const { getByText } = render(
      <TestWrapper>
        <ProUpgradePrompt
          feature="Test Feature"
        />
      </TestWrapper>
    );

    const upgradeButton = getByText('Upgrade a Pro');
    fireEvent.press(upgradeButton);

    expect(mockPush).toHaveBeenCalledWith('/paywall');
  });

  it('should call custom onUpgrade when provided', () => {
    mockUsePurchase.mockReturnValue({
      isPro: false,
    });

    const mockOnUpgrade = jest.fn();

    const { getByText } = render(
      <TestWrapper>
        <ProUpgradePrompt
          feature="Test Feature"
          onUpgrade={mockOnUpgrade}
        />
      </TestWrapper>
    );

    const upgradeButton = getByText('Upgrade a Pro');
    fireEvent.press(upgradeButton);

    expect(mockOnUpgrade).toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('should handle compact version tap', () => {
    mockUsePurchase.mockReturnValue({
      isPro: false,
    });

    const { getByText } = render(
      <TestWrapper>
        <ProUpgradePrompt
          feature="Test Feature"
          compact
        />
      </TestWrapper>
    );

    const upgradeLink = getByText('Upgrade');
    fireEvent.press(upgradeLink);

    expect(mockPush).toHaveBeenCalledWith('/paywall');
  });

  it('should display default benefit when none provided', () => {
    mockUsePurchase.mockReturnValue({
      isPro: false,
    });

    const { getByText } = render(
      <TestWrapper>
        <ProUpgradePrompt
          feature="Test Feature"
        />
      </TestWrapper>
    );

    expect(getByText('Desbloquea esta función y muchas más con Pro')).toBeTruthy();
  });

  it('should display feature bullets', () => {
    mockUsePurchase.mockReturnValue({
      isPro: false,
    });

    const { getByText } = render(
      <TestWrapper>
        <ProUpgradePrompt
          feature="Test Feature"
        />
      </TestWrapper>
    );

    expect(getByText('Proyectos ilimitados')).toBeTruthy();
    expect(getByText('Check-ins sin límites')).toBeTruthy();
    expect(getByText('Edición avanzada')).toBeTruthy();
    expect(getByText('Analytics de progreso')).toBeTruthy();
  });

  it('should display pricing info', () => {
    mockUsePurchase.mockReturnValue({
      isPro: false,
    });

    const { getByText } = render(
      <TestWrapper>
        <ProUpgradePrompt
          feature="Test Feature"
        />
      </TestWrapper>
    );

    expect(getByText('Desde $12/mes • Cancela cuando quieras')).toBeTruthy();
  });
});