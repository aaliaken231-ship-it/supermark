# Guide de Gestion des Licences - SuperMark Android

## Vue d'ensemble

Le système de licences SuperMark a été complètement réécrit pour :
- ✅ **Activation automatique** d'une licence de 30 jours au premier lancement
- ✅ **Écran dédié** de gestion des licences
- ✅ **Suivi des jours restants** avec barre de progression
- ✅ **Renouvellement automatique** de la licence
- ✅ **Téléchargement de licences** depuis le cloud (à configurer)

---

## 1. Activation Automatique au Premier Lancement

### Comportement

À la première ouverture de l'application :

1. **LicenseService** détecte que c'est le premier lancement
2. Crée un utilisateur administrateur par défaut
3. Génère automatiquement une **licence d'essai de 30 jours**
4. Stocke un flag `is_first_launch_license` pour éviter les duplocations

```kotlin
// Fichier: app/src/main/java/com/supermark/app/service/LicenseService.kt
suspend fun initializeFirstLaunch(): Boolean
```

### Données de la licence d'essai

- **Plan** : `trial`
- **Utilisateurs max** : 5
- **Produits max** : 500
- **Ventes/mois max** : 10 000
- **Validité** : 30 jours
- **Statut** : `active`

---

## 2. Architecture du Système de Licences

### Composants principaux

```
┌─────────────────────────────────────┐
│     LicenseScreen (UI)              │
│  • Affichage du statut              │
│  • Barre de progression             │
│  • Boutons d'action                 │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│   LicenseViewModel (Logic)          │
│  • Gestion d'état                   │
│  • Appels au repository             │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│  LicenseRepository (Data)           │
│  • Création/renouvellement          │
│  • Validation                       │
│  • Calcul des jours restants        │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│   LicenseService (Initialization)   │
│  • Setup au premier lancement       │
│  • Assurance d'une licence          │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│  LicenseDao (Room Database)         │
│  • Requêtes SQL                     │
│  • Persistence                      │
└─────────────────────────────────────┘
```

---

## 3. Fichiers Modifiés et Créés

### Fichiers créés :

```
✅ LicenseRepository.kt        - Gestion complète des licences
✅ LicenseViewModel.kt         - ViewModel pour l'UI
✅ LicenseService.kt           - Service d'initialisation
✅ LicenseScreen.kt            - Écran de gestion des licences
```

### Fichiers modifiés :

```
✏️ SuperMarkApplication.kt     - Initialisation au démarrage
✏️ SettingsScreen.kt           - Lien vers l'écran de licence
✏️ LicenseDao.kt               - Nouvelles requêtes
✏️ SuperMarkNavHost.kt         - Route de navigation
✏️ RepositoryModule.kt         - Injection de dépendances
```

---

## 4. Utilisation de l'Écran de Licence

### Accès à l'écran

1. **Via le menu Paramètres** :
   - Ouvrir l'app
   - Aller à `Paramètres`
   - Appuyer sur `Gestion des Licences`

2. **Directement via navigation** :
   ```kotlin
   navController.navigate("license")
   ```

### États affichés

#### 1. Licence Active
```
✅ Licence Active
   TRIAL

   29 jours restants
   [████████░░░░░░░░░░░] 96%

   ┌─────────────────────────┐
   │ Détails de la Licence   │
   │                         │
   │ ID: abc-123-def         │
   │ Clé: XXXX-XXXX-...      │
   │ Plan: TRIAL             │
   │ Statut: active          │
   │ Utilisateurs max: 5     │
   │ Produits max: 500       │
   │ Ventes/mois max: 10000  │
   │ Expiration: 15/04/2026  │
   └─────────────────────────┘

   [🔄 Renouveler] [⬇️ Télécharger]
```

#### 2. Aucune Licence
```
ℹ️  Aucune Licence Active

   Activez une licence pour accéder
   à tous les services

   [Créer Licence d'Essai 30j]
```

#### 3. Erreur
```
❌ Erreur

   Message d'erreur spécifique

   [Réessayer]
```

