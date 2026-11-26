package com.studyquest.app

import android.app.Activity
import android.content.Intent
import android.graphics.Color
import android.graphics.Typeface
import android.os.Bundle
import android.os.CountDownTimer
import android.view.Gravity
import android.widget.Button
import android.widget.LinearLayout
import android.widget.TextView

class FocusBlockedActivity : Activity() {
    private var timer: CountDownTimer? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val blockedLabel = intent.getStringExtra("blocked_label") ?: "Distraction App"
        val blockedPkg = intent.getStringExtra("blocked_pkg") ?: ""

        val root = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            gravity = Gravity.CENTER
            setBackgroundColor(Color.parseColor("#0B0C10"))
            val pad = (28 * resources.displayMetrics.density).toInt()
            setPadding(pad, pad, pad, pad)
        }

        val badge = TextView(this).apply {
            text = "REGAIN FOCUS SHIELD"
            setTextColor(Color.parseColor("#38BDF8"))
            textSize = 12f
            typeface = Typeface.DEFAULT_BOLD
            gravity = Gravity.CENTER
        }

        val title = TextView(this).apply {
            text = "$blockedLabel is Blocked"
            setTextColor(Color.WHITE)
            textSize = 24f
            typeface = Typeface.DEFAULT_BOLD
            gravity = Gravity.CENTER
            setPadding(0, 24, 0, 12)
        }

        val sub = TextView(this).apply {
            text = "Stay locked on your study target. Take a 5-second breath before continuing."
            setTextColor(Color.parseColor("#9CA3AF"))
            textSize = 14f
            gravity = Gravity.CENTER
            setPadding(0, 0, 0, 40)
        }

        val countdownView = TextView(this).apply {
            text = "5"
            setTextColor(Color.WHITE)
            textSize = 44f
            typeface = Typeface.DEFAULT_BOLD
            gravity = Gravity.CENTER
            setPadding(0, 0, 0, 36)
        }

        val returnBtn = Button(this).apply {
            text = "Return to StudyQuest"
            setBackgroundColor(Color.parseColor("#38BDF8"))
            setTextColor(Color.parseColor("#0B0C10"))
            setAllCaps(false)
            textSize = 15f
            typeface = Typeface.DEFAULT_BOLD
            setOnClickListener {
                val launch = Intent(this@FocusBlockedActivity, MainActivity::class.java).apply {
                    flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
                }
                startActivity(launch)
                finish()
            }
        }

        val unlockBtn = Button(this).apply {
            text = "Unlock 2 min (Wait 5s)"
            isEnabled = false
            setBackgroundColor(Color.parseColor("#181A24"))
            setTextColor(Color.parseColor("#6B7280"))
            setAllCaps(false)
            textSize = 13f
            setOnClickListener {
                FocusShieldPrefs.grantTempUnlockSeconds(this@FocusBlockedActivity, 120)
                if (blockedPkg.isNotEmpty()) {
                    packageManager.getLaunchIntentForPackage(blockedPkg)?.let { startActivity(it) }
                }
                finish()
            }
        }

        root.addView(badge)
        root.addView(title)
        root.addView(sub)
        root.addView(countdownView)
        root.addView(returnBtn)
        val spacer = TextView(this).apply { height = 24 }
        root.addView(spacer)
        root.addView(unlockBtn)
        setContentView(root)

        timer = object : CountDownTimer(5000, 1000) {
            override fun onTick(millisUntilFinished: Long) {
                val secs = ((millisUntilFinished + 999) / 1000).toInt()
                countdownView.text = secs.toString()
                unlockBtn.text = "Unlock 2 min (Wait ${secs}s)"
            }

            override fun onFinish() {
                countdownView.text = "0"
                unlockBtn.isEnabled = true
                unlockBtn.text = "Allow 2 min Break"
                unlockBtn.setTextColor(Color.parseColor("#E5E7EB"))
            }
        }.start()
    }

    override fun onDestroy() {
        timer?.cancel()
        super.onDestroy()
    }

    @Deprecated("Deprecated in Java")
    override fun onBackPressed() {
        val launch = Intent(this, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
        }
        startActivity(launch)
        finish()
    }
}
