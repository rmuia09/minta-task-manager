// Page object for the Today (task list) screen.
class TodayPage {
  get heading() {
    return $('android=new UiSelector().text("Today")');
  }

  get addTaskFab() {
    return $('android=new UiSelector().resourceId("com.example.taskmanager:id/add_task_fab")');
  }

  get noTasksText() {
    return $('android=new UiSelector().text("No tasks yet")');
  }

  async waitForScreen() {
    await this.heading.waitForDisplayed({ timeout: 20000 });
  }

  async openNewTask() {
    await this.addTaskFab.waitForDisplayed({ timeout: 15000 });
    await this.addTaskFab.click();
  }

  async taskCardByTitle(title) {
    return $(`android=new UiSelector().text("${title}")`);
  }

  async isTaskVisible(title) {
    const el = await this.taskCardByTitle(title);
    return el.isDisplayed();
  }
}

module.exports = new TodayPage();