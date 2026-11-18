const LoginPage = require('../pages/LoginPage');
const RegisterPage = require('../pages/RegisterPage');
const TodayPage = require('../pages/TodayPage');
const { uniqueEmail } = require('../utils/api');

describe('Register UI', () => {
  it('should register a new user and land on the Today screen', async () => {
    const email = uniqueEmail('uiregister');

    await LoginPage.openRegister();
    await RegisterPage.register('UI Register', email, 'Password123!');

    await TodayPage.waitForScreen();
    expect(await TodayPage.heading.isDisplayed()).toBe(true);
  });

  it('should show an error when registering with an existing email', async () => {
    const email = uniqueEmail('uiduplicate');

    // Register the user via the API first.
    const { api } = require('../utils/api');
    await api.post('/api/auth/register', {
      name: 'Existing',
      email,
      password: 'Password123!',
    });

    // Relaunch to get back to login, then go to register.
    await driver.terminateApp('com.example.taskmanager');
    await driver.activateApp('com.example.taskmanager');
    await LoginPage.openRegister();

    await RegisterPage.register('Duplicate', email, 'Password123!');

    const error = $('android=new UiSelector().textContains("already exists")');
    await error.waitForDisplayed({ timeout: 15000 });
    expect(await error.isDisplayed()).toBe(true);
  });
});