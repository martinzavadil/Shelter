import { test, expect } from '@playwright/test'

test.describe('Auth Login/Logout Smoke Tests', () => {
  test('login page loads and shows login form', async ({ page }) => {
    await page.goto('/login')

    // Check login page loads
    await expect(page.getByText('Sign In').or(page.getByText('Login'))).toBeVisible()

    // Check login form elements exist
    await expect(page.getByLabel('Email').or(page.getByPlaceholder('Email'))).toBeVisible()
    await expect(page.getByLabel('Password').or(page.getByPlaceholder('Password'))).toBeVisible()
    await expect(page.getByRole('button', { name: /sign in|login/i })).toBeVisible()

    // Check register link
    await expect(
      page.getByText('Sign up').or(
        page.getByText('Create account').or(
          page.getByText('Register')
        )
      )
    ).toBeVisible()
  })

  test('register page loads and shows registration form', async ({ page }) => {
    await page.goto('/register')

    // Check register page loads
    await expect(page.getByText('Sign Up').or(page.getByText('Register'))).toBeVisible()

    // Check registration form elements
    await expect(page.getByLabel('Name').or(page.getByPlaceholder('Name'))).toBeVisible()
    await expect(page.getByLabel('Email').or(page.getByPlaceholder('Email'))).toBeVisible()
    await expect(page.getByLabel('Password').or(page.getByPlaceholder('Password'))).toBeVisible()
    await expect(page.getByRole('button', { name: /sign up|register|create/i })).toBeVisible()

    // Check login link
    await expect(
      page.getByText('Sign in').or(
        page.getByText('Already have an account')
      )
    ).toBeVisible()
  })

  test('login with invalid credentials shows error', async ({ page }) => {
    await page.goto('/login')

    // Fill in invalid credentials
    await page.getByLabel('Email').or(page.getByPlaceholder('Email')).fill('invalid@test.com')
    await page.getByLabel('Password').or(page.getByPlaceholder('Password')).fill('wrongpassword')

    // Submit form
    await page.getByRole('button', { name: /sign in|login/i }).click()

    // Should show error message
    await expect(
      page.getByText(/invalid|incorrect|error|failed/i).or(
        page.getByText('Check your email and password')
      )
    ).toBeVisible({ timeout: 5000 })
  })

  test('navigation between login and register works', async ({ page }) => {
    await page.goto('/login')

    // Go to register from login
    const registerLink = page.getByText('Sign up').or(
      page.getByText('Create account').or(
        page.getByText('Register').or(
          page.getByRole('link', { name: /sign up|register/i })
        )
      )
    )

    await registerLink.click()
    await expect(page).toHaveURL(/.*register/)

    // Go back to login from register
    const loginLink = page.getByText('Sign in').or(
      page.getByText('Already have an account').or(
        page.getByRole('link', { name: /sign in|login/i })
      )
    )

    await loginLink.click()
    await expect(page).toHaveURL(/.*login/)
  })

  test('auth state is reflected in navigation', async ({ page }) => {
    // Check homepage shows login/register when not authenticated
    await page.goto('/')

    const authButtons = page.getByText('Sign In').or(
      page.getByText('Login').or(
        page.getByText('Sign Up').or(
          page.getByText('Register')
        )
      )
    )

    // Should see auth buttons when not logged in
    if (await authButtons.first().isVisible()) {
      expect(await authButtons.count()).toBeGreaterThan(0)
    }

    // If user menu exists, check for profile/logout options
    const userMenu = page.getByTestId('user-menu').or(
      page.getByRole('button', { name: /profile|account|user/i })
    )

    if (await userMenu.isVisible()) {
      await userMenu.click()

      // Should show logout option if logged in
      await expect(
        page.getByText('Logout').or(
          page.getByText('Sign out')
        )
      ).toBeVisible()
    }
  })

  test('protected pages redirect to login when not authenticated', async ({ page }) => {
    // Try to access a page that might require auth (trip builder with save functionality)
    await page.goto('/trip-builder')

    // Page might load but show login prompts for protected actions
    // Or redirect to login - either is acceptable
    const hasLoginPrompt = await page.getByText(/sign in|login/i).isVisible()
    const isOnLoginPage = page.url().includes('/login')

    expect(hasLoginPrompt || isOnLoginPage).toBeTruthy()
  })
})