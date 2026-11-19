// Shared helpers for the Appium page objects.

// Android KEYCODE_ESCAPE. Unlike KEYCODE_BACK it never leaves the app.
const KEYCODE_ESCAPE = 111;

/**
 * Hide the soft keyboard.
 *
 * On shorter screens the keyboard covers the submit buttons, and the button
 * then disappears from the view hierarchy, so the lookup fails with
 * "no such element".
 *
 * Only KEYCODE_ESCAPE is used. Appium's own hideKeyboard command falls back
 * to KEYCODE_BACK, which exits the app when no keyboard is shown and breaks
 * the test run.
 */
async function dismissKeyboard() {
  try {
    await driver.execute('mobile: pressKey', { key: KEYCODE_ESCAPE });
  } catch (e) {
    // The keyboard may not have been open; nothing to dismiss.
  }
  await browser.pause(300);
}

module.exports = { dismissKeyboard };
