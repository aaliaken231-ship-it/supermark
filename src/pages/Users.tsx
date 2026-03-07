import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  UserCircle,
  Shield,
  CheckCircle2,
  XCircle,
  ArrowLeft
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import Modal from '../components/Modal';
import { getAll, add, put, remove, STORES } from '../services/db';
import { User, UserType } from '../types';
import { cn, hashPassword } from '../utils';

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    nom_utilisateur: '',
    user_type: 'Vendeur' as UserType,
    email: '',
    telephone: '',
    statut: 'Activé' as 'Activé' | 'Désactivé'
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    const data = await getAll(STORES.USERS);
    setUsers(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const userData: any = { ...formData };
    if (formData.password) {
      userData.password_hash = await hashPassword(formData.password);
    }
    delete userData.password;

    if (editingUser) {
      await put(STORES.USERS, { ...editingUser, ...userData });
    } else {
      await add(STORES.USERS, {
        ...userData,
        password_hash: await hashPassword(formData.password || '12345')
      });
    }
    
    setIsModalOpen(false);
    setEditingUser(null);
    setFormData({
      username: '',
      password: '',
      nom_utilisateur: '',
      user_type: 'Vendeur',
      email: '',
      telephone: '',
      statut: 'Activé'
    });
    loadUsers();
  };

  const handleEdit = (user: User) => {
    if (['Admin', 'Adminnos'].includes(user.username)) {
      alert("Les utilisateurs système ne peuvent pas être modifiés ici.");
      return;
    }
    setEditingUser(user);
    setFormData({
      username: user.username,
      password: '',
      nom_utilisateur: user.nom_utilisateur,
      user_type: user.user_type,
      email: user.email,
      telephone: user.telephone,
      statut: user.statut
    });
    setIsModalOpen(true);
  };

  const toggleStatus = async (user: User) => {
    if (['Admin', 'Adminnos'].includes(user.username)) return;
    const newStatus = user.statut === 'Activé' ? 'Désactivé' : 'Activé';
    await put(STORES.USERS, { ...user, statut: newStatus });
    loadUsers();
  };

  const handleDelete = async (user: User) => {
    if (['Admin', 'Adminnos'].includes(user.username)) return;
    if (confirm('Supprimer cet utilisateur ?')) {
      await remove(STORES.USERS, user.id!);
      loadUsers();
    }
  };

  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(search.toLowerCase()) ||
    u.nom_utilisateur.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="p-2 hover:bg-slate-100 rounded-full transition-colors">
              <ArrowLeft className="w-6 h-6 text-slate-600" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Utilisateurs</h1>
              <p className="text-slate-500 font-medium">Gérez les accès et les rôles du personnel</p>
            </div>
          </div>
          <button 
            onClick={() => {
              setEditingUser(null);
              setFormData({
                username: '',
                password: '',
                nom_utilisateur: '',
                user_type: 'Vendeur',
                email: '',
                telephone: '',
                statut: 'Activé'
              });
              setIsModalOpen(true);
            }}
            className="bg-emerald-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg hover:bg-emerald-700 transition-all flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Ajouter Utilisateur
          </button>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center gap-4">
            <Search className="w-5 h-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Rechercher un utilisateur..." 
              className="flex-1 outline-none font-medium text-slate-700"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-slate-400 font-bold text-xs uppercase tracking-widest">
                  <th className="px-6 py-4">Utilisateur</th>
                  <th className="px-6 py-4">Rôle</th>
                  <th className="px-6 py-4">Contact</th>
                  <th className="px-6 py-4">Statut</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredUsers.map(user => (
                  <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
                          {user.nom_utilisateur[0]}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{user.nom_utilisateur}</p>
                          <p className="text-xs text-slate-500">@{user.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Shield className={cn(
                          "w-4 h-4",
                          user.user_type === 'SuperAdmin' ? "text-purple-500" :
                          user.user_type === 'Administrateur' ? "text-blue-500" :
                          user.user_type === 'Gérant' ? "text-emerald-500" : "text-slate-400"
                        )} />
                        <span className="text-sm font-bold text-slate-700">{user.user_type}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-slate-900">{user.email}</p>
                      <p className="text-xs text-slate-500">{user.telephone}</p>
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => toggleStatus(user)}
                        disabled={['Admin', 'Adminnos'].includes(user.username)}
                        className={cn(
                          "px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all",
                          user.statut === 'Activé' 
                            ? "bg-emerald-100 text-emerald-600 hover:bg-emerald-200" 
                            : "bg-rose-100 text-rose-600 hover:bg-rose-200"
                        )}
                      >
                        {user.statut === 'Activé' ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        {user.statut}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleEdit(user)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(user)}
                          className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingUser ? "Modifier l'utilisateur" : "Nouvel utilisateur"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Username</label>
              <input 
                type="text" 
                required
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Mot de passe</label>
              <input 
                type="password" 
                placeholder={editingUser ? "Laisser vide pour garder" : "Mot de passe"}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase">Nom Complet</label>
            <input 
              type="text" 
              required
              value={formData.nom_utilisateur}
              onChange={(e) => setFormData({ ...formData, nom_utilisateur: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase">Type d'utilisateur</label>
            <select 
              value={formData.user_type}
              onChange={(e) => setFormData({ ...formData, user_type: e.target.value as UserType })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
            >
              <option value="Vendeur">Vendeur</option>
              <option value="Gérant">Gérant</option>
              <option value="Administrateur">Administrateur</option>
              <option value="SuperAdmin">SuperAdmin</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Email</label>
              <input 
                type="email" 
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Téléphone</label>
              <input 
                type="text" 
                value={formData.telephone}
                onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
          </div>
          <div className="flex gap-3 pt-6">
            <button 
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="flex-1 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-all"
            >
              Annuler
            </button>
            <button 
              type="submit"
              className="flex-1 bg-emerald-600 text-white py-3 rounded-xl font-bold shadow-lg hover:bg-emerald-700 transition-all"
            >
              Enregistrer
            </button>
          </div>
        </form>
      </Modal>
    </Layout>
  );
}
