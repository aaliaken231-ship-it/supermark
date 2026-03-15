package com.supermark.app.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.supermark.app.data.model.License
import com.supermark.app.data.repository.LicenseRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class LicenseViewModel @Inject constructor(
    private val licenseRepository: LicenseRepository
) : ViewModel() {

    private val _licenseState = MutableStateFlow<LicenseState>(LicenseState.Loading)
    val licenseState: StateFlow<LicenseState> = _licenseState

    private val _daysRemaining = MutableStateFlow(0)
    val daysRemaining: StateFlow<Int> = _daysRemaining

    private val _isLicenseValid = MutableStateFlow(false)
    val isLicenseValid: StateFlow<Boolean> = _isLicenseValid

    fun loadLicenseForUser(userId: String) {
        viewModelScope.launch {
            try {
                _licenseState.value = LicenseState.Loading
                val license = licenseRepository.getActiveLicenseForUser(userId)

                if (license != null) {
                    _licenseState.value = LicenseState.Success(license)
                    val isValid = licenseRepository.checkLicenseValidity(userId)
                    _isLicenseValid.value = isValid
                    
                    if (isValid) {
                        val days = licenseRepository.getDaysRemainingForLicense(userId)
                        _daysRemaining.value = days
                    }
                } else {
                    _licenseState.value = LicenseState.NoLicense
                    _isLicenseValid.value = false
                    _daysRemaining.value = 0
                }
            } catch (e: Exception) {
                _licenseState.value = LicenseState.Error(e.message ?: "Unknown error")
            }
        }
    }

    fun createTrialLicense(userId: String, daysValidity: Int = 30) {
        viewModelScope.launch {
            try {
                _licenseState.value = LicenseState.Loading
                val license = licenseRepository.createTrialLicense(userId, daysValidity)
                _licenseState.value = LicenseState.Success(license)
                _isLicenseValid.value = true
                _daysRemaining.value = daysValidity
            } catch (e: Exception) {
                _licenseState.value = LicenseState.Error(e.message ?: "Failed to create license")
            }
        }
    }

    fun extendLicense(licenseId: String, additionalDays: Int) {
        viewModelScope.launch {
            try {
                licenseRepository.extendLicense(licenseId, additionalDays)
                _daysRemaining.value = (_daysRemaining.value + additionalDays).coerceAtMost(365)
                _licenseState.value = (_licenseState.value as? LicenseState.Success)?.let { current ->
                    LicenseState.Success(
                        current.license.copy(
                            expiresAt = current.license.expiresAt + (additionalDays * 24 * 60 * 60 * 1000),
                            updatedAt = System.currentTimeMillis()
                        )
                    )
                } ?: _licenseState.value
            } catch (e: Exception) {
                _licenseState.value = LicenseState.Error(e.message ?: "Failed to extend license")
            }
        }
    }

    fun validateLicenseKey(key: String) {
        viewModelScope.launch {
            try {
                val isValid = licenseRepository.validateLicenseKey(key)
                if (isValid) {
                    // If valid, you would typically activate it here
                } else {
                    _licenseState.value = LicenseState.Error("Invalid license key")
                }
            } catch (e: Exception) {
                _licenseState.value = LicenseState.Error(e.message ?: "Failed to validate license")
            }
        }
    }

    sealed class LicenseState {
        object Loading : LicenseState()
        object NoLicense : LicenseState()
        data class Success(val license: License) : LicenseState()
        data class Error(val message: String) : LicenseState()
    }
}
