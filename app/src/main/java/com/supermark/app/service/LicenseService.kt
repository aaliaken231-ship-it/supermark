package com.supermark.app.service

import android.content.Context
import android.content.SharedPreferences
import com.supermark.app.data.repository.LicenseRepository
import com.supermark.app.data.repository.UserRepository
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class LicenseService @Inject constructor(
    @ApplicationContext private val context: Context,
    private val licenseRepository: LicenseRepository,
    private val userRepository: UserRepository
) {

    private val sharedPreferences: SharedPreferences = 
        context.getSharedPreferences("supermark_license", Context.MODE_PRIVATE)

    suspend fun initializeFirstLaunch(): Boolean = withContext(Dispatchers.IO) {
        try {
            val isFirstLaunch = sharedPreferences.getBoolean("is_first_launch_license", true)

            if (isFirstLaunch) {
                // Get or create default user
                var users = userRepository.getAllUsers()
                
                if (users.isEmpty()) {
                    val defaultUser = com.supermark.app.data.model.User(
                        id = java.util.UUID.randomUUID().toString(),
                        email = "admin@supermark.local",
                        password = hashPassword("admin123"),
                        name = "Administrator",
                        role = "admin",
                        createdAt = System.currentTimeMillis(),
                        updatedAt = System.currentTimeMillis()
                    )
                    userRepository.insertUser(defaultUser)
                    users = listOf(defaultUser)
                }

                // Create trial licenses for users without one
                for (user in users) {
                    val existingLicense = licenseRepository.getActiveLicenseForUser(user.id)
                    if (existingLicense == null) {
                        licenseRepository.createTrialLicense(user.id, 30)
                        markUserHasLicense(user.id)
                    }
                }

                sharedPreferences.edit().putBoolean("is_first_launch_license", false).apply()
                return@withContext true
            }
            
            return@withContext false
        } catch (e: Exception) {
            e.printStackTrace()
            return@withContext false
        }
    }

    suspend fun ensureUserHasLicense(userId: String): Boolean = withContext(Dispatchers.IO) {
        try {
            val existingLicense = licenseRepository.getActiveLicenseForUser(userId)
            
            if (existingLicense == null) {
                licenseRepository.createTrialLicense(userId, 30)
                markUserHasLicense(userId)
                return@withContext true
            }

            return@withContext false
        } catch (e: Exception) {
            e.printStackTrace()
            return@withContext false
        }
    }

    suspend fun isLicenseValid(userId: String): Boolean = withContext(Dispatchers.IO) {
        licenseRepository.checkLicenseValidity(userId)
    }

    suspend fun getDaysRemaining(userId: String): Int = withContext(Dispatchers.IO) {
        licenseRepository.getDaysRemainingForLicense(userId)
    }

    private fun markUserHasLicense(userId: String) {
        sharedPreferences.edit().putBoolean("user_$userId:has_license", true).apply()
    }

    private fun hashPassword(password: String): String {
        // In production, use bcrypt: BCrypt.hashpw(password, BCrypt.gensalt())
        // For now, return the password as is (NOT RECOMMENDED FOR PRODUCTION)
        return password
    }
}
