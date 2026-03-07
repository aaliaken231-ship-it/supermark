import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  User, 
  Phone, 
  Mail, 
  MapPin,
  TrendingUp,
  ArrowLeft
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import Modal from '../components/Modal';
import { getAll, add, put, remove, STORES } from '../services/db';
import { Client } from '../types';
import { formatCurrency, generateId } from '../utils';

export default function Clients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [formData, setFormData] = useState({
    nom_client: '',
    telephone: '',
    email: '',
    adresse: ''
  });

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    const data = await getAll(STORES.CLIENTS);
    setClients(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingClient) {
      await put(STORES.CLIENTS, { ...editingClient, ...formData });
    } else {
      await add(STORES.CLIENTS, {
        ...formData,
        code_client: generateId('CLT'),
        total_achats: 0
      });
    }
    setIsModalOpen(false);
    setEditingClient(null);
    setFormData({ nom_client: '', telephone: '', email: '', adresse: '' });
    loadClients();
  };

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setFormData({
      nom_client: client.nom_client,
      telephone: client.telephone,
      email: client.email,
      adresse: client.adresse
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Supprimer ce client ?')) {
      await remove(STORES.CLIENTS, id);
      loadClients();
    }
  };

  const filteredClients = clients.filter(c => 
    c.nom_client.toLowerCase().includes(search.toLowerCase()) ||
    c.telephone.includes(search)
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
              <h1 className="text-3xl font-bold text-slate-900">Clients</h1>
              <p className="text-slate-500 font-medium">Gérez votre base de données clients</p>
            </div>
          </div>
          <button 
            onClick={() => {
              setEditingClient(null);
              setFormData({ nom_client: '', telephone: '', email: '', adresse: '' });
              setIsModalOpen(true);
            }}
            className="bg-emerald-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg hover:bg-emerald-700 transition-all flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Nouveau Client
          </button>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center gap-4">
            <Search className="w-5 h-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Rechercher par nom ou téléphone..." 
              className="flex-1 outline-none font-medium text-slate-700"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-slate-400 font-bold text-xs uppercase tracking-widest">
                  <th className="px-6 py-4">Client</th>
                  <th className="px-6 py-4">Contact</th>
                  <th className="px-6 py-4">Adresse</th>
                  <th className="px-6 py-4">Total Achats</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredClients.map(client => (
                  <tr key={client.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold">
                          {client.nom_client[0]}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{client.nom_client}</p>
                          <p className="text-[10px] font-mono text-slate-400">{client.code_client}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Phone className="w-3 h-3" />
                          {client.telephone}
                        </div>
                        {client.email && (
                          <div className="flex items-center gap-2 text-xs text-slate-400">
                            <Mail className="w-3 h-3" />
                            {client.email}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <MapPin className="w-4 h-4" />
                        {client.adresse || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-emerald-500" />
                        <span className="font-black text-slate-900">{formatCurrency(client.total_achats)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleEdit(client)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(client.id!)}
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
        title={editingClient ? "Modifier le client" : "Nouveau client"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase">Nom Complet</label>
            <input 
              type="text" 
              required
              value={formData.nom_client}
              onChange={(e) => setFormData({ ...formData, nom_client: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Téléphone</label>
              <input 
                type="text" 
                required
                value={formData.telephone}
                onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Email</label>
              <input 
                type="email" 
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase">Adresse</label>
            <textarea 
              value={formData.adresse}
              onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none h-24 resize-none"
            />
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
