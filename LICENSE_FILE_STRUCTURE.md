# Structure des Fichiers - Système de Licences SuperMark

## Hiérarchie Complète

```
app/src/main/
├── java/com/supermark/app/
│   ├── SuperMarkApplication.kt ✨ MODIFIÉ
│   │   └── Initialisation automatique des licences
│   │
│   ├── MainActivity.kt
│   │
│   ├── di/
│   │   ├── DatabaseModule.kt
│   │   ├── PreferencesModule.kt
│   │   ├── RepositoryModule.kt ✨ MODIFIÉ
│   │   │   └── Ajout provideLicenseRepository()
│   │   └── NetworkModule.kt (optionnel)
│   │
│   ├── data/
│   │   ├── database/
│   │   │   └── SuperMarkDatabase.kt
│   │   │
│   │   ├── model/
│   │   │   ├── License.kt ✅ (existant)
│   │   │   ├── User.kt
│   │   │   ├── Product.kt
│   │   │   ├── Customer.kt
│   │   │   ├── Sale.kt
│   │   │   ├── Transaction.kt
│   │   │   └── InventoryLog.kt
│   │   │
│   │   ├── dao/
│   │   │   ├── LicenseDao.kt ✨ MODIFIÉ
│   │   │   │   ├── getActiveLicenseForUser()
│   │   │   │   ├── getLicenseByKey()
│   │   │   │   └── getAllActiveLicenses()
│   │   │   ├── UserDao.kt
│   │   │   ├── ProductDao.kt
│   │   │   ├── CustomerDao.kt
│   │   │   ├── SaleDao.kt
│   │   │   ├── TransactionDao.kt
│   │   │   └── InventoryLogDao.kt
│   │   │
│   │   └── repository/
│   │       ├── LicenseRepository.kt ✅ NOUVEAU
│   │       │   ├── Création de licences
│   │       │   ├── Validation
│   │       │   ├── Renouvellement
│   │       │   └── Calcul des jours
│   │       ├── UserRepository.kt
│   │       ├── ProductRepository.kt
│   │       ├── CustomerRepository.kt
│   │       ├── SaleRepository.kt
│   │       ├── TransactionRepository.kt
│   │       └── InventoryRepository.kt
│   │
│   ├── service/
│   │   └── LicenseService.kt ✅ NOUVEAU
│   │       ├── Initialisation au lancement
│   │       ├── Vérification d'intégrité
│   │       └── Gestion des prefs
│   │
│   ├── network/
│   │   └── ApiService.kt ✅ NOUVEAU
│   │       ├── LicenseApiService
│   │       └── Modèles de requête/réponse
│   │
│   ├── ui/
│   │   ├── theme/
│   │   │   ├── Theme.kt
│   │   │   └── Type.kt
│   │   │
│   │   ├── navigation/
│   │   │   └── SuperMarkNavHost.kt ✨ MODIFIÉ
│   │   │       ├── Ajout composable License
│   │   │       └── Objet Screen.License
│   │   │
│   │   ├── screens/
│   │   │   ├── auth/
│   │   │   │   ├── LoginScreen.kt
│   │   │   │   └── RegisterScreen.kt
│   │   │   │
│   │   │   ├── dashboard/
│   │   │   │   └── DashboardScreen.kt
│   │   │   │
│   │   │   ├── products/
│   │   │   │   └── ProductsScreen.kt
│   │   │   │
│   │   │   ├── sales/
│   │   │   │   └── SalesScreen.kt
│   │   │   │
│   │   │   ├── customers/
│   │   │   │   └── CustomersScreen.kt
│   │   │   │
│   │   │   ├── settings/
│   │   │   │   └── SettingsScreen.kt ✨ MODIFIÉ
│   │   │   │       └── Navigation vers License
│   │   │   │
│   │   │   └── license/ ✅ NOUVEAU DOSSIER
│   │   │       └── LicenseScreen.kt
│   │   │           ├── Affichage du statut
│   │   │           ├── Barre de progression
│   │   │           ├── Détails
│   │   │           └── Actions
│   │   │
│   │   └── components/ (optionnel)
│   │
│   ├── viewmodel/
│   │   ├── AuthViewModel.kt
│   │   ├── ProductViewModel.kt
│   │   ├── SaleViewModel.kt
│   │   ├── CustomerViewModel.kt
│   │   ├── TransactionViewModel.kt
│   │   └── LicenseViewModel.kt ✅ NOUVEAU
│   │       ├── Gestion d'état
│   │       ├── Chargement de licence
│   │       ├── Création/renouvellement
│   │       └── Validation
│   │
│   └── utils/ (optionnel)
│
├── res/
│   ├── values/
│   │   ├── strings.xml ✨ MODIFIÉ
│   │   │   └── Ajout 24 strings pour les licences
│   │   ├── colors.xml
│   │   ├── themes.xml
│   │   ├── attrs.xml
│   │   └── dimens.xml
│   │
│   ├── drawable/ (optionnel)
│   │
│   └── menu/ (optionnel)
│
└── AndroidManifest.xml

Racine du Projet/
├── build.gradle.kts ✅ (build configuration)
├── settings.gradle.kts
├── gradle.properties
├── app/build.gradle.kts
├── app/proguard-rules.pro
│
├── LICENSE_MANAGEMENT.md ✅ NOUVEAU
│   └── Guide complet du système
│
├── LICENSE_INTEGRATION_GUIDE.md ✅ NOUVEAU
│   └── Guide d'intégration API
│
├── LICENSE_CHANGELOG.md ✅ NOUVEAU
│   └── Historique des changements
│
└── LICENSE_FILE_STRUCTURE.md (CE FICHIER)
    └── Structure et organisation
```

