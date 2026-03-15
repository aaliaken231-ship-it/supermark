# SuperMark Android - Index de la documentation

## Point de départ pour les développeurs

Bienvenue dans **SuperMark Android**, une application complète de gestion de supermarché écrite en Kotlin avec une architecture moderne.

## Documentation principale

### Pour commencer rapidement
1. **[ANDROID_README.md](./ANDROID_README.md)** ← Commencez ici !
   - Vue d'ensemble du projet
   - Fonctionnalités principales
   - Instructions d'installation
   - Guide de démarrage

### Pour compiler et déployer
2. **[BUILD_INSTRUCTIONS.md](./BUILD_INSTRUCTIONS.md)**
   - Setup complet de l'environnement
   - Instructions de compilation (Debug/Release)
   - Signatures APK
   - Deployment sur Google Play

### Pour développer
3. **[BEST_PRACTICES.md](./BEST_PRACTICES.md)**
   - Patterns architécturaux (MVVM)
   - Conventions de code
   - Gestion d'état avec StateFlow
   - Sécurité et performance
   - Testing guidelines

### Pour découvrir les ressources
4. **[RESOURCES.md](./RESOURCES.md)**
   - Documentation officielle
   - Tutoriels et guides
   - Outils de développement
   - Librairies recommandées
   - Communauté et support

### Avant de commencer une tâche
5. **[DEVELOPER_CHECKLIST.md](./DEVELOPER_CHECKLIST.md)**
   - Checklist de configuration
   - Checklist de développement
   - Checklist de release
   - Commandes utiles
   - Troubleshooting

### Vue d'ensemble du projet
6. **[PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md)**
   - Architecture complète
   - Structure du projet
   - Dépendances
   - Fonctionnalités
   - Prochaines étapes

## Structure du code

```
app/src/main/
├── java/com/supermark/app/
│   ├── data/                # Couche données
│   │   ├── dao/             # Data Access Objects
│   │   ├── database/        # Room Database
│   │   ├── model/           # Entités
│   │   └── repository/      # Repositories
│   ├── di/                  # Injection dépendances (Hilt)
│   ├── ui/                  # Interface utilisateur
│   │   ├── navigation/      # Navigation
│   │   ├── screens/         # Écrans Compose
│   │   └── theme/           # Thème et styles
│   └── viewmodel/           # ViewModels
│
├── res/
│   ├── values/              # Ressources (strings, colors, etc)
│   └── mipmap/              # Icons et assets
│
└── AndroidManifest.xml      # Configuration de l'app
```

## Flux de travail type

### 1. Installation initiale
```bash
git clone https://github.com/aaliaken231-ship-it/supermark.git
cd supermark
# Suivre BUILD_INSTRUCTIONS.md
```

### 2. Avant de développer
- Lire ANDROID_README.md pour comprendre le projet
- Lire BEST_PRACTICES.md pour les conventions
- Consulter PROJECT_SUMMARY.md pour l'architecture

### 3. Pendant le développement
- Créer une branche : `git checkout -b feature/ma-feature`
- Suivre les patterns MVVM
- Respecter les bonnes pratiques
- Utiliser DEVELOPER_CHECKLIST.md

### 4. Avant la publication
- Compiler en Release mode
- Signer l'APK
- Tester sur plusieurs appareils
- Suivre BUILD_INSTRUCTIONS.md

## Points clés de l'architecture

### MVVM Architecture
```
View (Compose Screen)
    ↓
ViewModel (State Management)
    ↓
Repository (Business Logic)
    ↓
DAO + Database (Data Layer)
```

### Technologies principales
- **Kotlin** : Langage de programmation
- **Jetpack Compose** : UI moderne
- **Room** : Base de données locale SQLite
- **Hilt** : Injection de dépendances
- **Coroutines** : Programmation asynchrone
- **Flow** : Données réactives

## Fichiers importants à connaître

### Configuration
- `build.gradle.kts` : Dépendances et compilation
- `AndroidManifest.xml` : Configuration de l'app
- `gradle.properties` : Propriétés Gradle

### Ressources
- `strings.xml` : Textes (français par défaut)
- `colors.xml` : Palette de couleurs
- `themes.xml` : Thèmes de l'app
- `dimens.xml` : Dimensions et espacements

