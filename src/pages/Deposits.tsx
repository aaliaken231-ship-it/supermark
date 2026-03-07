import * as React from 'react';
import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Search, AlertCircle, TrendingUp, Calendar, Wallet, CalendarDays } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { db, Deposit } from '@/lib/database';
import { generateCode } from '@/lib/utils';
import { toast } from 'sonner';

export default function Deposits() {
  const navigate = useNavigate();
  const [session, setSession] = useState<any>(null);
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedDeposit, setSelectedDeposit] = useState<Deposit | null>(null);
  const [formData, setFormData] = useState({
    code_depot: '',
    nom: '',
    montant: 0,
    motif: '',
    type_depot: 'Espèce' as any
  });
  const [error, setError] = useState('');

  useEffect(() => { checkSession(); }, []);

  const checkSession = () => {
    const sessionData = localStorage.getItem('supermarket_session');
    if (!sessionData) { navigate('/auth'); return; }
    const parsed = JSON.parse(sessionData);
    if (!['SuperAdmin', 'Administrateur'].includes(parsed.user_type)) { navigate('/dashboard'); return; }
    setSession(parsed);
    loadDeposits();
  };

  const loadDeposits = async () => {
    const data = await db.getDeposits();
    setDeposits(data.sort((a, b) => new Date(b.date_depot).getTime() - new Date(a.date_depot).getTime()));
    setLoading(false);
  };

  const handleOpenModal = () => {
    setSelectedDeposit(null);
    setFormData({
      code_depot: generateCode('DEP'),
      nom: '',
      montant: 0,
      motif: '',
      type_depot: 'Espèce'
    });
    setError('');
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.nom.trim() || formData.montant <= 0) {
      setError('Remplissez tous les champs obligatoires');
      return;
    }

    const now = new Date().toISOString();
    try {
      await db.addDeposit({ 
        ...formData, 
        date_depot: now, 
        utilisateur: session.nom_utilisateur, 
        created_at: now 
      });

      await db.addActivityLog({
        type_action: 'Dépôt',
        utilisateur: session.nom_utilisateur,
        date_action: now,
        details: `Nouveau dépôt: ${formData.nom} - ${formData.montant.toLocaleString()} FC (${formData.type_depot})`,
        module: 'Dépôts',
        created_at: now
      });

      toast.success("Dépôt enregistré", {
        description: `${formData.montant.toLocaleString()} FC déposé avec succès`,
      });

      setShowModal(false);
      loadDeposits();
    } catch (e: any) {
      setError(e.message || 'Erreur');
    }
  };

  const handleDelete = async () => {
    if (!selectedDeposit) return;
    await db.deleteDeposit(selectedDeposit.id!);
    await db.addActivityLog({
      type_action: 'Suppression',
      utilisateur: session.nom_utilisateur,
      date_action: new Date().toISOString(),
      details: `Suppression dépôt: ${selectedDeposit.nom} - ${selectedDeposit.montant.toLocaleString()} FC`,
      module: 'Dépôts',
      created_at: new Date().toISOString()
    });
    
    toast.error("Dépôt supprimé");
    
    setShowDeleteDialog(false);
    loadDeposits();
  };

  const filteredDeposits = deposits.filter(d =>
    d.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.motif?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.code_depot?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Stats calculations
  const stats = useMemo(() => {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    const totalDeposits = deposits.reduce((sum, d) => sum + (d.montant || 0), 0);
    const todayDeposits = deposits
      .filter(d => new Date(d.date_depot) >= startOfDay)
      .reduce((sum, d) => sum + (d.montant || 0), 0);
    const monthDeposits = deposits
      .filter(d => new Date(d.date_depot) >= startOfMonth)
      .reduce((sum, d) => sum + (d.montant || 0), 0);
    
    return { totalDeposits, todayDeposits, monthDeposits };
  }, [deposits]);

  const getTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      'Espèce': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      'Bancaire': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      'Mobile Money': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      'Chèque': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
      'Autre': 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
    };
    return colors[type] || colors['Autre'];
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link to="/dashboard"><Button variant="ghost" size="icon"><ArrowLeft className="w-5 h-5" /></Button></Link>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Dépôts</h1>
              <p className="text-muted-foreground">Gestion des entrées de caisse</p>
            </div>
          </div>
          <Button onClick={handleOpenModal} className="bg-green-600 hover:bg-green-700 text-white">
            <Plus className="w-4 h-4 mr-2" />Enregistrer Dépôt
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="border-green-200 dark:border-green-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <Wallet className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Dépôts</p>
                  <p className="text-xl font-bold text-green-600">{stats.totalDeposits.toLocaleString()} FC</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-blue-200 dark:border-blue-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Dépôts du Jour</p>
                  <p className="text-xl font-bold text-blue-600">{stats.todayDeposits.toLocaleString()} FC</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-purple-200 dark:border-purple-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <CalendarDays className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Dépôts du Mois</p>
                  <p className="text-xl font-bold text-purple-600">{stats.monthDeposits.toLocaleString()} FC</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card className="mb-4">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Rechercher par nom, motif ou code..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
                className="pl-10" 
              />
            </div>
          </CardContent>
        </Card>

        {/* Deposits Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Déposant</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Motif</TableHead>
                  <TableHead>Date & Heure</TableHead>
                  <TableHead>Utilisateur</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={8} className="text-center py-8">Chargement...</TableCell></TableRow>
                ) : filteredDeposits.length === 0 ? (
                  <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Aucun dépôt enregistré</TableCell></TableRow>
                ) : (
                  filteredDeposits.map(deposit => (
                    <TableRow key={deposit.id}>
                      <TableCell className="font-mono text-xs">{deposit.code_depot}</TableCell>
                      <TableCell className="font-medium">{deposit.nom}</TableCell>
                      <TableCell className="font-bold text-green-600">+{(deposit.montant || 0).toLocaleString()} FC</TableCell>
                      <TableCell><Badge className={getTypeBadge(deposit.type_depot)}>{deposit.type_depot}</Badge></TableCell>
                      <TableCell className="max-w-[200px] truncate">{deposit.motif || '-'}</TableCell>
                      <TableCell>
                        <div className="text-xs">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(deposit.date_depot).toLocaleDateString('fr-FR')}
                          </div>
                          <div className="text-muted-foreground">
                            {new Date(deposit.date_depot).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{deposit.utilisateur}</TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => { setSelectedDeposit(deposit); setShowDeleteDialog(true); }}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Add Deposit Dialog */}
        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogContent className="max-h-[90vh] flex flex-col">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                Enregistrer un Dépôt
              </DialogTitle>
            </DialogHeader>
            <ScrollArea className="flex-1 max-h-[60vh] pr-4">
              <div className="space-y-4">
                {error && (
                  <div className="p-3 bg-destructive/10 text-destructive rounded-lg flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />{error}
                  </div>
                )}
                <div>
                  <Label>Code Dépôt</Label>
                  <Input value={formData.code_depot} disabled className="font-mono" />
                </div>
                <div>
                  <Label>Nom du Déposant *</Label>
                  <Input 
                    value={formData.nom} 
                    onChange={(e) => setFormData({...formData, nom: e.target.value})} 
                    placeholder="Ex: Capital initial, Virement bancaire..." 
                  />
                </div>
                <div>
                  <Label>Montant (FC) *</Label>
                  <Input 
                    type="number" 
                    value={formData.montant || ''} 
                    onChange={(e) => setFormData({...formData, montant: parseFloat(e.target.value) || 0})} 
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label>Type de Dépôt</Label>
                  <Select value={formData.type_depot} onValueChange={(v) => setFormData({...formData, type_depot: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Espèce">Espèce</SelectItem>
                      <SelectItem value="Bancaire">Bancaire</SelectItem>
                      <SelectItem value="Mobile Money">Mobile Money</SelectItem>
                      <SelectItem value="Chèque">Chèque</SelectItem>
                      <SelectItem value="Autre">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Motif</Label>
                  <Textarea 
                    value={formData.motif} 
                    onChange={(e) => setFormData({...formData, motif: e.target.value})} 
                    rows={2} 
                    placeholder="Raison du dépôt..."
                  />
                </div>
              </div>
            </ScrollArea>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowModal(false)}>Annuler</Button>
              <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700 text-white">
                Enregistrer Dépôt
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
              <AlertDialogDescription>
                Voulez-vous vraiment supprimer ce dépôt de {selectedDeposit?.montant?.toLocaleString()} FC ? Cette action est irréversible.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                Supprimer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
