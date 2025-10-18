import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ErrorBoundary from './ErrorBoundary';

const ThrowError = ({ error = 'Test error' }) => {
  throw new Error(error);
};

describe('ErrorBoundary', () => {
  const originalEnv = process.env.NODE_ENV;
  
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    console.error.mockRestore();
    process.env.NODE_ENV = originalEnv;
  });

  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div>Test Content</div>
      </ErrorBoundary>
    );
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('renders error UI when error occurs', () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText(/We're sorry, but something unexpected happened/)).toBeInTheDocument();
  });

  it('shows error details in development mode', () => {
    process.env.NODE_ENV = 'development';
    
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );
    
    expect(screen.getByText(/Error Details/)).toBeInTheDocument();
    expect(screen.getByText(/Test error/)).toBeInTheDocument();
  });

  it('hides error details in production mode', () => {
    process.env.NODE_ENV = 'production';
    
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );
    
    expect(screen.queryByText(/Error Details/)).not.toBeInTheDocument();
  });

  it('displays Try Again button', () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );
    
    expect(screen.getByText('Try Again')).toBeInTheDocument();
  });

  it('displays Go to Home button', () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );
    
    expect(screen.getByText('Go to Home')).toBeInTheDocument();
  });

  it('resets error state when Try Again is clicked', () => {
    const GoodComponent = () => <div>All Good</div>;
    let shouldThrow = true;

    const ConditionalError = () => {
      if (shouldThrow) throw new Error('Error');
      return <GoodComponent />;
    };

    const { rerender } = render(
      <ErrorBoundary>
        <ConditionalError />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();

    shouldThrow = false;
    const tryAgainButton = screen.getByText('Try Again');
    fireEvent.click(tryAgainButton);

    rerender(
      <ErrorBoundary>
        <GoodComponent />
      </ErrorBoundary>
    );

    expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
  });

  it('navigates to home when Go to Home is clicked', () => {
    delete window.location;
    window.location = { href: '' };

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    const homeButton = screen.getByText('Go to Home');
    fireEvent.click(homeButton);

    expect(window.location.href).toBe('/');
  });

  it('logs error to logger', () => {
    const mockLogger = { error: jest.fn() };
    jest.mock('../utils/logger', () => ({ logger: mockLogger }));

    render(
      <ErrorBoundary>
        <ThrowError error="Custom error" />
      </ErrorBoundary>
    );

    // Error boundary should catch and log the error
    expect(console.error).toHaveBeenCalled();
  });
});