const fs = require('fs');
const path = require('path');

const pluginPath = path.join(
  __dirname,
  '..',
  'node_modules',
  'expo-modules-autolinking',
  'android',
  'expo-gradle-plugin',
  'expo-autolinking-plugin',
  'src',
  'main',
  'kotlin',
  'expo',
  'modules',
  'plugin',
  'ExpoAutolinkingPlugin.kt'
);

if (fs.existsSync(pluginPath)) {
  let content = fs.readFileSync(pluginPath, 'utf8');
  const targetPattern = 'project.findProperty("expo.inlineModules.watchedDirectories") ?: emptyList<String>()';
  const replacement = '(project.findProperty("expo.inlineModules.watchedDirectories") as? String)?.takeIf { it.isNotBlank() } ?: "[]"';

  if (content.includes(targetPattern)) {
    content = content.replace(targetPattern, replacement);
    fs.writeFileSync(pluginPath, content, 'utf8');
    console.log('[patch-autolinking] Successfully patched ExpoAutolinkingPlugin.kt fallback to "[]"');
  } else {
    console.log('[patch-autolinking] Target pattern not found or already patched.');
  }
} else {
  console.log('[patch-autolinking] File not found at:', pluginPath);
}

// 2. Patch RNCWebViewClient.java for untrusted/self-signed SSL certificates (e.g. JUET CampusLynx)
const webviewClientPath = path.join(
  __dirname,
  '..',
  'node_modules',
  'react-native-webview',
  'android',
  'src',
  'main',
  'java',
  'com',
  'reactnativecommunity',
  'webview',
  'RNCWebViewClient.java'
);

if (fs.existsSync(webviewClientPath)) {
  let wvContent = fs.readFileSync(webviewClientPath, 'utf8');
  if (wvContent.includes('handler.proceed();\n        return;')) {
    wvContent = wvContent.replace(
      'handler.proceed();\n        return;',
      'if (true) { handler.proceed(); return; }'
    );
    fs.writeFileSync(webviewClientPath, wvContent, 'utf8');
    console.log('[patch-webview-ssl] Fixed unreachable statement in RNCWebViewClient.java');
  } else if (wvContent.includes('handler.cancel();') && wvContent.includes('onReceivedSslError')) {
    wvContent = wvContent.replace(
      'handler.cancel();',
      'if (true) { handler.proceed(); return; }'
    );
    fs.writeFileSync(webviewClientPath, wvContent, 'utf8');
    console.log('[patch-webview-ssl] Successfully patched RNCWebViewClient.java to proceed on SSL cert errors');
  } else {
    console.log('[patch-webview-ssl] RNCWebViewClient.java already patched or pattern missing');
  }
}
