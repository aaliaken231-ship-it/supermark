package com.supermark.app.data.repository

import com.supermark.app.data.dao.LicenseDao
import com.supermark.app.data.model.License
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.withContext
import javax.inject.Inject
import javax.inject.Singleton
import java.util.UUID
import java.util.Calendar

@Singleton
class LicenseRepository @Inject constructor(
    private val licenseDao: LicenseDao
) {

    fun getAllLicenses(): Flow<List<License>> = licenseDao.getAllLicenses()

    fun getLicensesByUserId(userId: String): Flow<List<License>> = 
        licenseDao.getLicensesByUserId(userId)

    suspend fun getLicenseById(licenseId: String): License? = withContext(Dispatchers.IO) {
        licenseDao.getLicenseById(licenseId)
    }

    suspend fun getActiveLicenseForUser(userId: String): License? = withContext(Dispatchers.IO) {
        licenseDao.getActiveLicenseForUser(userId)
    }

    suspend fun insertLicense(license: License) = withContext(Dispatchers.IO) {
        licenseDao.insertLicense(license)
    }

    suspend fun updateLicense(license: License) = withContext(Dispatchers.IO) {
        licenseDao.updateLicense(license)
    }

    suspend fun deleteLicense(licenseId: String) = withContext(Dispatchers.IO) {
        licenseDao.deleteLicenseById(licenseId)
    }

    suspend fun getLicenseCount(): Int = withContext(Dispatchers.IO) {
        licenseDao.getLicenseCount()
    }

    suspend fun createTrialLicense(
        userId: String,
        daysValidity: Int = 30,
        plan: String = "trial"
    ) = withContext(Dispatchers.IO) {
        val calendar = Calendar.getInstance()
        calendar.add(Calendar.DAY_OF_MONTH, daysValidity)
        val expiresAt = calendar.timeInMillis

        val license = License(
            id = UUID.randomUUID().toString(),
            userId = userId,
            key = generateLicenseKey(),
            plan = plan,
            maxUsers = 5,
            maxProducts = 500,
            maxSalesPerMonth = 10000,
            expiresAt = expiresAt,
            status = "active",
            createdAt = System.currentTimeMillis(),
            updatedAt = System.currentTimeMillis()
        )

        insertLicense(license)
        license
    }

    suspend fun createPremiumLicense(
        userId: String,
        daysValidity: Int = 365,
        plan: String = "professional",
        maxUsers: Int = 10,
        maxProducts: Int = 5000,
        maxSalesPerMonth: Int = 100000
    ) = withContext(Dispatchers.IO) {
        val calendar = Calendar.getInstance()
        calendar.add(Calendar.DAY_OF_MONTH, daysValidity)
        val expiresAt = calendar.timeInMillis

        val license = License(
            id = UUID.randomUUID().toString(),
            userId = userId,
            key = generateLicenseKey(),
            plan = plan,
            maxUsers = maxUsers,
            maxProducts = maxProducts,
            maxSalesPerMonth = maxSalesPerMonth,
            expiresAt = expiresAt,
            status = "active",
            createdAt = System.currentTimeMillis(),
            updatedAt = System.currentTimeMillis()
        )

        insertLicense(license)
        license
    }

    suspend fun extendLicense(licenseId: String, additionalDays: Int) = withContext(Dispatchers.IO) {
        val license = licenseDao.getLicenseById(licenseId) ?: return@withContext null

        val calendar = Calendar.getInstance()
        calendar.timeInMillis = license.expiresAt
        calendar.add(Calendar.DAY_OF_MONTH, additionalDays)

        val updatedLicense = license.copy(
            expiresAt = calendar.timeInMillis,
            updatedAt = System.currentTimeMillis()
        )

        licenseDao.updateLicense(updatedLicense)
        updatedLicense
    }

    suspend fun checkLicenseValidity(userId: String): Boolean = withContext(Dispatchers.IO) {
        val license = licenseDao.getActiveLicenseForUser(userId)
        license != null && license.expiresAt > System.currentTimeMillis()
    }

    suspend fun getDaysRemainingForLicense(userId: String): Int = withContext(Dispatchers.IO) {
        val license = licenseDao.getActiveLicenseForUser(userId) ?: return@withContext 0

        val now = System.currentTimeMillis()
        val remaining = license.expiresAt - now
        val daysRemaining = remaining / (1000 * 60 * 60 * 24)

        return@withContext daysRemaining.toInt().coerceAtLeast(0)
    }

    suspend fun downloadLicense(licenseKey: String): License? = withContext(Dispatchers.IO) {
        // This would typically call a backend API
        // For now, we'll just return null to indicate failure
        // In production, implement actual API call
        null
    }

    suspend fun validateLicenseKey(key: String): Boolean = withContext(Dispatchers.IO) {
        // Validate license key format and check if it exists
        val license = licenseDao.getLicenseByKey(key)
        license != null && license.status == "active"
    }

    private fun generateLicenseKey(): String {
        val chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
        return (1..16)
            .map { chars.random() }
            .joinToString("")
            .chunked(4)
            .joinToString("-")
    }

    suspend fun getAllActiveLicenses(): List<License> = withContext(Dispatchers.IO) {
        licenseDao.getAllActiveLicenses()
    }
}
