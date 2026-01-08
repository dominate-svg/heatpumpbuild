import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, LogOut, Download, Users, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { useLeads } from '@/hooks/useLeads';
import { useAssumptionsList, useUpdateAssumption } from '@/hooks/useAssumptions';
import { formatCurrency } from '@/lib/calculations';

export default function Admin() {
  const { user, isAdmin, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const { data: leads, isLoading: leadsLoading } = useLeads();
  const { data: assumptions, isLoading: assumptionsLoading } = useAssumptionsList();
  const updateAssumption = useUpdateAssumption();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/admin/login');
    }
  }, [user, authLoading, navigate]);

  const exportCSV = () => {
    if (!leads) return;
    const headers = ['Date', 'Name', 'Email', 'Phone', 'Address', 'Postcode', 'Install Price', 'Savings'];
    const rows = leads.map(l => [
      new Date(l.created_at).toLocaleDateString(),
      l.name, l.email, l.phone, l.address, l.postcode || '',
      l.estimates?.[0]?.install_price_final || '',
      l.estimates?.[0]?.annual_savings || ''
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card p-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">Admin Dashboard</h1>
          <Button variant="ghost" onClick={signOut}>
            <LogOut className="w-4 h-4 mr-2" /> Sign Out
          </Button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        <Tabs defaultValue="leads">
          <TabsList>
            <TabsTrigger value="leads"><Users className="w-4 h-4 mr-2" />Leads</TabsTrigger>
            <TabsTrigger value="assumptions"><Settings className="w-4 h-4 mr-2" />Assumptions</TabsTrigger>
          </TabsList>

          <TabsContent value="leads" className="mt-6">
            <Card>
              <CardHeader className="flex-row items-center justify-between">
                <CardTitle>Leads ({leads?.length || 0})</CardTitle>
                <Button variant="outline" size="sm" onClick={exportCSV}>
                  <Download className="w-4 h-4 mr-2" />Export CSV
                </Button>
              </CardHeader>
              <CardContent>
                {leadsLoading ? (
                  <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Address</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Savings</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {leads?.map((lead) => (
                        <TableRow key={lead.id}>
                          <TableCell>{new Date(lead.created_at).toLocaleDateString()}</TableCell>
                          <TableCell>{lead.name}</TableCell>
                          <TableCell>{lead.email}</TableCell>
                          <TableCell>{lead.phone}</TableCell>
                          <TableCell className="max-w-[200px] truncate">{lead.address}</TableCell>
                          <TableCell>
                            {lead.estimates?.[0]?.install_price_final 
                              ? formatCurrency(Number(lead.estimates[0].install_price_final)) 
                              : '-'}
                          </TableCell>
                          <TableCell>
                            {lead.estimates?.[0]?.annual_savings 
                              ? formatCurrency(Number(lead.estimates[0].annual_savings)) 
                              : '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="assumptions" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Calculation Assumptions</CardTitle>
              </CardHeader>
              <CardContent>
                {assumptionsLoading ? (
                  <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">
                    {assumptions?.map((a) => (
                      <div key={a.id} className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
                        <div className="flex-1">
                          <p className="text-sm font-medium">{a.label}</p>
                          <p className="text-xs text-muted-foreground">{a.key}</p>
                        </div>
                        <Input
                          type="number"
                          step="any"
                          defaultValue={a.value}
                          className="w-28 bg-background"
                          onBlur={(e) => {
                            const val = parseFloat(e.target.value);
                            if (!isNaN(val) && val !== a.value) {
                              updateAssumption.mutate({ key: a.key, value: val });
                            }
                          }}
                        />
                        {a.unit && <span className="text-sm text-muted-foreground w-16">{a.unit}</span>}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
