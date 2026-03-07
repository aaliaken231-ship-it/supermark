import { openDB, IDBPDatabase } from 'idb';

const DB_NAME = 'supermarket_db';
const DB_VERSION = 1;

export const STORES = {
  USERS: 'users',
  SHOP: 'shop',
  PRODUCTS: 'products',
  CLIENTS: 'clients',
  SALES: 'sales',
  INVOICES: 'invoices',
  SUPPLIES: 'supplies',
  DEPOSITS: 'deposits',
  WITHDRAWALS: 'withdrawals',
  LICENSE: 'license',
  LOGS: 'activity_logs',
  SETTINGS: 'settings',
  SYSTEM: 'system',
  FAILED_ACTIVATIONS: 'failed_activations',
};

export async function initDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      Object.values(STORES).forEach((storeName) => {
        if (!db.objectStoreNames.contains(storeName)) {
          const store = db.createObjectStore(storeName, { keyPath: 'id', autoIncrement: true });
          
          // Add indexes for specific stores
          if (storeName === STORES.USERS) {
            store.createIndex('username', 'username', { unique: true });
          }
        }
      });
    },
  });
}

let dbPromise: Promise<IDBPDatabase> | null = null;

export function getDB() {
  if (!dbPromise) {
    dbPromise = initDB().catch(err => {
      console.error('Failed to initialize IndexedDB:', err);
      dbPromise = null;
      throw err;
    });
  }
  return dbPromise;
}

export async function getAll(storeName: string) {
  const db = await getDB();
  return db.getAll(storeName);
}

export async function getById(storeName: string, id: any) {
  const db = await getDB();
  return db.get(storeName, id);
}

export async function add(storeName: string, data: any) {
  const db = await getDB();
  const id = await db.add(storeName, { ...data, createdAt: new Date().toISOString() });
  return id;
}

export async function put(storeName: string, data: any) {
  const db = await getDB();
  return db.put(storeName, { ...data, updatedAt: new Date().toISOString() });
}

export async function remove(storeName: string, id: any) {
  const db = await getDB();
  return db.delete(storeName, id);
}

export const db = {
  getProducts: () => getAll(STORES.PRODUCTS),
  getShops: () => getAll(STORES.SHOP),
  getUsers: () => getAll(STORES.USERS),
  getInvoices: () => getAll(STORES.INVOICES),
  getInvoicesByVendeur: async (vendeur: string) => {
    const all = await getAll(STORES.INVOICES);
    return all.filter(inv => inv.nom_vendeur === vendeur);
  },
  addInvoice: (data: any) => add(STORES.INVOICES, data),
  addSale: (data: any) => add(STORES.SALES, data),
  updateProduct: (data: any) => put(STORES.PRODUCTS, data),
  addProduct: (data: any) => add(STORES.PRODUCTS, data),
  deleteProduct: (id: any) => remove(STORES.PRODUCTS, id),
  addActivityLog: (data: any) => add(STORES.LOGS, data),
  getClients: () => getAll(STORES.CLIENTS),
  updateClient: (data: any) => put(STORES.CLIENTS, data),
  addClient: (data: any) => add(STORES.CLIENTS, data),
  getLicenses: () => getAll(STORES.LICENSE),
  getActiveLicense: async () => {
    const licenses = await getAll(STORES.LICENSE);
    const now = new Date();
    // Grace period: 48 hours
    const gracePeriod = 48 * 60 * 60 * 1000;
    
    return licenses.find(l => {
      if (l.status !== 'activated' || !l.expires_at) return false;
      const expiry = new Date(l.expires_at);
      return expiry.getTime() + gracePeriod > now.getTime();
    });
  },
  addLicense: (data: any) => add(STORES.LICENSE, data),
  updateLicense: (data: any) => put(STORES.LICENSE, data),
  getDeposits: () => getAll(STORES.DEPOSITS),
  addDeposit: (data: any) => add(STORES.DEPOSITS, data),
  deleteDeposit: (id: any) => remove(STORES.DEPOSITS, id),
  getWithdrawals: () => getAll(STORES.WITHDRAWALS),
  addWithdrawal: (data: any) => add(STORES.WITHDRAWALS, data),
  deleteWithdrawal: (id: any) => remove(STORES.WITHDRAWALS, id),
  getSupplies: () => getAll(STORES.SUPPLIES),
  addSupply: (data: any) => add(STORES.SUPPLIES, data),
  updateSupply: (data: any) => put(STORES.SUPPLIES, data),
  deleteSupply: (id: any) => remove(STORES.SUPPLIES, id),
  getSales: () => getAll(STORES.SALES),
  getSalesByVendeur: async (vendeur: string) => {
    const all = await getAll(STORES.SALES);
    return all.filter(sale => sale.nom_vendeur === vendeur);
  },
  getActivityLogs: () => getAll(STORES.LOGS),
  getCaisseBalance: async () => {
    const [invoices, deposits, withdrawals] = await Promise.all([
      getAll(STORES.INVOICES),
      getAll(STORES.DEPOSITS),
      getAll(STORES.WITHDRAWALS)
    ]);
    const totalSales = invoices.reduce((sum, inv) => sum + (inv.montant_ttc || 0), 0);
    const totalDeposits = deposits.reduce((sum, d) => sum + (d.montant || 0), 0);
    const totalWithdrawals = withdrawals.reduce((sum, w) => sum + (w.montant || 0), 0);
    return totalSales + totalDeposits - totalWithdrawals;
  }
};
