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
  // A single emulator cannot host concurrent sessions. Without this,
  // WebdriverIO defaults to 100 instances per capability and the spec files
  // run in parallel against the same screen, so they fight over the UI.
  maxInstancesPerCapability: 1,
  capabilities: [
    {
      platformName: 'Android',
      'appium:automationName': 'UiAutomator2',
      'appium:deviceName': process.env.APPIUM_DEVICE_NAME || 'Android Emulator',
      // Appium expects the Android version, not the API level.
      // The CI system image is API 30, which is Android 11.
      'appium:platformVersion': process.env.APPIUM_PLATFORM_VERSION || '11',
      'appium:appPackage': 'com.example.taskmanager',
      'appium:appActivity': '.MainActivity',
      // Restart the app for every spec file. With noReset the app keeps the
      // screen from the previous spec (e.g. the forgot-password form), so the
      // next spec never sees the login screen it expects.
      'appium:noReset': false,
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