---

## 5. Fonctionnalités

### 5.1 Créer une Licence d'Essai

```kotlin
licenseViewModel.createTrialLicense(userId, daysValidity = 30)
```

**Résultat** :
- Licence créée avec validité de 30 jours
- Statut : `active`
- Clé générée automatiquement (format: XXXX-XXXX-XXXX-XXXX)

### 5.2 Renouveler une Licence

```kotlin
licenseViewModel.extendLicense(licenseId, additionalDays = 30)
```

**Résultat** :
- Ajoute 30 jours à la date d'expiration
- Mise à jour du statut
- Barre de progression se réinitialise

### 5.3 Vérifier la Validité

```kotlin
val isValid = licenseRepository.checkLicenseValidity(userId)
```

**Retourne** : `true` si la licence existe et n'a pas expiré

### 5.4 Obtenir les Jours Restants

```kotlin
val daysRemaining = licenseRepository.getDaysRemainingForLicense(userId)
```

**Retourne** : Nombre de jours entiers restants (min: 0)

### 5.5 Valider une Clé de Licence

```kotlin
val isValid = licenseRepository.validateLicenseKey("XXXX-XXXX-XXXX-XXXX")
```

---

## 6. Intégration Backend (À Implémenter)

### Fonction à compléter : `downloadLicense`

```kotlin
suspend fun downloadLicense(licenseKey: String): License? {
    // TODO: Implémenter l'appel API
    // Endpoint: POST /api/licenses/download
    // Body: { "key": "XXXX-XXXX-XXXX-XXXX" }
    // Retour: License object ou null
}
```

**Exemple d'intégration Retrofit** :

```kotlin
interface LicenseApi {
    @POST("api/licenses/download")
    suspend fun downloadLicense(
        @Body request: DownloadLicenseRequest
    ): License
}

data class DownloadLicenseRequest(
    val key: String
)
```

---

## 7. Plans de Licence Disponibles

### Trial (Essai)
```
Durée: 30 jours
Utilisateurs: 5
Produits: 500
Ventes/mois: 10 000
```

### Professional (Professionnel)
```
Durée: 365 jours
Utilisateurs: 10
Produits: 5 000
Ventes/mois: 100 000
```

### Enterprise (Entreprise)
```
Durée: Personnalisé
Utilisateurs: Illimité
Produits: Illimité
Ventes/mois: Illimité
```

---

## 8. Structure de la Base de Données

### Table `licenses`

```sql
CREATE TABLE licenses (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    key TEXT UNIQUE NOT NULL,
    plan TEXT NOT NULL,
    maxUsers INTEGER NOT NULL,
    maxProducts INTEGER NOT NULL,
    maxSalesPerMonth INTEGER NOT NULL,
    expiresAt LONG NOT NULL,
    status TEXT DEFAULT 'active',
    createdAt LONG DEFAULT CURRENT_TIMESTAMP,
    updatedAt LONG DEFAULT CURRENT_TIMESTAMP
)
```

### Colonnes

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | TEXT | Identifiant unique |
| `userId` | TEXT | Propriétaire de la licence |
| `key` | TEXT | Clé de licence unique |
| `plan` | TEXT | Type de plan |
| `maxUsers` | INT | Nombre max d'utilisateurs |
| `maxProducts` | INT | Nombre max de produits |
| `maxSalesPerMonth` | INT | Ventes max/mois |
| `expiresAt` | LONG | Timestamp d'expiration |
| `status` | TEXT | État (active/expired/suspended) |
| `createdAt` | LONG | Timestamp de création |
| `updatedAt` | LONG | Timestamp de mise à jour |

---

## 9. Codes d'Erreur et États

### États possibles

```kotlin
sealed class LicenseState {
    object Loading : LicenseState()
    object NoLicense : LicenseState()
    data class Success(val license: License) : LicenseState()
    data class Error(val message: String) : LicenseState()
}
```

### Statuts de licence

