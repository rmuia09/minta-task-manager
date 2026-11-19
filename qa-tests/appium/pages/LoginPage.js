// Page object for the Login screen.
class LoginPage {
  get emailField() {
    return $(`//*[@resource-id="login_email"]`);
  }

  get passwordField() {
    return $(`//*[@resource-id="login_password"]`);
  }

  get signInButton() {
    return $(`//*[@resource-id="login_submit"]`);
  }

  get forgotPasswordLink() {
    return $('android=new UiSelector().text("Forgot password?")');
  }

  get signUpLink() {
    return $('android=new UiSelector().textContains("Sign Up")');
  }

  get welcomeHeading() {
    return $('android=new UiSelector().text("Welcome Back")');
  }

  async login(email, password) {
    await this.emailField.waitForDisplayed({ timeout: 15000 });
    await this.emailField.click();
    await this.emailField.setValue(email);

    await this.passwordField.click();
    await this.passwordField.setValue(password);

    await this.signInButton.click();
  }

  async openForgotPassword() {
    await this.forgotPasswordLink.waitForDisplayed({ timeout: 15000 });
    await this.forgotPasswordLink.click();
  }

  async openRegister() {
    await this.signUpLink.waitForDisplayed({ timeout: 15000 });
    await this.signUpLink.click();
  }
}

module.exports = new LoginPage();