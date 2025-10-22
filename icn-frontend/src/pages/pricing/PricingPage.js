import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSubscriptionService } from '../../services/serviceFactory';
import './PricingPage.css';

function PricingPage() {
  const navigate = useNavigate();
  const subscriptionService = getSubscriptionService();
  const [user, setUser] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    setUser(userData);
  }, []);

  const plans = [
    {
      id: 'free',
      name: 'Basic/Free',
      price: { monthly: 0, yearly: 0 },
      description: 'Perfect for getting started',
      features: [
        'Company name & address access',
        'Items and sector information',
        'Website/contact details',
        'Basic export (CSV/PDF)',
        'News tab access'
      ],
      limitations: [
        'No ABN and company summary',
        'No capability types filtering',
        'No ICN chat support',
        'No revenue & employee data'
      ],
      recommended: false,
      current: user?.tier === 'free'
    },
    {
      id: 'plus',
      name: 'Plus',
      price: { monthly: 9.99, yearly: 99.99 },
      description: 'For regular users and small businesses',
      features: [
        'Everything in Basic, plus:',
        'ABN and company summary',
        'Capability types filtering',
        'ICN chat support',
        'Limited export capabilities',
        'Gateway links access',
        'Company size filters',
        'Basic certifications info'
      ],
      limitations: [
        'No revenue & employee count',
        'No diversity markers & full export'
      ],
      recommended: false,
      current: user?.tier === 'plus'
    },
    {
      id: 'premium',
      name: 'Premium',
      price: { monthly: 19.99, yearly: 199.99 },
      description: 'For power users and enterprises',
      features: [
        'Everything in Plus, plus:',
        'Revenue & employee count data',
        'Diversity markers (Female/FN-owned)',
        'Advanced certifications',
        'Full export capabilities',
        'Local content percentage',
        'Demographic filters',
        'Priority support',
        'Advanced analytics access',
        'Enterprise API access (coming)'
      ],
      limitations: [],
      recommended: true,
      current: user?.tier === 'premium'
    }
  ];

  const handleSelectPlan = (plan) => {
    if (!user) {
      // Redirect to signup with selected plan
      localStorage.setItem('selectedPlan', plan.id);
      navigate('/signup');
      return;
    }

    if (plan.id === 'free' && user.tier !== 'free') {
      if (window.confirm('Are you sure you want to downgrade to the Free plan? You will lose access to premium features.')) {
        updateUserPlan(plan);
      }
    } else if (plan.id === user.tier) {
      alert('You are already on this plan');
    } else {
      setSelectedPlan(plan);
      setShowPaymentModal(true);
    }
  };

  const updateUserPlan = (plan) => {
    const updatedUser = { ...user, tier: plan.id };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
    alert(`Successfully ${plan.id === 'free' ? 'downgraded' : 'upgraded'} to ${plan.name} plan!`);
    window.location.reload();
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Simulate payment processing with service
      const response = await subscriptionService.updateSubscription({
        plan: selectedPlan.id,
        billingCycle,
        paymentMethod: {
          // Payment details would be collected from form
          cardNumber: e.target.querySelector('input[placeholder*="1234"]').value,
          expiryDate: e.target.querySelector('input[placeholder="MM/YY"]').value,
          cvv: e.target.querySelector('input[placeholder="123"]').value,
          name: e.target.querySelector('input[placeholder="John Smith"]').value
        }
      });
      
      // Update user with new plan
      updateUserPlan(selectedPlan);
      setShowPaymentModal(false);
    } catch (error) {
      alert(error.message || 'Payment failed. Please try again.');
    }
  };  

  const calculateSavings = (plan) => {
    if (billingCycle === 'yearly' && plan.price.monthly > 0) {
      const monthlyCost = plan.price.monthly * 12;
      const yearlyCost = plan.price.yearly;
      const savings = monthlyCost - yearlyCost;
      return savings;
    }
    return null;
  };

  const getSavingsText = (planId) => {
    if (billingCycle === 'yearly') {
      if (planId === 'plus') return 'Save $19.89/year';
      if (planId === 'premium') return 'Save $39.89/year';
    }
    return null;
  };

  return (
    <div className="pricing-page">
      {/* Hero Section */}
      <section className="pricing-hero">
        <div className="container">
          <h1>Choose the Right Plan for Your Business</h1>
          <p className="hero-subtitle">
            Access Victoria's most comprehensive supplier database with flexible pricing
          </p>
          
          <div className="billing-toggle">
            <button 
              className={`toggle-btn ${billingCycle === 'monthly' ? 'active' : ''}`}
              onClick={() => setBillingCycle('monthly')}
            >
              Monthly
            </button>
            <button 
              className={`toggle-btn ${billingCycle === 'yearly' ? 'active' : ''}`}
              onClick={() => setBillingCycle('yearly')}
            >
              Yearly
              <span className="save-badge">Save up to 20%</span>
            </button>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pricing-cards-section">
        <div className="container">
          <div className="pricing-cards">
            {plans.map(plan => {
              const savings = calculateSavings(plan);
              const savingsText = getSavingsText(plan.id);
              const price = plan.price[billingCycle];
              const isCurrentPlan = user?.tier === plan.id;
              
              return (
                <div 
                  key={plan.id} 
                  className={`pricing-card ${plan.recommended ? 'recommended' : ''} ${isCurrentPlan ? 'current' : ''}`}
                >
                  {plan.recommended && (
                    <div className="recommended-badge">Most Popular</div>
                  )}
                  {isCurrentPlan && (
                    <div className="current-badge">Current Plan</div>
                  )}
                  
                  <div className="plan-header">
                    <h2>{plan.name}</h2>
                    <p className="plan-description">{plan.description}</p>
                  </div>
                  
                  <div className="plan-price">
                    <span className="currency">$</span>
                    <span className="amount">
                      {billingCycle === 'yearly' && price > 0 
                        ? (price / 12).toFixed(2) 
                        : price}
                    </span>
                    <span className="period">/month</span>
                  </div>
                  
                  {billingCycle === 'yearly' && price > 0 && (
                    <p className="billing-info">
                      Billed ${price} yearly
                      {savingsText && (
                        <span className="savings"> ({savingsText})</span>
                      )}
                    </p>
                  )}
                  
                  <button 
                    className={`select-plan-btn ${isCurrentPlan ? 'current' : ''}`}
                    onClick={() => handleSelectPlan(plan)}
                    disabled={isCurrentPlan}
                  >
                    {isCurrentPlan ? 'Current Plan' : 
                     plan.id === 'free' ? 'Get Started' : 
                     user?.tier === 'free' ? 'Upgrade Now' : 'Select Plan'}
                  </button>
                  
                  <div className="plan-features">
                    <h3>Features</h3>
                    <ul>
                      {plan.features.map((feature, index) => (
                        <li key={index}>
                          <span className="feature-icon">✓</span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                    
                    {plan.limitations.length > 0 && (
                      <>
                        <h3>Limitations</h3>
                        <ul className="limitations">
                          {plan.limitations.map((limitation, index) => (
                            <li key={index}>
                              <span className="limitation-icon">×</span>
                              {limitation}
                            </li>
                          ))}
                        </ul>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="comparison-section">
        <div className="container">
          <h2>Detailed Feature Comparison</h2>
          <div className="comparison-table">
            <table>
              <thead>
                <tr>
                  <th>Feature</th>
                  <th>Basic/Free</th>
                  <th>Plus</th>
                  <th className="highlighted">Premium</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Company name & address access</td>
                  <td>✓</td>
                  <td>✓</td>
                  <td className="highlighted">✓</td>
                </tr>
                <tr>
                  <td>Items and sector information</td>
                  <td>✓</td>
                  <td>✓</td>
                  <td className="highlighted">✓</td>
                </tr>
                <tr>
                  <td>Website/contact details</td>
                  <td>✓</td>
                  <td>✓</td>
                  <td className="highlighted">✓</td>
                </tr>
                <tr>
                  <td>Basic export (CSV/PDF)</td>
                  <td>✓</td>
                  <td>✓</td>
                  <td className="highlighted">✓</td>
                </tr>
                <tr>
                  <td>News tab access</td>
                  <td>✓</td>
                  <td>✓</td>
                  <td className="highlighted">✓</td>
                </tr>
                <tr>
                  <td>ABN and company summary</td>
                  <td>-</td>
                  <td>✓</td>
                  <td className="highlighted">✓</td>
                </tr>
                <tr>
                  <td>Capability types filtering</td>
                  <td>-</td>
                  <td>✓</td>
                  <td className="highlighted">✓</td>
                </tr>
                <tr>
                  <td>ICN chat support</td>
                  <td>-</td>
                  <td>✓</td>
                  <td className="highlighted">✓</td>
                </tr>
                <tr>
                  <td>Gateway links access</td>
                  <td>-</td>
                  <td>✓</td>
                  <td className="highlighted">✓</td>
                </tr>
                <tr>
                  <td>Company size filters</td>
                  <td>-</td>
                  <td>✓</td>
                  <td className="highlighted">✓</td>
                </tr>
                <tr>
                  <td>Revenue & employee data</td>
                  <td>-</td>
                  <td>-</td>
                  <td className="highlighted">✓</td>
                </tr>
                <tr>
                  <td>Diversity markers (Female/FN-owned)</td>
                  <td>-</td>
                  <td>-</td>
                  <td className="highlighted">✓</td>
                </tr>
                <tr>
                  <td>Full export capabilities</td>
                  <td>-</td>
                  <td>-</td>
                  <td className="highlighted">✓</td>
                </tr>
                <tr>
                  <td>Local content percentage</td>
                  <td>-</td>
                  <td>-</td>
                  <td className="highlighted">✓</td>
                </tr>
                <tr>
                  <td>Advanced analytics access</td>
                  <td>-</td>
                  <td>-</td>
                  <td className="highlighted">✓</td>
                </tr>
                <tr>
                  <td>Support</td>
                  <td>Email</td>
                  <td>Chat + Email</td>
                  <td className="highlighted">Priority</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="faq-section">
        <div className="container">
          <h2>Frequently Asked Questions</h2>
          <div className="faq-grid">
            <div className="faq-item">
              <h3>Can I change plans anytime?</h3>
              <p>Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.</p>
            </div>
            <div className="faq-item">
              <h3>Is there a setup fee?</h3>
              <p>No, there are no setup fees. You only pay the monthly or yearly subscription fee.</p>
            </div>
            <div className="faq-item">
              <h3>What payment methods do you accept?</h3>
              <p>We accept all major credit cards, PayPal, and bank transfers for enterprise accounts.</p>
            </div>
            <div className="faq-item">
              <h3>Can I get a refund?</h3>
              <p>We offer a 30-day money-back guarantee for all paid plans.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Payment Modal */}
      {showPaymentModal && selectedPlan && (
        <div className="payment-modal-overlay" onClick={() => setShowPaymentModal(false)}>
          <div className="payment-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Upgrade to {selectedPlan.name}</h2>
              <button className="close-btn" onClick={() => setShowPaymentModal(false)}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="plan-summary">
                <h3>{selectedPlan.name} Plan</h3>
                <p className="price-summary">
                  ${selectedPlan.price[billingCycle]} / {billingCycle}
                </p>
              </div>
              
              <form onSubmit={handlePaymentSubmit}>
                <div className="form-group">
                  <label>Card Number</label>
                  <input type="text" placeholder="1234 5678 9012 3456" required />
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Expiry Date</label>
                    <input type="text" placeholder="MM/YY" required />
                  </div>
                  <div className="form-group">
                    <label>CVV</label>
                    <input type="text" placeholder="123" required />
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Name on Card</label>
                  <input type="text" placeholder="John Smith" required />
                </div>
                
                <button type="submit" className="btn-submit">
                  Complete Upgrade
                </button>
              </form>
              
              <p className="security-note">
                🔒 Your payment information is secure and encrypted
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PricingPage;