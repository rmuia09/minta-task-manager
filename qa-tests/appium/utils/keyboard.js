// Shared helpers for the Appium page objects.

/**
 * Hide the soft keyboard.
 *
 * On shorter screens the keyboard covers the submit buttons, and the button
 * then disappears from the view hierarchy, so the lookup fails with
 * "no such element". Pressing the Android back key closes the IME without
 * leaving the current screen.
 */
async function dismissKeyboard() {
  try {
    await driver.execute('mobile: pressKey', { key: 4 });
  } catch (e) {
    // The keyboard may not have been open; nothing to dismiss.
  }
  await browser.pause(300);
}

module.exports = { dismissKeyboard };
