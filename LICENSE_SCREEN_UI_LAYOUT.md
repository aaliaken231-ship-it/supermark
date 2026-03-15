# Guide Visual - Mise en Page LicenseScreen

## Vue d'Ensemble

La page de gestion des licences utilise une architecture en couches pour présenter l'information de manière claire et hiérarchique.

---

## Layout Général

```
┌─────────────────────────────────────────┐
│  ◄  Gestion des Licences                │  ← TopAppBar (Primary)
├─────────────────────────────────────────┤
│                                         │
│  CONTENU (LazyColumn)                   │
│  - Status Card                          │
│  - License Details Card                 │
│  - Action Buttons                       │
│                                         │
└─────────────────────────────────────────┘
```

---

## État: Licence Active (Success)

### Status Card
```
┌─────────────────────────────────────┐
│                                     │
│          ✓ (56x56)                  │  ← Icône CheckCircle
│                                     │
│    Licence Active                   │  ← Titre (headlineSmall)
│    PROFESSIONAL                     │  ← Label (labelLarge, planColor)
│                                     │
│    Validité                  30/365 │  ← Texte + Nombre jours
│    ████████░░░░░░░░░░░░░░░░         │  ← LinearProgressIndicator
│                                     │
└─────────────────────────────────────┘
```

**Couleurs Dynamiques:**
- `trial` → Tertiary (Violet)
- `professional` → Secondary (Bleu)
- `enterprise` → Primary (Vert)

---

### License Details Card

```
┌─────────────────────────────────────┐
│                                     │
│  Détails de la Licence              │  ← titleMedium, Bold
│  ──────────────────────────────────  │  ← HorizontalDivider
│                                     │
│  ID Licence          [COPY ICON]    │  ← LicenseDetailRowWithCopy
│  abc-123-...                        │  ← Monospace, selectable
│                                     │
│  Clé Licence         [COPY ICON]    │  ← LicenseDetailRowWithCopy
│  ABCD-EFGH-IJKL-MNOP                │  ← Format 4-4-4-4
│                                     │
│  ──────────────────────────────────  │  ← HorizontalDivider
│                                     │
│  Plan          │  Statut            │  ← Deux colonnes
│  PROFESSIONAL  │  Actif (✓)         │
│                │  (Couleur: Secondary)
│                                     │
│  ──────────────────────────────────  │  ← HorizontalDivider
│                                     │
│  Limites du Plan                    │  ← labelMedium, Bold
│                                     │
│  Utilisateurs Max        10         │  ← LicenseDetailRow
│  Produits Max            5,000      │  ← LicenseDetailRow
│  Ventes/Mois Max         100,000    │  ← LicenseDetailRow
│                                     │
│  ──────────────────────────────────  │  ← HorizontalDivider
│                                     │
│  Date Création    │  Date Expiration │  ← Deux colonnes
│  15/03/2026       │  15/04/2026     │
│                                     │
└─────────────────────────────────────┘
```

---

### Action Buttons

```
┌────────────────┬────────────────┐
│  ↻ Renouveler  │  ⬇ Télécharger │  ← OutlinedButton + Button
│  (48px height) │  (48px height) │     (RoundedCornerShape 8.dp)
└────────────────┴────────────────┘
```

**Interactions:**
- Renouveler → Ouvre Renew Dialog
- Télécharger → Ouvre Download Dialog

---

## État: Pas de Licence (NoLicense)

### No License Card

```
┌─────────────────────────────────────┐
│                                     │
│          ℹ (56x56)                  │  ← Icône Info
│                                     │
│  Aucune Licence Active              │  ← headlineSmall, Bold
│                                     │
│  Activez une licence d'essai        │  ← bodyMedium
│  gratuite pour accéder à tous les   │
│  services pendant 30 jours          │
│                                     │
│  ┌─────────────────────────────────┐│
│  │  ✓ Créer Licence d'Essai 30j   ││  ← Button (Primary)
│  │  (50px height)                  ││     (RoundedCornerShape 8.dp)
│  └─────────────────────────────────┘│
│                                     │
└─────────────────────────────────────┘
```

### Plans Information Card

```
┌─────────────────────────────────────┐
│                                     │
│  Plans Disponibles                  │  ← titleMedium, Bold
│                                     │
│  ESSAI                              │  ← PlanInfoItem
│  30 jours                           │
│  • Max utilisateurs: 5              │
│  • Max produits: 500                │
│  • Max ventes/mois: 10,000          │
│                                     │
│  ─────────────────────────────────  │  ← HorizontalDivider
│                                     │
│  PROFESSIONNEL                      │  ← PlanInfoItem
│  1 an                               │
│  • Max utilisateurs: 10             │
│  • Max produits: 5,000              │
│  • Max ventes/mois: 100,000         │
│                                     │
│  ─────────────────────────────────  │  ← HorizontalDivider
│                                     │
│  ENTREPRISE                         │  ← PlanInfoItem
│  1 an                               │
│  • Max utilisateurs: Illimité       │
│  • Max produits: Illimité           │
│  • Max ventes/mois: Illimité        │
│                                     │
└─────────────────────────────────────┘
```

---

## État: Chargement (Loading)

```
┌─────────────────────────────────────┐
│                                     │
│                                     │
│              ○ ◐ ○                  │  ← CircularProgressIndicator
│              ◑   ◑                  │     (Centré, 32x32)
│              ○ ◑ ○                  │
│                                     │
│                                     │
└─────────────────────────────────────┘
```

---

## État: Erreur (Error)

