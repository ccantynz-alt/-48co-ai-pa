package nz.co.fortyeightco.keyboard

import android.content.Intent
import android.os.Bundle
import android.provider.Settings
import android.view.inputmethod.InputMethodManager
import android.widget.Button
import android.widget.EditText
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity

/**
 * Setup activity shown when the user opens the 48co Voice Keyboard app.
 * Guides them through enabling the keyboard in system settings.
 */
class SetupActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.setup_activity)

        val enableButton = findViewById<Button>(R.id.btnEnableKeyboard)
        val selectButton = findViewById<Button>(R.id.btnSelectKeyboard)
        val statusText = findViewById<TextView>(R.id.statusStep1)
        val testInput = findViewById<EditText>(R.id.testInput)

        enableButton.setOnClickListener {
            // Open Android keyboard settings
            startActivity(Intent(Settings.ACTION_INPUT_METHOD_SETTINGS))
        }

        selectButton.setOnClickListener {
            // Show keyboard picker
            val imm = getSystemService(INPUT_METHOD_SERVICE) as InputMethodManager
            imm.showInputMethodPicker()
        }

        testInput.setOnFocusChangeListener { _, hasFocus ->
            if (hasFocus) {
                testInput.hint = "Start typing or tap the mic button..."
            }
        }
    }

    override fun onResume() {
        super.onResume()
        updateStatus()
    }

    override fun onWindowFocusChanged(hasFocus: Boolean) {
        super.onWindowFocusChanged(hasFocus)
        if (hasFocus) updateStatus()
    }

    private fun updateStatus() {
        val statusText = findViewById<TextView>(R.id.tv_status)
        val selectButton = findViewById<Button>(R.id.btn_select_keyboard)

        val isEnabled = isKeyboardEnabled()
        val isSelected = isKeyboardSelected()

        when {
            isEnabled && isSelected -> {
                statusText.text = "48co Voice Keyboard is active. Try it below!"
                statusText.setTextColor(getColor(R.color.brand_success))
                selectButton.isEnabled = true
            }
            isEnabled && !isSelected -> {
                statusText.text = "Keyboard enabled. Now select it as your active keyboard."
                statusText.setTextColor(getColor(R.color.brand_warning))
                selectButton.isEnabled = true
            }
            else -> {
                statusText.text = "Step 1: Enable 48co Voice Keyboard in settings."
                statusText.setTextColor(getColor(R.color.brand_muted))
                selectButton.isEnabled = false
            }
        }
    }

    private fun isKeyboardEnabled(): Boolean {
        val enabledIMEs = Settings.Secure.getString(contentResolver, Settings.Secure.ENABLED_INPUT_METHODS)
        return enabledIMEs?.contains(packageName) == true
    }

    private fun isKeyboardSelected(): Boolean {
        val currentIME = Settings.Secure.getString(contentResolver, Settings.Secure.DEFAULT_INPUT_METHOD)
        return currentIME?.contains(packageName) == true
    }
}
