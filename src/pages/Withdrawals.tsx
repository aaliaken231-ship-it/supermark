import * as React from 'react';
import { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Search, AlertCircle, TrendingDown, Calendar, FileText, Upload, Wallet, CalendarDays, Download } from 'lucide-react';
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
import { db, Withdrawal } from '@/lib/database';
import { generateCode } from '@/lib/utils';
import { toast } from 'sonner';

export default function Withdrawals() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [session, setSession] = useState<any>(null);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<Withdrawal | null>(null);
  const [caisseBalance, setCaisseBalance] = useState(0);
  const [formData, setFormData] = useState({
    code_retrait: '',
    nom: '',
    montant: 0,
    motif: '',
    type_retrait: 'Espèce' as any,
    engagement_url: ''
  });
  const [error, setError] = useState('');

  useEffect(() => { checkSession(); }, []);

  const checkSession = () => {
    const sessionData = localStorage.getItem('supermarket_session');
    if (!sessionData) { navigate('/auth'); return; }
    const parsed = JSON.parse(sessionData);
    if (!['SuperAdmin', 'Administrateur'].includes(parsed.user_type)) { navigate('/dashboard'); return; }
    setSession(parsed);
    loadData();
  };

  const loadData = async () => {
    const [withdrawalsData, balance] = await Promise.all([
      db.getWithdrawals(),
      db.getCaisseBalance()
    ]);
    setWithdrawals(withdrawalsData.sort((a, b) => new Date(b.date_retrait).getTime() - new Date(a.date_retrait).getTime()));
    setCaisseBalance(balance);
    setLoading(false);
  };

  const handleOpenModal = () => {
    setSelectedWithdrawal(null);
    setFormData({
      code_retrait: generateCode('RET'),
      nom: '',
      montant: 0,
      motif: '',
      type_retrait: 'Espèce',
      engagement_url: ''
    });
    setError('');
    setShowModal(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Convert file to base64 for storage
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setFormData({ ...formData, engagement_url: base64 });
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!formData.nom.trim()) {
      setError('Le nom du bénéficiaire est obligatoire');
      return;
    }
    if (formData.montant <= 0) {
      setError('Le montant doit être supérieur à 0');
      return;
    }
    if (!formData.motif.trim()) {
      setError('Le motif est obligatoire');
      return;
    }

    // Check caisse balance
    if (caisseBalance < formData.montant) {
      setError(`Solde caisse insuffisant. Disponible: ${caisseBalance.toLocaleString()} FC`);
      return;
    }

    const now = new Date().toISOString();
    try {
      await db.addWithdrawal({ 
        ...formData, 
        date_retrait: now, 
        utilisateur: session.nom_utilisateur, 
        created_at: now 
      });

      await db.addActivityLog({
        type_action: 'Retrait',
        utilisateur: session.nom_utilisateur,
        date_action: now,
        details: `Nouveau retrait: ${formData.nom} - ${formData.montant.toLocaleString()} FC (${formData.type_retrait}) - Motif: ${formData.motif}`,
        module: 'Retraits',
        created_at: now
      });

      toast.success("Retrait enregistré", {
        description: `${formData.montant.toLocaleString()} FC retiré avec succès`,
      });

      setShowModal(false);
      loadData();
    } catch (e: any) {
      setError(e.message || 'Erreur');
    }
  };

  const handleDelete = async () => {
    if (!selectedWithdrawal) return;
    await db.deleteWithdrawal(selectedWithdrawal.id!);
    await db.addActivityLog({
      type_action: 'Suppression',
      utilisateur: session.nom_utilisateur,
      date_action: new Date().toISOString(),
      details: `Suppression retrait: ${selectedWithdrawal.nom} - ${selectedWithdrawal.montant.toLocaleString()} FC`,
      module: 'Retraits',
      created_at: new Date().toISOString()
    });
    
    toast.error("Retrait supprimé");
    
    setShowDeleteDialog(false);
    loadData();
  };

  const filteredWithdrawals = withdrawals.filter(w =>
    w.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    w.motif?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    w.code_retrait?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Stats calculations
  const stats = useMemo(() => {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    const totalWithdrawals = withdrawals.reduce((sum, w) => sum + (w.montant || 0), 0);
    const todayWithdrawals = withdrawals
      .filter(w => new Date(w.date_retrait) >= startOfDay)
      .reduce((sum, w) => sum + (w.montant || 0), 0);
    const monthWithdrawals = withdrawals
      .filter(w => new Date(w.date_retrait) >= startOfMonth)
      .reduce((sum, w) => sum + (w.montant || 0), 0);
    
    return { totalWithdrawals, todayWithdrawals, monthWithdrawals };
  }, [withdrawals]);

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

  const downloadEngagement = (base64Data: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = base64Data;
    link.download = fileName;
    link.click();
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link to="/dashboard"><Button variant="ghost" size="icon"><ArrowLeft className="w-5 h-5" /></Button></Link>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Retraits</h1>
              <p className="text-muted-foreground">Gestion des sorties de caisse</p>
            </div>
          </div>
          <Button onClick={handleOpenModal} className="bg-red-600 hover:bg-red-700 text-white">
            <Plus className="w-4 h-4 mr-2" />Enregistrer Retrait
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="border-green-200 dark:border-green-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <Wallet className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Solde Caisse</p>
                  <p className={`text-xl font-bold ${caisseBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {caisseBalance.toLocaleString()} FC
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-red-200 dark:border-red-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <TrendingDown className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Retraits</p>
                  <p className="text-xl font-bold text-red-600">{stats.totalWithdrawals.toLocaleString()} FC</p>
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
                  <p className="text-sm text-muted-foreground">Retraits du Jour</p>
                  <p className="text-xl font-bold text-blue-600">{stats.todayWithdrawals.toLocaleString()} FC</p>
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
                  <p className="text-sm text-muted-foreground">Retraits du Mois</p>
                  <p className="text-xl font-bold text-purple-600">{stats.monthWithdrawals.toLocaleString()} FC</p>
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

        {/* Withdrawals Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Bénéficiaire</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Motif</TableHead>
                  <TableHead>Engagement</TableHead>
                  <TableHead>Date & Heure</TableHead>
                  <TableHead>Utilisateur</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={9} className="text-center py-8">Chargement...</TableCell></TableRow>
                ) : filteredWithdrawals.length === 0 ? (
                  <TableRow><TableCell colSpan={9} className="text-center py-8 text-muted-foreground">Aucun retrait enregistré</TableCell></TableRow>
                ) : (
                  filteredWithdrawals.map(withdrawal => (
                    <TableRow key={withdrawal.id}>
                      <TableCell className="font-mono text-xs">{withdrawal.code_retrait}</TableCell>
                      <TableCell className="font-medium">{withdrawal.nom}</TableCell>
                      <TableCell className="font-bold text-red-600">-{(withdrawal.montant || 0).toLocaleString()} FC</TableCell>
                      <TableCell><Badge className={getTypeBadge(withdrawal.type_retrait)}>{withdrawal.type_retrait}</Badge></TableCell>
                      <TableCell className="max-w-[150px] truncate">{withdrawal.motif || '-'}</TableCell>
                      <TableCell>
                        {withdrawal.engagement_url ? (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => downloadEngagement(withdrawal.engagement_url!, `engagement_${withdrawal.code_retrait}`)}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <Download className="w-3 h-3 mr-1" />
                            Télécharger
                          </Button>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-xs">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(withdrawal.date_retrait).toLocaleDateString('fr-FR')}
                          </div>
                          <div className="text-muted-foreground">
                            {new Date(withdrawal.date_retrait).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{withdrawal.utilisateur}</TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => { setSelectedWithdrawal(withdrawal); setShowDeleteDialog(true); }}
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

        {/* Add Withdrawal Dialog */}
        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogContent className="max-h-[90vh] flex flex-col">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-red-600" />
                Enregistrer un Retrait
              </DialogTitle>
            </DialogHeader>
            <ScrollArea className="flex-1 max-h-[60vh] pr-4">
              <div className="space-y-4">
                {error && (
                  <div className="p-3 bg-destructive/10 text-destructive rounded-lg flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />{error}
                  </div>
                )}
                
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm">Solde caisse disponible: <strong className={caisseBalance >= 0 ? 'text-green-600' : 'text-red-600'}>{caisseBalance.toLocaleString()} FC</strong></p>
                </div>
                
                <div>
                  <Label>Code Retrait</Label>
                  <Input value={formData.code_retrait} disabled className="font-mono" />
                </div>
                <div>
                  <Label>Nom du Bénéficiaire *</Label>
                  <Input 
                    value={formData.nom} 
                    onChange={(e) => setFormData({...formData, nom: e.target.value})} 
                    placeholder="Nom de la personne ou entreprise..." 
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
                  <Label>Type de Retrait</Label>
                  <Select value={formData.type_retrait} onValueChange={(v) => setFormData({...formData, type_retrait: v})}>
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
                  <Label>Motif *</Label>
                  <Textarea 
                    value={formData.motif} 
                    onChange={(e) => setFormData({...formData, motif: e.target.value})} 
                    rows={2} 
                    placeholder="Raison du retrait (obligatoire)..."
                  />
                </div>
                <div>
                  <Label>Pièce d'Engagement (optionnel)</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      className="hidden"
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {formData.engagement_url ? 'Fichier sélectionné ✓' : 'Importer un fichier'}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">PDF, Image ou Document (max 5MB)</p>
                </div>
              </div>
            </ScrollArea>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowModal(false)}>Annuler</Button>
              <Button onClick={handleSave} className="bg-red-600 hover:bg-red-700 text-white">
                Enregistrer Retrait
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
                Voulez-vous vraiment supprimer ce retrait de {selectedWithdrawal?.montant?.toLocaleString()} FC ? Cette action est irréversible.
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