## Détail des Fichiers

### 1. Fichiers Créés (7 fichiers)

#### Data Layer

**LicenseRepository.kt** (161 lignes)
```
Location: app/src/main/java/com/supermark/app/data/repository/
Dépendances: LicenseDao
Responsabilités:
  - Créer/renouveler les licences
  - Valider les clés
  - Calculer les jours restants
  - Télécharger des licences (API)
  - Vérifier la validité
Méthodes principales:
  ✓ createTrialLicense()
  ✓ extendLicense()
  ✓ checkLicenseValidity()
  ✓ getDaysRemainingForLicense()
  ✓ downloadLicense()
```

#### Business Logic Layer

**LicenseService.kt** (100 lignes)
```
Location: app/src/main/java/com/supermark/app/service/
Dépendances: LicenseRepository, UserRepository
Responsabilités:
  - Initialiser au premier lancement
  - Assurer qu'un utilisateur a une licence
  - Gérer les SharedPreferences
Méthodes principales:
  ✓ initializeFirstLaunch()
  ✓ ensureUserHasLicense()
  ✓ isLicenseValid()
  ✓ getDaysRemaining()
```

**LicenseViewModel.kt** (108 lignes)
```
Location: app/src/main/java/com/supermark/app/viewmodel/
Dépendances: LicenseRepository
Responsabilités:
  - Gérer l'état de l'UI
  - Charger les licences
  - Créer/renouveler
  - Valider les clés
États:
  • Loading
  • NoLicense
  • Success
  • Error
```

#### UI Layer

**LicenseScreen.kt** (444 lignes)
```
Location: app/src/main/java/com/supermark/app/ui/screens/license/
Dépendances: LicenseViewModel, AuthViewModel
Responsabilités:
  - Afficher le statut de licence
  - Barre de progression
  - Détails de licence
  - Boutons d'action
Composants:
  • États de chargement/erreur
  • Licence active (avec détails)
  • Aucune licence (créer essai)
  • Barre de progression
  • Boutons (Renouveler, Télécharger)
```

#### Network Layer

**ApiService.kt** (75 lignes)
```
Location: app/src/main/java/com/supermark/app/network/
Responsabilités:
  - Interface Retrofit pour les API
  - Modèles de requête/réponse
  - Configuration client
Endpoints:
  - POST /api/licenses/validate
  - POST /api/licenses/download
  - GET /api/licenses/{id}
  - POST /api/licenses/{id}/extend
  - POST /api/licenses/create-trial
```

#### Documentation

**LICENSE_MANAGEMENT.md** (474 lignes)
- Vue d'ensemble du système
- Activation automatique
- Architecture détaillée
- Utilisation de l'écran
- Fonctionnalités
- Structure DB
- Troubleshooting

**LICENSE_INTEGRATION_GUIDE.md** (641 lignes)
- Intégration API Retrofit
- Endpoints requis
- Exemples d'utilisation
- Tests unitaires/intégration
- Checklist déploiement
- Troubleshooting avancé

**LICENSE_CHANGELOG.md** (369 lignes)
- Historique complet
- Changements techniques
- Fichiers modifiés/créés
- Exemples d'utilisation
- Checklist de validation

### 2. Fichiers Modifiés (5 fichiers)

#### SuperMarkApplication.kt
```diff
- class SuperMarkApplication : Application()
+ class SuperMarkApplication : Application() {
+     @Inject lateinit var licenseRepository: LicenseRepository
+     @Inject lateinit var userRepository: UserRepository
+     
+     override fun onCreate() {
+         super.onCreate()
+         initializeFirstLaunchLicense()
+     }
+     
+     private fun initializeFirstLaunchLicense() { ... }
+ }
```

#### SettingsScreen.kt
```diff
- SettingsSection(...) { /* TODO: Show license info */ }
+ SettingsSection(...) { navController.navigate("license") }
```

