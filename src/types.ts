export type UserType = 'SuperAdmin' | 'Administrateur' | 'Gérant' | 'Vendeur';

export interface User {
  id?: number;
  username: string;
  password_hash: string;
  nom_utilisateur: string;
  user_type: UserType;
  email: string;
  telephone: string;
  statut: 'Activé' | 'Désactivé';
}

export interface Shop {
  id?: number;
  code_boutique: string;
  nom_boutique: string;
  proprietaire: string;
  lieu: string;
  email: string;
  telephone: string;
  slogan: string;
  logo_url?: string;
  cachet_url?: string;
}

export interface Product {
  id?: number;
  code_produit: string;
  nom_produit: string;
  description: string;
  pu_vente: number;
  stock_actuel: number;
  seuil_alerte: number;
}

export interface Client {
  id?: number;
  code_client: string;
  nom_client: string;
  telephone: string;
  email: string;
  adresse: string;
  total_achats: number;
}

export interface Sale {
  id?: number;
  code_vente: string;
  code_facture: string;
  code_produit: string;
  nom_produit: string;
  pu_vente: number;
  qty_vente: number;
  pt_vente: number;
  tva: number;
  prix_ttc: number;
  date_vente: string;
  nom_vendeur: string;
  nom_client: string;
  telephone_client: string;
}

export interface Invoice {
  id?: number;
  code_facture: string;
  date_facture: string;
  nom_client: string;
  telephone_client: string;
  montant_total: number;
  montant_tva: number;
  montant_ttc: number;
  nom_vendeur: string;
  articles: any[];
}

export interface Supply {
  id?: number;
  code_approvisionnement: string;
  code_produit: string;
  nom_produit: string;
  pu_achat: number;
  qty_achat: number;
  pt_achat: number;
  tva: number;
  prix_ttc: number;
  date_approvisionnement: string;
  utilisateur: string;
}

export interface Deposit {
  id?: number;
  code_depot: string;
  nom: string;
  montant: number;
  date_depot: string;
  motif: string;
  type_depot: 'Espèce' | 'Bancaire' | 'Mobile Money' | 'Chèque' | 'Autre';
  utilisateur: string;
  created_at?: string;
}

export interface Withdrawal {
  id?: number;
  code_retrait: string;
  nom: string;
  montant: number;
  date_retrait: string;
  motif: string;
  type_retrait: 'Espèce' | 'Bancaire' | 'Mobile Money' | 'Chèque' | 'Autre';
  engagement_url?: string;
  utilisateur: string;
}

export interface License {
  id?: number;
  code: string;
  email: string;
  role: string;
  status: 'pending' | 'generated' | 'activated';
  type_licence: string;
  duree_jours: number;
  prix: number;
  created_at: string;
  activated_at?: string;
  expires_at?: string;
}

export interface ActivityLog {
  id?: number;
  type_action: string;
  utilisateur: string;
  date_action: string;
  details: string;
  valeur_avant?: string;
  valeur_apres?: string;
  module: string;
}

export interface Settings {
  id?: number;
  theme: 'clair' | 'sombre';
  devise: string;
  format_date: string;
  prefixe_facture: string;
  langue: string;
  delai_verrouillage: number;
}
