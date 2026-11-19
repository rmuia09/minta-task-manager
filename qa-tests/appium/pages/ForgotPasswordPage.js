// Page object for the Forgot Password screen.
const { dismissKeyboard } = require('../utils/keyboard');

class ForgotPasswordPage {
  get emailField() {
    return $(`//*[@resource-id="forgot_email"]`);
  }

  get sendCodeButton() {
    return $(`//*[@resource-id="forgot_submit"]`);
  }

  get codeField() {
    return $(`//*[@resource-id="forgot_code"]`);
  }

  get newPasswordField() {
    return $(`//*[@resource-id="forgot_new_password"]`);
  }

  get resetSubmitButton() {
    return $(`//*[@resource-id="forgot_reset_submit"]`);
  }

  get heading() {
    return $('android=new UiSelector().text("Forgot password?")');
  }

  get resetHeading() {
    return $('android=new UiSelector().text("Reset password")');
  }

  async requestCode(email) {
    await this.emailField.waitForDisplayed({ timeout: 15000 });
    await this.emailField.setValue(email);

    // The soft keyboard can cover the button on shorter screens.
    await dismissKeyboard();

    await this.sendCodeButton.waitForDisplayed({ timeout: 15000 });
    await this.sendCodeButton.click();
  }

  async resetPassword(code, newPassword) {
    await this.codeField.waitForDisplayed({ timeout: 15000 });
    await this.codeField.setValue(code);
    await this.newPasswordField.setValue(newPassword);

    // The soft keyboard can cover the button on shorter screens.
    await dismissKeyboard();

    await this.resetSubmitButton.waitForDisplayed({ timeout: 15000 });
    await this.resetSubmitButton.click();
  }
}

module.exports = new ForgotPasswordPage();