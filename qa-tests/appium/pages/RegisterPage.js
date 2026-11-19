// Page object for the Register screen.
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
    await this.submitButton.click();
  }
}

module.exports = new RegisterPage();