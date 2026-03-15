# SuperMark - Android Application

Une application complète de gestion de supermarché développée en Kotlin avec Jetpack Compose.

## Fonctionnalités

### Authentification & Gestion des utilisateurs
- Connexion et inscription sécurisées
- Gestion des rôles (admin, manager, user)
- Stockage sécurisé des préférences utilisateur

### Gestion des produits
- Ajout, modification et suppression de produits
- Gestion du stock et des quantités
- Recherche par nom ou SKU
- Alertes de stock faible
- Historique des mouvements de stock

### Gestion des clients
- Création et gestion des profils clients
- Recherche par nom, email ou téléphone
- Types de clients (particuliers, entreprises)
- Historique d'achat

### Gestion des ventes
- Création de factures complètes
- Ajout d'articles aux ventes
- Calcul automatique des taxes et remises
- Multiples méthodes de paiement
- Historique complet des ventes

### Transactions financières
- Enregistrement des dépôts
- Enregistrement des retraits
- Calcul du solde
- Historique des transactions

### Tableau de bord
- Vue d'ensemble des ventes du jour
- Statistiques des produits et clients
- Accès rapide aux principales fonctionnalités

## Architecture

L'application utilise une architecture MVVM moderne avec :

- **Room Database** : Base de données SQLite locale
- **Hilt** : Injection de dépendances
- **Jetpack Compose** : Interface utilisateur moderne
- **Coroutines** : Programmation asynchrone
- **EncryptedSharedPreferences** : Stockage sécurisé des données

## Structure du projet

```
app/src/main/java/com/supermark/app/
├── data/
│   ├── dao/              # Data Access Objects
│   ├── database/         # Configuration Room Database
│   ├── model/            # Modèles de données
│   └── repository/       # Repositories pour la logique métier
├── di/                   # Modules d'injection de dépendances
├── ui/
│   ├── navigation/       # Navigation de l'app
│   ├── screens/          # Écrans Compose
│   └── theme/            # Thème et styles
└── viewmodel/            # ViewModels pour chaque feature
```

## Configuration requise

- Android 8.0+ (API 26)
- Android Studio 2023.1+
- Kotlin 1.9.20+

## Installation

1. **Cloner le repository**
   ```bash
   git clone https://github.com/aaliaken231-ship-it/supermark.git
   cd supermark
   ```

2. **Ouvrir le projet dans Android Studio**
   - Fichier → Ouvrir
   - Sélectionner le dossier du projet

3. **Synchroniser les dépendances Gradle**
   - Android Studio synchronisera automatiquement les dépendances
   - Attendre que la compilation soit complète

4. **Lancer l'application**
   - Cliquer sur "Run" ou appuyer sur Shift + F10
   - Sélectionner un émulateur ou un appareil physique

## Données de test

### Compte par défaut
- Email : `test@example.com`
- Mot de passe : `password123`

Vous pouvez créer de nouveaux comptes à partir de l'écran d'inscription.

## Dépendances principales

### Jetpack
- `androidx.compose.*` - Interface utilisateur
- `androidx.room:room-ktx` - Base de données
- `androidx.lifecycle:*` - Gestion du cycle de vie
- `androidx.navigation:navigation-compose` - Navigation

### Hilt
- `com.google.dagger:hilt-android` - Injection de dépendances

### Sécurité
- `androidx.security:security-crypto` - Stockage chiffré

### Coroutines
- `org.jetbrains.kotlinx:kotlinx-coroutines-*` - Programmation asynchrone

### Sérialisation
- `com.google.code.gson:gson` - Sérialisation JSON

## Guide d'utilisation

### Créer un compte
1. Appuyer sur "Créer un compte" dans l'écran de connexion
2. Remplir les informations requises
3. Appuyer sur "S'inscrire"

### Ajouter un produit
1. Aller à "Gestion des produits"
2. Appuyer sur le bouton "+"
3. Remplir les informations du produit
4. Enregistrer

### Créer une vente
1. Aller à "Gestion des ventes"
2. Appuyer sur le bouton "+"
3. Sélectionner les produits
4. Définir le méthode de paiement
5. Valider la vente

### Gérer les clients
1. Aller à "Gestion des clients"
2. Appuyer sur "+" pour ajouter un client
3. Remplir les informations
4. Enregistrer

## Base de données

L'application utilise une base de données SQLite locale avec les tables suivantes :

- **users** : Utilisateurs
- **products** : Produits
- **customers** : Clients
- **sales** : Factures de vente
- **sale_items** : Articles des ventes
- **transactions** : Dépôts et retraits
- **licenses** : Licences
- **inventory_logs** : Historique du stock

## Sécurité

- Mots de passe hachés avec bcrypt (à implémenter)
- Données sensibles chiffrées avec EncryptedSharedPreferences
- Pas de données sensibles en log
- Validation des entrées utilisateur

## Performance

- Utilisation de Flow pour les mises à jour réactives
- Pagination pour les listes longues (à implémenter)
- Cache local avec Room
- Images optimisées

## Troubleshooting

### La base de données ne se crée pas
- Vérifier que les permissions d'écriture sont accordées
- Vérifier les logs d'erreur dans Logcat

### L'authentification ne fonctionne pas
- Vérifier que l'email est unique
- Vérifier que les mots de passe correspondent lors de l'inscription

### Les données ne se synchronisent pas
- Vérifier que la base de données est correctement initialisée
- Vérifier les logs pour les erreurs

## Développement futur

- [ ] Synchronisation cloud (Firebase)
- [ ] Codes barres et scanner de produits
- [ ] Rapports et analyses avancées
- [ ] Système de notifications
- [ ] Support des images de produits
- [ ] Mode hors ligne
- [ ] Export en PDF/Excel
- [ ] Authentification biométrique

## Licence

Ce projet est licencié sous la License MIT - voir le fichier LICENSE pour plus de détails.

## Support

Pour toute question ou bug, veuillez ouvrir une issue sur GitHub.

## Contributeurs

- SuperMark Development Team

---

Développé avec ❤️ en Kotlin
