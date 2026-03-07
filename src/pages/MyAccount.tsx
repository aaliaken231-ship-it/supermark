import * as React from 'react';
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, BarChart3, Calendar, TrendingUp, DollarSign, Receipt } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { db, Sale } from '@/lib/database';

export default function MyAccount() {
  const navigate = useNavigate();
  const [session, setSession] = useState<any>(null);
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterPeriod, setFilterPeriod] = useState('all');

  useEffect(() => { checkSession(); }, []);

  const checkSession = () => {
    const sessionData = localStorage.getItem('supermarket_session');
    if (!sessionData) { navigate('/auth'); return; }
    const parsed = JSON.parse(sessionData);
    setSession(parsed);
    loadData(parsed.nom_utilisateur);
  };

  const loadData = async (vendeur: string) => {
    const salesData = await db.getSalesByVendeur(vendeur);
    setSales(salesData.sort((a, b) => new Date(b.date_vente).getTime() - new Date(a.date_vente).getTime()));
    setLoading(false);
  };

  const filterByPeriod = (sale: Sale) => {
    if (filterPeriod === 'all') return true;
    const saleDate = new Date(sale.date_vente);
    const today = new Date();
    
    switch (filterPeriod) {
      case 'today':
        return saleDate.toDateString() === today.toDateString();
      case 'month':
        return saleDate.getMonth() === today.getMonth() && saleDate.getFullYear() === today.getFullYear();
      case 'year':
        return saleDate.getFullYear() === today.getFullYear();
      default:
        return true;
    }
  };

  const filteredSales = sales.filter(filterByPeriod);

  const totalTTC = filteredSales.reduce((sum, s) => sum + (s.prix_ttc || 0), 0);
  const totalTVA = filteredSales.reduce((sum, s) => sum + (s.tva || 0), 0);
  const totalHT = totalTTC - totalTVA;
  const nbVentes = [...new Set(filteredSales.map(s => s.code_facture))].length;

  // Daily sales for chart
  const dailySales: Record<string, number> = {};
  filteredSales.forEach(sale => {
    const date = new Date(sale.date_vente).toLocaleDateString('fr-FR');
    dailySales[date] = (dailySales[date] || 0) + (sale.prix_ttc || 0);
  });
  const chartData = Object.entries(dailySales).slice(-7).map(([date, total]) => ({ date, total }));

  // Sales by invoice
  const invoiceTotals: Record<string, { total: number; date: string; client: string }> = {};
  filteredSales.forEach(sale => {
    if (!invoiceTotals[sale.code_facture]) {
      invoiceTotals[sale.code_facture] = { total: 0, date: sale.date_vente, client: sale.nom_client };
    }
    invoiceTotals[sale.code_facture].total += sale.prix_ttc || 0;
  });

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link to="/dashboard"><Button variant="ghost" size="icon"><ArrowLeft className="w-5 h-5" /></Button></Link>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Mon Compte</h1>
              <p className="text-muted-foreground">Rapports de ventes - {session?.nom_utilisateur}</p>
            </div>
          </div>
        </div>

        {/* Filter */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <Select value={filterPeriod} onValueChange={setFilterPeriod}>
              <SelectTrigger className="w-full md:w-64">
                <div className="flex items-center gap-2"><Calendar className="w-4 h-4" /><SelectValue placeholder="Période" /></div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les périodes</SelectItem>
                <SelectItem value="today">Aujourd'hui</SelectItem>
                <SelectItem value="month">Ce mois</SelectItem>
                <SelectItem value="year">Cette année</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total TTC</p>
                  <p className="text-xl font-bold text-green-600">{totalTTC.toLocaleString()} FC</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total HT</p>
                  <p className="text-xl font-bold text-blue-600">{totalHT.toLocaleString()} FC</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">TVA</p>
                  <p className="text-xl font-bold text-amber-600">{totalTVA.toLocaleString()} FC</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <Receipt className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Nb Ventes</p>
                  <p className="text-xl font-bold text-purple-600">{nbVentes}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chart */}
        <Card className="mb-6">
          <CardHeader><CardTitle className="text-lg">Évolution des ventes</CardTitle></CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip formatter={(value) => `${Number(value).toLocaleString()} FC`} />
                  <Bar dataKey="total" fill="hsl(160, 84%, 39%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Recent Sales */}
        <Card>
          <CardHeader><CardTitle className="text-lg">Dernières ventes</CardTitle></CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code Facture</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Montant</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={4} className="text-center py-8">Chargement...</TableCell></TableRow>
                ) : Object.entries(invoiceTotals).length === 0 ? (
                  <TableRow><TableCell colSpan={4} className="text-center py-8">Aucune vente</TableCell></TableRow>
                ) : (
                  Object.entries(invoiceTotals).slice(0, 10).map(([code, data]) => (
                    <TableRow key={code}>
                      <TableCell className="font-mono text-xs">{code}</TableCell>
                      <TableCell>{new Date(data.date).toLocaleDateString('fr-FR')}</TableCell>
                      <TableCell>{data.client}</TableCell>
                      <TableCell className="font-bold text-primary">{data.total.toLocaleString()} FC</TableCell>
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
