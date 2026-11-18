const LoginPage = require('../pages/LoginPage');
const TodayPage = require('../pages/TodayPage');
const { registerUser, logout } = require('../utils/api');

describe('Login UI', () => {
  let credentials;

  before(async () => {
    const { payload } = await registerUser();
    credentials = payload;
  });

  after(async () => {
    await logout();
  });

  it('should log in with valid credentials and land on the Today screen', async () => {
    await LoginPage.login(credentials.email, credentials.password);
    await TodayPage.waitForScreen();
    expect(await TodayPage.heading.isDisplayed()).toBe(true);
  });

  it('should show an error for invalid credentials', async () => {
    await LoginPage.login(credentials.email, 'WrongPassword!');

    const error = $('android=new UiSelector().textContains("Invalid email or password")');
    await error.waitForDisplayed({ timeout: 15000 });
    expect(await error.isDisplayed()).toBe(true);
  });
});
