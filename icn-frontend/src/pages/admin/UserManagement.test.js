import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import UserManagement from '../admin/UserManagement';
import * as serviceFactory from '../../services/serviceFactory';

jest.mock('../../services/serviceFactory');

describe('UserManagement', () => {
  const mockAdminService = {
    getUsers: jest.fn(),
    deactivateUser: jest.fn(),
    reactivateUser: jest.fn(),
  };

  const mockUsers = [
    {
      id: 1,
      name: 'John Smith',
      email: 'john@example.com',
      tier: 'free',
      status: 'active',
      joinDate: '2024-01-10',
      lastActive: '2024-12-15'
    },
    {
      id: 2,
      name: 'Sarah Johnson',
      email: 'sarah@company.com',
      tier: 'premium',
      status: 'active',
      joinDate: '2024-02-15',
      lastActive: '2024-12-14'
    },
    {
      id: 3,
      name: 'Mike Chen',
      email: 'mike@business.com',
      tier: 'plus',
      status: 'inactive',
      joinDate: '2024-03-20',
      lastActive: '2024-11-30'
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    serviceFactory.getAdminService.mockReturnValue(mockAdminService);
    mockAdminService.getUsers.mockResolvedValue({
      data: mockUsers
    });
  });

  const renderComponent = () => {
    return render(<UserManagement />);
  };

  test('renders user management page', async () => {
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText('User Management')).toBeInTheDocument();
    });
  });

  test('displays user statistics', async () => {
    renderComponent();
    
    await waitFor(() => {
      // Use more specific queries to avoid ambiguity
      const statCards = screen.getAllByRole('heading', { level: 3 });
      const totalUsers = statCards.find(card => 
        card.textContent === '3' && 
        card.closest('.stat-card')?.textContent.includes('Total Users')
      );
      expect(totalUsers).toBeInTheDocument();
      expect(screen.getByText('Total Users')).toBeInTheDocument();
      expect(screen.getByText('Premium Users')).toBeInTheDocument();
      expect(screen.getByText('Plus Users')).toBeInTheDocument();
      expect(screen.getByText('Free Users')).toBeInTheDocument();
    });
  });

  test('displays list of users', async () => {
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText('John Smith')).toBeInTheDocument();
      expect(screen.getByText('Sarah Johnson')).toBeInTheDocument();
      expect(screen.getByText('Mike Chen')).toBeInTheDocument();
    });
  });

  test('filters users by tier', async () => {
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText('John Smith')).toBeInTheDocument();
    });

    const tierFilter = screen.getByRole('combobox');
    fireEvent.change(tierFilter, { target: { value: 'premium' } });

    await waitFor(() => {
      expect(screen.getByText('Sarah Johnson')).toBeInTheDocument();
      expect(screen.queryByText('John Smith')).not.toBeInTheDocument();
      expect(screen.queryByText('Mike Chen')).not.toBeInTheDocument();
    });
  });

  test('shows correct tier badges', async () => {
    renderComponent();
    
    await waitFor(() => {
      const freeBadges = screen.getAllByText('free');
      const premiumBadges = screen.getAllByText('premium');
      const plusBadges = screen.getAllByText('plus');
      
      expect(freeBadges.length).toBeGreaterThan(0);
      expect(premiumBadges.length).toBeGreaterThan(0);
      expect(plusBadges.length).toBeGreaterThan(0);
    });
  });

  test('shows correct status badges', async () => {
    renderComponent();
    
    await waitFor(() => {
      const activeStatuses = screen.getAllByText('active');
      const inactiveStatuses = screen.getAllByText('inactive');
      
      expect(activeStatuses.length).toBe(2); // John and Sarah
      expect(inactiveStatuses.length).toBe(1); // Mike
    });
  });

  test('handles user deactivation', async () => {
    mockAdminService.deactivateUser.mockResolvedValue({ success: true });
    
    renderComponent();
    
    // Wait for initial load with all users active
    await waitFor(() => {
      expect(screen.getByText('John Smith')).toBeInTheDocument();
    });

    // Now set up the mock for the reload after deactivation
    mockAdminService.getUsers.mockResolvedValueOnce({
      data: mockUsers.map(u => 
        u.id === 1 ? { ...u, status: 'inactive' } : u
      )
    });

    const deactivateButtons = screen.getAllByText('Deactivate');
    fireEvent.click(deactivateButtons[0]);

    await waitFor(() => {
      expect(mockAdminService.deactivateUser).toHaveBeenCalledWith(1);
      expect(mockAdminService.getUsers).toHaveBeenCalledTimes(2); // Initial + reload
    });
  });

  test('handles user reactivation', async () => {
    mockAdminService.reactivateUser.mockResolvedValue({ success: true });
    
    renderComponent();
    
    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('Mike Chen')).toBeInTheDocument();
    });

    // Mike is inactive, so he should have an Activate button
    const activateButton = screen.getByText('Activate');
    
    // Set up mock for reload after reactivation
    mockAdminService.getUsers.mockResolvedValueOnce({
      data: mockUsers.map(u => 
        u.id === 3 ? { ...u, status: 'active' } : u
      )
    });
    
    fireEvent.click(activateButton);

    await waitFor(() => {
      expect(mockAdminService.reactivateUser).toHaveBeenCalledWith(3);
    });
  });

  test('displays user emails correctly', async () => {
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText('john@example.com')).toBeInTheDocument();
      expect(screen.getByText('sarah@company.com')).toBeInTheDocument();
      expect(screen.getByText('mike@business.com')).toBeInTheDocument();
    });
  });

  test('displays join dates', async () => {
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText('2024-01-10')).toBeInTheDocument();
      expect(screen.getByText('2024-02-15')).toBeInTheDocument();
      expect(screen.getByText('2024-03-20')).toBeInTheDocument();
    });
  });

  test('displays last active dates', async () => {
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText('2024-12-15')).toBeInTheDocument();
      expect(screen.getByText('2024-12-14')).toBeInTheDocument();
      expect(screen.getByText('2024-11-30')).toBeInTheDocument();
    });
  });

  test('calculates tier statistics correctly', async () => {
    renderComponent();
    
    await waitFor(() => {
      // Premium: 1 user (Sarah)
      const premiumCount = screen.getAllByText('1').find(
        el => el.closest('.stat-card')?.textContent.includes('Premium')
      );
      expect(premiumCount).toBeTruthy();
      
      // Plus: 1 user (Mike)
      // Free: 1 user (John)
    });
  });

  test('handles API errors gracefully', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    mockAdminService.getUsers.mockRejectedValue(
      new Error('Failed to fetch users')
    );
    
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText('User Management')).toBeInTheDocument();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error loading users:',
        expect.any(Error)
      );
    });
    
    consoleErrorSpy.mockRestore();
  });

  test('handles status toggle error', async () => {
    window.alert = jest.fn();
    mockAdminService.deactivateUser.mockRejectedValue(
      new Error('Update failed')
    );
    
    renderComponent();
    
    await waitFor(() => {
      const deactivateButtons = screen.getAllByText('Deactivate');
      fireEvent.click(deactivateButtons[0]);
    });

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith(
        expect.stringContaining('Failed to update user status')
      );
    });
  });

  test('filters users correctly when switching tiers', async () => {
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getAllByRole('row').length).toBeGreaterThan(1);
    });

    const tierFilter = screen.getByRole('combobox');
    
    // Filter by free
    fireEvent.change(tierFilter, { target: { value: 'free' } });
    await waitFor(() => {
      expect(screen.getByText('John Smith')).toBeInTheDocument();
      expect(screen.queryByText('Sarah Johnson')).not.toBeInTheDocument();
    });
    
    // Switch to all
    fireEvent.change(tierFilter, { target: { value: 'all' } });
    await waitFor(() => {
      expect(screen.getByText('John Smith')).toBeInTheDocument();
      expect(screen.getByText('Sarah Johnson')).toBeInTheDocument();
      expect(screen.getByText('Mike Chen')).toBeInTheDocument();
    });
  });
});