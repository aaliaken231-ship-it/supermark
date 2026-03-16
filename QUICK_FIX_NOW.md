# FIX RAPIDE - 2 minutes

## Le Problème
Cache Vite obsolète → Erreur `getMachineId has already been declared`

## LA SOLUTION

Exécutez une seule commande dans votre terminal:

```bash
rm -rf /vercel/share/v0-next-shadcn/.vite /vercel/share/v0-next-shadcn/node_modules/.vite && cd /vercel/share/v0-next-shadcn && npm run dev
```

Ou si vous utilisez yarn:

```bash
rm -rf /vercel/share/v0-next-shadcn/.vite /vercel/share/v0-next-shadcn/node_modules/.vite && cd /vercel/share/v0-next-shadcn && yarn dev
```

## Étapes Détaillées (Si la commande ci-dessus ne fonctionne pas)

1. **Arrêtez le serveur** (Ctrl+C)
2. **Nettoyez les caches:**
   ```bash
   cd /vercel/share/v0-next-shadcn
   rm -rf .vite node_modules/.vite
   ```
3. **Relancez le serveur:**
   ```bash
   npm run dev
   ```
4. **Rafraîchissez le navigateur** (Ctrl+Shift+R)

## Ça marche?
✓ Oui → Application fonctionnelle
✗ Non → Voir fichiers de solution complets (VITE_CACHE_SOLUTION.md)