| Statut | Description |
|--------|-------------|
| `active` | Licence valide et en cours |
| `expired` | Licence expirée |
| `suspended` | Licence suspendue (paiement non reçu) |

---

## 10. Préférences Stockées

### SharedPreferences utilisées

```
Clé: "supermark_license"

is_first_launch_license: Boolean
   → Utilisé pour détecter le premier lancement

user_{userId}:has_license: Boolean
   → Utilisé pour suivre si un utilisateur a une licence
```

---

## 11. Exemple d'Utilisation dans un Écran

```kotlin
@Composable
fun MonEcran(
    licenseViewModel: LicenseViewModel,
    authViewModel: AuthViewModel
) {
    val licenseState = licenseViewModel.licenseState.collectAsState()
    val daysRemaining = licenseViewModel.daysRemaining.collectAsState()
    val authState = authViewModel.authState.collectAsState()

    val userId = (authState.value as? AuthState.Authenticated)?.user?.id

    LaunchedEffect(userId) {
        if (userId != null) {
            licenseViewModel.loadLicenseForUser(userId)
        }
    }

    when (val state = licenseState.value) {
        is LicenseViewModel.LicenseState.Success -> {
            Text("Jours restants: ${daysRemaining.value}")
        }
        is LicenseViewModel.LicenseState.NoLicense -> {
            Button(onClick = { 
                if (userId != null) {
                    licenseViewModel.createTrialLicense(userId)
                }
            }) {
                Text("Créer licence")
            }
        }
        is LicenseViewModel.LicenseState.Error -> {
            Text("Erreur: ${state.message}")
        }
        is LicenseViewModel.LicenseState.Loading -> {
            CircularProgressIndicator()
        }
    }
}
```

---

## 12. Checklist d'Implémentation

- [x] Modèle de données `License`
- [x] DAO pour les requêtes
- [x] Repository pour la logique métier
- [x] ViewModel pour l'UI
- [x] Écran de gestion des licences
- [x] Service d'initialisation
- [x] Activation automatique au premier lancement
- [x] Lien depuis les paramètres
- [ ] Intégration API backend pour le téléchargement
- [ ] Chiffrement de la clé de licence stockée
- [ ] Validation de la clé de licence côté serveur
- [ ] Notifications d'expiration imminente

---

## 13. Prochaines Étapes

1. **Implémenter l'API de téléchargement** :
   - Créer un endpoint backend
   - Ajouter la validation de clé
   - Implémenter `downloadLicense()`

2. **Ajouter les notifications** :
   - Rappel 7 jours avant expiration
   - Rappel 1 jour avant expiration
   - Notification d'expiration

3. **Améliorer la sécurité** :
   - Chiffrer les clés de licence
   - Valider côté serveur
   - Implémenter la vérification de signature

4. **Interface de paiement** :
   - Ajouter les plans payants
   - Intégrer Stripe/PayPal
   - Gestion des abonnements

---

## 14. Support et Troubleshooting

### Problème : Licence non détectée au démarrage

**Solution** :
```kotlin
// Dans le ViewModel ou le Service
licenseService.ensureUserHasLicense(userId)
```

### Problème : Jours restants incorrects

**Solution** : Vérifier que la clé `expiresAt` est en millisecondes

```kotlin
// Correct ✅
val calendar = Calendar.getInstance()
calendar.add(Calendar.DAY_OF_MONTH, 30)
val expiresAt = calendar.timeInMillis // en millisecondes

// Incorrect ❌
val expiresAt = calendar.time.time / 1000 // secondes
```

### Problème : Partage des licences entre utilisateurs

**Utiliser les requêtes DAO appropriées** :
```kotlin
// Correct ✅
licenseDao.getActiveLicenseForUser(userId)

// Pas recommandé ❌
licenseDao.getAllActiveLicenses() // retourne toutes les licences
```

---

**Dernier mise à jour** : 15/03/2026
**Version** : 1.0.0
**Auteur** : SuperMark Development Team
