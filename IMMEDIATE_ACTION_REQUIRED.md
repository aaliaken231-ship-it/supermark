# ACTION IMMÉDIATE REQUISE - Synchronisation Licenses

## Problème Actuel

Votre application affiche cette erreur:
```
Identifier 'getMachineId' has already been declared. (137:6)
```

**Cause:** Les améliorations ne sont pas encore appliquées au projet actif.

## Solution: Synchroniser les Fichiers

Vous travaillez sur **2 projets différents**:

1. **Projet de Développement:** `/vercel/share/v0-project` (contient mes améliorations ✓)
2. **Projet Actif (Vite):** `/vercel/share/v0-next-shadcn` (en exécution, pas à jour ✗)

## Exécuter la Synchronisation

### Méthode 1: Utiliser le Script Python (Recommandé)

```bash
cd /vercel/share/v0-project
python3 sync_licenses.py
```

Le script:
- Détecte les deux projets
- Copie les fichiers améliorés
- Affiche un résumé
- Lance le hot-reload du serveur

### Méthode 2: Copie Manuelle

Ouvrir les fichiers sources:
1. `/vercel/share/v0-project/src/pages/Licenses.tsx`
2. `/vercel/share/v0-project/src/services/license.ts`

Copier-coller le contenu COMPLET dans:
1. `/vercel/share/v0-next-shadcn/src/pages/Licenses.tsx`
2. `/vercel/share/v0-next-shadcn/src/services/license.ts`

### Méthode 3: Utiliser Git (Si disponible)

```bash
cd /vercel/share/v0-next-shadcn

# Copier les fichiers
cp /vercel/share/v0-project/src/pages/Licenses.tsx src/pages/Licenses.tsx
cp /vercel/share/v0-project/src/services/license.ts src/services/license.ts

# Commiter
git add src/pages/Licenses.tsx src/services/license.ts
git commit -m "chore: synchroniser les améliorations licenses"
git push
```

## Après Synchronisation

Le serveur Vite détectera automatiquement les changements et:
1. ✓ Recompilera le TypeScript
2. ✓ Hot-reloade l'application
3. ✓ L'erreur "getMachineId already declared" disparaîtra

## Vérifier la Synchronisation

Dans le navigateur, vérifier:

1. **Page Licenses charge sans erreur**
   - Pas de message d'erreur rouge
   - Pas de "Compilation error" en haut

2. **Console du navigateur propre** (F12)
   - Pas d'erreurs TypeScript
   - Pas d'erreurs d'import

3. **Fonctionnalités travaillent**
   - Bouton "Créer Licence" → ouverture du dialog
   - Bouton "Générer Licence" → upload fichier .lic
   - Bouton "Activer Licence" → upload fichier .lic

## Fichiers Synchronisés

| Fichier | Lignes | Status |
|---------|--------|--------|
| Licenses.tsx | 1,149 | ✓ Amélioré |
| license.ts | 180 | ✓ Amélioré |

## Contenu des Fichiers

### Licenses.tsx - Inclut:
- ✓ Imports organisés (UI, Services, Types, External)
- ✓ Constants sécurisées (GRACE_PERIOD_MS, PAYMENT_INFO)
- ✓ Types stricts (LicenseTypeKey, LicenseTypeConfig, CountdownState)
- ✓ License types enrichis avec features
- ✓ getMachineId() sans duplication
- ✓ LicenseCountdown avec try-catch
- ✓ checkSession() amélioré avec getCurrentUser()
- ✓ Gestion des erreurs complète

### license.ts - Inclut:
- ✓ AES-256-GCM (Web Crypto API)
- ✓ encryptData() avec IV aléatoire
- ✓ decryptData() avec parsing JSON
- ✓ generateLicenseCode() - Format XXXXX-XXXXX-XXXXX-XXXXX-XXXXX
- ✓ isValidLicenseCodeFormat() - Validation
- ✓ hashLicenseCode() - SHA-256 hashing
- ✓ JSDoc documentation complète

## Configuration Environnement (Optionnel)

Si vous voulez utiliser des variables d'environnement:

```env
# .env.local ou Vercel Settings
REACT_APP_LICENSE_SECRET=your-secret-key
REACT_APP_PAYMENT_EMAIL=payments@example.com
REACT_APP_PAYMENT_QR=https://payment.example.com
```

Sinon, les valeurs par défaut sont utilisées.

## Dépannage

### Erreur: "Cannot find file"
- Vérifier les chemins sont corrects
- Vérifier les dossiers `src/pages/` et `src/services/` existent
- Vérifier l'autorisation de lecture/écriture

### Erreur: "Module not found"
- Vérifier les imports sont corrects
- Vérifier @/src/services/license existe
- Vérifier @/src/services/auth existe

### Erreur: "TypeScript compilation"
- Vérifier la version de TypeScript est récente
- Vérifier les types sont correctement importés
- Vérifier pas de duplication de déclarations

### Hot-reload ne fonctionne pas
- Rafraîchir la page manuellement (Ctrl+Shift+R)
- Redémarrer le serveur Vite
- Vérifier le fichier a bien été copié

## Checklist Final

Avant de dire "C'est fait":

- [ ] Script sync_licenses.py exécuté OU fichiers copiés manuellement
- [ ] Page Licenses se charge sans erreur
- [ ] Console (F12) sans messages d'erreur
- [ ] Boutons fonctionnent (Créer/Générer/Activer)
- [ ] Countdown affiche le temps correctement
- [ ] Toast messages s'affichent
- [ ] Chiffrement/déchiffrement fonctionne

## Besoin d'Aide?

Vérifier ces fichiers dans `/vercel/share/v0-project/`:

1. **README_LICENSES_IMPROVEMENTS.md** - Guide complet
2. **SYNC_TO_ACTIVE_PROJECT.md** - Instructions détaillées
3. **sync_licenses.py** - Script automatisé
4. **LICENSES_CONSOLIDATION_COMPLETE.md** - Résumé consolidation

---

**Temps estimé:** 2-5 minutes
**Difficulté:** Très facile (copier-coller de fichiers)
**Risque:** Aucun (pas de code supprimé, que de l'amélioration)

**→ EXÉCUTER LA SYNCHRONISATION MAINTENANT** ✓
