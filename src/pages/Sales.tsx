import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, ShoppingCart, Plus, Minus, Trash2, User, Phone, CheckCircle, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { db, Product, Shop } from '@/lib/database';
import { generateCode, numberToWords } from '@/lib/utils';

interface CartItem { code_produit: string; nom_produit: string; pu_vente: number; qty: number; pt: number; stock_disponible: number; }

export default function Sales() {
  const navigate = useNavigate();
  const [session, setSession] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [clientInfo, setClientInfo] = useState({ nom: '', telephone: '' });
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);
  const [currentInvoice, setCurrentInvoice] = useState<any>(null);
  const [shopInfo, setShopInfo] = useState<Shop | null>(null);

  useEffect(() => { checkSession(); }, []);

  const checkSession = () => {
    const sessionData = localStorage.getItem('supermarket_session');
    if (!sessionData) { navigate('/auth'); return; }
    setSession(JSON.parse(sessionData));
    loadData();
  };

  const loadData = async () => {
    const [prods, shops] = await Promise.all([db.getProducts(), db.getShops()]);
    setProducts(prods);
    if (shops.length > 0) setShopInfo(shops[0]);
    setLoading(false);
  };

  const addToCart = (product: Product) => {
    const existing = cart.find(item => item.code_produit === product.code_produit);
    if (existing) {
      if (existing.qty < product.stock_actuel) {
        setCart(cart.map(item => item.code_produit === product.code_produit ? { ...item, qty: item.qty + 1, pt: (item.qty + 1) * item.pu_vente } : item));
      }
    } else if (product.stock_actuel > 0) {
      setCart([...cart, { code_produit: product.code_produit, nom_produit: product.nom_produit, pu_vente: product.pu_vente, qty: 1, pt: product.pu_vente, stock_disponible: product.stock_actuel }]);
    }
  };

  const updateQuantity = (code: string, delta: number) => {
    setCart(cart.map(item => {
      if (item.code_produit === code) {
        const newQty = Math.max(1, Math.min(item.qty + delta, item.stock_disponible));
        return { ...item, qty: newQty, pt: newQty * item.pu_vente };
      }
      return item;
    }));
  };

  const removeFromCart = (code: string) => setCart(cart.filter(item => item.code_produit !== code));
  const totalTTC = cart.reduce((sum, item) => sum + item.pt, 0);

  const handleValidateSale = async () => {
    if (cart.length === 0) return;
    setProcessing(true);
    const invoiceCode = generateCode('FAC');
    const now = new Date().toISOString();

    try {
      await db.addInvoice({ code_facture: invoiceCode, date_facture: now, nom_client: clientInfo.nom || 'Client anonyme', telephone_client: clientInfo.telephone, montant_total: totalTTC, montant_tva: 0, montant_ttc: totalTTC, nom_vendeur: session.nom_utilisateur, articles: cart.map(item => ({ code_produit: item.code_produit, nom_produit: item.nom_produit, pu_vente: item.pu_vente, qty: item.qty, pt: item.pt, tva: 0, ttc: item.pt })), created_at: now });

      for (const item of cart) {
        await db.addSale({ code_vente: generateCode('VTE'), code_facture: invoiceCode, code_produit: item.code_produit, nom_produit: item.nom_produit, pu_vente: item.pu_vente, qty_vente: item.qty, pt_vente: item.pt, tva: 0, prix_ttc: item.pt, date_vente: now, nom_vendeur: session.nom_utilisateur, nom_client: clientInfo.nom || 'Client anonyme', telephone_client: clientInfo.telephone, created_at: now });
        const product = products.find(p => p.code_produit === item.code_produit);
        if (product) await db.updateProduct({ ...product, stock_actuel: product.stock_actuel - item.qty, updated_at: now });
      }

      await db.addActivityLog({ type_action: 'Vente', utilisateur: session.nom_utilisateur, date_action: now, details: `Vente validée: ${invoiceCode} - ${totalTTC} FC`, module: 'Ventes', created_at: now });

      if (clientInfo.nom) {
        const existingClients = await db.getClients();
        const existing = existingClients.find(c => c.nom_client === clientInfo.nom);
        if (existing) { await db.updateClient({ ...existing, total_achats: existing.total_achats + totalTTC, updated_at: now }); }
        else { await db.addClient({ code_client: generateCode('CLI'), nom_client: clientInfo.nom, telephone: clientInfo.telephone, total_achats: totalTTC, created_at: now, updated_at: now }); }
      }

      setCurrentInvoice({ code_facture: invoiceCode, date_facture: now, nom_client: clientInfo.nom || 'Client anonyme', telephone_client: clientInfo.telephone, articles: cart, totalTTC, totalWords: numberToWords(Math.floor(totalTTC)), nom_vendeur: session.nom_utilisateur });
      setShowInvoice(true);
      setCart([]);
      setClientInfo({ nom: '', telephone: '' });
      loadData();
    } catch (error) { console.error(error); }
    finally { setProcessing(false); }
  };

  const filteredProducts = products.filter(p => p.nom_produit?.toLowerCase().includes(searchTerm.toLowerCase()) || p.code_produit?.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="min-h-screen bg-background">
      <header className="glass border-b border-border sticky top-0 z-40 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/dashboard"><Button variant="ghost" size="icon"><ArrowLeft className="w-5 h-5" /></Button></Link>
            <div><h1 className="text-xl font-bold text-foreground">Nouvelle Vente</h1><p className="text-sm text-muted-foreground">Vendeur: {session?.nom_utilisateur}</p></div>
          </div>
          <div className="flex items-center gap-2 bg-primary/10 px-3 py-1 rounded-full"><ShoppingCart className="w-4 h-4 text-primary" /><span className="font-medium text-primary">{cart.length}</span></div>
        </div>
      </header>

      <div className="p-4 grid lg:grid-cols-2 gap-6">
        <div>
          <Card className="mb-4"><CardContent className="p-4"><div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input placeholder="Rechercher produit..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" /></div></CardContent></Card>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[60vh] overflow-y-auto">
            {loading ? <p className="col-span-full text-center py-8">Chargement...</p> :
            filteredProducts.map(product => {
              const inCart = cart.find(item => item.code_produit === product.code_produit);
              const outOfStock = product.stock_actuel === 0;
              return (
                <Card key={product.id} className={`cursor-pointer transition-all ${outOfStock ? 'opacity-50' : 'hover:shadow-md'} ${inCart ? 'ring-2 ring-primary' : ''}`} onClick={() => !outOfStock && addToCart(product)}>
                  <CardContent className="p-3">
                    <div className="flex justify-between text-xs mb-1"><span className="text-muted-foreground">{product.code_produit}</span>{outOfStock ? <Badge variant="destructive" className="text-xs">Rupture</Badge> : <Badge variant="outline" className="text-xs">Stock: {product.stock_actuel}</Badge>}</div>
                    <p className="font-medium text-sm truncate">{product.nom_produit}</p>
                    <p className="text-primary font-bold">{product.pu_vente.toLocaleString()} FC</p>
                    {inCart && <div className="mt-1 flex items-center gap-1 text-xs text-primary"><CheckCircle className="w-3 h-3" />{inCart.qty} dans le panier</div>}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        <div className="space-y-4">
          <Card><CardContent className="p-4 grid grid-cols-2 gap-4">
            <div className="relative"><User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input placeholder="Nom client" value={clientInfo.nom} onChange={(e) => setClientInfo({...clientInfo, nom: e.target.value})} className="pl-10" /></div>
            <div className="relative"><Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input placeholder="Téléphone" value={clientInfo.telephone} onChange={(e) => setClientInfo({...clientInfo, telephone: e.target.value})} className="pl-10" /></div>
          </CardContent></Card>

          <Card><CardHeader className="pb-2"><CardTitle className="text-lg flex items-center gap-2"><ShoppingCart className="w-5 h-5" />Panier ({cart.length})</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {cart.length === 0 ? <p className="text-muted-foreground text-center py-4">Le panier est vide</p> :
              cart.map(item => (
                <div key={item.code_produit} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                  <div><p className="font-medium text-sm">{item.nom_produit}</p><p className="text-primary font-bold">{item.pt.toLocaleString()} FC</p></div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateQuantity(item.code_produit, -1)}><Minus className="w-3 h-3" /></Button>
                    <span className="w-6 text-center font-medium">{item.qty}</span>
                    <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateQuantity(item.code_produit, 1)} disabled={item.qty >= item.stock_disponible}><Plus className="w-3 h-3" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => removeFromCart(item.code_produit)}><Trash2 className="w-3 h-3" /></Button>
                  </div>
                </div>
              ))}
              {cart.length > 0 && <div className="pt-3 border-t"><div className="flex justify-between text-lg font-bold"><span>Total TTC</span><span className="text-primary">{totalTTC.toLocaleString()} FC</span></div></div>}
              <Button className="w-full gradient-primary" onClick={handleValidateSale} disabled={cart.length === 0 || processing}>
                {processing ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Traitement...</span> : <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4" />Valider la vente</span>}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={showInvoice} onOpenChange={setShowInvoice}>
        <DialogContent className="max-w-lg print:max-w-full print:shadow-none">
          <DialogHeader>
            <DialogTitle className="flex justify-between items-center print:hidden">
              Facture générée
              <Button variant="outline" size="sm" onClick={() => window.print()}>
                <Printer className="w-4 h-4 mr-2" />Imprimer
              </Button>
            </DialogTitle>
          </DialogHeader>
          {currentInvoice && (
            <div className="space-y-4 text-sm" id="invoice-print">
              {/* En-tête avec logo au centre */}
              <div className="flex justify-between items-start border-b pb-4">
                {/* Gauche: Info facture */}
                <div>
                  <p className="text-xs text-muted-foreground">Facture N°</p>
                  <p className="font-bold text-primary text-lg">{currentInvoice.code_facture}</p>
                  <p className="text-sm">{new Date(currentInvoice.date_facture).toLocaleDateString('fr-FR')}</p>
                </div>
                
                {/* Centre: Logo */}
                <div className="text-center">
                  {shopInfo?.logo_url ? (
                    <img src={shopInfo.logo_url} alt="Logo" className="h-16 w-auto mx-auto object-contain" />
                  ) : (
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                      <span className="text-2xl font-bold text-primary">
                        {(shopInfo?.nom_boutique || 'SM').substring(0, 2).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                
                {/* Droite: Info boutique */}
                <div className="text-right">
                  <p className="font-bold">{shopInfo?.nom_boutique || 'Au Super Marché'}</p>
                  <p className="text-xs text-muted-foreground italic">{shopInfo?.slogan}</p>
                  <p className="text-sm">{shopInfo?.telephone}</p>
                  <p className="text-xs text-muted-foreground">{shopInfo?.email}</p>
                </div>
              </div>
              
              {/* Info client */}
              <div className="bg-muted/50 p-3 rounded-lg">
                <p className="font-medium">Client: {currentInvoice.nom_client}</p>
                {currentInvoice.telephone_client && <p className="text-sm text-muted-foreground">Tél: {currentInvoice.telephone_client}</p>}
              </div>
              
              {/* Tableau des articles */}
              <Table>
                <TableHeader>
                  <TableRow className="bg-primary/10">
                    <TableHead>Produit</TableHead>
                    <TableHead className="text-right">PU</TableHead>
                    <TableHead className="text-center">Qté</TableHead>
                    <TableHead className="text-right">PT</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentInvoice.articles.map((item: any, i: number) => (
                    <TableRow key={i}>
                      <TableCell>{item.nom_produit}</TableCell>
                      <TableCell className="text-right">{item.pu_vente.toLocaleString()} FC</TableCell>
                      <TableCell className="text-center">{item.qty}</TableCell>
                      <TableCell className="text-right font-medium">{item.pt.toLocaleString()} FC</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {/* Total */}
              <div className="border-t pt-3">
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>TOTAL TTC:</span>
                  <span className="text-primary">{currentInvoice.totalTTC.toLocaleString()} FC</span>
                </div>
                <p className="text-xs italic mt-2 p-2 bg-muted rounded">
                  Arrêté à la somme de: <span className="font-medium">{currentInvoice.totalWords}</span> francs congolais
                </p>
              </div>
              
              {/* Pied de page avec cachet */}
              <div className="border-t pt-4 flex justify-between items-end">
                {/* Cachet */}
                <div className="text-center">
                  {shopInfo?.cachet_url && (
                    <div>
                      <img src={shopInfo.cachet_url} alt="Cachet" className="h-16 w-auto object-contain opacity-80" />
                      <p className="text-xs text-muted-foreground">Cachet</p>
                    </div>
                  )}
                </div>
                
                {/* Date et lieu */}
                <div className="text-right">
                  <p className="text-sm">
                    Fait à <span className="font-medium">{shopInfo?.lieu || 'Kinshasa'}</span>
                  </p>
                  <p className="text-sm">
                    Le {new Date().toLocaleDateString('fr-FR')} à {new Date().toLocaleTimeString('fr-FR')}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">Vendeur: {currentInvoice.nom_vendeur || session?.nom_utilisateur}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
