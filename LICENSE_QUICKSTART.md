# Quick Start - Système de Licences SuperMark

**Durée** : 5 minutes pour démarrer | 30 minutes pour comprendre

---

## 🚀 En 3 Étapes

### Étape 1 : Compiler l'App ✅

```bash
# Si vous êtes dans Android Studio
1. File → Open → (sélectionner le dossier supermark)
2. Laisser Gradle synchroniser
3. Build → Make Project
4. Run → Run 'app'
```

### Étape 2 : Tester le Premier Lancement ✅

```
1. App se lance
2. Écran de login (utiliser admin@supermark.local / admin123)
3. Dashboard s'affiche
4. Aller à Paramètres → Licence
5. Licence d'essai de 30 jours est visible ✅
```

### Étape 3 : Explorer les Fonctionnalités ✅

```
Dashboard
├── Paramètres
│   └── Gestion des Licences
│       ├── Voir le statut
│       ├── Voir les jours restants
│       ├── Renouveler la licence
│       └── Télécharger (non implémenté)
└── ...
```

---

## 📋 Déroulement Complet

### A. Au Premier Lancement

```
✅ SuperMarkApplication.onCreate()
   ├── initializeFirstLaunchLicense()
   │   ├── Détecte is_first_launch = true
   │   ├── Crée utilisateur admin
   │   ├── Crée licence 30 jours
   │   └── Marque is_first_launch = false
   └── App prête !
```

### B. Accès à l'Écran de Licence

```
Clic utilisateur : Paramètres → Licence
   ↓
SettingsScreen navigue vers "license"
   ↓
SuperMarkNavHost route vers Screen.License
   ↓
LicenseScreen composable rendu
   ↓
LaunchedEffect charge la licence
   ↓
LicenseViewModel charge depuis Repository
   ↓
Écran affiche la licence ✅
```

### C. Actions Utilisateur

**Renouveler la licence** :
```
User clicks "Renouveler"
   ↓
LicenseViewModel.extendLicense(licenseId, 30)
   ↓
LicenseRepository.extendLicense()
   ↓
Ajoute 30 jours à expiresAt
   ↓
Interface mise à jour ✅
```

**Créer une licence d'essai** :
```
User clicks "Créer Licence d'Essai"
   ↓
LicenseViewModel.createTrialLicense(userId, 30)
   ↓
LicenseRepository.createTrialLicense()
   ↓
Licence créée et stockée
   ↓
Interface affiche la nouvelle licence ✅
```

---

## 🔍 Fichiers Clés à Connaître

### Must Know (Impératif)
```
1. SuperMarkApplication.kt
   → Initialisation au démarrage
   → 64 lignes ajoutées

2. LicenseScreen.kt
   → Interface d'affichage
   → 444 lignes de Compose

3. LicenseRepository.kt
   → Logique métier
   → 161 lignes de requêtes
```

### Should Know (Recommandé)
```
4. LicenseViewModel.kt
   → Gestion d'état
   → 108 lignes

5. LicenseService.kt
   → Initialisation
   → 100 lignes

6. SuperMarkNavHost.kt
   → Navigation
   → +11 lignes
```

### Nice to Know (Optional)
```
7. ApiService.kt
   → Prêt pour backend
   → 75 lignes

8. LicenseDao.kt
   → Requêtes DB
   → +9 lignes
```

---

## 💻 Modification Rapide

### Changer la durée d'essai (30 jours → X jours)

**Fichier** : `SuperMarkApplication.kt`

```kotlin
// Avant
licenseRepository.createTrialLicense(defaultUser.id, 30)

// Après (exemple: 14 jours)
licenseRepository.createTrialLicense(defaultUser.id, 14)
```

### Ajouter une action au clic du bouton "Télécharger"

**Fichier** : `LicenseScreen.kt`

```kotlin
// Avant
Button(onClick = { /* TODO */ }) {
    Text("Télécharger")
}

// Après
Button(onClick = { licenseViewModel.downloadLicense(license.key) }) {
    Text("Télécharger")
}
```

### Changer le plan par défaut

**Fichier** : `LicenseRepository.kt`

```kotlin
// Avant
val license = License(
    plan = "trial",  // ← Changer ici
    ...
)

// Après
val license = License(
    plan = "professional",  // ← Nouveau plan
    ...
)
```

---

## 🐛 Debugging Rapide

### Vérifier la création de licence

```kotlin
// Ajouter dans MainActivity
GlobalScope.launch {
    val licenses = licenseRepository.getAllLicenses().first()
    println("[V0] Licences trouvées: ${licenses.size}")
}
```

### Logs de l'initialisation

```
// Dans logcat, chercher:
[V0] Initializing first launch
[V0] Creating trial license
[V0] License created: ...
```

### Vérifier la navigation

```kotlin
// Dans SettingsScreen, avant le clic
println("[V0] Navigating to license screen")

// Dans LicenseScreen
LaunchedEffect(userId) {
    println("[V0] LicenseScreen loaded for user: $userId")
}
```

---

## ✅ Checklist 10 minutes

- [ ] Télécharger/cloner le projet
- [ ] Ouvrir dans Android Studio
- [ ] Synchroniser Gradle (2-3 min)
- [ ] Compiler (Build → Make Project) (2-3 min)
- [ ] Lancer l'app (Run → Run 'app') (1-2 min)
- [ ] Login avec admin@supermark.local
- [ ] Naviguer à Paramètres → Licence
- [ ] Voir la licence de 30 jours ✅

