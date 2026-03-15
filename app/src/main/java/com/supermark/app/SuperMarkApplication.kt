package com.supermark.app

import android.app.Application
import android.content.Context
import androidx.lifecycle.lifecycleScope
import com.supermark.app.data.repository.LicenseRepository
import com.supermark.app.data.repository.UserRepository
import dagger.hilt.android.HiltAndroidApp
import kotlinx.coroutines.GlobalScope
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltAndroidApp
class SuperMarkApplication : Application() {

    @Inject
    lateinit var licenseRepository: LicenseRepository

    @Inject
    lateinit var userRepository: UserRepository

    override fun onCreate() {
        super.onCreate()

        // Initialize app-wide setup
        initializeFirstLaunchLicense()
    }

    private fun initializeFirstLaunchLicense() {
        GlobalScope.launch {
            try {
                val sharedPref = getSharedPreferences("supermark_prefs", Context.MODE_PRIVATE)
                val isFirstLaunch = sharedPref.getBoolean("is_first_launch", true)

                if (isFirstLaunch) {
                    // Create default user if doesn't exist
                    val users = userRepository.getAllUsers()
                    if (users.isEmpty()) {
                        val defaultUser = com.supermark.app.data.model.User(
                            id = java.util.UUID.randomUUID().toString(),
                            email = "admin@supermark.local",
                            password = "admin123", // In production, use bcrypt hash
                            name = "Administrator",
                            role = "admin",
                            createdAt = System.currentTimeMillis(),
                            updatedAt = System.currentTimeMillis()
                        )
                        userRepository.insertUser(defaultUser)

                        // Create 30-day trial license for default user
                        licenseRepository.createTrialLicense(defaultUser.id, 30)
                    } else {
                        // If users exist, create license for each user without one
                        for (user in users) {
                            val existingLicense = licenseRepository.getActiveLicenseForUser(user.id)
                            if (existingLicense == null) {
                                licenseRepository.createTrialLicense(user.id, 30)
                            }
                        }
                    }

                    // Mark first launch as completed
                    sharedPref.edit().putBoolean("is_first_launch", false).apply()
                }
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
    }
}
