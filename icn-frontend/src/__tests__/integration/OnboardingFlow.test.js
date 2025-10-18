// src/__tests__/integration/OnboardingFlow.test.js
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import OnboardingModal from '../../components/onboarding/OnboardingModal';
import { mockUsers } from '../../utils/testUtils';

describe('Onboarding Flow', () => {
  const mockOnComplete = jest.fn();
  const mockOnSkip = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('completes full onboarding flow', async () => {
    const user = userEvent.setup();

    render(
      <OnboardingModal
        user={mockUsers.newUser}
        onComplete={mockOnComplete}
        onSkip={mockOnSkip}
      />
    );

    // Step 1: Select user type
    expect(screen.getByText(/How will you use ICN Navigator/i)).toBeInTheDocument();
    const buyerOption = screen.getByText(/Finding suppliers/i);
    await user.click(buyerOption);
    
    const nextButton = screen.getByRole('button', { name: /next/i });
    await user.click(nextButton);

    // Step 2: Select industries
    await waitFor(() => {
      expect(screen.getByText(/Which industries interest you/i)).toBeInTheDocument();
    });
    
    const techIndustry = screen.getByText('Technology');
    await user.click(techIndustry);
    await user.click(nextButton);

    // Step 3: Select company size
    await waitFor(() => {
      expect(screen.getByText(/Preferred company size/i)).toBeInTheDocument();
    });
    
    const anySize = screen.getByText(/Any size/i);
    await user.click(anySize);
    await user.click(nextButton);

    // Step 4: Set search radius
    await waitFor(() => {
      expect(screen.getByText(/How far should we search/i)).toBeInTheDocument();
    });
    
    const slider = screen.getByRole('slider');
    fireEvent.change(slider, { target: { value: 75 } });
    
    const getStartedButton = screen.getByRole('button', { name: /get started/i });
    await user.click(getStartedButton);

    // Verify completion
    await waitFor(() => {
      expect(mockOnComplete).toHaveBeenCalledWith(
        expect.objectContaining({
          userType: 'buyer',
          industries: expect.arrayContaining(['Technology']),
          searchRadius: expect.any(String),
        })
      );
    });
  });

  it('allows skipping onboarding', async () => {
    const user = userEvent.setup();

    render(
      <OnboardingModal
        user={mockUsers.newUser}
        onComplete={mockOnComplete}
        onSkip={mockOnSkip}
      />
    );

    const skipButton = screen.getByText(/skip for now/i);
    await user.click(skipButton);

    expect(mockOnSkip).toHaveBeenCalled();
  });

  it('allows going back to previous steps', async () => {
    const user = userEvent.setup();

    render(
      <OnboardingModal
        user={mockUsers.newUser}
        onComplete={mockOnComplete}
        onSkip={mockOnSkip}
      />
    );

    // Go to step 2
    const supplierOption = screen.getByText(/Listing my company/i);
    await user.click(supplierOption);
    
    const nextButton = screen.getByRole('button', { name: /next/i });
    await user.click(nextButton);

    await waitFor(() => {
      expect(screen.getByText(/Which industries/i)).toBeInTheDocument();
    });

    // Go back
    const backButton = screen.getByRole('button', { name: /back/i });
    await user.click(backButton);

    // Verify we're back at step 1
    await waitFor(() => {
      expect(screen.getByText(/How will you use/i)).toBeInTheDocument();
    });
  });
});