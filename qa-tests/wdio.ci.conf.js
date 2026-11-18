// WebDriverIO + Appium configuration for CI (Appium started externally).
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
      'appium:platformVersion': process.env.APPIUM_PLATFORM_VERSION || '14',
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
  hostname: '127.0.0.1',
  port: 4723,
  path: '/',
  framework: 'mocha',
  reporters: ['spec'],
  mochaOpts: {
    ui: 'bdd',
    timeout: 120000,
  },
};
