# Instructions de compilation - SuperMark Android

## Prérequis

- Android Studio 2023.1 ou plus récent
- JDK 11 ou plus récent
- SDK Android API 34
- Gradle 8.1+

## Étapes de compilation

### 1. Cloner le projet
```bash
git clone https://github.com/aaliaken231-ship-it/supermark.git
cd supermark
```

### 2. Ouvrir dans Android Studio
- Lancer Android Studio
- File → Open
- Sélectionner le dossier `supermark`
- Attendre la synchronisation automatique des dépendances Gradle

### 3. Télécharger les SDK nécessaires
- SDK → Tools → SDK Manager
- Vérifier que les éléments suivants sont installés :
  - Android SDK API Level 34
  - Android SDK Build-Tools 34.0.0+
  - Android Emulator (optionnel pour les tests)

### 4. Compiler le projet
Dans le menu Android Studio :
```
Build → Rebuild Project
```

Ou via la ligne de commande :
```bash
./gradlew clean build
```

## Créer un APK

### APK Debug (pour développement/test)
```bash
./gradlew assembleDebug
```
L'APK sera créé dans : `app/build/outputs/apk/debug/app-debug.apk`

### APK Release (production)
```bash
./gradlew assembleRelease
```
L'APK sera créé dans : `app/build/outputs/apk/release/app-release.apk`

## Signer l'APK Release

Pour distribuer l'APK en production, vous devez le signer avec une clé privée :

### 1. Créer un keystore (si vous n'en avez pas)
```bash
keytool -genkey -v -keystore my-release-key.keystore -keyalg RSA -keysize 2048 -validity 10000 -alias my-key-alias
```

### 2. Configurer la signature dans build.gradle.kts

Ajouter dans le bloc `android` :
```kotlin
signingConfigs {
    create("release") {
        storeFile = file("path/to/my-release-key.keystore")
        storePassword = "votre_mot_de_passe"
        keyAlias = "my-key-alias"
        keyPassword = "votre_mot_de_passe"
    }
}

buildTypes {
    release {
        signingConfig = signingConfigs.getByName("release")
        isMinifyEnabled = true
        proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro")
    }
}
```

### 3. Compiler l'APK signé
```bash
./gradlew assembleRelease
```

## Installer sur un appareil ou émulateur

### Via Android Studio
1. Connecter un appareil USB ou démarrer un émulateur
2. Run → Run 'app'

### Via ligne de commande
```bash
./gradlew installDebug
```

## Tester l'application

### Exécuter les tests
```bash
./gradlew test
```

### Exécuter les tests d'instrumentation
```bash
./gradlew connectedAndroidTest
```

## Dépannage

### Erreur de compilation Gradle
```bash
./gradlew clean
./gradlew build
```

### Problème de synchronisation
- File → Invalidate Caches
- Redémarrer Android Studio

### Erreur de dépendances
```bash
./gradlew dependencies
```

## Structure des artefacts générés

Après la compilation, vous trouverez :

```
app/build/
├── outputs/
│   ├── apk/
│   │   ├── debug/        # APK debug
│   │   └── release/      # APK release
│   ├── bundle/           # Android App Bundle
│   └── logs/
├── intermediates/        # Fichiers intermédiaires
└── reports/             # Rapports de build
```

## Déployer sur Google Play Store

1. Créer un compte Google Play Developer
2. Préparer l'APK release signé
3. Créer une nouvelle application
4. Remplir les métadonnées (icône, description, captures d'écran)
5. Télécharger l'APK signé
6. Tester sur les appareils de test
7. Publier l'application

## Optimisation du build

### Augmenter la mémoire heap du daemon Gradle
```gradle
org.gradle.jvmargs=-Xmx2048m
```

### Activer le mode offline
```gradle
org.gradle.offline=true
```

### Désactiver les tests pendant le build
```bash
./gradlew build -x test
```

## Commandes utiles

```bash
# Nettoyer le projet
./gradlew clean

# Voir la version actuellement compilée
./gradlew --version

# Lister toutes les tâches disponibles
./gradlew tasks

# Compiler et exécuter les tests
./gradlew build test

# Générer un rapport de dépendances
./gradlew dependencies --configuration debugRuntimeClasspath

# Mettre à jour Gradle Wrapper
./gradlew wrapper --gradle-version=latest
```

## Support et documentation

- [Documentation Android Developers](https://developer.android.com/)
- [Gradle Build Tool](https://gradle.org/)
- [Kotlin Docs](https://kotlinlang.org/docs/)
- [Jetpack Compose](https://developer.android.com/jetpack/compose)

---

Pour toute question, consultez la documentation du projet ou ouvrez une issue sur GitHub.
