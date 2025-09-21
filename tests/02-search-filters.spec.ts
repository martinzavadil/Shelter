import { test, expect } from '@playwright/test'

test.describe('Search & Filters Smoke Tests', () => {
  test('search returns deterministic results for known shelter names', async ({ page }) => {
    await page.goto('/map')

    // Wait for initial load
    await page.waitForLoadState('networkidle')

    // Search for a known shelter - "Matterhorn"
    const searchInput = page.getByPlaceholder('Search shelters...')
    await searchInput.fill('Matterhorn')
    await searchInput.press('Enter')

    // Should find exactly 1 result (Matterhorn Hut)
    await expect(page.getByText('Matterhorn Hut')).toBeVisible({ timeout: 5000 })

    // Clear search and search for "Emergency"
    await searchInput.clear()
    await searchInput.fill('Emergency')
    await searchInput.press('Enter')

    // Should find multiple emergency shelters (deterministic: known to have several "Emergency" shelters)
    await expect(page.getByText('Emergency', { exact: false })).toHaveCount({ gte: 5 })
  })

  test('filters return deterministic results', async ({ page }) => {
    await page.goto('/map')
    await page.waitForLoadState('networkidle')

    // Test free filter - should reduce results
    const freeFilter = page.getByRole('button', { name: 'Free Only' }).or(page.getByLabel('Free Only'))
    await freeFilter.check()

    // Wait for filter to apply
    await page.waitForTimeout(1000)

    // Get result count with free filter
    const freeResults = await page.getByText(/\d+ shelters found/).textContent()

    // Turn off free filter
    await freeFilter.uncheck()
    await page.waitForTimeout(1000)

    // Get total results
    const allResults = await page.getByText(/\d+ shelters found/).textContent()

    // Free should be fewer than all results
    expect(freeResults).not.toEqual(allResults)

    // Test type filter - huts vs shelters
    const typeFilter = page.getByRole('combobox').or(page.getByLabel('Type'))
    await typeFilter.selectOption('hut')
    await page.waitForTimeout(1000)

    const hutResults = await page.getByText(/\d+ shelters found/).textContent()
    expect(hutResults).not.toEqual(allResults)
  })

  test('search with no results shows appropriate message', async ({ page }) => {
    await page.goto('/map')
    await page.waitForLoadState('networkidle')

    // Search for something that doesn't exist
    const searchInput = page.getByPlaceholder('Search shelters...')
    await searchInput.fill('NonExistentShelterXYZ123')
    await searchInput.press('Enter')

    // Should show no results or empty state
    await expect(page.getByText('0 shelters found').or(page.getByText('No shelters found'))).toBeVisible({ timeout: 5000 })
  })
})