#### SuperMarkNavHost.kt
```diff
+ import com.supermark.app.ui.screens.license.LicenseScreen
+ import com.supermark.app.viewmodel.LicenseViewModel

+ composable(Screen.License.route) {
+     val licenseViewModel: LicenseViewModel = hiltViewModel()
+     LicenseScreen(...)
+ }

+ object License : Screen("license")
```

#### LicenseDao.kt
```diff
+ suspend fun getActiveLicenseForUser(userId: String): License?
+ suspend fun getLicenseByKey(key: String): License?
+ suspend fun getAllActiveLicenses(currentTime: Long): List<License>
```

#### RepositoryModule.kt
```diff
+ import com.supermark.app.data.repository.LicenseRepository

+ @Provides
+ fun provideLicenseRepository(licenseDao: LicenseDao): LicenseRepository
```

#### strings.xml
```diff
+ <string name="license_title">Gestion des Licences</string>
+ <string name="license_active">Licence Active</string>
+ ... (24 nouvelles strings)
```

### 3. Dépendances Entre Fichiers

```
LicenseScreen.kt
    ↓
LicenseViewModel.kt
    ↓
LicenseRepository.kt
    ↓
LicenseDao.kt
    ↓
License.kt (Model)

SuperMarkApplication.kt
    ↓
LicenseService.kt
    ↓
LicenseRepository.kt
    ↓
UserRepository.kt

SuperMarkNavHost.kt
    ↓
LicenseScreen.kt
    ↓
SettingsScreen.kt
```

## Arborescence Gradle

```
supermark/
├── build.gradle.kts
├── settings.gradle.kts
├── gradle.properties
└── app/
    ├── build.gradle.kts ← Ajouter retrofit si API
    ├── proguard-rules.pro
    └── src/
        └── main/
            ├── AndroidManifest.xml
            ├── java/com/supermark/app/ ← Voir hiérarchie ci-dessus
            ├── res/
            │   ├── values/strings.xml ← Modifié
            │   └── ...
            └── ...
```

## Points d'Entrée

### 1. Initialisation (Au démarrage)
```kotlin
SuperMarkApplication.onCreate()
    → initializeFirstLaunchLicense()
        → LicenseService.initializeFirstLaunch()
            → LicenseRepository.createTrialLicense()
```

### 2. Écran (Via Paramètres)
```kotlin
SettingsScreen
    → onClick = navController.navigate("license")
        → SuperMarkNavHost routes to Screen.License
            → LicenseScreen
                → LicenseViewModel
                    → LicenseRepository
```

### 3. Vérification (Dans un écran)
```kotlin
MyScreen.LaunchedEffect
    → LicenseViewModel.loadLicenseForUser(userId)
        → LicenseRepository.getActiveLicenseForUser(userId)
            → LicenseDao.getActiveLicenseForUser(userId)
```

## Organisation par Couches

### Data Layer
```
data/
├── model/License.kt
├── dao/LicenseDao.kt ✨
├── repository/LicenseRepository.kt ✅
└── database/SuperMarkDatabase.kt
```

### Business Logic Layer
```
service/LicenseService.kt ✅
di/
├── DatabaseModule.kt
├── PreferencesModule.kt
└── RepositoryModule.kt ✨
```

### UI Layer
```
ui/
├── screens/license/LicenseScreen.kt ✅
├── navigation/SuperMarkNavHost.kt ✨
└── screens/settings/SettingsScreen.kt ✨
viewmodel/LicenseViewModel.kt ✅
```

### Network Layer
```
network/ApiService.kt ✅
```

## Flux de Compilation

```
✅ build.gradle.kts
    ↓
✅ app/build.gradle.kts
    ↓
✅ AndroidManifest.xml
    ↓
✅ Kotlin Sources
    ├── di/ (Hilt)
    ├── data/ (Room)
    ├── viewmodel/ (ViewModel)
    ├── ui/ (Compose)
    └── service/
    ↓
✅ Resources
    ├── strings.xml
    ├── colors.xml
    └── themes.xml
    ↓
APK/AAB
```

## Checklist de Fichiers

### À Créer (7)
- [x] LicenseRepository.kt
- [x] LicenseViewModel.kt
- [x] LicenseService.kt
- [x] LicenseScreen.kt
- [x] ApiService.kt
- [x] LICENSE_MANAGEMENT.md
- [x] LICENSE_INTEGRATION_GUIDE.md

### À Modifier (5)
- [x] SuperMarkApplication.kt
- [x] SettingsScreen.kt
- [x] SuperMarkNavHost.kt
- [x] LicenseDao.kt
- [x] RepositoryModule.kt
- [x] strings.xml

### À Laisser Inchangés
- [ ] Tous les autres fichiers
- [ ] Models existants
- [ ] ViewModels existants
- [ ] Écrans existants

---

**Date** : 15 Mars 2026
**Version** : 1.0.0
**Total Fichiers** : 12 (7 créés, 5 modifiés)
**Total Lignes** : ~3,000 lignes de code + documentation
