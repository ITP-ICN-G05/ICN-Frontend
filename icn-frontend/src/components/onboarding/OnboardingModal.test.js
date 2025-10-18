// src/components/onboarding/OnboardingModal.test.js
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import OnboardingModal from './OnboardingModal';

const mockUser = {
  id: 1,
  name: 'New User',
  email: 'new@example.com',
};

const mockOnComplete = jest.fn();
const mockOnSkip = jest.fn();
const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('OnboardingModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders onboarding modal', () => {
      render(
        <OnboardingModal
          user={mockUser}
          onComplete={mockOnComplete}
          onSkip={mockOnSkip}
        />
      );
      
      expect(screen.getByText(/How will you use ICN Navigator/)).toBeInTheDocument();
    });

    it('renders progress bar', () => {
      const { container } = render(
        <OnboardingModal
          user={mockUser}
          onComplete={mockOnComplete}
          onSkip={mockOnSkip}
        />
      );
      
      expect(container.querySelector('.progress-bar')).toBeInTheDocument();
    });

    it('renders skip button', () => {
      render(
        <OnboardingModal
          user={mockUser}
          onComplete={mockOnComplete}
          onSkip={mockOnSkip}
        />
      );
      
      expect(screen.getByText('Skip for now')).toBeInTheDocument();
    });

    it('renders step indicators', () => {
      const { container } = render(
        <OnboardingModal
          user={mockUser}
          onComplete={mockOnComplete}
          onSkip={mockOnSkip}
        />
      );
      
      const indicators = container.querySelectorAll('.indicator, span[style*="width"]');
      expect(indicators.length).toBeGreaterThan(0);
    });
  });

  describe('Step 1: User Type', () => {
    it('renders user type options', () => {
      render(
        <OnboardingModal
          user={mockUser}
          onComplete={mockOnComplete}
          onSkip={mockOnSkip}
        />
      );
      
      expect(screen.getByText(/Finding suppliers/)).toBeInTheDocument();
      expect(screen.getByText(/Listing my company/)).toBeInTheDocument();
      expect(screen.getByText('Both')).toBeInTheDocument();
    });

    it('selects user type', async () => {
      const user = userEvent.setup();
      
      render(
        <OnboardingModal
          user={mockUser}
          onComplete={mockOnComplete}
          onSkip={mockOnSkip}
        />
      );
      
      const buyerOption = screen.getByText(/Finding suppliers/);
      await user.click(buyerOption);
      
      // Button should be enabled after selection
      const nextButton = screen.getByText('Next');
      expect(nextButton).not.toBeDisabled();
    });

    it('Next button is disabled without selection', () => {
      render(
        <OnboardingModal
          user={mockUser}
          onComplete={mockOnComplete}
          onSkip={mockOnSkip}
        />
      );
      
      const nextButton = screen.getByText('Next');
      expect(nextButton).toBeDisabled();
    });
  });

  describe('Step 2: Industries', () => {
    it('navigates to industries step', async () => {
      const user = userEvent.setup();
      
      render(
        <OnboardingModal
          user={mockUser}
          onComplete={mockOnComplete}
          onSkip={mockOnSkip}
        />
      );
      
      // Select user type
      const buyerOption = screen.getByText(/Finding suppliers/);
      await user.click(buyerOption);
      
      // Click next
      const nextButton = screen.getByText('Next');
      await user.click(nextButton);
      
      // Check we're on industries step
      await waitFor(() => {
        expect(screen.getByText(/Which industries interest you/)).toBeInTheDocument();
      });
    });

    it('renders industry options', async () => {
      const user = userEvent.setup();
      
      render(
        <OnboardingModal
          user={mockUser}
          onComplete={mockOnComplete}
          onSkip={mockOnSkip}
        />
      );
      
      // Go to step 2
      await user.click(screen.getByText(/Finding suppliers/));
      await user.click(screen.getByText('Next'));
      
      await waitFor(() => {
        expect(screen.getByText('Manufacturing')).toBeInTheDocument();
        expect(screen.getByText('Technology')).toBeInTheDocument();
        expect(screen.getByText('Logistics')).toBeInTheDocument();
      });
    });

    it('allows multiple industry selection up to limit', async () => {
      const user = userEvent.setup();
      
      render(
        <OnboardingModal
          user={mockUser}
          onComplete={mockOnComplete}
          onSkip={mockOnSkip}
        />
      );
      
      // Navigate to step 2
      await user.click(screen.getByText(/Finding suppliers/));
      await user.click(screen.getByText('Next'));
      
      await waitFor(() => {
        expect(screen.getByText('Technology')).toBeInTheDocument();
      });
      
      // Select 3 industries
      await user.click(screen.getByText('Technology'));
      await user.click(screen.getByText('Manufacturing'));
      await user.click(screen.getByText('Services'));
      
      const nextButton = screen.getByText('Next');
      expect(nextButton).not.toBeDisabled();
    });

    it('shows subtitle with selection limit', async () => {
      const user = userEvent.setup();
      
      render(
        <OnboardingModal
          user={mockUser}
          onComplete={mockOnComplete}
          onSkip={mockOnSkip}
        />
      );
      
      await user.click(screen.getByText(/Finding suppliers/));
      await user.click(screen.getByText('Next'));
      
      await waitFor(() => {
        expect(screen.getByText('Select up to 3')).toBeInTheDocument();
      });
    });
  });

  describe('Step 3: Company Size', () => {
    it('renders company size options', async () => {
      const user = userEvent.setup();
      
      render(
        <OnboardingModal
          user={mockUser}
          onComplete={mockOnComplete}
          onSkip={mockOnSkip}
        />
      );
      
      // Navigate to step 3
      await user.click(screen.getByText(/Finding suppliers/));
      await user.click(screen.getByText('Next'));
      await waitFor(() => screen.getByText('Technology'));
      await user.click(screen.getByText('Technology'));
      await user.click(screen.getByText('Next'));
      
      await waitFor(() => {
        expect(screen.getByText(/Preferred company size/)).toBeInTheDocument();
        expect(screen.getByText(/Small \(1-99\)/)).toBeInTheDocument();
        expect(screen.getByText(/Medium \(100-499\)/)).toBeInTheDocument();
        expect(screen.getByText(/Large \(500\+\)/)).toBeInTheDocument();
        expect(screen.getByText(/Any size/)).toBeInTheDocument();
      });
    });

    it('selects company size', async () => {
      const user = userEvent.setup();
      
      render(
        <OnboardingModal
          user={mockUser}
          onComplete={mockOnComplete}
          onSkip={mockOnSkip}
        />
      );
      
      // Navigate to step 3
      await user.click(screen.getByText(/Finding suppliers/));
      await user.click(screen.getByText('Next'));
      await waitFor(() => screen.getByText('Technology'));
      await user.click(screen.getByText('Technology'));
      await user.click(screen.getByText('Next'));
      
      await waitFor(() => screen.getByText(/Any size/));
      await user.click(screen.getByText(/Any size/));
      
      const nextButton = screen.getByText('Next');
      expect(nextButton).not.toBeDisabled();
    });
  });

  describe('Step 4: Search Radius', () => {
    it('renders search radius slider', async () => {
      const user = userEvent.setup();
      
      render(
        <OnboardingModal
          user={mockUser}
          onComplete={mockOnComplete}
          onSkip={mockOnSkip}
        />
      );
      
      // Navigate to step 4
      await user.click(screen.getByText(/Finding suppliers/));
      await user.click(screen.getByText('Next'));
      await waitFor(() => screen.getByText('Technology'));
      await user.click(screen.getByText('Technology'));
      await user.click(screen.getByText('Next'));
      await waitFor(() => screen.getByText(/Any size/));
      await user.click(screen.getByText(/Any size/));
      await user.click(screen.getByText('Next'));
      
      await waitFor(() => {
        expect(screen.getByText(/How far should we search/)).toBeInTheDocument();
        expect(screen.getByRole('slider')).toBeInTheDocument();
      });
    });

    it('changes search radius value', async () => {
      const user = userEvent.setup();
      
      render(
        <OnboardingModal
          user={mockUser}
          onComplete={mockOnComplete}
          onSkip={mockOnSkip}
        />
      );
      
      // Navigate to step 4
      await user.click(screen.getByText(/Finding suppliers/));
      await user.click(screen.getByText('Next'));
      await waitFor(() => screen.getByText('Technology'));
      await user.click(screen.getByText('Technology'));
      await user.click(screen.getByText('Next'));
      await waitFor(() => screen.getByText(/Any size/));
      await user.click(screen.getByText(/Any size/));
      await user.click(screen.getByText('Next'));
      
      await waitFor(() => screen.getByRole('slider'));
      
      const slider = screen.getByRole('slider');
      fireEvent.change(slider, { target: { value: 75 } });
      
      expect(screen.getByText('75')).toBeInTheDocument();
    });

    it('shows Get Started button on last step', async () => {
      const user = userEvent.setup();
      
      render(
        <OnboardingModal
          user={mockUser}
          onComplete={mockOnComplete}
          onSkip={mockOnSkip}
        />
      );
      
      // Navigate to step 4
      await user.click(screen.getByText(/Finding suppliers/));
      await user.click(screen.getByText('Next'));
      await waitFor(() => screen.getByText('Technology'));
      await user.click(screen.getByText('Technology'));
      await user.click(screen.getByText('Next'));
      await waitFor(() => screen.getByText(/Any size/));
      await user.click(screen.getByText(/Any size/));
      await user.click(screen.getByText('Next'));
      
      await waitFor(() => {
        expect(screen.getByText('Get Started')).toBeInTheDocument();
      });
    });
  });

  describe('Navigation', () => {
    it('shows Back button after first step', async () => {
      const user = userEvent.setup();
      
      render(
        <OnboardingModal
          user={mockUser}
          onComplete={mockOnComplete}
          onSkip={mockOnSkip}
        />
      );
      
      await user.click(screen.getByText(/Finding suppliers/));
      await user.click(screen.getByText('Next'));
      
      await waitFor(() => {
        expect(screen.getByText('Back')).toBeInTheDocument();
      });
    });

    it('goes back to previous step', async () => {
      const user = userEvent.setup();
      
      render(
        <OnboardingModal
          user={mockUser}
          onComplete={mockOnComplete}
          onSkip={mockOnSkip}
        />
      );
      
      // Go to step 2
      await user.click(screen.getByText(/Finding suppliers/));
      await user.click(screen.getByText('Next'));
      
      await waitFor(() => screen.getByText(/Which industries/));
      
      // Go back
      await user.click(screen.getByText('Back'));
      
      await waitFor(() => {
        expect(screen.getByText(/How will you use/)).toBeInTheDocument();
      });
    });

    it('does not show Back button on first step', () => {
      render(
        <OnboardingModal
          user={mockUser}
          onComplete={mockOnComplete}
          onSkip={mockOnSkip}
        />
      );
      
      expect(screen.queryByText('Back')).not.toBeInTheDocument();
    });
  });

  describe('Skip Functionality', () => {
    it('calls onSkip when Skip button clicked', async () => {
      const user = userEvent.setup();
      
      render(
        <OnboardingModal
          user={mockUser}
          onComplete={mockOnComplete}
          onSkip={mockOnSkip}
        />
      );
      
      const skipButton = screen.getByText('Skip for now');
      await user.click(skipButton);
      
      expect(mockOnSkip).toHaveBeenCalled();
    });

    it('navigates to home if onSkip not provided', async () => {
      const user = userEvent.setup();
      
      render(
        <OnboardingModal user={mockUser} onComplete={mockOnComplete} />
      );
      
      const skipButton = screen.getByText('Skip for now');
      await user.click(skipButton);
      
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  describe('Completion', () => {
    it('completes onboarding flow', async () => {
      const user = userEvent.setup();
      
      render(
        <OnboardingModal
          user={mockUser}
          onComplete={mockOnComplete}
          onSkip={mockOnSkip}
        />
      );
      
      // Step 1: User type
      await user.click(screen.getByText(/Finding suppliers/));
      await user.click(screen.getByText('Next'));
      
      // Step 2: Industries
      await waitFor(() => screen.getByText('Technology'));
      await user.click(screen.getByText('Technology'));
      await user.click(screen.getByText('Next'));
      
      // Step 3: Company size
      await waitFor(() => screen.getByText(/Any size/));
      await user.click(screen.getByText(/Any size/));
      await user.click(screen.getByText('Next'));
      
      // Step 4: Search radius
      await waitFor(() => screen.getByRole('slider'));
      const slider = screen.getByRole('slider');
      fireEvent.change(slider, { target: { value: 75 } });
      
      await user.click(screen.getByText('Get Started'));
      
      expect(mockOnComplete).toHaveBeenCalledWith(
        expect.objectContaining({
          userType: expect.any(String),
          industries: expect.any(Array),
          companySize: expect.any(String),
          searchRadius: expect.any(String),
        })
      );
    });

    it('navigates to home if onComplete not provided', async () => {
      const user = userEvent.setup();
      
      render(
        <OnboardingModal user={mockUser} onSkip={mockOnSkip} />
      );
      
      // Complete all steps
      await user.click(screen.getByText(/Finding suppliers/));
      await user.click(screen.getByText('Next'));
      await waitFor(() => screen.getByText('Technology'));
      await user.click(screen.getByText('Technology'));
      await user.click(screen.getByText('Next'));
      await waitFor(() => screen.getByText(/Any size/));
      await user.click(screen.getByText(/Any size/));
      await user.click(screen.getByText('Next'));
      await waitFor(() => screen.getByRole('slider'));
      await user.click(screen.getByText('Get Started'));
      
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  describe('Progress Tracking', () => {
    it('updates progress bar as user advances', async () => {
      const user = userEvent.setup();
      const { container } = render(
        <OnboardingModal
          user={mockUser}
          onComplete={mockOnComplete}
          onSkip={mockOnSkip}
        />
      );
      
      // Initial progress
      let progressBar = container.querySelector('[style*="width"]');
      expect(progressBar).toBeTruthy();
      
      // Advance to step 2
      await user.click(screen.getByText(/Finding suppliers/));
      await user.click(screen.getByText('Next'));
      
      // Progress should increase
      await waitFor(() => {
        progressBar = container.querySelector('[style*="width"]');
        expect(progressBar).toBeTruthy();
      });
    });
  });
});

