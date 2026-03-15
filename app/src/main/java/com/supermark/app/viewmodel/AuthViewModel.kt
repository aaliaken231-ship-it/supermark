package com.supermark.app.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.supermark.app.data.model.User
import com.supermark.app.data.repository.UserRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject
import java.util.UUID

@HiltViewModel
class AuthViewModel @Inject constructor(
    private val userRepository: UserRepository
) : ViewModel() {

    sealed class AuthState {
        object Loading : AuthState()
        object Unauthenticated : AuthState()
        data class Authenticated(val user: User) : AuthState()
        data class Error(val message: String) : AuthState()
    }

    private val _authState = MutableStateFlow<AuthState>(AuthState.Loading)
    val authState: StateFlow<AuthState> = _authState.asStateFlow()

    private val _loading = MutableStateFlow(false)
    val loading: StateFlow<Boolean> = _loading.asStateFlow()

    private val _error = MutableStateFlow<String?>(null)
    val error: StateFlow<String?> = _error.asStateFlow()

    init {
        checkAuthStatus()
    }

    private fun checkAuthStatus() {
        viewModelScope.launch {
            _authState.value = AuthState.Loading
            try {
                val userId = userRepository.getCurrentUserId()
                if (userId != null) {
                    val user = userRepository.getUserById(userId)
                    if (user != null) {
                        _authState.value = AuthState.Authenticated(user)
                    } else {
                        _authState.value = AuthState.Unauthenticated
                    }
                } else {
                    _authState.value = AuthState.Unauthenticated
                }
            } catch (e: Exception) {
                _authState.value = AuthState.Error(e.message ?: "Unknown error")
            }
        }
    }

    fun login(email: String, password: String) {
        viewModelScope.launch {
            _loading.value = true
            _error.value = null
            try {
                val user = userRepository.getUserByEmail(email)
                if (user != null && user.password == password) {
                    userRepository.saveCurrentUserId(user.id)
                    _authState.value = AuthState.Authenticated(user)
                } else {
                    _error.value = "Invalid email or password"
                }
            } catch (e: Exception) {
                _error.value = e.message ?: "Login failed"
            } finally {
                _loading.value = false
            }
        }
    }

    fun register(name: String, email: String, password: String) {
        viewModelScope.launch {
            _loading.value = true
            _error.value = null
            try {
                val existingUser = userRepository.getUserByEmail(email)
                if (existingUser != null) {
                    _error.value = "Email already exists"
                    _loading.value = false
                    return@launch
                }

                val newUser = User(
                    id = UUID.randomUUID().toString(),
                    email = email,
                    name = name,
                    password = password,
                    role = "user"
                )

                userRepository.insertUser(newUser)
                userRepository.saveCurrentUserId(newUser.id)
                _authState.value = AuthState.Authenticated(newUser)
            } catch (e: Exception) {
                _error.value = e.message ?: "Registration failed"
            } finally {
                _loading.value = false
            }
        }
    }

    fun logout() {
        viewModelScope.launch {
            try {
                userRepository.clearCurrentUserId()
                _authState.value = AuthState.Unauthenticated
            } catch (e: Exception) {
                _error.value = e.message ?: "Logout failed"
            }
        }
    }

    fun clearError() {
        _error.value = null
    }
}
