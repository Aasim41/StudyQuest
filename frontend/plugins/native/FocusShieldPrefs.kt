package com.studyquest.app

import android.content.Context
import android.content.SharedPreferences

object FocusShieldPrefs {
    private const val PREF_NAME = "studyquest_focus_shield"
    private const val KEY_FOCUS_ACTIVE = "focus_active"
    private const val KEY_STRICT_MODE = "strict_mode"
    private const val KEY_BLOCK_SHORTS = "block_shorts"
    private const val KEY_ALWAYS_GUARD = "always_guard"
    private const val KEY_BLOCKED_CSV = "blocked_csv"
    private const val KEY_UNLOCK_UNTIL = "unlock_until_ms"
    private const val KEY_URGES_BLOCKED = "urges_blocked_count"
    private const val KEY_LAST_PACKAGE = "last_blocked_package"
    private const val KEY_LAST_LABEL = "last_blocked_label"

    private const val DEFAULT_BLOCKED =
        "com.instagram.android,com.zhiliaoapp.musically,com.ss.android.ugc.trill,com.snapchat.android,com.reddit.frontpage,com.twitter.android,com.netflix.mediaclient"

    private fun prefs(ctx: Context): SharedPreferences =
        ctx.getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE)

    fun sync(
        ctx: Context,
        focusActive: Boolean,
        strictMode: Boolean,
        blockShorts: Boolean,
        alwaysGuard: Boolean,
        blockedCsv: String
    ) {
        prefs(ctx).edit()
            .putBoolean(KEY_FOCUS_ACTIVE, focusActive)
            .putBoolean(KEY_STRICT_MODE, strictMode)
            .putBoolean(KEY_BLOCK_SHORTS, blockShorts)
            .putBoolean(KEY_ALWAYS_GUARD, alwaysGuard)
            .putString(KEY_BLOCKED_CSV, blockedCsv)
            .apply()
    }

    fun isFocusActive(ctx: Context): Boolean = prefs(ctx).getBoolean(KEY_FOCUS_ACTIVE, false)

    fun isStrictMode(ctx: Context): Boolean = prefs(ctx).getBoolean(KEY_STRICT_MODE, true)

    fun isAlwaysGuard(ctx: Context): Boolean = prefs(ctx).getBoolean(KEY_ALWAYS_GUARD, false)

    fun isBlockShortsEnabled(ctx: Context): Boolean {
        val p = prefs(ctx)
        return p.getBoolean(KEY_BLOCK_SHORTS, true) &&
            (p.getBoolean(KEY_FOCUS_ACTIVE, false) || p.getBoolean(KEY_ALWAYS_GUARD, false))
    }

    fun getBlockedSet(ctx: Context): Set<String> {
        val raw = prefs(ctx).getString(KEY_BLOCKED_CSV, DEFAULT_BLOCKED) ?: DEFAULT_BLOCKED
        return raw.split(",")
            .map { it.trim() }
            .filter { it.isNotEmpty() }
            .toSet()
    }

    fun shouldBlockPackage(ctx: Context, packageName: String): Boolean {
        val p = prefs(ctx)
        val active = p.getBoolean(KEY_FOCUS_ACTIVE, false) || p.getBoolean(KEY_ALWAYS_GUARD, false)
        if (!active) return false
        if (System.currentTimeMillis() < p.getLong(KEY_UNLOCK_UNTIL, 0L)) return false
        return getBlockedSet(ctx).contains(packageName)
    }

    fun recordBlockedEvent(ctx: Context, packageName: String, label: String) {
        val p = prefs(ctx)
        val nextCount = p.getInt(KEY_URGES_BLOCKED, 0) + 1
        p.edit()
            .putInt(KEY_URGES_BLOCKED, nextCount)
            .putString(KEY_LAST_PACKAGE, packageName)
            .putString(KEY_LAST_LABEL, label)
            .apply()
    }

    fun getUrgesBlockedCount(ctx: Context): Int = prefs(ctx).getInt(KEY_URGES_BLOCKED, 0)

    fun getLastBlockedPackage(ctx: Context): String = prefs(ctx).getString(KEY_LAST_PACKAGE, "") ?: ""

    fun getLastBlockedLabel(ctx: Context): String = prefs(ctx).getString(KEY_LAST_LABEL, "") ?: ""

    fun grantTempUnlockSeconds(ctx: Context, seconds: Int) {
        val until = System.currentTimeMillis() + (seconds.coerceIn(0, 600) * 1000L)
        prefs(ctx).edit().putLong(KEY_UNLOCK_UNTIL, until).apply()
    }
}
