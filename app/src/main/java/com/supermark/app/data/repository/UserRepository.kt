package com.supermark.app.data.repository

import android.security.keystore.KeyGenParameterSpec
import android.security.keystore.KeyProperties
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey
import com.supermark.app.data.dao.UserDao
import com.supermark.app.data.model.User
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import kotlinx.coroutines.withContext
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class UserRepository @Inject constructor(
    private val userDao: UserDao,
    private val encryptedPreferences: EncryptedSharedPreferences
) {

    fun getAllUsers(): Flow<List<User>> = userDao.getAllUsers()

    suspend fun getUserById(userId: String): User? = withContext(Dispatchers.IO) {
        userDao.getUserById(userId)
    }

    suspend fun getUserByEmail(email: String): User? = withContext(Dispatchers.IO) {
        userDao.getUserByEmail(email)
    }

    suspend fun insertUser(user: User) = withContext(Dispatchers.IO) {
        userDao.insertUser(user)
    }

    suspend fun updateUser(user: User) = withContext(Dispatchers.IO) {
        userDao.updateUser(user)
    }

    suspend fun deleteUser(userId: String) = withContext(Dispatchers.IO) {
        userDao.deleteUserById(userId)
    }

    suspend fun saveCurrentUserId(userId: String) = withContext(Dispatchers.IO) {
        encryptedPreferences.edit().putString("current_user_id", userId).apply()
    }

    suspend fun getCurrentUserId(): String? = withContext(Dispatchers.IO) {
        encryptedPreferences.getString("current_user_id", null)
    }

    suspend fun clearCurrentUserId() = withContext(Dispatchers.IO) {
        encryptedPreferences.edit().remove("current_user_id").apply()
    }
}
