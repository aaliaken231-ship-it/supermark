import * as React from 'react';
import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, BarChart3, Users, Calendar, TrendingUp, TrendingDown, DollarSign, Wallet, ShoppingCart, Package, FileDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import { db, Sale, User, Supply, Deposit, Withdrawal } from '@/lib/database';

export default function GeneralAccounts() {
  const navigate = useNavigate();
  const [sales, setSales] = useState<Sale[]>([]);
  const [supplies, setSupplies] = useState<Supply[]>([]);
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterUser, setFilterUser] = useState('all');
  const [filterPeriod, setFilterPeriod] = useState('all');

  useEffect(() => { checkSession(); }, []);

  const checkSession = () => {
    const sessionData = localStorage.getItem('supermarket_session');
    if (!sessionData) { navigate('/auth'); return; }
    const parsed = JSON.parse(sessionData);
    if (!['SuperAdmin', 'Administrateur'].includes(parsed.user_type)) { navigate('/dashboard'); return; }
    loadData();
  };

  const loadData = async () => {
    const [salesData, suppliesData, depositsData, withdrawalsData, usersData] = await Promise.all([
      db.getSales(),
      db.getSupplies(),
      db.getDeposits(),
      db.getWithdrawals(),
      db.getUsers()
    ]);
    setSales(salesData);
    setSupplies(suppliesData);
    setDeposits(depositsData);
    setWithdrawals(withdrawalsData);
    setUsers(usersData.filter(u => u.user_type !== 'SuperAdmin'));
    setLoading(false);
  };

  const filterByPeriod = (date: string) => {
    if (filterPeriod === 'all') return true;
    const itemDate = new Date(date);
    const today = new Date();
    
    switch (filterPeriod) {
      case 'today':
        return itemDate.toDateString() === today.toDateString();
      case 'month':
        return itemDate.getMonth() === today.getMonth() && itemDate.getFullYear() === today.getFullYear();
      case 'year':
        return itemDate.getFullYear() === today.getFullYear();
      default:
        return true;
    }
  };

  // Filtered data
  const filteredSales = useMemo(() => 
    sales.filter(s => filterByPeriod(s.date_vente)).filter(s => filterUser === 'all' || s.nom_vendeur === filterUser),
    [sales, filterPeriod, filterUser]
  );
  
  const filteredSupplies = useMemo(() => 
    supplies.filter(s => filterByPeriod(s.date_approvisionnement)),
    [supplies, filterPeriod]
  );
  
  const filteredDeposits = useMemo(() => 
    deposits.filter(d => filterByPeriod(d.date_depot)),
    [deposits, filterPeriod]
  );
  
  const filteredWithdrawals = useMemo(() => 
    withdrawals.filter(w => filterByPeriod(w.date_retrait)),
    [withdrawals, filterPeriod]
  );

  // Financial calculations
  const financials = useMemo(() => {
    const totalSales = filteredSales.reduce((sum, s) => sum + (s.prix_ttc || 0), 0);
    const totalTVA = filteredSales.reduce((sum, s) => sum + (s.tva || 0), 0);
    const totalSupplies = filteredSupplies.reduce((sum, s) => sum + (s.prix_ttc || 0), 0);
    const totalDeposits = filteredDeposits.reduce((sum, d) => sum + (d.montant || 0), 0);
    const totalWithdrawals = filteredWithdrawals.reduce((sum, w) => sum + (w.montant || 0), 0);
    
    // Recettes = Ventes + Dépôts
    const recettes = totalSales + totalDeposits;
    // Dépenses = Approvisionnements + Retraits
    const depenses = totalSupplies + totalWithdrawals;
    // Solde = Recettes - Dépenses
    const solde = recettes - depenses;

    return {
      totalSales,
      totalTVA,
      totalHT: totalSales - totalTVA,
      totalSupplies,
      totalDeposits,
      totalWithdrawals,
      recettes,
      depenses,
      solde
    };
  }, [filteredSales, filteredSupplies, filteredDeposits, filteredWithdrawals]);

  // Sales by user
  const salesByUser = useMemo(() => 
    users.map(user => ({
      name: user.nom_utilisateur,
      ventes: filteredSales.filter(s => s.nom_vendeur === user.nom_utilisateur).reduce((sum, s) => sum + (s.prix_ttc || 0), 0)
    })).filter(u => u.ventes > 0).sort((a, b) => b.ventes - a.ventes),
    [users, filteredSales]
  );

  // Chart colors
  const COLORS = ['hsl(160, 84%, 39%)', 'hsl(217, 91%, 60%)', 'hsl(262, 83%, 58%)', 'hsl(45, 93%, 47%)', 'hsl(0, 84%, 60%)'];

  // Daily evolution chart data
  const evolutionData = useMemo(() => {
    const last7Days: Record<string, { date: string; ventes: number; achats: number }> = {};
    
    // Initialize last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const key = date.toLocaleDateString('fr-FR');
      last7Days[key] = { date: key, ventes: 0, achats: 0 };
    }
    
    // Aggregate sales
    filteredSales.forEach(sale => {
      const date = new Date(sale.date_vente).toLocaleDateString('fr-FR');
      if (last7Days[date]) {
        last7Days[date].ventes += sale.prix_ttc || 0;
      }
    });
    
    // Aggregate supplies
    filteredSupplies.forEach(supply => {
      const date = new Date(supply.date_approvisionnement).toLocaleDateString('fr-FR');
      if (last7Days[date]) {
        last7Days[date].achats += supply.prix_ttc || 0;
      }
    });
    
    return Object.values(last7Days);
  }, [filteredSales, filteredSupplies]);

  // Revenue distribution pie chart
  const revenueDistribution = useMemo(() => [
    { name: 'Ventes', value: financials.totalSales, color: 'hsl(160, 84%, 39%)' },
    { name: 'Dépôts', value: financials.totalDeposits, color: 'hsl(217, 91%, 60%)' }
  ].filter(item => item.value > 0), [financials]);

  const expenseDistribution = useMemo(() => [
    { name: 'Achats', value: financials.totalSupplies, color: 'hsl(0, 84%, 60%)' },
    { name: 'Retraits', value: financials.totalWithdrawals, color: 'hsl(45, 93%, 47%)' }
  ].filter(item => item.value > 0), [financials]);

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link to="/dashboard"><Button variant="ghost" size="icon"><ArrowLeft className="w-5 h-5" /></Button></Link>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Compte Général</h1>
              <p className="text-muted-foreground">Résumé financier complet</p>
            </div>
          </div>
          <Button variant="outline">
            <FileDown className="w-4 h-4 mr-2" />
            Exporter PDF
          </Button>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select value={filterUser} onValueChange={setFilterUser}>
                <SelectTrigger>
                  <div className="flex items-center gap-2"><Users className="w-4 h-4" /><SelectValue placeholder="Utilisateur" /></div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les utilisateurs</SelectItem>
                  {users.map(u => <SelectItem key={u.id} value={u.nom_utilisateur}>{u.nom_utilisateur}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={filterPeriod} onValueChange={setFilterPeriod}>
                <SelectTrigger>
                  <div className="flex items-center gap-2"><Calendar className="w-4 h-4" /><SelectValue placeholder="Période" /></div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les périodes</SelectItem>
                  <SelectItem value="today">Aujourd'hui</SelectItem>
                  <SelectItem value="month">Ce mois</SelectItem>
                  <SelectItem value="year">Cette année</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Main Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="border-green-200 dark:border-green-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <ShoppingCart className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Ventes</p>
                  <p className="text-xl font-bold text-green-600">{financials.totalSales.toLocaleString()} FC</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-red-200 dark:border-red-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <Package className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Achats</p>
                  <p className="text-xl font-bold text-red-600">{financials.totalSupplies.toLocaleString()} FC</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-blue-200 dark:border-blue-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Dépôts</p>
                  <p className="text-xl font-bold text-blue-600">{financials.totalDeposits.toLocaleString()} FC</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-amber-200 dark:border-amber-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                  <TrendingDown className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Retraits</p>
                  <p className="text-xl font-bold text-amber-600">{financials.totalWithdrawals.toLocaleString()} FC</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-700 dark:text-green-400 font-medium">RECETTES</p>
                  <p className="text-sm text-muted-foreground">(Ventes + Dépôts)</p>
                  <p className="text-3xl font-bold text-green-600 mt-2">{financials.recettes.toLocaleString()} FC</p>
                </div>
                <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <TrendingUp className="w-8 h-8 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-red-200 dark:border-red-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-red-700 dark:text-red-400 font-medium">DÉPENSES</p>
                  <p className="text-sm text-muted-foreground">(Achats + Retraits)</p>
                  <p className="text-3xl font-bold text-red-600 mt-2">{financials.depenses.toLocaleString()} FC</p>
                </div>
                <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <TrendingDown className="w-8 h-8 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className={`bg-gradient-to-br ${financials.solde >= 0 ? 'from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border-emerald-200 dark:border-emerald-800' : 'from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border-red-200 dark:border-red-800'}`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${financials.solde >= 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400'}`}>SOLDE CAISSE</p>
                  <p className="text-sm text-muted-foreground">(Recettes - Dépenses)</p>
                  <p className={`text-3xl font-bold mt-2 ${financials.solde >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {financials.solde.toLocaleString()} FC
                  </p>
                </div>
                <div className={`w-16 h-16 rounded-full flex items-center justify-center ${financials.solde >= 0 ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                  <Wallet className={`w-8 h-8 ${financials.solde >= 0 ? 'text-emerald-600' : 'text-red-600'}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* TVA and HT */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total HT (Ventes)</p>
                  <p className="text-xl font-bold text-purple-600">{financials.totalHT.toLocaleString()} FC</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total TVA</p>
                  <p className="text-xl font-bold text-indigo-600">{financials.totalTVA.toLocaleString()} FC</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader><CardTitle className="text-lg">Évolution Ventes vs Achats</CardTitle></CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={evolutionData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip formatter={(value) => `${Number(value).toLocaleString()} FC`} />
                    <Legend />
                    <Line type="monotone" dataKey="ventes" stroke="hsl(160, 84%, 39%)" strokeWidth={2} name="Ventes" />
                    <Line type="monotone" dataKey="achats" stroke="hsl(0, 84%, 60%)" strokeWidth={2} name="Achats" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader><CardTitle className="text-lg">Répartition Recettes / Dépenses</CardTitle></CardHeader>
            <CardContent>
              <div className="h-64 flex gap-4">
                <div className="flex-1">
                  <p className="text-sm text-center text-muted-foreground mb-2">Recettes</p>
                  <ResponsiveContainer width="100%" height="90%">
                    <PieChart>
                      <Pie
                        data={revenueDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={30}
                        outerRadius={60}
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {revenueDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `${Number(value).toLocaleString()} FC`} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-center text-muted-foreground mb-2">Dépenses</p>
                  <ResponsiveContainer width="100%" height="90%">
                    <PieChart>
                      <Pie
                        data={expenseDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={30}
                        outerRadius={60}
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {expenseDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `${Number(value).toLocaleString()} FC`} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sales by User Table */}
        <Card>
          <CardHeader><CardTitle className="text-lg">Détails Ventes par Utilisateur</CardTitle></CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Utilisateur</TableHead>
                  <TableHead>Nb Ventes</TableHead>
                  <TableHead>Total TTC</TableHead>
                  <TableHead>% du Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={4} className="text-center py-8">Chargement...</TableCell></TableRow>
                ) : salesByUser.length === 0 ? (
                  <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">Aucune vente pour cette période</TableCell></TableRow>
                ) : (
                  salesByUser.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>{filteredSales.filter(s => s.nom_vendeur === item.name).length}</TableCell>
                      <TableCell className="font-bold text-primary">{item.ventes.toLocaleString()} FC</TableCell>
                      <TableCell>{financials.totalSales > 0 ? ((item.ventes / financials.totalSales) * 100).toFixed(1) : 0}%</TableCell>
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
