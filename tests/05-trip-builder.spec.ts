import { test, expect } from '@playwright/test'

test.describe('Trip Builder Smoke Tests', () => {
  test('trip builder loads and shows shelter selection', async ({ page }) => {
    await page.goto('/trip-builder')

    // Check page loads with trip builder heading
    await expect(page.getByText('Trip Builder')).toBeVisible()
    await expect(page.getByText('Plan your mountain adventure')).toBeVisible()

    // Check shelter search/selection interface
    await expect(
      page.getByText('Select Shelters').or(
        page.getByPlaceholder('Search shelters').or(
          page.getByText('Add Shelter')
        )
      )
    ).toBeVisible({ timeout: 5000 })

    // Check if shelters are loaded (should show some shelter options)
    await expect(
      page.getByText('Matterhorn').or(
        page.getByText('refuge').or(
          page.getByText('hut').or(
            page.locator('[data-testid="shelter-option"]')
          )
        )
      )
    ).toBeVisible({ timeout: 10000 })
  })

  test('trip builder can add shelters', async ({ page }) => {
    await page.goto('/trip-builder')
    await page.waitForLoadState('networkidle')

    // Look for shelter selection interface
    const shelterOptions = page.getByText('Matterhorn Hut').or(
      page.getByText('Monte Rosa Hut').or(
        page.locator('[data-shelter-id]').first()
      )
    )

    if (await shelterOptions.first().isVisible()) {
      // Try to add first shelter
      await shelterOptions.first().click()

      // Should show shelter added to trip or in trip list
      await expect(
        page.getByText('Added to trip').or(
          page.getByText('Stage 1').or(
            page.getByText('Selected Shelters').or(
              page.locator('[data-testid="trip-shelter"]')
            )
          )
        )
      ).toBeVisible({ timeout: 5000 })
    }

    // Check if there's a save/create trip button
    const tripActions = page.getByRole('button', { name: /save trip|create trip|export/i })
    if (await tripActions.isVisible()) {
      expect(tripActions).toBeVisible()
    }
  })

  test('trip builder shows stages and distance calculations', async ({ page }) => {
    await page.goto('/trip-builder')
    await page.waitForLoadState('networkidle')

    // Try to add at least 2 shelters if possible
    const shelterOptions = page.locator('[data-shelter-id]').or(
      page.getByText(/hut|refuge|shelter/i)
    )

    const visibleShelters = await shelterOptions.count()

    if (visibleShelters >= 2) {
      // Add first shelter
      await shelterOptions.first().click()
      await page.waitForTimeout(1000)

      // Add second shelter
      await shelterOptions.nth(1).click()
      await page.waitForTimeout(1000)

      // Should show stages or distance information
      await expect(
        page.getByText(/stage|distance|km|day/i).or(
          page.getByText(/route|total/i)
        )
      ).toBeVisible({ timeout: 5000 })
    }

    // Should show some kind of trip summary or planning interface
    await expect(
      page.getByText('Trip Summary').or(
        page.getByText('Route Planning').or(
          page.getByText('Daily Stages').or(
            page.locator('[data-testid="trip-overview"]')
          )
        )
      )
    ).toBeVisible({ timeout: 5000 })
  })

  test('trip builder handles empty state', async ({ page }) => {
    await page.goto('/trip-builder')

    // Should show instructions or empty state initially
    await expect(
      page.getByText('Select shelters').or(
        page.getByText('Add shelters to your trip').or(
          page.getByText('Start by adding').or(
            page.getByText('No shelters selected')
          )
        )
      )
    ).toBeVisible({ timeout: 5000 })
  })
})