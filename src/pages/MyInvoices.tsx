import * as React from 'react';
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Receipt, Calendar, Eye, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { db, Invoice, Shop } from '@/lib/database';
import { numberToWords } from '@/lib/utils';

export default function MyInvoices() {
  const navigate = useNavigate();
  const [session, setSession] = useState<any>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [shopInfo, setShopInfo] = useState<Shop | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPeriod, setFilterPeriod] = useState('all');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showInvoice, setShowInvoice] = useState(false);

  useEffect(() => { checkSession(); }, []);

  const checkSession = () => {
    const sessionData = localStorage.getItem('supermarket_session');
    if (!sessionData) { navigate('/auth'); return; }
    const parsed = JSON.parse(sessionData);
    setSession(parsed);
    loadData(parsed.nom_utilisateur);
  };

  const loadData = async (vendeur: string) => {
    const [invoicesData, shopsData] = await Promise.all([
      db.getInvoicesByVendeur(vendeur),
      db.getShops()
    ]);
    setInvoices(invoicesData.sort((a, b) => new Date(b.date_facture).getTime() - new Date(a.date_facture).getTime()));
    if (shopsData.length > 0) setShopInfo(shopsData[0]);
    setLoading(false);
  };

  const filterByPeriod = (invoice: Invoice) => {
    if (filterPeriod === 'all') return true;
    const invoiceDate = new Date(invoice.date_facture);
    const today = new Date();
    
    switch (filterPeriod) {
      case 'today':
        return invoiceDate.toDateString() === today.toDateString();
      case 'month':
        return invoiceDate.getMonth() === today.getMonth() && invoiceDate.getFullYear() === today.getFullYear();
      case 'year':
        return invoiceDate.getFullYear() === today.getFullYear();
      default:
        return true;
    }
  };

  const filteredInvoices = invoices
    .filter(filterByPeriod)
    .filter(inv =>
      inv.code_facture?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.nom_client?.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const totalAmount = filteredInvoices.reduce((sum, inv) => sum + (inv.montant_ttc || 0), 0);

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link to="/dashboard"><Button variant="ghost" size="icon"><ArrowLeft className="w-5 h-5" /></Button></Link>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Mes Factures</h1>
              <p className="text-muted-foreground">{filteredInvoices.length} facture(s) - Total: {totalAmount.toLocaleString()} FC</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-4">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Rechercher..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
              </div>
              <Select value={filterPeriod} onValueChange={setFilterPeriod}>
                <SelectTrigger><div className="flex items-center gap-2"><Calendar className="w-4 h-4" /><SelectValue placeholder="Période" /></div></SelectTrigger>
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

        {/* Invoices Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code facture</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Montant TTC</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-8">Chargement...</TableCell></TableRow>
                ) : filteredInvoices.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-8"><Receipt className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />Aucune facture</TableCell></TableRow>
                ) : (
                  filteredInvoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-mono text-xs">{invoice.code_facture}</TableCell>
                      <TableCell>{new Date(invoice.date_facture).toLocaleDateString('fr-FR')}</TableCell>
                      <TableCell>{invoice.nom_client}</TableCell>
                      <TableCell className="font-bold text-primary">{(invoice.montant_ttc || 0).toLocaleString()} FC</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" onClick={() => { setSelectedInvoice(invoice); setShowInvoice(true); }}>
                          <Eye className="w-4 h-4 text-blue-600" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Invoice Dialog */}
        <Dialog open={showInvoice} onOpenChange={setShowInvoice}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex justify-between items-center">
                <span>Facture {selectedInvoice?.code_facture}</span>
                <Button variant="outline" size="sm" onClick={() => window.print()}><Printer className="w-4 h-4 mr-2" />Imprimer</Button>
              </DialogTitle>
            </DialogHeader>
            
            {selectedInvoice && (
              <div className="space-y-4 text-sm">
                <div className="flex justify-between items-start border-b pb-4">
                  <div>
                    <p className="text-lg font-bold">Facture N°</p>
                    <p className="text-primary font-bold text-xl">{selectedInvoice.code_facture}</p>
                    <p className="text-muted-foreground">{new Date(selectedInvoice.date_facture).toLocaleDateString('fr-FR')}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">{shopInfo?.nom_boutique || 'Au Super Marché'}</p>
                    <p className="text-sm">{shopInfo?.telephone}</p>
                  </div>
                </div>

                <div className="bg-muted p-3 rounded-lg">
                  <p className="font-medium">Client: {selectedInvoice.nom_client}</p>
                  {selectedInvoice.telephone_client && <p className="text-sm">Tél: {selectedInvoice.telephone_client}</p>}
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produit</TableHead>
                      <TableHead className="text-right">PU</TableHead>
                      <TableHead className="text-right">Qté</TableHead>
                      <TableHead className="text-right">PT</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedInvoice.articles?.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.nom_produit}</TableCell>
                        <TableCell className="text-right">{item.pu_vente.toLocaleString()}</TableCell>
                        <TableCell className="text-right">{item.qty}</TableCell>
                        <TableCell className="text-right font-medium">{item.pt.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <div className="border-t pt-4">
                  <div className="flex justify-between text-xl font-bold">
                    <span>TOTAL:</span>
                    <span className="text-primary">{(selectedInvoice.montant_ttc || 0).toLocaleString()} FC</span>
                  </div>
                  <p className="text-sm italic mt-2">Arrêté à: {numberToWords(Math.floor(selectedInvoice.montant_ttc || 0))} francs congolais</p>
                </div>

                <div className="text-center text-xs text-muted-foreground border-t pt-4">
                  <p>Fait à {shopInfo?.lieu || 'Kinshasa'}, le {new Date().toLocaleDateString('fr-FR')} à {new Date().toLocaleTimeString('fr-FR')}</p>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