### Code principal
- `MainActivity.kt` : Activité principale
- `SuperMarkApplication.kt` : Classe application avec Hilt
- `SuperMarkNavHost.kt` : Configuration navigation
- `*ViewModel.kt` : Logique métier (6 ViewModels)

## Quick Links

### Documentation technique
- [ANDROID_README.md](./ANDROID_README.md) - Guide complet
- [BUILD_INSTRUCTIONS.md](./BUILD_INSTRUCTIONS.md) - Compilation
- [BEST_PRACTICES.md](./BEST_PRACTICES.md) - Patterns
- [RESOURCES.md](./RESOURCES.md) - Ressources externes

### Développement
- [DEVELOPER_CHECKLIST.md](./DEVELOPER_CHECKLIST.md) - Checklists
- [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) - Résumé architecture

### Repository
- [GitHub Repository](https://github.com/aaliaken231-ship-it/supermark)
- [Issues Tracker](https://github.com/aaliaken231-ship-it/supermark/issues)
- [Discussions](https://github.com/aaliaken231-ship-it/supermark/discussions)

## Fonctionnalités principales

### Authentification
- Inscription et connexion
- Gestion des rôles

### Gestion
- Produits et stock
- Clients
- Ventes et factures
- Transactions financières

### Tableau de bord
- Statistiques
- Accès rapide aux modules

## Commandes essentielles

```bash
# Compiler
./gradlew build

# Tester
./gradlew test

# APK Debug
./gradlew assembleDebug

# APK Release
./gradlew assembleRelease

# Format code
./gradlew spotlessApply

# Lancer l'app
./gradlew installDebug
```

## FAQ rapide

### Q: Par où commencer ?
**R:** Lisez d'abord [ANDROID_README.md](./ANDROID_README.md), puis [BUILD_INSTRUCTIONS.md](./BUILD_INSTRUCTIONS.md)

### Q: Comment contribuer ?
**R:** Créez une branche, respectez [BEST_PRACTICES.md](./BEST_PRACTICES.md), puis pull request

### Q: Quelles sont les dépendances ?
**R:** Consultez [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) - section Dépendances

### Q: Comment déboguer ?
**R:** Utilisez Android Studio Debugger ou consultez BEST_PRACTICES.md

### Q: Comment déployer ?
**R:** Suivez [BUILD_INSTRUCTIONS.md](./BUILD_INSTRUCTIONS.md)

## Conseils pour la réussite

✓ **Lisez la documentation** avant de coder
✓ **Respectez les patterns** MVVM et Clean Architecture
✓ **Testez régulièrement** pendant le développement
✓ **Consultez les bonnes pratiques** pour le code quality
✓ **Demandez de l'aide** sur les GitHub Discussions

## Support

- **Documentation** : Lisez les fichiers .md
- **Code Issues** : Consultez GitHub Issues
- **Questions** : Utilisez GitHub Discussions
- **Contributions** : Pull requests bienvenues

## Versions et compatibilité

- **Min SDK** : Android 8.0 (API 26)
- **Target SDK** : Android 14 (API 34)
- **Language** : Kotlin 1.9.20+
- **Build Tools** : Gradle 8.1+

## Checklist de démarrage (5 mins)

- [ ] Cloner le repository
- [ ] Ouvrir dans Android Studio
- [ ] Synchroniser les dépendances Gradle
- [ ] Compiler le projet
- [ ] Lancer sur émulateur/appareil

## Prochaines étapes après installation

1. Lire [ANDROID_README.md](./ANDROID_README.md) (10 mins)
2. Consulter [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) (15 mins)
3. Explorer le code source (30 mins)
4. Lire [BEST_PRACTICES.md](./BEST_PRACTICES.md) (20 mins)
5. Essayer de compiler et lancer (10 mins)

**Temps total estimé : 1 heure 25 minutes**

---

**Version** : 1.0.0  
**Dernière mise à jour** : 2024  
**Créateur** : SuperMark Development Team  
**License** : MIT

Commencez par lire **[ANDROID_README.md](./ANDROID_README.md)** pour démarrer !
