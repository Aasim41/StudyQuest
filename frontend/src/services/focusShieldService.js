import { NativeModules, Platform, Linking } from 'react-native';

const { FocusShield } = NativeModules;

export const isNativeShieldAvailable = Platform.OS === 'android' && !!FocusShield;

export const DEFAULT_BLOCKED_PACKAGES = [
  { packageName: 'com.instagram.android', label: 'Instagram', blocked: true },
  { packageName: 'com.google.android.youtube', label: 'YouTube (Main App)', blocked: false },
  { packageName: 'com.zhiliaoapp.musically', label: 'TikTok / Short Video', blocked: true },
  { packageName: 'com.snapchat.android', label: 'Snapchat', blocked: true },
  { packageName: 'com.reddit.frontpage', label: 'Reddit', blocked: true },
  { packageName: 'com.twitter.android', label: 'X / Twitter', blocked: true },
  { packageName: 'com.netflix.mediaclient', label: 'Netflix', blocked: true },
  { packageName: 'com.whatsapp', label: 'WhatsApp', blocked: false },
];

export async function getNativeShieldStatus() {
  if (!isNativeShieldAvailable) {
    return {
      nativeSupported: false,
      accessibilityEnabled: false,
      overlayEnabled: false,
      focusActive: false,
      urgesBlockedCount: 0,
      lastBlockedPackage: '',
      lastBlockedLabel: '',
    };
  }
  try {
    const status = await FocusShield.getStatus();
    return { nativeSupported: true, ...status };
  } catch {
    return { nativeSupported: true, accessibilityEnabled: false, overlayEnabled: false };
  }
}

export async function syncNativeShield({
  focusActive = false,
  strictMode = true,
  blockShortsReels = true,
  alwaysGuard = false,
  blockedPackages = [],
}) {
  if (!isNativeShieldAvailable) return false;
  try {
    const csv = blockedPackages
      .filter((a) => a.blocked && a.packageName)
      .map((a) => a.packageName)
      .join(',');
    await FocusShield.syncShieldConfig(
      !!focusActive,
      !!strictMode,
      !!blockShortsReels,
      !!alwaysGuard,
      csv
    );
    return true;
  } catch {
    return false;
  }
}

export async function loadInstalledAppsList() {
  if (!isNativeShieldAvailable) return null;
  try {
    const list = await FocusShield.getInstalledApps();
    return Array.isArray(list) ? list : null;
  } catch {
    return null;
  }
}

export async function grantNativeTempUnlock(seconds = 120) {
  if (!isNativeShieldAvailable) return false;
  try {
    await FocusShield.grantTempUnlockSeconds(seconds);
    return true;
  } catch {
    return false;
  }
}

export function openAndroidAccessibilitySettings() {
  if (isNativeShieldAvailable) {
    FocusShield.openAccessibilitySettings();
    return;
  }
  if (Platform.OS === 'android') {
    Linking.openSettings().catch(() => {});
  }
}

export function openAndroidOverlaySettings() {
  if (isNativeShieldAvailable) {
    FocusShield.openOverlaySettings();
    return;
  }
  if (Platform.OS === 'android') {
    Linking.openSettings().catch(() => {});
  }
}

export function openSystemDigitalWellbeing() {
  if (isNativeShieldAvailable) {
    FocusShield.openDigitalWellbeing();
    return;
  }
  if (Platform.OS === 'android') {
    Linking.sendIntent('android.settings.DIGITAL_WELLBEING_SETTINGS').catch(() => {
      Linking.openSettings().catch(() => {});
    });
  }
}