---

## 📱 Utilisateur Final - Mode d'Emploi

### Pour L'Utilisateur Final

```
1. Ouvrir l'app
2. Créer un compte ou se connecter
3. Aller à Paramètres
4. Appuyer sur "Licence"
5. Voir la durée de validité
6. Appuyer "Renouveler" si expirant bientôt

C'est tout! 🎉
```

---

## 🔧 Pour les Développeurs

### Structure Rapide

```
App Layers:
├── UI (Compose)
│   └── LicenseScreen
│
├── Logic (ViewModel)
│   └── LicenseViewModel
│
├── Business (Repository)
│   └── LicenseRepository
│
└── Data (Room)
    └── LicenseDao + License Entity
```

### Flux Rapide

```
UI Event
  ↓
ViewModel Method
  ↓
Repository Method
  ↓
DAO Query
  ↓
Database
  ↓
Response back up
  ↓
UI Updated
```

---

## 🎯 Cas d'Utilisation Communs

### Cas 1 : Afficher la licence dans un écran

```kotlin
@Composable
fun MyScreen(licenseViewModel: LicenseViewModel) {
    val daysRemaining = licenseViewModel.daysRemaining.collectAsState()
    
    Text("Jours restants: ${daysRemaining.value}")
}
```

### Cas 2 : Protéger une action par licence

```kotlin
Button(onClick = {
    if (licenseIsValid) {
        saveTransaction()
    } else {
        showLicenseExpiredDialog()
    }
}) { 
    Text("Enregistrer") 
}
```

### Cas 3 : Renouveler automatiquement avant expiration

```kotlin
LaunchedEffect(daysRemaining) {
    if (daysRemaining <= 7) {
        licenseViewModel.extendLicense(licenseId, 30)
    }
}
```

---

## 📚 Resources Rapides

| Besoin | Fichier | Section |
|--------|---------|---------|
| Comprendre | LICENSE_SYSTEM_SUMMARY.md | - |
| Détails | LICENSE_MANAGEMENT.md | - |
| Code | LICENSE_FILE_STRUCTURE.md | - |
| API | LICENSE_INTEGRATION_GUIDE.md | - |
| Index | LICENSE_DOCS_INDEX.md | - |

---

## ❓ FAQ 30 Secondes

**Q: Où la licence est-elle créée?**
A: Automatiquement au premier lancement dans `SuperMarkApplication.onCreate()`

**Q: Où aller pour voir la licence?**
A: Paramètres → Gestion des Licences

**Q: Comment changer la durée?**
A: Modifier `createTrialLicense(userId, 30)` → `createTrialLicense(userId, 14)`

**Q: Comment ajouter une API?**
A: Lire LICENSE_INTEGRATION_GUIDE.md

**Q: Qu'est-ce qui manque?**
A: L'intégration API backend (prêt à implémenter)

**Q: Où est le code?**
A: `app/src/main/java/com/supermark/app/`

**Q: Comment tester?**
A: Compiler, lancer, naviguer à Paramètres → Licence

---

## 🚀 Prochaines Étapes

### Immédiatement
1. ✅ Compiler et tester
2. ✅ Naviguer à l'écran de licence
3. ✅ Vérifier l'affichage

### Suivant (1-2 jours)
1. Lire LICENSE_MANAGEMENT.md
2. Lire LICENSE_INTEGRATION_GUIDE.md
3. Implémenter l'API backend

### Optionnel (1-2 semaines)
1. Ajouter tests unitaires
2. Ajouter notifications
3. Ajouter plans payants

---

## 💡 Tips & Tricks

**Tip 1** : Utilisez Android Studio's "Find" (Ctrl+F) pour naviguer
**Tip 2** : Les logs affichent `[V0]` pour les messages de debug
**Tip 3** : Inspectez la DB avec Android Studio Database Inspector
**Tip 4** : Utilisez Logcat pour voir les erreurs
**Tip 5** : Lisez le code en parallèle avec la documentation

---

## 🎓 Exemple Complet

```kotlin
// 1. Importer
import com.supermark.app.viewmodel.LicenseViewModel
import androidx.hilt.navigation.compose.hiltViewModel

// 2. Dans votre Composable
@Composable
fun MonEcran() {
    val licenseViewModel: LicenseViewModel = hiltViewModel()
    val licenseState = licenseViewModel.licenseState.collectAsState()
    val daysRemaining = licenseViewModel.daysRemaining.collectAsState()

    // 3. Charger au démarrage
    LaunchedEffect(userId) {
        licenseViewModel.loadLicenseForUser(userId)
    }

    // 4. Afficher
    when (val state = licenseState.value) {
        is LicenseViewModel.LicenseState.Success -> {
            Text("Jours: ${daysRemaining.value}")
        }
        is LicenseViewModel.LicenseState.NoLicense -> {
            Button(onClick = { 
                licenseViewModel.createTrialLicense(userId) 
            }) {
                Text("Créer licence")
            }
        }
        else -> {}
    }
}
```

---

**Vous êtes prêt! 🎉**

Compilez l'app et explorez!

---

**Date** : 15 Mars 2026
**Version** : 1.0.0
**Auteur** : SuperMark Development Team
