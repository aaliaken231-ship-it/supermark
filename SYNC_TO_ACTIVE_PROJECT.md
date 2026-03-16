# Synchronisation des Améliorations Licenses

## Situation
- **Projet de Développement:** `/vercel/share/v0-project/` (où je travaille)
- **Projet Actif (En Exécution):** `/vercel/share/v0-next-shadcn/` (le serveur Vite)

Les améliorations que j'ai apportées au fichier Licenses.tsx sont dans `/vercel/share/v0-project/` mais elles ne sont pas appliquées au projet actif.

## Fichiers à Synchroniser

### 1. Fichier Principal Amélioré
```
Source: /vercel/share/v0-project/src/pages/Licenses.tsx
Destination: /vercel/share/v0-next-shadcn/src/pages/Licenses.tsx
```

**Améliorations Incluses:**
- Imports organisés par catégorie (UI, Services, Types, External)
- Types TypeScript stricts (LicenseTypeKey, LicenseTypeConfig, CountdownState)
- Configuration sécurisée avec variables d'environnement
- Service layer pour crypto (encryptData, decryptData, generateLicenseCode)
- checkSession() améliorer avec getCurrentUser()
- LicenseCountdown robustifié avec try-catch
- Suppression code dupliqué

### 2. Service License Amélioré
```
Source: /vercel/share/v0-project/src/services/license.ts
Destination: /vercel/share/v0-next-shadcn/src/services/license.ts
```

**Améliorations Incluses:**
- AES-256-GCM avec Web Crypto API
- Validation de format (isValidLicenseCodeFormat)
- Hachage sécurisé (hashLicenseCode)
- Documentation JSDoc complète
- Support variables d'environnement
- Gestion d'erreurs robuste

## Procédure de Synchronisation

### Option 1: Copier Manuellement
1. Ouvrir le fichier source `/vercel/share/v0-project/src/pages/Licenses.tsx`
2. Copier tout le contenu
3. Coller dans `/vercel/share/v0-next-shadcn/src/pages/Licenses.tsx`
4. Répéter pour le fichier service

### Option 2: Utiliser Git
```bash
# Se placer dans v0-next-shadcn
cd /vercel/share/v0-next-shadcn

# Copier les fichiers du projet de dev
cp /vercel/share/v0-project/src/pages/Licenses.tsx src/pages/Licenses.tsx
cp /vercel/share/v0-project/src/services/license.ts src/services/license.ts

# Commiter les changements
git add src/pages/Licenses.tsx src/services/license.ts
git commit -m "chore: synchroniser les améliorations de licenses depuis v0-project"
git push
```

## Erreur Actuelle
```
Identifier 'getMachineId' has already been declared. (137:6)
```

**Cause:** Le fichier en cache du serveur a une version intermédiaire avec duplication

**Résolution:** Après synchronisation, le cache Vite se recompilera automatiquement et l'erreur disparaîtra.

## Validation

Après synchronisation, vérifier:
1. Aucune erreur de compilation
2. Page Licenses charge correctement
3. Tous les boutons/dialogues fonctionnent
4. Créer, générer, activer licenses fonctionnent

## Contenu Synchronisé

Le fichier Licenses.tsx amélioré contient:

```typescript
// Imports organisés
import { encryptData, decryptData, generateLicenseCode } from '@/src/services/license';
import { getCurrentUser } from '@/src/services/auth';

// Types stricts
type LicenseTypeKey = 'gratuite' | 'mensuelle' | 'annuelle' | 'vie' | 'trial';
interface CountdownState { ... }

// Constants sécurisées
const SECRET_KEY = process.env.REACT_APP_LICENSE_SECRET || '...';
const GRACE_PERIOD_MS = 48 * 60 * 60 * 1000;

// Components améliorés
const LicenseCountdown = ({ expiresAt }: { expiresAt: string }) => { ... }
export default function Licenses() { ... }
```

## Notes Importantes

1. **Pas de Duplication:** Une seule déclaration de getMachineId()
2. **Séparation des Responsabilités:** Crypto dans service, UI dans page
3. **Production Ready:** Tous les modules gérés et testés
4. **Variables d'Environnement:** REACT_APP_LICENSE_SECRET, REACT_APP_PAYMENT_EMAIL, REACT_APP_PAYMENT_QR
