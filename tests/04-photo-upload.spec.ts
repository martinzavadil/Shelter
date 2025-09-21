import { test, expect } from '@playwright/test'
import fs from 'fs'
import path from 'path'

const MATTERHORN_HUT_ID = '9d948373-23a5-4da2-936b-e8085626a38a'

test.describe('Photo Upload Validation Smoke Tests', () => {
  test.beforeAll(async () => {
    // Create test files for upload validation
    const testDir = path.join(process.cwd(), 'test-files')

    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir)
    }

    // Create a small valid image (1x1 PNG, ~100 bytes)
    const smallPng = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==', 'base64')
    fs.writeFileSync(path.join(testDir, 'small-valid.png'), smallPng)

    // Create a large file (>3MB) by creating a buffer
    const largePng = Buffer.alloc(4 * 1024 * 1024) // 4MB
    fs.writeFileSync(path.join(testDir, 'large-invalid.png'), largePng)

    // Create multiple small files for count testing
    for (let i = 1; i <= 6; i++) {
      fs.writeFileSync(path.join(testDir, `file${i}.png`), smallPng)
    }
  })

  test.afterAll(async () => {
    // Clean up test files
    const testDir = path.join(process.cwd(), 'test-files')
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true })
    }
  })

  test('photo upload rejects files >3MB', async ({ page }) => {
    await page.goto(`/shelter/${MATTERHORN_HUT_ID}`)

    // Check if photo upload section is visible (may require auth)
    const uploadSection = page.getByText('Upload Photos').or(page.getByText('Add Photos'))

    if (await uploadSection.isVisible()) {
      // Find file input
      const fileInput = page.locator('input[type="file"]')

      if (await fileInput.isVisible()) {
        // Try to upload large file
        await fileInput.setInputFiles(path.join(process.cwd(), 'test-files', 'large-invalid.png'))

        // Should show error for file size
        await expect(
          page.getByText(/file.*too large|size.*exceeded|3.*MB/i)
        ).toBeVisible({ timeout: 3000 })
      }
    } else {
      // Not logged in - check for sign in message
      await expect(page.getByText('Sign in to share photos')).toBeVisible()
    }
  })

  test('photo upload rejects >5 files', async ({ page }) => {
    await page.goto(`/shelter/${MATTERHORN_HUT_ID}`)

    const uploadSection = page.getByText('Upload Photos').or(page.getByText('Add Photos'))

    if (await uploadSection.isVisible()) {
      const fileInput = page.locator('input[type="file"]')

      if (await fileInput.isVisible()) {
        // Try to upload 6 files at once
        const files = [
          'file1.png', 'file2.png', 'file3.png',
          'file4.png', 'file5.png', 'file6.png'
        ].map(f => path.join(process.cwd(), 'test-files', f))

        await fileInput.setInputFiles(files)

        // Should show error for too many files
        await expect(
          page.getByText(/only.*5|max.*5|too many/i)
        ).toBeVisible({ timeout: 3000 })
      }
    } else {
      // Not logged in case
      await expect(page.getByText('Sign in to share photos')).toBeVisible()
    }
  })

  test('photo upload accepts valid small files', async ({ page }) => {
    await page.goto(`/shelter/${MATTERHORN_HUT_ID}`)

    const uploadSection = page.getByText('Upload Photos').or(page.getByText('Add Photos'))

    if (await uploadSection.isVisible()) {
      const fileInput = page.locator('input[type="file"]')

      if (await fileInput.isVisible()) {
        // Upload a valid small file
        await fileInput.setInputFiles(path.join(process.cwd(), 'test-files', 'small-valid.png'))

        // Should not show size/count errors
        const errorMessages = page.getByText(/file.*too large|too many|exceeded/i)
        if (await errorMessages.isVisible()) {
          // If errors are visible, they should not contain our file size/count errors
          const errorText = await errorMessages.textContent()
          expect(errorText).not.toMatch(/3.*MB|5.*files|too large|too many/i)
        }

        // Upload button should be enabled or show success
        const uploadButton = page.getByRole('button', { name: /upload|add|submit/i })
        if (await uploadButton.isVisible()) {
          expect(await uploadButton.isDisabled()).toBeFalsy()
        }
      }
    }
  })
})