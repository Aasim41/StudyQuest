package com.studyquest.app

import android.accessibilityservice.AccessibilityService
import android.content.Intent
import android.os.Handler
import android.os.Looper
import android.view.accessibility.AccessibilityEvent
import android.widget.Toast

class FocusShieldAccessibilityService : AccessibilityService() {
    private var lastTriggerMs = 0L
    private var lastShortsBackMs = 0L

    private val ignoredPackages = setOf(
        "com.studyquest.app",
        "com.android.systemui",
        "android",
        "com.google.android.inputmethod.latin",
        "com.samsung.android.honeyboard"
    )

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        if (event == null) return
        val pkg = event.packageName?.toString() ?: return
        if (ignoredPackages.contains(pkg)) return

        val now = System.currentTimeMillis()

        // 1. OS-level distraction app interception
        if (FocusShieldPrefs.shouldBlockPackage(this, pkg)) {
            if (now - lastTriggerMs < 900L) return
            lastTriggerMs = now

            val label = resolveAppLabel(pkg)
            FocusShieldPrefs.recordBlockedEvent(this, pkg, label)
            performGlobalAction(GLOBAL_ACTION_HOME)

            val overlayIntent = Intent(this, FocusBlockedActivity::class.java).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or
                    Intent.FLAG_ACTIVITY_CLEAR_TOP or
                    Intent.FLAG_ACTIVITY_SINGLE_TOP
                putExtra("blocked_pkg", pkg)
                putExtra("blocked_label", label)
            }
            startActivity(overlayIntent)
            return
        }

        // 2. Real in-app Shorts & Reels feed blocking (keeps long lectures working)
        if (FocusShieldPrefs.isBlockShortsEnabled(this)) {
            val root = rootInActiveWindow ?: return
            if (pkg == "com.google.android.youtube") {
                val isShorts =
                    root.findAccessibilityNodeInfosByViewId("com.google.android.youtube:id/reel_watch_fragment_root").isNotEmpty() ||
                    root.findAccessibilityNodeInfosByViewId("com.google.android.youtube:id/reel_player_page_container").isNotEmpty() ||
                    root.findAccessibilityNodeInfosByViewId("com.google.android.youtube:id/shorts_player_view_stub").isNotEmpty()
                if (isShorts && now - lastShortsBackMs > 1200L) {
                    lastShortsBackMs = now
                    FocusShieldPrefs.recordBlockedEvent(this, "com.google.android.youtube.shorts", "YouTube Shorts")
                    performGlobalAction(GLOBAL_ACTION_BACK)
                    showToast("YouTube Shorts blocked by Regain")
                }
            } else if (pkg == "com.instagram.android") {
                val isReels =
                    root.findAccessibilityNodeInfosByViewId("com.instagram.android:id/clips_viewer_view_pager").isNotEmpty() ||
                    root.findAccessibilityNodeInfosByViewId("com.instagram.android:id/reel_viewer_root").isNotEmpty()
                if (isReels && now - lastShortsBackMs > 1200L) {
                    lastShortsBackMs = now
                    FocusShieldPrefs.recordBlockedEvent(this, "com.instagram.android.reels", "Instagram Reels")
                    performGlobalAction(GLOBAL_ACTION_BACK)
                    showToast("Instagram Reels blocked by Regain")
                }
            }
        }
    }

    private fun resolveAppLabel(pkg: String): String {
        return try {
            val appInfo = packageManager.getApplicationInfo(pkg, 0)
            packageManager.getApplicationLabel(appInfo).toString()
        } catch (_: Exception) {
            pkg.substringAfterLast(".")
        }
    }

    private fun showToast(msg: String) {
        Handler(Looper.getMainLooper()).post {
            Toast.makeText(applicationContext, msg, Toast.LENGTH_SHORT).show()
        }
    }

    override fun onInterrupt() {}
}
