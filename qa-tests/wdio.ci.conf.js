// WebDriverIO + Appium configuration for CI (Appium started externally).
//
// NOTE: run with `--autoCompileOpts.autoCompile=false`. The specs are plain
// CommonJS, but WebdriverIO auto-detects the ts-node dependency that Appium
// and Jest pull in and registers `--loader ts-node/esm/transpile-only`, which
// crashes on Node 22 with "ts-node/esm/transpile-only 'resolve' did not call
// the next hook in its chain".
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
