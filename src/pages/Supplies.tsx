import * as React from 'react';
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Pencil, Trash2, Search, AlertCircle, Truck, Package } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { db, Supply, Product } from '@/lib/database';
import { generateCode } from '@/lib/utils';

export default function Supplies() {
  const navigate = useNavigate();
  const [session, setSession] = useState<any>(null);
  const [supplies, setSupplies] = useState<Supply[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedSupply, setSelectedSupply] = useState<Supply | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    code_approvisionnement: '',
    code_produit: '',
    nom_produit: '',
    pu_achat: 0,
    qty_achat: 0,
    pt_achat: 0,
    tva: 0,
    prix_ttc: 0
  });
  const [error, setError] = useState('');

  useEffect(() => { checkSession(); }, []);

  const checkSession = () => {
    const sessionData = localStorage.getItem('supermarket_session');
    if (!sessionData) { navigate('/auth'); return; }
    const parsed = JSON.parse(sessionData);
    if (!['SuperAdmin', 'Administrateur', 'Gérant'].includes(parsed.user_type)) { navigate('/dashboard'); return; }
    setSession(parsed);
    loadData();
  };

  const loadData = async () => {
    const [suppliesData, productsData] = await Promise.all([db.getSupplies(), db.getProducts()]);
    setSupplies(suppliesData);
    setProducts(productsData);
    setLoading(false);
  };

  const handleProductSelect = (productCode: string) => {
    const product = products.find(p => p.code_produit === productCode);
    if (product) {
      setSelectedProduct(product);
      setFormData(prev => ({
        ...prev,
        code_produit: product.code_produit,
        nom_produit: product.nom_produit
      }));
    }
  };

  const calculateTotals = (puAchat: number, qtyAchat: number, tva: number) => {
    const ptAchat = puAchat * qtyAchat;
    const prixTtc = ptAchat + tva;
    setFormData(prev => ({ ...prev, pu_achat: puAchat, qty_achat: qtyAchat, tva, pt_achat: ptAchat, prix_ttc: prixTtc }));
  };

  const handleOpenModal = (supply: Supply | null = null) => {
    if (supply) {
      setSelectedSupply(supply);
      setFormData({
        code_approvisionnement: supply.code_approvisionnement,
        code_produit: supply.code_produit,
        nom_produit: supply.nom_produit,
        pu_achat: supply.pu_achat,
        qty_achat: supply.qty_achat,
        pt_achat: supply.pt_achat,
        tva: supply.tva,
        prix_ttc: supply.prix_ttc
      });
    } else {
      setSelectedSupply(null);
      setSelectedProduct(null);
      setFormData({
        code_approvisionnement: generateCode('APP'),
        code_produit: '',
        nom_produit: '',
        pu_achat: 0,
        qty_achat: 0,
        pt_achat: 0,
        tva: 0,
        prix_ttc: 0
      });
    }
    setError('');
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.code_produit || formData.qty_achat <= 0) {
      setError('Sélectionnez un produit et une quantité valide');
      return;
    }

    // Check caisse balance
    const caisseBalance = await db.getCaisseBalance();
    if (caisseBalance < formData.prix_ttc && !selectedSupply) {
      setError(`Solde caisse insuffisant. Disponible: ${caisseBalance.toLocaleString()} FC`);
      return;
    }

    const now = new Date().toISOString();
    try {
      if (selectedSupply) {
        await db.updateSupply({ ...selectedSupply, ...formData });
      } else {
        await db.addSupply({ ...formData, date_approvisionnement: now, utilisateur: session.nom_utilisateur, created_at: now });
        
        // Update product stock
        const product = products.find(p => p.code_produit === formData.code_produit);
        if (product) {
          await db.updateProduct({
            ...product,
            stock_actuel: product.stock_actuel + formData.qty_achat,
            updated_at: now
          });
        }
      }

      await db.addActivityLog({
        type_action: selectedSupply ? 'Modification' : 'Approvisionnement',
        utilisateur: session.nom_utilisateur,
        date_action: now,
        details: `${selectedSupply ? 'Modification' : 'Approvisionnement'}: ${formData.nom_produit} x${formData.qty_achat}`,
        module: 'Approvisionnements',
        created_at: now
      });

      setShowModal(false);
      loadData();
    } catch (e: any) {
      setError(e.message || 'Erreur');
    }
  };

  const handleDelete = async () => {
    if (!selectedSupply) return;
    await db.deleteSupply(selectedSupply.id!);
    await db.addActivityLog({
      type_action: 'Suppression',
      utilisateur: session.nom_utilisateur,
      date_action: new Date().toISOString(),
      details: `Suppression approvisionnement: ${selectedSupply.nom_produit}`,
      module: 'Approvisionnements',
      created_at: new Date().toISOString()
    });
    setShowDeleteDialog(false);
    loadData();
  };

  const filteredSupplies = supplies.filter(s =>
    s.nom_produit?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.code_approvisionnement?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalSupplies = supplies.reduce((sum, s) => sum + (s.prix_ttc || 0), 0);

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link to="/dashboard"><Button variant="ghost" size="icon"><ArrowLeft className="w-5 h-5" /></Button></Link>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Approvisionnements</h1>
              <p className="text-muted-foreground">Total: {totalSupplies.toLocaleString()} FC</p>
            </div>
          </div>
          <Button onClick={() => handleOpenModal()} className="gradient-primary"><Plus className="w-4 h-4 mr-2" />Approvisionner</Button>
        </div>

        <Card className="mb-4"><CardContent className="p-4"><div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input placeholder="Rechercher..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" /></div></CardContent></Card>

        <Card><CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Produit</TableHead>
                <TableHead>PU Achat</TableHead>
                <TableHead>Qté</TableHead>
                <TableHead>PT</TableHead>
                <TableHead>TTC</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={8} className="text-center py-8">Chargement...</TableCell></TableRow>
              ) : filteredSupplies.length === 0 ? (
                <TableRow><TableCell colSpan={8} className="text-center py-8">Aucun approvisionnement</TableCell></TableRow>
              ) : (
                filteredSupplies.map(supply => (
                  <TableRow key={supply.id}>
                    <TableCell className="font-mono text-xs">{supply.code_approvisionnement}</TableCell>
                    <TableCell>{supply.nom_produit}</TableCell>
                    <TableCell>{supply.pu_achat.toLocaleString()} FC</TableCell>
                    <TableCell>{supply.qty_achat}</TableCell>
                    <TableCell>{supply.pt_achat.toLocaleString()} FC</TableCell>
                    <TableCell className="font-bold">{supply.prix_ttc.toLocaleString()} FC</TableCell>
                    <TableCell>{new Date(supply.date_approvisionnement).toLocaleDateString('fr-FR')}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleOpenModal(supply)}><Pencil className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => { setSelectedSupply(supply); setShowDeleteDialog(true); }}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent></Card>

        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogContent className="max-w-lg max-h-[90vh] flex flex-col">
            <DialogHeader><DialogTitle className="flex items-center gap-2"><Truck className="w-5 h-5" />{selectedSupply ? 'Modifier' : 'Nouvel'} Approvisionnement</DialogTitle></DialogHeader>
            <ScrollArea className="flex-1 max-h-[60vh] pr-4">
              <div className="space-y-4">
                {error && <div className="p-3 bg-destructive/10 text-destructive rounded-lg flex items-center gap-2"><AlertCircle className="w-4 h-4" />{error}</div>}
                
                <div><Label>Code</Label><Input value={formData.code_approvisionnement} disabled /></div>
                
                <div>
                  <Label>Produit *</Label>
                  <Select value={formData.code_produit} onValueChange={handleProductSelect} disabled={!!selectedSupply}>
                    <SelectTrigger><SelectValue placeholder="Sélectionner un produit" /></SelectTrigger>
                    <SelectContent>
                      {products.map(p => (
                        <SelectItem key={p.code_produit} value={p.code_produit}>
                          <div className="flex items-center gap-2">
                            <Package className="w-4 h-4" />
                            {p.nom_produit} (Stock: {p.stock_actuel})
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>PU Achat (FC) *</Label>
                    <Input
                      type="number"
                      value={formData.pu_achat}
                      onChange={(e) => calculateTotals(parseFloat(e.target.value) || 0, formData.qty_achat, formData.tva)}
                    />
                  </div>
                  <div>
                    <Label>Quantité *</Label>
                    <Input
                      type="number"
                      value={formData.qty_achat}
                      onChange={(e) => calculateTotals(formData.pu_achat, parseInt(e.target.value) || 0, formData.tva)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>TVA (FC)</Label>
                    <Input
                      type="number"
                      value={formData.tva}
                      onChange={(e) => calculateTotals(formData.pu_achat, formData.qty_achat, parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <Label>PT Achat (FC)</Label>
                    <Input value={formData.pt_achat.toLocaleString()} disabled className="bg-muted" />
                  </div>
                </div>

                <div className="p-4 bg-primary/10 rounded-lg">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total TTC:</span>
                    <span className="text-primary">{formData.prix_ttc.toLocaleString()} FC</span>
                  </div>
                </div>
              </div>
            </ScrollArea>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowModal(false)}>Annuler</Button>
              <Button onClick={handleSave}>{selectedSupply ? 'Modifier' : 'Valider'}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
              <AlertDialogDescription>Cette action est irréversible.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive">Supprimer</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
