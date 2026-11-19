// WebDriverIO + Appium configuration for the Task Manager Android app.
// Prerequisites:
//   1. Appium server running (npm run appium)
//   2. An Android emulator/device with the app installed
//   3. Backend running (cd backend && npm start)
exports.config = {
  runner: 'local',
  specs: ['./appium/specs/**/*.js'],
  exclude: [],

  maxInstances: 1,

  capabilities: [
    {
      platformName: 'Android',
      'appium:automationName': 'UiAutomator2',
      'appium:deviceName': process.env.APPIUM_DEVICE_NAME || 'Android Emulator',
      'appium:platformVersion': process.env.APPIUM_PLATFORM_VERSION || '30',
      'appium:appPackage': 'com.example.taskmanager',
      'appium:appActivity': '.MainActivity',
      'appium:noReset': true,
      'appium:fullReset': false,
      'appium:autoGrantPermissions': true,
    },
  ],

  logLevel: 'info',
  bail: 0,
  waitforTimeout: 15000,
  connectionRetryTimeout: 120000,
  connectionRetryCount: 3,

  services: [
    [
      'appium',
      {
        command: 'appium',
        args: {
          address: '127.0.0.1',
          port: 4723,
        },
      },
    ],
  ],

  framework: 'mocha',
  reporters: ['spec'],

  mochaOpts: {
    ui: 'bdd',
    timeout: 120000,
  },
};