const LoginPage = require('../pages/LoginPage');
const ForgotPasswordPage = require('../pages/ForgotPasswordPage');
const { registerUser, getResetCode } = require('../utils/api');

describe('Forgot Password UI', () => {
  let credentials;

  before(async () => {
    const { payload } = await registerUser();
    credentials = payload;
  });

  it('should request a reset code and reset the password', async () => {
    await LoginPage.openForgotPassword();
    await ForgotPasswordPage.requestCode(credentials.email);

    // Wait for the reset form to appear.
    await ForgotPasswordPage.resetHeading.waitForDisplayed({ timeout: 15000 });

    // Fetch the code from the API (in production this would come via email/SMS).
    const code = await getResetCode(credentials.email);

    await ForgotPasswordPage.resetPassword(code, 'NewPassword456!');

    // After reset, we should be back on the login screen.
    await LoginPage.welcomeHeading.waitForDisplayed({ timeout: 15000 });
    expect(await LoginPage.welcomeHeading.isDisplayed()).toBe(true);
  });

  it('should log in with the new password after reset', async () => {
    await LoginPage.login(credentials.email, 'NewPassword456!');
    const TodayPage = require('../pages/TodayPage');
    await TodayPage.waitForScreen();
    expect(await TodayPage.heading.isDisplayed()).toBe(true);
  });
});