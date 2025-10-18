class MockAdminService {
  async getDashboardMetrics() {
    await this.delay(600);
    
    return {
      data: {
        totalUsers: 1234,
        activeUsers: 892,
        totalCompanies: 5678,
        verifiedCompanies: 3456,
        totalSearches: 98765,
        searchesToday: 234,
        revenue: {
          monthly: 15678,
          yearly: 188136
        },
        growth: {
          users: 12.5,
          companies: 8.3,
          revenue: 15.2
        },
        usersByTier: {
          free: 856,
          plus: 267,
          premium: 111
        },
        recentActivity: [
          {
            id: 1,
            type: 'user_signup',
            description: 'New user registered: jane@example.com',
            timestamp: new Date(Date.now() - 3600000).toISOString()
          },
          {
            id: 2,
            type: 'company_verified',
            description: 'Company verified: TechCorp Industries',
            timestamp: new Date(Date.now() - 7200000).toISOString()
          },
          {
            id: 3,
            type: 'subscription_upgrade',
            description: 'User upgraded to Premium: john@company.com',
            timestamp: new Date(Date.now() - 10800000).toISOString()
          }
        ]
      }
    };
  }
  
  async getAllCompanies(params = {}) {
    await this.delay(700);
    
    const { mockCompanyService } = await import('./mockCompanyService');
    const result = await mockCompanyService.getAll(params);
    return result;
  }
  
  async getUsers(params = {}) {
    await this.delay(600);
    
    const { mockAuthService } = await import('./mockAuthService');
    
    // Return mock users (excluding passwords)
    const users = mockAuthService.MOCK_USERS.map(u => {
      const user = { ...u };
      delete user.password;
      return user;
    });
    
    // Apply filters if provided
    let filteredUsers = users;
    
    if (params.tier) {
      filteredUsers = filteredUsers.filter(u => u.tier === params.tier);
    }
    
    if (params.role) {
      filteredUsers = filteredUsers.filter(u => u.role === params.role);
    }
    
    if (params.search) {
      const searchLower = params.search.toLowerCase();
      filteredUsers = filteredUsers.filter(u => 
        u.name.toLowerCase().includes(searchLower) ||
        u.email.toLowerCase().includes(searchLower) ||
        u.company.toLowerCase().includes(searchLower)
      );
    }
    
    return {
      data: filteredUsers,
      total: filteredUsers.length,
      page: params.page || 1,
      limit: params.limit || 50
    };
  }
  
  async getAllUsers(params = {}) {
    // Alias for getUsers to maintain compatibility
    return this.getUsers(params);
  }
  
  async updateUser(id, data) {
    await this.delay(500);
    
    const { mockAuthService } = await import('./mockAuthService');
    
    const userIndex = mockAuthService.MOCK_USERS.findIndex(u => u.id === id);
    if (userIndex === -1) {
      throw new Error('User not found');
    }
    
    mockAuthService.MOCK_USERS[userIndex] = { 
      ...mockAuthService.MOCK_USERS[userIndex], 
      ...data 
    };
    
    const updatedUser = { ...mockAuthService.MOCK_USERS[userIndex] };
    delete updatedUser.password;
    
    return { data: updatedUser };
  }
  
  async updateUserTier(userId, newTier) {
    await this.delay(500);
    
    return this.updateUser(userId, { tier: newTier });
  }
  
  async deactivateUser(id) {
    await this.delay(400);
    
    return this.updateUser(id, { status: 'inactive' });
  }
  
  async reactivateUser(id) {
    await this.delay(400);
    
    return this.updateUser(id, { status: 'active' });
  }
  
  async getCompanyVerificationQueue() {
    await this.delay(500);
    
    // Mock pending companies for verification
    const pendingCompanies = [
      {
        id: 'pending_1',
        name: 'New Tech Solutions',
        type: 'Technology Company',
        address: '456 Innovation St, Melbourne VIC 3000',
        status: 'pending',
        submittedAt: new Date(Date.now() - 86400000).toISOString(),
        submittedBy: 'user@newtech.com.au'
      },
      {
        id: 'pending_2',
        name: 'Green Energy Co',
        type: 'Energy Provider',
        address: '789 Sustainable Ave, Sydney NSW 2000',
        status: 'pending',
        submittedAt: new Date(Date.now() - 172800000).toISOString(),
        submittedBy: 'admin@greenenergy.com.au'
      }
    ];
    
    return { data: pendingCompanies };
  }
  
  async approveCompany(companyId) {
    await this.delay(600);
    
    console.log('Approving company:', companyId);
    return { 
      data: { 
        success: true, 
        message: 'Company approved successfully',
        companyId 
      } 
    };
  }
  
  async rejectCompany(companyId, reason) {
    await this.delay(600);
    
    console.log('Rejecting company:', companyId, 'Reason:', reason);
    return { 
      data: { 
        success: true, 
        message: 'Company rejected',
        companyId,
        reason 
      } 
    };
  }
  
  async getActivityLogs(params = {}) {
    await this.delay(400);
    
    const logs = [
      {
        id: 1,
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        userId: '2',
        action: 'LOGIN',
        description: 'User logged in',
        ip: '192.168.1.100'
      },
      {
        id: 2,
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        userId: '1',
        action: 'COMPANY_UPDATE',
        description: 'Updated company profile',
        ip: '192.168.1.101'
      },
      {
        id: 3,
        timestamp: new Date(Date.now() - 10800000).toISOString(),
        userId: 'admin',
        action: 'USER_TIER_UPDATE',
        description: 'Changed user tier to Premium',
        ip: '192.168.1.102'
      }
    ];
    
    return { data: logs };
  }
  
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const mockAdminService = new MockAdminService();
