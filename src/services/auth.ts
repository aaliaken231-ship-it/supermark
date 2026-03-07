import { hashPassword } from '../utils';
import { getAll, add, STORES } from './db';
import { User } from '../types';
import CryptoJS from 'crypto-js';

const SESSION_KEY = 'supermarket_session';
const SESSION_SECRET = 'supermarket-session-secret-key-2026';

export async function login(username: string, password_plain: string): Promise<User | null> {
  const users = await getAll(STORES.USERS) as User[];
  const hashed = await hashPassword(password_plain);
  
  const user = users.find(u => u.username === username && u.password_hash === hashed);
  
  if (user && user.statut === 'Activé') {
    const sessionData = {
      id: user.id,
      username: user.username,
      nom_utilisateur: user.nom_utilisateur,
      user_type: user.user_type,
      email: user.email,
      loginTime: new Date().toISOString()
    };
    
    // Sign the session data
    const signature = CryptoJS.HmacSHA256(JSON.stringify(sessionData), SESSION_SECRET).toString();
    const session = {
      data: sessionData,
      signature: signature
    };
    
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return user;
  }
  
  return null;
}

export function getCurrentUser() {
  const sessionStr = localStorage.getItem(SESSION_KEY);
  if (!sessionStr) return null;
  
  try {
    const session = JSON.parse(sessionStr);
    if (!session.data || !session.signature) return null;
    
    // Verify signature
    const expectedSignature = CryptoJS.HmacSHA256(JSON.stringify(session.data), SESSION_SECRET).toString();
    if (session.signature !== expectedSignature) {
      console.error('Session signature mismatch!');
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
    
    return session.data;
  } catch (e) {
    return null;
  }
}

export function logout() {
  localStorage.removeItem(SESSION_KEY);
}

export async function seedInitialShop() {
  const shops = await getAll(STORES.SHOP);
  if (shops.length === 0) {
    await add(STORES.SHOP, {
      code_boutique: 'SHP-001',
      nom_boutique: 'Au Super Marché',
      proprietaire: 'Christophe Folinga',
      lieu: 'Kinshasa, RDC',
      email: 'contact@supergere.cd',
      telephone: '+243 000 000 000',
      slogan: 'Qualité, Service et Fraîcheur au quotidien !',
      logo_url: '',
      cachet_url: ''
    });
  }
}

export async function seedInitialProducts() {
  const products = await getAll(STORES.PRODUCTS);
  if (products.length === 0) {
    const sampleProducts = [
      { code_produit: 'PRD-001', nom_produit: 'Lait Nido 400g', pu_vente: 12000, stock_actuel: 50, seuil_alerte: 10, categorie: 'Alimentation' },
      { code_produit: 'PRD-002', nom_produit: 'Riz Basmati 5kg', pu_vente: 25000, stock_actuel: 30, seuil_alerte: 5, categorie: 'Alimentation' },
      { code_produit: 'PRD-003', nom_produit: 'Huile Végétale 5L', pu_vente: 18000, stock_actuel: 20, seuil_alerte: 5, categorie: 'Alimentation' },
      { code_produit: 'PRD-004', nom_produit: 'Savon Le Coq', pu_vente: 1500, stock_actuel: 100, seuil_alerte: 20, categorie: 'Hygiène' },
      { code_produit: 'PRD-005', nom_produit: 'Pâtes Panzani 500g', pu_vente: 3500, stock_actuel: 40, seuil_alerte: 10, categorie: 'Alimentation' }
    ];

    for (const p of sampleProducts) {
      await add(STORES.PRODUCTS, p);
    }
  }
}

export async function seedInitialUsers() {
  const users = await getAll(STORES.USERS);
  if (users.length === 0) {
    const adminHash = await hashPassword('1225');
    const superAdminHash = await hashPassword('12345');
    
    await add(STORES.USERS, {
      username: 'Admin',
      password_hash: adminHash,
      nom_utilisateur: 'Administrateur Principal',
      user_type: 'Administrateur',
      email: 'admin@supermarket.com',
      telephone: '000000000',
      statut: 'Activé'
    });
    
    await add(STORES.USERS, {
      username: 'Adminnos',
      password_hash: superAdminHash,
      nom_utilisateur: 'Super Administrateur',
      user_type: 'SuperAdmin',
      email: 'christophefolinga@gmail.com',
      telephone: '111111111',
      statut: 'Activé'
    });
  }
  
  await seedInitialShop();
  await seedInitialProducts();
}
