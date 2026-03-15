# Guide d'Intégration du Système de Licences - SuperMark Android

## Table des Matières

1. [Vue d'ensemble](#vue-densemble)
2. [Architecture](#architecture)
3. [Intégration API Backend](#intégration-api-backend)
4. [Exemples d'Utilisation](#exemples-dutilisation)
5. [Tests](#tests)
6. [Déploiement](#déploiement)

---

## Vue d'ensemble

Le système de licences SuperMark Android est conçu pour :

- ✅ Activer automatiquement une licence de 30 jours au premier lancement
- ✅ Gérer différents types de plans (Trial, Professional, Enterprise)
- ✅ Suivre les jours d'expiration en temps réel
- ✅ Renouveler et télécharger les licences
- ✅ Intégrer facilement avec un backend

---

## Architecture

### 1. Couches du Système

```
┌─────────────────────────────────────────────┐
│           UI Layer                          │
│  - LicenseScreen                            │
│  - Settings Integration                     │
│  - LicenseViewModel                         │
└──────────────┬────────────────────────────────┘
               │
┌──────────────▼────────────────────────────────┐
│      Business Logic Layer                   │
│  - LicenseRepository                        │
│  - LicenseService                           │
│  - LicenseViewModel                         │
└──────────────┬────────────────────────────────┘
               │
┌──────────────▼────────────────────────────────┐
│      Data Access Layer                      │
│  - LicenseDao (Room)                        │
│  - License Entity                           │
│  - Database                                 │
└──────────────┬────────────────────────────────┘
               │
┌──────────────▼────────────────────────────────┐
│      Network Layer (Optional)               │
│  - ApiService (Retrofit)                    │
│  - API Calls to Backend                     │
└─────────────────────────────────────────────┘
```

### 2. Flux de Données

#### Initialisation (Premier lancement)

```
Application.onCreate()
    ↓
LicenseService.initializeFirstLaunch()
    ↓
- Vérifie is_first_launch_license flag
- Crée utilisateur par défaut si nécessaire
- Crée licence d'essai 30 jours
- Marque is_first_launch_license = false
    ↓
Licence active !
```

#### Chargement d'une licence

```
LicenseScreen.LaunchedEffect
    ↓
LicenseViewModel.loadLicenseForUser(userId)
    ↓
LicenseRepository.getActiveLicenseForUser(userId)
    ↓
LicenseDao.getActiveLicenseForUser(userId)
    ↓
Affiche licence ou "Aucune Licence"
```

#### Renouvellement d'une licence

```
User clicks "Renouveler"
    ↓
LicenseViewModel.extendLicense(licenseId, days)
    ↓
LicenseRepository.extendLicense()
    ↓
- Récupère la licence
- Ajoute N jours à expiresAt
- Met à jour la base de données
    ↓
Interface mise à jour
```

---

## Intégration API Backend

### 1. Configuration Retrofit

#### Ajouter les dépendances (build.gradle.kts)

```gradle
dependencies {
    // Retrofit
    implementation("com.squareup.retrofit2:retrofit:2.9.0")
    implementation("com.squareup.retrofit2:converter-gson:2.9.0")
    
    // OkHttp Logging
    implementation("com.squareup.okhttp3:logging-interceptor:4.11.0")
}
```

#### Créer un client Retrofit personnalisé

```kotlin
// app/src/main/java/com/supermark/app/network/RetrofitClient.kt

object RetrofitClient {
    private const val BASE_URL = "https://api.supermark.com/"

    private val httpClient: OkHttpClient by lazy {
        OkHttpClient.Builder()
            .connectTimeout(30, TimeUnit.SECONDS)
            .readTimeout(30, TimeUnit.SECONDS)
            .writeTimeout(30, TimeUnit.SECONDS)
            .addInterceptor(HttpLoggingInterceptor().apply {
                level = HttpLoggingInterceptor.Level.BODY
            })
            .addInterceptor { chain ->
                val original = chain.request()
                val requestBuilder = original.newBuilder()
                    .header("Content-Type", "application/json")
                    .header("Accept", "application/json")
                
                val request = requestBuilder.build()
                chain.proceed(request)
            }
            .build()
    }

    fun createService(): LicenseApiService {
        return Retrofit.Builder()
            .baseUrl(BASE_URL)
            .client(httpClient)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
            .create(LicenseApiService::class.java)
    }
}
```

### 2. Endpoints API à Implémenter

#### POST `/api/licenses/validate`

**Request:**
```json
{
    "key": "XXXX-XXXX-XXXX-XXXX",
    "userId": "user-123"
}
```

**Response (Success):**
```json
{
    "isValid": true,
    "message": "License is valid",
    "license": {
        "id": "lic-456",
        "userId": "user-123",
        "key": "XXXX-XXXX-XXXX-XXXX",
        "plan": "professional",
        "maxUsers": 10,
        "maxProducts": 5000,
        "maxSalesPerMonth": 100000,
        "expiresAt": 1789512000000,
        "status": "active",
        "createdAt": 1694476800000,
        "updatedAt": 1694476800000
    }
}
```

**Response (Failure):**
```json
{
    "isValid": false,
    "message": "License key not found",
    "license": null
}
```

#### POST `/api/licenses/download`

**Request:**
```json
{
    "key": "XXXX-XXXX-XXXX-XXXX",
    "email": "user@example.com"
}
```

**Response:**
```json
{
    "id": "lic-456",
    "userId": "user-123",
    "key": "XXXX-XXXX-XXXX-XXXX",
    "plan": "professional",
    "maxUsers": 10,
    "maxProducts": 5000,
    "maxSalesPerMonth": 100000,
    "expiresAt": 1789512000000,
    "status": "active",
    "createdAt": 1694476800000,
    "updatedAt": 1694476800000
}
```

#### GET `/api/licenses/{licenseId}`

**Response:**
```json
{
    "id": "lic-456",
    "userId": "user-123",
    "key": "XXXX-XXXX-XXXX-XXXX",
    "plan": "professional",
    "maxUsers": 10,
    "maxProducts": 5000,
    "maxSalesPerMonth": 100000,
    "expiresAt": 1789512000000,
    "status": "active",
    "createdAt": 1694476800000,
    "updatedAt": 1694476800000
}
```

#### POST `/api/licenses/{licenseId}/extend`

**Request:**
```json
{
    "additionalDays": 30
}
```

**Response:**
```json
{
    "id": "lic-456",
    "userId": "user-123",
    "key": "XXXX-XXXX-XXXX-XXXX",
    "plan": "professional",
    "maxUsers": 10,
    "maxProducts": 5000,
    "maxSalesPerMonth": 100000,
    "expiresAt": 1790121600000,
    "status": "active",
    "createdAt": 1694476800000,
    "updatedAt": 1694563200000
}
```

#### POST `/api/licenses/create-trial`

**Request:**
```json
{
    "userId": "user-123",
    "daysValidity": 30
}
```

**Response:**
```json
{
    "id": "lic-789",
    "userId": "user-123",
    "key": "YYYY-YYYY-YYYY-YYYY",
    "plan": "trial",
    "maxUsers": 5,
    "maxProducts": 500,
    "maxSalesPerMonth": 10000,
    "expiresAt": 1694563200000,
    "status": "active",
    "createdAt": 1694476800000,
    "updatedAt": 1694476800000
}
```

### 3. Intégration dans le Repository

```kotlin
// Modifier LicenseRepository.kt

@Singleton
class LicenseRepository @Inject constructor(
    private val licenseDao: LicenseDao,
    private val apiService: LicenseApiService // Ajouter injection
) {
    
    suspend fun downloadLicense(licenseKey: String, email: String): License? {
        return try {
            val request = DownloadLicenseRequest(licenseKey, email)
            val response = apiService.downloadLicense(request)
            
            // Sauvegarder dans la base de données locale
            insertLicense(response)
            response
        } catch (e: Exception) {
            null
        }
    }

    suspend fun validateLicenseOnline(key: String, userId: String): Boolean {
        return try {
            val request = ValidateLicenseRequest(key, userId)
            val response = apiService.validateLicense(request)
            
            if (response.isValid && response.license != null) {
                insertLicense(response.license)
                true
            } else {
                false
            }
        } catch (e: Exception) {
            false
        }
    }

    suspend fun syncLicenseWithBackend(licenseId: String): License? {
        return try {
            apiService.getLicenseDetails(licenseId)
        } catch (e: Exception) {
            null
        }
    }
}
```

### 4. Module d'Injection pour l'API

```kotlin
// Créer app/src/main/java/com/supermark/app/di/NetworkModule.kt

@Module
@InstallIn(SingletonComponent::class)
object NetworkModule {

    @Singleton
    @Provides
    fun provideLicenseApiService(): LicenseApiService {
        return RetrofitClient.createService()
    }
}
```

---

## Exemples d'Utilisation

### 1. Charger une licence au démarrage d'un écran

```kotlin
@Composable
fun MyScreen(
    licenseViewModel: LicenseViewModel,
    authViewModel: AuthViewModel
) {
    val authState = authViewModel.authState.collectAsState()
    val userId = (authState.value as? AuthState.Authenticated)?.user?.id

    LaunchedEffect(userId) {
        if (userId != null) {
            licenseViewModel.loadLicenseForUser(userId)
        }
    }

    // Afficher l'UI basée sur l'état
}
```

### 2. Créer une licence d'essai

```kotlin
fun onCreateTrialClick(userId: String) {
    licenseViewModel.createTrialLicense(userId, 30)
}
```

### 3. Renouveler une licence

```kotlin
fun onRenewClick(licenseId: String) {
    licenseViewModel.extendLicense(licenseId, 30)
}
```

### 4. Télécharger une licence depuis le backend

```kotlin
@HiltViewModel
class LicenseViewModel @Inject constructor(
    private val licenseRepository: LicenseRepository
) : ViewModel() {

    fun downloadLicenseByKey(key: String, email: String) {
        viewModelScope.launch {
            val license = licenseRepository.downloadLicense(key, email)
            if (license != null) {
                _licenseState.value = LicenseState.Success(license)
            } else {
                _licenseState.value = LicenseState.Error("Failed to download license")
            }
        }
    }
}
```

### 5. Vérifier la validité avant une action

```kotlin
suspend fun canPerformAction(userId: String): Boolean {
    return licenseRepository.checkLicenseValidity(userId)
}

// Utilisation
if (canPerformAction(userId)) {
    // Effectuer l'action
    saveSale(sale)
} else {
    // Afficher message d'expiration
    showLicenseExpiredMessage()
}
```

---

## Tests

### 1. Tests Unitaires

```kotlin
// app/src/test/java/com/supermark/app/LicenseRepositoryTest.kt

@RunWith(MockitoJUnitRunner::class)
class LicenseRepositoryTest {

    @Mock
    private lateinit var licenseDao: LicenseDao

    private lateinit var repository: LicenseRepository

    @Before
    fun setUp() {
        repository = LicenseRepository(licenseDao)
    }

    @Test
    fun testCreateTrialLicense() = runBlocking {
        val userId = "user-123"
        val license = repository.createTrialLicense(userId, 30)

        assertNotNull(license)
        assertEquals("trial", license.plan)
        assertEquals(userId, license.userId)
    }

    @Test
    fun testCheckLicenseValidity() = runBlocking {
        val userId = "user-123"
        val isValid = repository.checkLicenseValidity(userId)

        // Mock should return true for valid license
        assertTrue(isValid)
    }

    @Test
    fun testGetDaysRemaining() = runBlocking {
        val userId = "user-123"
        val days = repository.getDaysRemainingForLicense(userId)

        assertTrue(days > 0)
    }
}
```

### 2. Tests d'Intégration

```kotlin
// Tests avec la vraie base de données

@RunWith(AndroidJUnit4::class)
class LicenseIntegrationTest {

    @get:Rule
    val instantTaskExecutorRule = InstantTaskExecutorRule()

    private lateinit var database: SuperMarkDatabase
    private lateinit var licenseDao: LicenseDao
    private lateinit var repository: LicenseRepository

    @Before
    fun createDb() {
        val context = ApplicationProvider.getApplicationContext<Context>()
        database = Room.inMemoryDatabaseBuilder(
            context,
            SuperMarkDatabase::class.java
        ).build()

        licenseDao = database.licenseDao()
        repository = LicenseRepository(licenseDao)
    }

    @After
    fun closeDb() {
        database.close()
    }

    @Test
    fun insertAndRetrieveLicense() = runBlocking {
        val license = License(
            id = "test-1",
            userId = "user-1",
            key = "TEST-TEST-TEST",
            plan = "trial",
            maxUsers = 5,
            maxProducts = 500,
            maxSalesPerMonth = 10000,
            expiresAt = System.currentTimeMillis() + 30 * 24 * 60 * 60 * 1000
        )

        repository.insertLicense(license)
        val retrieved = licenseDao.getLicenseById("test-1")

        assertEquals(license.id, retrieved?.id)
        assertEquals(license.key, retrieved?.key)
    }
}
```

---

## Déploiement

### 1. Checklist Pre-Production

```
☐ Endpoints API configurés et testés
☐ Chiffrement des clés de licence implémenté
☐ Validation serveur en place
☐ Tests unitaires à 100%
☐ Tests d'intégration validés
☐ Logs sensibles supprimés
☐ ProGuard/R8 configuré pour l'obfuscation
☐ Certificat SSL valide pour l'API
☐ Rate limiting mis en place
☐ Monitoring/Logging en place
```

### 2. Configuration de Release

```gradle
// build.gradle.kts

buildTypes {
    release {
        isMinifyEnabled = true
        proguardFiles(
            getDefaultProguardFile("proguard-android-optimize.txt"),
            "proguard-rules.pro"
        )
        signingConfig = signingConfigs.getByName("release")
    }
}
```

### 3. Versionning

```
Version: 1.0.0
Format: MAJOR.MINOR.PATCH

1.0.0 - Première version avec système de licence automatique
1.0.1 - Correction de bugs
1.1.0 - Nouvelle fonctionnalité X
```

---

## Troubleshooting

### Problème : "Licence non trouvée"

**Solution** :
```kotlin
// Vérifier que l'initialisation a eu lieu
val hasRun = sharedPref.getBoolean("is_first_launch_license", true)
if (hasRun) {
    licenseService.initializeFirstLaunch()
}
```

### Problème : Jours restants négatifs

**Solution** :
```kotlin
// S'assurer que expiresAt est en future
val days = (license.expiresAt - System.currentTimeMillis()) / (1000 * 60 * 60 * 24)
val safeDays = days.toInt().coerceAtLeast(0) // Minimum 0
```

### Problème : Timeout API

**Solution** :
```kotlin
// Augmenter les timeouts
.connectTimeout(60, TimeUnit.SECONDS)
.readTimeout(60, TimeUnit.SECONDS)
.writeTimeout(60, TimeUnit.SECONDS)
```

---

**Dernière mise à jour** : 15/03/2026
**Version du guide** : 1.0.0
