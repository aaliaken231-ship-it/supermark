package com.supermark.app.network

import com.supermark.app.data.model.License
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.Path

interface LicenseApiService {
    
    @POST("api/licenses/validate")
    suspend fun validateLicense(
        @Body request: ValidateLicenseRequest
    ): ValidateLicenseResponse

    @POST("api/licenses/download")
    suspend fun downloadLicense(
        @Body request: DownloadLicenseRequest
    ): License

    @GET("api/licenses/{licenseId}")
    suspend fun getLicenseDetails(
        @Path("licenseId") licenseId: String
    ): License

    @POST("api/licenses/{licenseId}/extend")
    suspend fun extendLicense(
        @Path("licenseId") licenseId: String,
        @Body request: ExtendLicenseRequest
    ): License

    @POST("api/licenses/create-trial")
    suspend fun createTrialLicense(
        @Body request: CreateTrialLicenseRequest
    ): License
}

data class ValidateLicenseRequest(
    val key: String,
    val userId: String
)

data class ValidateLicenseResponse(
    val isValid: Boolean,
    val message: String,
    val license: License? = null
)

data class DownloadLicenseRequest(
    val key: String,
    val email: String
)

data class ExtendLicenseRequest(
    val additionalDays: Int
)

data class CreateTrialLicenseRequest(
    val userId: String,
    val daysValidity: Int = 30
)

// Singleton pour Retrofit
object RetrofitClient {
    private const val BASE_URL = "https://api.supermark.com/"

    fun getInstance(): LicenseApiService {
        return retrofit2.Retrofit.Builder()
            .baseUrl(BASE_URL)
            .addConverterFactory(com.google.gson.Gson())
            .build()
            .create(LicenseApiService::class.java)
    }
}
