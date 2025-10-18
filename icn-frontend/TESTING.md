# ICN Navigator - Testing Documentation

## Overview

This document describes the comprehensive testing setup for the ICN Navigator frontend application.

## Table of Contents

- [Test Types](#test-types)
- [Setup](#setup)
- [Running Tests](#running-tests)
- [Writing Tests](#writing-tests)
- [CI/CD Integration](#cicd-integration)
- [Coverage Reports](#coverage-reports)
- [Best Practices](#best-practices)

## Test Types

### 1. Unit Tests
Tests for individual components and functions in isolation.

**Location:** `src/**/*.test.js`

**Framework:** Jest + React Testing Library

**Examples:**
- Component rendering
- User interactions
- Props validation
- State management

### 2. Integration Tests
Tests for multiple components working together.

**Location:** `src/__tests__/integration/`

**Examples:**
- Complete user flows
- Form submissions
- API interactions
- Navigation flows

### 3. End-to-End (E2E) Tests
Tests that simulate real user scenarios in a browser.

**Location:** `e2e/`

**Framework:** Playwright

**Examples:**
- Full authentication flow
- Search and filter operations
- Multi-page workflows

## Setup

### Initial Setup

1. **Install dependencies:**
```bash
npm install
```

2. **Install Playwright browsers:**
```bash
npx playwright install
```

3. **Configure environment:**
```bash
cp .env.example .env.test
```

### Environment Files

- `.env.test` - Test environment configuration
- `jest.config.js` - Jest configuration
- `playwright.config.js` - Playwright configuration
- `setupTests.js` - Global test setup

## Running Tests

### Unit & Integration Tests

```bash
# Run all tests in watch mode
npm test

# Run all tests once (CI mode)
npm run test:ci

# Run with coverage report
npm run test:coverage

# Run only unit tests
npm run test:unit

# Run only integration tests
npm run test:integration

# Run tests for specific component
npm test -- Header

# Debug tests
npm run test:debug
```

### E2E Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run with UI mode (interactive)
npm run test:e2e:ui

# Run in debug mode
npm run test:e2e:debug

# Run specific browser
npm run test:e2e:chromium
npm run test:e2e:firefox
npm run test:e2e:webkit

# Run mobile tests
npm run test:e2e:mobile

# Show test report
npm run test:e2e:report
```

### All Tests

```bash
# Run everything
npm run test:all

# Quick validation before commit
npm run validate
```

## Writing Tests

### Unit Test Example

```javascript
// src/components/MyComponent.test.js
import { render, screen, fireEvent } from '@testing-library/react';
import MyComponent from './MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent title="Test" />);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });

  it('handles click events', () => {
    const handleClick = jest.fn();
    render(<MyComponent onClick={handleClick} />);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### Integration Test Example

```javascript
// src/__tests__/integration/SearchFlow.test.js
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../../utils/testUtils';
import SearchPage from '../../pages/search/SearchPage';

describe('Search Flow', () => {
  it('completes full search', async () => {
    const user = userEvent.setup();
    renderWithProviders(<SearchPage />);

    // Enter search
    await user.type(screen.getByPlaceholderText('Search'), 'tech');
    
    // Apply filters
    await user.click(screen.getByLabelText('Technology'));
    
    // Verify results
    await waitFor(() => {
      expect(screen.getByText(/results/i)).toBeInTheDocument();
    });
  });
});
```

### E2E Test Example

```javascript
// e2e/search.spec.js
import { test, expect } from '@playwright/test';

test('search functionality', async ({ page }) => {
  await page.goto('/search');
  
  await page.fill('input[placeholder*="Search"]', 'technology');
  await page.press('input[placeholder*="Search"]', 'Enter');
  
  await expect(page.locator('.company-card').first()).toBeVisible();
});
```

## Test Utilities

### Custom Render

```javascript
import { renderWithProviders } from './utils/testUtils';

renderWithProviders(<MyComponent />, {
  user: mockUsers.premium,
  initialEntries: ['/search']
});
```

### Mock Data

```javascript
import { mockUsers, mockCompanies, mockFilters } from './utils/testUtils';

// Use in tests
const testUser = mockUsers.premium;
const testCompany = mockCompanies[0];
```

### Mock Geolocation

```javascript
import { mockGeolocation } from './utils/testUtils';

beforeEach(() => {
  mockGeolocation(true, {
    latitude: -37.8136,
    longitude: 144.9631
  });
});
```

## CI/CD Integration

### GitHub Actions

The test suite runs automatically on:
- Push to `main`, `develop`, or `feature/**` branches
- Pull requests to `main` or `develop`

**Workflow File:** `.github/workflows/test.yml`

### Pipeline Stages

1. **Lint & Format Check**
2. **Unit Tests** (with coverage)
3. **Integration Tests**
4. **Build**
5. **E2E Tests** (optional)

### Required Checks

All PRs must pass:
- ✅ Linting
- ✅ Format check
- ✅ Unit tests (70% coverage minimum)
- ✅ Build success

## Coverage Reports

### View Coverage

```bash
# Generate and view coverage
npm run test:coverage

# Coverage report will be in ./coverage/lcov-report/index.html
open coverage/lcov-report/index.html
```

### Coverage Thresholds

| Metric | Threshold |
|--------|-----------|
| Branches | 70% |
| Functions | 70% |
| Lines | 70% |
| Statements | 70% |

### Excluded from Coverage

- `src/index.js`
- `src/reportWebVitals.js`
- Test files (`*.test.js`)
- `src/setupTests.js`

## Best Practices

### ✅ Do's

1. **Write descriptive test names**
   ```javascript
   it('should show error when email is invalid', () => {});
   ```

2. **Use data-testid for complex queries**
   ```javascript
   <button data-testid="submit-button">Submit</button>
   ```

3. **Test user behavior, not implementation**
   ```javascript
   // Good
   await user.click(screen.getByRole('button', { name: /submit/i }));
   
   // Avoid
   wrapper.find('button').simulate('click');
   ```

4. **Clean up after tests**
   ```javascript
   afterEach(() => {
     jest.clearAllMocks();
     localStorage.clear();
   });
   ```

5. **Use proper async handling**
   ```javascript
   await waitFor(() => {
     expect(screen.getByText('Success')).toBeInTheDocument();
   });
   ```

### ❌ Don'ts

1. **Don't test implementation details**
2. **Don't use snapshot tests excessively**
3. **Don't skip cleanup**
4. **Don't test third-party libraries**
5. **Don't write brittle selectors**

### Testing Pyramid

```
       /\
      /E2E\        - Few, critical user journeys
     /------\
    /Integration\ - Multiple components together
   /------------\
  /  Unit Tests  \ - Many, fast, isolated tests
 /----------------\
```

## Debugging Tests

### Debug Unit Tests

```bash
# Add debugger statement in test
npm run test:debug

# Or use VS Code debugger with launch config
```

### Debug E2E Tests

```bash
# Playwright inspector
npm run test:e2e:debug

# Run with headed browser
npm run test:e2e:headed

# UI mode for interactive debugging
npm run test:e2e:ui
```

### Common Issues

**Issue: Tests timeout**
```javascript
// Increase timeout
jest.setTimeout(10000);

// Or for specific test
it('slow test', async () => {}, 10000);
```

**Issue: Async issues**
```javascript
// Always use waitFor for async operations
await waitFor(() => {
  expect(screen.getByText('Loaded')).toBeInTheDocument();
});
```

**Issue: Mock not working**
```javascript
// Clear mocks between tests
afterEach(() => {
  jest.clearAllMocks();
});
```

## Resources

- [React Testing Library Docs](https://testing-library.com/react)
- [Jest Documentation](https://jestjs.io/)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

## Support

For questions or issues with tests:
1. Check this documentation
2. Review existing test examples
3. Consult team members
4. Create an issue in the repository

---

**Last Updated:** 2025-01-20
**Maintained By:** ICN Navigator Development Team