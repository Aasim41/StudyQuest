const fs = require('fs');
const path = require('path');
const {
  withAndroidManifest,
  withStringsXml,
  withMainApplication,
  withDangerousMod,
  AndroidConfig,
} = require('expo/config-plugins');

const SERVICE_NAME = '.FocusShieldAccessibilityService';
const ACTIVITY_NAME = '.FocusBlockedActivity';

function withFocusShieldManifest(config) {
  return withAndroidManifest(config, (cfg) => {
    const manifest = cfg.modResults;

    // Ensure SYSTEM_ALERT_WINDOW permission
    AndroidConfig.Permissions.addPermission(
      manifest,
      'android.permission.SYSTEM_ALERT_WINDOW'
    );

    // Ensure <queries> includes MAIN + LAUNCHER so PackageManager lists installed user apps
    if (!manifest.manifest.queries) manifest.manifest.queries = [{}];
    const queriesBlock = manifest.manifest.queries[0];
    if (!queriesBlock.intent) queriesBlock.intent = [];
    const hasLauncherQuery = queriesBlock.intent.some(
      (i) =>
        i?.action?.[0]?.$?.['android:name'] === 'android.intent.action.MAIN' &&
        i?.category?.[0]?.$?.['android:name'] === 'android.intent.category.LAUNCHER'
    );
    if (!hasLauncherQuery) {
      queriesBlock.intent.push({
        action: [{ $: { 'android:name': 'android.intent.action.MAIN' } }],
        category: [{ $: { 'android:name': 'android.intent.category.LAUNCHER' } }],
      });
    }

    const app = AndroidConfig.Manifest.getMainApplicationOrThrow(manifest);
    if (!app.activity) app.activity = [];
    if (!app.activity.some((a) => a?.$?.['android:name'] === ACTIVITY_NAME)) {
      app.activity.push({
        $: {
          'android:name': ACTIVITY_NAME,
          'android:exported': 'false',
          'android:launchMode': 'singleTop',
          'android:excludeFromRecents': 'true',
          'android:theme': '@android:style/Theme.DeviceDefault.NoActionBar',
          'android:screenOrientation': 'portrait',
        },
      });
    }

    if (!app.service) app.service = [];
    if (!app.service.some((s) => s?.$?.['android:name'] === SERVICE_NAME)) {
      app.service.push({
        $: {
          'android:name': SERVICE_NAME,
          'android:exported': 'false',
          'android:permission': 'android.permission.BIND_ACCESSIBILITY_SERVICE',
        },
        'intent-filter': [
          {
            action: [
              { $: { 'android:name': 'android.accessibilityservice.AccessibilityService' } },
            ],
          },
        ],
        'meta-data': [
          {
            $: {
              'android:name': 'android.accessibilityservice',
              'android:resource': '@xml/focus_shield_accessibility',
            },
          },
        ],
      });
    }

    return cfg;
  });
}

function withFocusShieldStrings(config) {
  return withStringsXml(config, (cfg) => {
    AndroidConfig.Strings.setStringItem(
      [
        {
          $: { name: 'focus_shield_accessibility_desc' },
          _: 'StudyQuest Regain Shield blocks selected distraction apps and short-form Reels/Shorts loops during focus sessions.',
        },
      ],
      cfg.modResults
    );
    return cfg;
  });
}

function withFocusShieldMainApplication(config) {
  return withMainApplication(config, (cfg) => {
    let contents = cfg.modResults.contents;
    if (!contents.includes('FocusShieldPackage()')) {
      contents = contents.replace(
        /(PackageList\(this\)\.packages\.apply\s*\{)/,
        '$1\n          add(FocusShieldPackage())'
      );
      cfg.modResults.contents = contents;
    }
    return cfg;
  });
}

function withFocusShieldNativeFiles(config) {
  return withDangerousMod(config, [
    'android',
    async (cfg) => {
      const projectRoot = cfg.modRequest.projectRoot;
      const pkg = cfg.android?.package || 'com.studyquest.app';
      const pkgPath = pkg.replace(/\./g, '/');
      const nativeTemplateDir = path.join(projectRoot, 'plugins', 'native');

      const destJavaDir = path.join(
        cfg.modRequest.platformProjectRoot,
        'app',
        'src',
        'main',
        'java',
        pkgPath
      );
      const destXmlDir = path.join(
        cfg.modRequest.platformProjectRoot,
        'app',
        'src',
        'main',
        'res',
        'xml'
      );

      fs.mkdirSync(destJavaDir, { recursive: true });
      fs.mkdirSync(destXmlDir, { recursive: true });

      const ktFiles = [
        'FocusShieldPrefs.kt',
        'FocusBlockedActivity.kt',
        'FocusShieldAccessibilityService.kt',
        'FocusShieldModule.kt',
        'FocusShieldPackage.kt',
      ];
      for (const file of ktFiles) {
        const src = path.join(nativeTemplateDir, file);
        if (fs.existsSync(src)) {
          fs.copyFileSync(src, path.join(destJavaDir, file));
        }
      }

      const xmlSrc = path.join(nativeTemplateDir, 'focus_shield_accessibility.xml');
      if (fs.existsSync(xmlSrc)) {
        fs.copyFileSync(xmlSrc, path.join(destXmlDir, 'focus_shield_accessibility.xml'));
      }

      return cfg;
    },
  ]);
}

module.exports = function withFocusShield(config) {
  config = withFocusShieldManifest(config);
  config = withFocusShieldStrings(config);
  config = withFocusShieldMainApplication(config);
  config = withFocusShieldNativeFiles(config);
  return config;
};
