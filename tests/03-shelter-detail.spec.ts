import { test, expect } from '@playwright/test'

const MATTERHORN_HUT_ID = '9d948373-23a5-4da2-936b-e8085626a38a'

test.describe('Shelter Detail & Review Smoke Tests', () => {
  test('shelter detail page loads with correct information', async ({ page }) => {
    await page.goto(`/shelter/${MATTERHORN_HUT_ID}`)

    // Check shelter name and basic info loads
    await expect(page.getByText('Matterhorn Hut')).toBeVisible()
    await expect(page.getByText('Iconic shelter beneath the legendary Matterhorn peak')).toBeVisible()

    // Check basic information section
    await expect(page.getByText('Basic Information')).toBeVisible()
    await expect(page.getByText('Type:')).toBeVisible()
    await expect(page.getByText('hut')).toBeVisible()
    await expect(page.getByText('Cost:')).toBeVisible()
    await expect(page.getByText('Capacity:')).toBeVisible()

    // Check access and amenities section
    await expect(page.getByText('Access & Amenities')).toBeVisible()
    await expect(page.getByText('foot')).toBeVisible()

    // Check back to map link
    await expect(page.getByText('Back to Map')).toBeVisible()
  })

  test('review form appears and submission works (stub auth)', async ({ page }) => {
    await page.goto(`/shelter/${MATTERHORN_HUT_ID}`)

    // Check if review form is visible (might require auth)
    const reviewForm = page.getByText('Add Review').or(page.getByText('Write a Review')).or(page.getByPlaceholder('Write your review'))

    if (await reviewForm.isVisible()) {
      // Form is available (user might be logged in or auth stubbed)
      const ratingStars = page.locator('[data-testid="rating-star"]').or(page.locator('input[type="radio"]'))

      if (await ratingStars.first().isVisible()) {
        await ratingStars.first().click()
      }

      const commentField = page.getByPlaceholder('Write your review').or(page.getByLabel('Comment'))
      if (await commentField.isVisible()) {
        await commentField.fill('Test review for smoke test')
      }

      const submitButton = page.getByRole('button', { name: /submit|add review|save/i })
      if (await submitButton.isVisible()) {
        await submitButton.click()

        // Should show some success indication or require auth
        await expect(
          page.getByText('Review submitted').or(
            page.getByText('Login required').or(
              page.getByText('Sign in to leave a review')
            )
          )
        ).toBeVisible({ timeout: 5000 })
      }
    } else {
      // No review form visible - check if login prompt appears
      await expect(
        page.getByText('Sign in to leave a review').or(
          page.getByText('Login to add review')
        )
      ).toBeVisible()
    }
  })

  test('shelter detail page handles non-existent shelter', async ({ page }) => {
    await page.goto('/shelter/non-existent-id-123')

    // Should show 404 or not found message
    await expect(
      page.getByText('Not Found').or(
        page.getByText('Shelter not found').or(
          page.locator('h1').filter({ hasText: '404' })
        )
      )
    ).toBeVisible({ timeout: 5000 })
  })
})