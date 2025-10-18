import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import TierAccessControl from './TierAccessControl';
import { useTierAccess } from '../../hooks/useTierAccess';

jest.mock('../../hooks/useTierAccess');

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const renderTierControl = (props = {}) => {
  return render(
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <TierAccessControl {...props} />
    </BrowserRouter>
  );
};

describe('TierAccessControl', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    useTierAccess.mockReturnValue({
      hasAccess: jest.fn(() => false),
      userTier: 'free',
    });
  });

  it('renders children when user has access', () => {
    useTierAccess.mockReturnValue({
      hasAccess: jest.fn(() => true),
      userTier: 'premium',
    });

    renderTierControl({
      feature: 'PREMIUM_FEATURE',
      children: <div>Premium Content</div>,
    });

    expect(screen.getByText('Premium Content')).toBeInTheDocument();
  });

  it('renders fallback when access denied and fallback provided', () => {
    renderTierControl({
      feature: 'PREMIUM_FEATURE',
      children: <div>Premium Content</div>,
      fallback: <div>Upgrade Required</div>,
    });

    expect(screen.queryByText('Premium Content')).not.toBeInTheDocument();
    expect(screen.getByText('Upgrade Required')).toBeInTheDocument();
  });

  it('shows upgrade prompt by default when access denied', () => {
    renderTierControl({
      feature: 'PREMIUM_FEATURE',
      children: <div>Premium Content</div>,
      showUpgradePrompt: true,
    });

    expect(screen.getByText(/This feature requires/)).toBeInTheDocument();
    expect(screen.getByText('Upgrade Now')).toBeInTheDocument();
  });

  it('masks content when maskContent is true', () => {
    renderTierControl({
      feature: 'PREMIUM_FEATURE',
      children: <div>Secret Data</div>,
      maskContent: true,
    });

    expect(screen.getByText('Upgrade to view')).toBeInTheDocument();
    expect(screen.getByText('••••••••')).toBeInTheDocument();
  });

  it('navigates to pricing when upgrade button clicked', () => {
    renderTierControl({
      feature: 'PREMIUM_FEATURE',
      children: <div>Content</div>,
      showUpgradePrompt: true,
    });

    const upgradeButton = screen.getByText('Upgrade Now');
    fireEvent.click(upgradeButton);

    expect(mockNavigate).toHaveBeenCalledWith('/pricing');
  });

  it('shows custom upgrade message', () => {
    renderTierControl({
      feature: 'PREMIUM_FEATURE',
      children: <div>Content</div>,
      upgradeMessage: 'Custom upgrade message',
    });

    expect(screen.getByText('Custom upgrade message')).toBeInTheDocument();
  });

  it('shows different message for plus users', () => {
    useTierAccess.mockReturnValue({
      hasAccess: jest.fn(() => false),
      userTier: 'plus',
    });

    renderTierControl({
      feature: 'PREMIUM_FEATURE',
      children: <div>Content</div>,
    });

    expect(screen.getByText(/Premium tier/)).toBeInTheDocument();
  });

  it('returns null when showUpgradePrompt is false and no fallback', () => {
    const { container } = renderTierControl({
      feature: 'PREMIUM_FEATURE',
      children: <div>Content</div>,
      showUpgradePrompt: false,
    });

    expect(container.firstChild).toBeNull();
  });

  it('renders lock icon in masked overlay', () => {
    renderTierControl({
      feature: 'PREMIUM_FEATURE',
      children: <div>Secret</div>,
      maskContent: true,
    });

    expect(screen.getByText('🔒')).toBeInTheDocument();
  });
});