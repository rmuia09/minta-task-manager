// Page object for the Register screen.
const { dismissKeyboard } = require('../utils/keyboard');

class RegisterPage {
  get nameField() {
    return $(`//*[@resource-id="register_name"]`);
  }

  get emailField() {
    return $(`//*[@resource-id="register_email"]`);
  }

  get passwordField() {
    return $(`//*[@resource-id="register_password"]`);
  }

  get submitButton() {
    return $(`//*[@resource-id="register_submit"]`);
  }

  get heading() {
    return $('android=new UiSelector().text("Create account")');
  }

  async register(name, email, password) {
    await this.nameField.waitForDisplayed({ timeout: 15000 });
    await this.nameField.setValue(name);
    await this.emailField.setValue(email);
    await this.passwordField.setValue(password);

    // The soft keyboard can cover the submit button on shorter screens.
    await dismissKeyboard();

    await this.submitButton.waitForDisplayed({ timeout: 15000 });
    await this.submitButton.click();
  }
}

module.exports = new RegisterPage();