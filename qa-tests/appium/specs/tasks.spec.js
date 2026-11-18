const LoginPage = require('../pages/LoginPage');
const TodayPage = require('../pages/TodayPage');
const NewTaskPage = require('../pages/NewTaskPage');
const { registerUser, logout } = require('../utils/api');

describe('Task Management UI', () => {
  let credentials;

  before(async () => {
    const { payload } = await registerUser();
    credentials = payload;
    await LoginPage.login(credentials.email, credentials.password);
    await TodayPage.waitForScreen();
  });

  after(async () => {
    await logout();
  });

  it('should create a new task and show it on the Today screen', async () => {
    const title = `UI Task ${Date.now()}`;

    await TodayPage.openNewTask();
    await NewTaskPage.createTask(title, 'Created by Appium UI test');

    await TodayPage.waitForScreen();
    const task = await TodayPage.taskCardByTitle(title);
    await task.waitForDisplayed({ timeout: 15000 });
    expect(await task.isDisplayed()).toBe(true);
  });

  it('should show the empty state when there are no tasks', async () => {
    // Log out current user, register fresh, verify empty state.
    await logout();
    const fresh = await registerUser();
    await LoginPage.login(fresh.payload.email, fresh.payload.password);
    await TodayPage.waitForScreen();

    await TodayPage.noTasksText.waitForDisplayed({ timeout: 15000 });
    expect(await TodayPage.noTasksText.isDisplayed()).toBe(true);

    await logout();
  });
});
