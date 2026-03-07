import * as React from 'react';
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Package, AlertTriangle, TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { db, Product, Supply, Sale } from '@/lib/database';

interface StockItem {
  product: Product;
  qtyApprovisionnee: number;
  qtyVendue: number;
  stockRestant: number;
  status: 'normal' | 'low' | 'critical';
}

export default function Stock() {
  const navigate = useNavigate();
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({ total: 0, normal: 0, low: 0, critical: 0 });

  useEffect(() => { checkSession(); }, []);

  const checkSession = () => {
    const sessionData = localStorage.getItem('supermarket_session');
    if (!sessionData) { navigate('/auth'); return; }
    const parsed = JSON.parse(sessionData);
    if (!['SuperAdmin', 'Administrateur', 'Gérant'].includes(parsed.user_type)) { navigate('/dashboard'); return; }
    loadData();
  };

  const loadData = async () => {
    const [products, supplies, sales] = await Promise.all([
      db.getProducts(),
      db.getSupplies(),
      db.getSales()
    ]);

    const items: StockItem[] = products.map(product => {
      const qtyApprovisionnee = supplies
        .filter(s => s.code_produit === product.code_produit)
        .reduce((sum, s) => sum + s.qty_achat, 0);
      
      const qtyVendue = sales
        .filter(s => s.code_produit === product.code_produit)
        .reduce((sum, s) => sum + s.qty_vente, 0);

      const stockRestant = product.stock_actuel;
      
      let status: 'normal' | 'low' | 'critical' = 'normal';
      if (stockRestant === 0) status = 'critical';
      else if (stockRestant <= product.seuil_alerte) status = 'low';

      return { product, qtyApprovisionnee, qtyVendue, stockRestant, status };
    });

    setStockItems(items);
    setStats({
      total: items.length,
      normal: items.filter(i => i.status === 'normal').length,
      low: items.filter(i => i.status === 'low').length,
      critical: items.filter(i => i.status === 'critical').length
    });
    setLoading(false);
  };

  const filteredItems = stockItems.filter(item =>
    item.product.nom_produit.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.product.code_produit.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'critical':
        return <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">Rupture</Badge>;
      case 'low':
        return <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">Stock bas</Badge>;
      default:
        return <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">Normal</Badge>;
    }
  };

  const getProgressColor = (status: string) => {
    switch (status) {
      case 'critical': return 'bg-red-500';
      case 'low': return 'bg-amber-500';
      default: return 'bg-green-500';
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link to="/dashboard"><Button variant="ghost" size="icon"><ArrowLeft className="w-5 h-5" /></Button></Link>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Stock Général</h1>
              <p className="text-muted-foreground">{stockItems.length} produit(s)</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Package className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Produits</p>
                  <p className="text-xl font-bold">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Stock Normal</p>
                  <p className="text-xl font-bold text-green-600">{stats.normal}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Stock Bas</p>
                  <p className="text-xl font-bold text-amber-600">{stats.low}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <TrendingDown className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Rupture</p>
                  <p className="text-xl font-bold text-red-600">{stats.critical}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-4">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Rechercher un produit..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Produit</TableHead>
                  <TableHead>Approv.</TableHead>
                  <TableHead>Vendu</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Seuil</TableHead>
                  <TableHead>Niveau</TableHead>
                  <TableHead>Statut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={8} className="text-center py-8">Chargement...</TableCell></TableRow>
                ) : filteredItems.length === 0 ? (
                  <TableRow><TableCell colSpan={8} className="text-center py-8">Aucun produit trouvé</TableCell></TableRow>
                ) : (
                  filteredItems.map(item => {
                    const maxStock = Math.max(item.qtyApprovisionnee, item.product.seuil_alerte * 3, 100);
                    const progressValue = (item.stockRestant / maxStock) * 100;
                    
                    return (
                      <TableRow key={item.product.id} className={item.status === 'critical' ? 'bg-red-50 dark:bg-red-900/10' : item.status === 'low' ? 'bg-amber-50 dark:bg-amber-900/10' : ''}>
                        <TableCell className="font-mono text-xs">{item.product.code_produit}</TableCell>
                        <TableCell className="font-medium">{item.product.nom_produit}</TableCell>
                        <TableCell className="text-green-600">+{item.qtyApprovisionnee}</TableCell>
                        <TableCell className="text-red-600">-{item.qtyVendue}</TableCell>
                        <TableCell className="font-bold">{item.stockRestant}</TableCell>
                        <TableCell>{item.product.seuil_alerte}</TableCell>
                        <TableCell className="w-32">
                          <div className="space-y-1">
                            <Progress value={progressValue} className={`h-2 ${getProgressColor(item.status)}`} />
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(item.status)}</TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
