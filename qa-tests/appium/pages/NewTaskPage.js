// Page object for the New Task screen.
class NewTaskPage {
  get titleField() {
    return $('android=new UiSelector().resourceId("com.example.taskmanager:id/new_task_title")');
  }

  get descriptionField() {
    return $('android=new UiSelector().resourceId("com.example.taskmanager:id/new_task_description")');
  }

  get saveButton() {
    return $('android=new UiSelector().resourceId("com.example.taskmanager:id/new_task_save")');
  }

  get heading() {
    return $('android=new UiSelector().text("New task")');
  }

  async createTask(title, description) {
    await this.titleField.waitForDisplayed({ timeout: 15000 });
    await this.titleField.setValue(title);
    if (description) {
      await this.descriptionField.setValue(description);
    }
    await this.saveButton.click();
  }

  async selectChip(label) {
    const chip = $(`android=new UiSelector().text("${label}")`);
    await chip.waitForDisplayed({ timeout: 10000 });
    await chip.click();
  }
}

module.exports = new NewTaskPage();