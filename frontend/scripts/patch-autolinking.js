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
