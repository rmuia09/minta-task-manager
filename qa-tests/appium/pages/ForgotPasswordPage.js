// Page object for the Forgot Password screen.
class ForgotPasswordPage {
  get emailField() {
    return $('android=new UiSelector().resourceId("com.example.taskmanager:id/forgot_email")');
  }

  get sendCodeButton() {
    return $('android=new UiSelector().resourceId("com.example.taskmanager:id/forgot_submit")');
  }

  get codeField() {
    return $('android=new UiSelector().resourceId("com.example.taskmanager:id/forgot_code")');
  }

  get newPasswordField() {
    return $('android=new UiSelector().resourceId("com.example.taskmanager:id/forgot_new_password")');
  }

  get resetSubmitButton() {
    return $('android=new UiSelector().resourceId("com.example.taskmanager:id/forgot_reset_submit")');
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
    await this.sendCodeButton.click();
  }

  async resetPassword(code, newPassword) {
    await this.codeField.waitForDisplayed({ timeout: 15000 });
    await this.codeField.setValue(code);
    await this.newPasswordField.setValue(newPassword);
    await this.resetSubmitButton.click();
  }
}

module.exports = new ForgotPasswordPage();