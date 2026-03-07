import * as React from 'react';
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Pencil, Trash2, Search, AlertCircle } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { db, Product } from '@/lib/database';
import { generateCode } from '@/lib/utils';

export default function Products() {
  const navigate = useNavigate();
  const [session, setSession] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<{
    code_produit: string;
    nom_produit: string;
    description?: string;
    pu_vente: number;
    stock_actuel: number;
    seuil_alerte: number;
  }>({ code_produit: '', nom_produit: '', description: '', pu_vente: 0, stock_actuel: 0, seuil_alerte: 10 });
  const [error, setError] = useState('');

  useEffect(() => { checkSession(); }, []);

  const checkSession = () => {
    const sessionData = localStorage.getItem('supermarket_session');
    if (!sessionData) { navigate('/auth'); return; }
    const parsed = JSON.parse(sessionData);
    if (!['SuperAdmin', 'Administrateur', 'Gérant'].includes(parsed.user_type)) { navigate('/dashboard'); return; }
    setSession(parsed);
    loadProducts();
  };

  const loadProducts = async () => {
    const data = await db.getProducts();
    setProducts(data);
    setLoading(false);
  };

  const getStockBadge = (product: Product) => {
    if (product.stock_actuel === 0) return <Badge className="bg-red-100 text-red-700">Rupture</Badge>;
    if (product.stock_actuel <= product.seuil_alerte) return <Badge className="bg-amber-100 text-amber-700">Stock bas</Badge>;
    return <Badge className="bg-green-100 text-green-700">En stock</Badge>;
  };

  const handleOpenModal = (product: Product | null = null) => {
    if (product) { setSelectedProduct(product); setFormData(product); }
    else { setSelectedProduct(null); setFormData({ code_produit: generateCode('PRD'), nom_produit: '', description: '', pu_vente: 0, stock_actuel: 0, seuil_alerte: 10 }); }
    setError(''); setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.nom_produit || formData.pu_vente <= 0) { setError('Remplissez tous les champs obligatoires'); return; }
    const now = new Date().toISOString();
    try {
      if (selectedProduct) { await db.updateProduct({ ...selectedProduct, ...formData }); }
      else { await db.addProduct({ ...formData }); }
      await db.addActivityLog({ type_action: selectedProduct ? 'Modification' : 'Ajout', utilisateur: session.nom_utilisateur, date_action: now, details: `${selectedProduct ? 'Modification' : 'Ajout'} produit: ${formData.nom_produit}`, module: 'Produits', created_at: now });
      setShowModal(false); loadProducts();
    } catch (e: any) { setError(e.message || 'Erreur'); }
  };

  const handleDelete = async () => {
    if (!selectedProduct) return;
    await db.deleteProduct(selectedProduct.id!);
    await db.addActivityLog({ type_action: 'Suppression', utilisateur: session.nom_utilisateur, date_action: new Date().toISOString(), details: `Suppression produit: ${selectedProduct.nom_produit}`, module: 'Produits', created_at: new Date().toISOString() });
    setShowDeleteDialog(false); loadProducts();
  };

  const filteredProducts = products.filter(p => p.nom_produit?.toLowerCase().includes(searchTerm.toLowerCase()) || p.code_produit?.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link to="/dashboard"><Button variant="ghost" size="icon"><ArrowLeft className="w-5 h-5" /></Button></Link>
            <div><h1 className="text-2xl font-bold text-foreground">Produits</h1><p className="text-muted-foreground">{products.length} produit(s)</p></div>
          </div>
          <Button onClick={() => handleOpenModal()} className="gradient-primary"><Plus className="w-4 h-4 mr-2" />Ajouter</Button>
        </div>

        <Card className="mb-4"><CardContent className="p-4"><div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input placeholder="Rechercher..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" /></div></CardContent></Card>

        <Card><CardContent className="p-0">
          <Table>
            <TableHeader><TableRow><TableHead>Code</TableHead><TableHead>Nom</TableHead><TableHead>PU Vente</TableHead><TableHead>Stock</TableHead><TableHead>Statut</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {loading ? <TableRow><TableCell colSpan={6} className="text-center py-8">Chargement...</TableCell></TableRow> :
              filteredProducts.length === 0 ? <TableRow><TableCell colSpan={6} className="text-center py-8">Aucun produit</TableCell></TableRow> :
              filteredProducts.map(product => (
                <TableRow key={product.id}>
                  <TableCell>{product.code_produit}</TableCell>
                  <TableCell>{product.nom_produit}</TableCell>
                  <TableCell>{product.pu_vente.toLocaleString()} FC</TableCell>
                  <TableCell>{product.stock_actuel}</TableCell>
                  <TableCell>{getStockBadge(product)}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenModal(product)}><Pencil className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => { setSelectedProduct(product); setShowDeleteDialog(true); }}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent></Card>

        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogContent className="max-h-[90vh] flex flex-col">
            <DialogHeader><DialogTitle>{selectedProduct ? 'Modifier' : 'Ajouter'} produit</DialogTitle></DialogHeader>
            <ScrollArea className="flex-1 max-h-[60vh] pr-4">
              <div className="space-y-4">
                {error && <div className="p-3 bg-destructive/10 text-destructive rounded-lg flex items-center gap-2"><AlertCircle className="w-4 h-4" />{error}</div>}
                <div><Label>Code</Label><Input value={formData.code_produit} disabled /></div>
                <div><Label>Nom *</Label><Input value={formData.nom_produit} onChange={(e) => setFormData({...formData, nom_produit: e.target.value})} /></div>
                <div><Label>Description</Label><Input value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} /></div>
                <div><Label>Prix unitaire vente (FC) *</Label><Input type="number" value={formData.pu_vente} onChange={(e) => setFormData({...formData, pu_vente: parseFloat(e.target.value) || 0})} /></div>
                <div><Label>Seuil d'alerte</Label><Input type="number" value={formData.seuil_alerte} onChange={(e) => setFormData({...formData, seuil_alerte: parseInt(e.target.value) || 10})} /></div>
              </div>
            </ScrollArea>
            <DialogFooter><Button variant="outline" onClick={() => setShowModal(false)}>Annuler</Button><Button onClick={handleSave}>{selectedProduct ? 'Modifier' : 'Ajouter'}</Button></DialogFooter>
          </DialogContent>
        </Dialog>

        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Confirmer la suppression</AlertDialogTitle><AlertDialogDescription>Cette action est irréversible.</AlertDialogDescription></AlertDialogHeader>
            <AlertDialogFooter><AlertDialogCancel>Annuler</AlertDialogCancel><AlertDialogAction onClick={handleDelete} className="bg-destructive">Supprimer</AlertDialogAction></AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
