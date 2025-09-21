import { test, expect } from '@playwright/test'

test.describe('Map Smoke Tests', () => {
  test('map renders and has at least 1 marker', async ({ page }) => {
    await page.goto('/map')

    // Wait for the map container to be visible
    await expect(page.locator('.leaflet-container')).toBeVisible({ timeout: 10000 })

    // Wait for map tiles to load
    await page.waitForFunction(() => {
      const tileContainer = document.querySelector('.leaflet-tile-container')
      return tileContainer && tileContainer.children.length > 0
    }, { timeout: 10000 })

    // Check that at least one marker exists (shelter markers)
    const markerCount = await page.locator('.leaflet-marker-icon').count()
    expect(markerCount).toBeGreaterThan(0)

    // Verify map is interactive (zoom controls are present)
    await expect(page.locator('.leaflet-control-zoom')).toBeVisible()
  })

  test('emergency map renders with geolocation prompt', async ({ page }) => {
    await page.goto('/emergency')

    // Check emergency page loads with location button
    await expect(page.getByText('Use My Location')).toBeVisible()

    // Check emergency map placeholder is shown when no location
    await expect(page.getByText('Get your location to see emergency shelter directions')).toBeVisible()
  })
})