package com.supermark.app.data.dao

import androidx.room.Dao
import androidx.room.Delete
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Update
import com.supermark.app.data.model.License
import kotlinx.coroutines.flow.Flow

@Dao
interface LicenseDao {

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertLicense(license: License)

    @Update
    suspend fun updateLicense(license: License)

    @Delete
    suspend fun deleteLicense(license: License)

    @Query("SELECT * FROM licenses WHERE id = :licenseId")
    suspend fun getLicenseById(licenseId: String): License?

    @Query("SELECT * FROM licenses WHERE userId = :userId")
    suspend fun getLicenseByUserId(userId: String): License?

    @Query("SELECT * FROM licenses WHERE userId = :userId AND status = 'active' LIMIT 1")
    suspend fun getActiveLicenseForUser(userId: String): License?

    @Query("SELECT * FROM licenses WHERE `key` = :key LIMIT 1")
    suspend fun getLicenseByKey(key: String): License?

    @Query("SELECT * FROM licenses")
    fun getAllLicenses(): Flow<List<License>>

    @Query("SELECT * FROM licenses WHERE status = 'active'")
    fun getActiveLicenses(): Flow<List<License>>

    @Query("SELECT * FROM licenses WHERE status = 'active' AND expiresAt > :currentTime")
    suspend fun getAllActiveLicenses(currentTime: Long = System.currentTimeMillis()): List<License>

    @Query("SELECT COUNT(*) FROM licenses")
    suspend fun getLicenseCount(): Int

    @Query("DELETE FROM licenses WHERE id = :licenseId")
    suspend fun deleteLicenseById(licenseId: String)
}
