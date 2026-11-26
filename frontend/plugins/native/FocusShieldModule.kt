package com.studyquest.app

import android.content.ComponentName
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.provider.Settings
import android.text.TextUtils
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class FocusShieldModule(private val reactCtx: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactCtx) {

    override fun getName(): String = "FocusShield"

    private fun isAccessibilityServiceEnabled(): Boolean {
        val expected = ComponentName(reactCtx, FocusShieldAccessibilityService::class.java)
        val enabledServices = Settings.Secure.getString(
            reactCtx.contentResolver,
            Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES
        ) ?: return false
        val splitter = TextUtils.SimpleStringSplitter(':')
        splitter.setString(enabledServices)
        while (splitter.hasNext()) {
            val name = ComponentName.unflattenFromString(splitter.next())
            if (name == expected) return true
        }
        return false
    }

    @ReactMethod
    fun getStatus(promise: Promise) {
        try {
            val map = Arguments.createMap().apply {
                putBoolean("accessibilityEnabled", isAccessibilityServiceEnabled())
                putBoolean("overlayEnabled", Settings.canDrawOverlays(reactCtx))
                putBoolean("focusActive", FocusShieldPrefs.isFocusActive(reactCtx))
                putInt("urgesBlockedCount", FocusShieldPrefs.getUrgesBlockedCount(reactCtx))
                putString("lastBlockedPackage", FocusShieldPrefs.getLastBlockedPackage(reactCtx))
                putString("lastBlockedLabel", FocusShieldPrefs.getLastBlockedLabel(reactCtx))
            }
            promise.resolve(map)
        } catch (e: Exception) {
            promise.reject("STATUS_ERR", e)
        }
    }

    @ReactMethod
    fun syncShieldConfig(
        isFocusActive: Boolean,
        isStrictMode: Boolean,
        blockShorts: Boolean,
        alwaysGuard: Boolean,
        blockedPackagesCsv: String,
        promise: Promise
    ) {
        try {
            FocusShieldPrefs.sync(
                reactCtx,
                isFocusActive,
                isStrictMode,
                blockShorts,
                alwaysGuard,
                blockedPackagesCsv
            )
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("SYNC_ERR", e)
        }
    }

    @ReactMethod
    fun getInstalledApps(promise: Promise) {
        try {
            val pm = reactCtx.packageManager
            val mainIntent = Intent(Intent.ACTION_MAIN, null).apply {
                addCategory(Intent.CATEGORY_LAUNCHER)
            }
            val resolveInfos = pm.queryIntentActivities(mainIntent, PackageManager.MATCH_ALL)
            val seen = HashSet<String>()
            val blocked = FocusShieldPrefs.getBlockedSet(reactCtx)
            val arr = Arguments.createArray()

            resolveInfos
                .mapNotNull { info ->
                    val pkg = info.activityInfo?.packageName ?: return@mapNotNull null
                    if (pkg == reactCtx.packageName || !seen.add(pkg)) return@mapNotNull null
                    val label = info.loadLabel(pm)?.toString() ?: pkg
                    Pair(pkg, label)
                }
                .sortedBy { it.second.lowercase() }
                .forEach { (pkg, label) ->
                    val item = Arguments.createMap().apply {
                        putString("packageName", pkg)
                        putString("label", label)
                        putBoolean("blocked", blocked.contains(pkg))
                    }
                    arr.pushMap(item)
                }

            promise.resolve(arr)
        } catch (e: Exception) {
            promise.reject("APPS_ERR", e)
        }
    }

    @ReactMethod
    fun grantTempUnlockSeconds(seconds: Int, promise: Promise) {
        try {
            FocusShieldPrefs.grantTempUnlockSeconds(reactCtx, seconds)
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("UNLOCK_ERR", e)
        }
    }

    @ReactMethod
    fun openAccessibilitySettings() {
        val intent = Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS).apply {
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        }
        reactCtx.startActivity(intent)
    }

    @ReactMethod
    fun openOverlaySettings() {
        val intent = Intent(
            Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
            Uri.parse("package:${reactCtx.packageName}")
        ).apply {
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        }
        reactCtx.startActivity(intent)
    }

    @ReactMethod
    fun openDigitalWellbeing() {
        try {
            val intent = Intent("android.settings.DIGITAL_WELLBEING_SETTINGS").apply {
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            reactCtx.startActivity(intent)
        } catch (_: Exception) {
            val fallback = Intent(Settings.ACTION_SETTINGS).apply {
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            reactCtx.startActivity(fallback)
        }
    }
}
