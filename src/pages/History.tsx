import * as React from 'react';
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Clock, Filter, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { db, ActivityLog } from '@/lib/database';

export default function History() {
  const navigate = useNavigate();
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterModule, setFilterModule] = useState('all');

  useEffect(() => { checkSession(); }, []);

  const checkSession = () => {
    const sessionData = localStorage.getItem('supermarket_session');
    if (!sessionData) { navigate('/auth'); return; }
    const parsed = JSON.parse(sessionData);
    if (!['SuperAdmin', 'Administrateur'].includes(parsed.user_type)) { navigate('/dashboard'); return; }
    loadLogs();
  };

  const loadLogs = async () => {
    const data = await db.getActivityLogs();
    setLogs(data.sort((a, b) => new Date(b.date_action).getTime() - new Date(a.date_action).getTime()));
    setLoading(false);
  };

  const actionTypes = [...new Set(logs.map(l => l.type_action))];
  const modules = [...new Set(logs.map(l => l.module))];

  const filteredLogs = logs
    .filter(l => filterType === 'all' || l.type_action === filterType)
    .filter(l => filterModule === 'all' || l.module === filterModule)
    .filter(l =>
      l.utilisateur?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.details?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.type_action?.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const getActionBadge = (action: string) => {
    const colors: Record<string, string> = {
      'Connexion': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      'Déconnexion': 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
      'Ajout': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      'Modification': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
      'Suppression': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      'Vente': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      'Approvisionnement': 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
      'Dépôt': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      'Retrait': 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
      'Initialisation': 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'
    };
    return colors[action] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link to="/dashboard"><Button variant="ghost" size="icon"><ArrowLeft className="w-5 h-5" /></Button></Link>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Historique des Activités</h1>
              <p className="text-muted-foreground">{filteredLogs.length} action(s)</p>
            </div>
          </div>
        </div>

        <Card className="mb-4">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Rechercher..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4" />
                    <SelectValue placeholder="Type d'action" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les actions</SelectItem>
                  {actionTypes.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={filterModule} onValueChange={setFilterModule}>
                <SelectTrigger>
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    <SelectValue placeholder="Module" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les modules</SelectItem>
                  {modules.map(mod => <SelectItem key={mod} value={mod}>{mod}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date & Heure</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Module</TableHead>
                  <TableHead>Utilisateur</TableHead>
                  <TableHead>Détails</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-8">Chargement...</TableCell></TableRow>
                ) : filteredLogs.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-8">Aucune activité</TableCell></TableRow>
                ) : (
                  filteredLogs.map(log => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <p>{new Date(log.date_action).toLocaleDateString('fr-FR')}</p>
                            <p className="text-xs text-muted-foreground">{new Date(log.date_action).toLocaleTimeString('fr-FR')}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell><Badge className={getActionBadge(log.type_action)}>{log.type_action}</Badge></TableCell>
                      <TableCell><Badge variant="outline">{log.module}</Badge></TableCell>
                      <TableCell className="font-medium">{log.utilisateur}</TableCell>
                      <TableCell className="max-w-[300px] truncate text-sm text-muted-foreground">{log.details}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