```
┌─────────────────────────────────────┐
│                                     │
│          ✗ (56x56)                  │  ← Icône Error (Red)
│                                     │
│  Erreur                             │  ← headlineSmall, Bold
│                                     │
│  Message d'erreur détaillé...       │  ← bodyMedium
│  (ex: "Impossible de charger la     │     La vraie erreur affichée
│        licence")                    │
│                                     │
│  ┌─────────────────────────────────┐│
│  │  ↻ Réessayer                    ││  ← Button
│  │  (50px height)                  ││     (RoundedCornerShape 8.dp)
│  └─────────────────────────────────┘│
│                                     │
└─────────────────────────────────────┘
```

---

## Dialogues Interactives

### Dialog: Créer Licence d'Essai

```
┌────────────────────────────────────┐
│  Créer une Licence d'Essai         │  ← Titre
├────────────────────────────────────┤
│                                    │
│  Vous allez créer une licence      │  ← bodyMedium
│  d'essai gratuite de 30 jours.     │
│  Cette licence vous donnera accès  │
│  à toutes les fonctionnalités de   │
│  SuperMark.                        │
│                                    │
├────────────────────────────────────┤
│       [Créer]           [Annuler]  │  ← TextButtons
└────────────────────────────────────┘
```

### Dialog: Renouveler Licence

```
┌────────────────────────────────────┐
│  Renouveler la Licence             │  ← Titre
├────────────────────────────────────┤
│                                    │
│  Voulez-vous renouveler votre      │  ← bodyMedium
│  licence pour 30 jours             │
│  supplémentaires?                  │
│                                    │
├────────────────────────────────────┤
│   [Renouveler]         [Annuler]   │  ← TextButtons
└────────────────────────────────────┘
```

### Dialog: Télécharger Licence

```
┌────────────────────────────────────┐
│  Télécharger la Licence            │  ← Titre
├────────────────────────────────────┤
│                                    │
│  Pour télécharger votre licence,   │  ← bodyMedium
│  veuillez contacter notre équipe   │
│  support.                          │
│                                    │
│  Email: support@supermark.com      │  ← bodySmall (Monospace)
│                                    │     (Couleur: primary)
│                                    │
├────────────────────────────────────┤
│             [Fermer]               │  ← TextButton
└────────────────────────────────────┘
```

---

## Composables Détaillées

### LicenseDetailRow
```
┌─────────────────────────────────────┐
│  Label              │  Value         │  ← Deux colonnes
│  (labelSmall)       │  (bodySmall)   │     SpaceBetween
└─────────────────────────────────────┘
```

### LicenseDetailRowWithCopy
```
┌─────────────────────────────────────────────────┐
│  Label                              [COPY ICON] │
│  Value (Monospace, Selectable)                  │
└─────────────────────────────────────────────────┘
```

### PlanInfoItem
```
┌─────────────────────────────────────┐
│  NOM DU PLAN                        │  ← labelLarge, Bold
│  Durée (jours/ans)                  │  ← labelSmall
│                                     │
│  • Max utilisateurs: X              │  ← bodySmall
│  • Max produits: Y                  │  ← bodySmall
│  • Max ventes/mois: Z               │  ← bodySmall
│                                     │
└─────────────────────────────────────┘
```

---

## Spacing & Dimensions

### Padding
- Card content: 20dp - 24dp
- Screen sides: 16dp
- Between items: 12dp - 20dp

### Heights
- Buttons: 50dp (avec Icon)
- LinearProgressIndicator: 10dp
- Icons: 48dp - 56dp

### Shapes
- Cards: RoundedCornerShape(12.dp)
- Buttons: RoundedCornerShape(8.dp)

---

## Couleurs Utilisées

### Dynamiques (Par Plan)
```kotlin
trial       → MaterialTheme.colorScheme.tertiary
professional → MaterialTheme.colorScheme.secondary
enterprise  → MaterialTheme.colorScheme.primary
```

### Statiques
```kotlin
Background      → MaterialTheme.colorScheme.background
Surface         → MaterialTheme.colorScheme.surface
Error           → MaterialTheme.colorScheme.error
OnBackground    → MaterialTheme.colorScheme.onBackground
OnSurfaceVariant → MaterialTheme.colorScheme.onSurfaceVariant
```

### Opacités
```kotlin
Texte secondaire    → .copy(0.6f)
Texte désactivé     → .copy(0.7f)
Texte atténué       → .copy(0.85f)
Track progress      → .copy(0.3f)
```

---

## Responsive Design

### Mobile (< 600dp)
- Boutons: Full width avec Row(weight = 1f)
- Texte: 14sp-16sp pour lisibilité
- Cards: Padding adapté

### Tablet (≥ 600dp)
- Même layout (adapté avec weight)
- Texte légèrement plus grand possible

---

## Animations

### Progress Bar
```kotlin
LinearProgressIndicator(
    progress = progress.coerceIn(0f, 1f),  // Animate smoothly
    modifier = Modifier.fillMaxWidth()
)
```

### Dialog Transitions
```kotlin
AlertDialog(
    onDismissRequest = { ... },  // Fade in/out
    ...
)
```

---

## Accessibilité

- ✅ Icônes avec contentDescription
- ✅ Texte contrastant
- ✅ Boutons 48dp+ pour tappable
- ✅ Clés sélectionnables (SelectionContainer)
- ✅ Couleurs pas seule information

---

## Performance Considerations

- LazyColumn pour optimisation
- StateFlow pour réactivité
- Recomposition minimale
- Pas d'images lourdes
- Text soigneusement optimisé

---

## Conclusion

La mise en page est professionnelle, claire et intuitive, avec une hiérarchie visuelle bien définie et une accessibilité optimale sur tous les appareils.
