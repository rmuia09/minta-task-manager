const LoginPage = require('../pages/LoginPage');
const TodayPage = require('../pages/TodayPage');
const { registerUser } = require('../utils/api');

describe('Login UI', () => {
  let credentials;

  before(async () => {
    // Create a user via the API so we can test the login flow.
    const { payload } = await registerUser();
    credentials = payload;
  });

  it('should log in with valid credentials and land on the Today screen', async () => {
    await LoginPage.login(credentials.email, credentials.password);
    await TodayPage.waitForScreen();
    expect(await TodayPage.heading.isDisplayed()).toBe(true);
  });

  it('should show an error for invalid credentials', async () => {
    // Log out first by relaunching the app (clears session state).
    await driver.terminateApp('com.example.taskmanager');
    await driver.activateApp('com.example.taskmanager');

    await LoginPage.login(credentials.email, 'WrongPassword!');

    const error = $('android=new UiSelector().textContains("Invalid email or password")');
    await error.waitForDisplayed({ timeout: 15000 });
    expect(await error.isDisplayed()).toBe(true);
  });
});