import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, LogOut, Package, Eye, Check, Trash2, RotateCcw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { getAllItems, updateItem, deleteItem as dbDeleteItem, isAdminLoggedIn, setAdminLoggedIn, getStats } from '@/lib/database';
import { Item, ItemCategory, ItemStatus, CATEGORY_LABELS, STATUS_LABELS } from '@/types/item';
import { format } from 'date-fns';

const AdminDashboardPage = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [itemNotes, setItemNotes] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();
  
  useEffect(() => {
    if (!isAdminLoggedIn()) {
      navigate('/admin');
      return;
    }
    refreshItems();
  }, [navigate]);

  const refreshItems = () => {
    setItems(getAllItems());
  };

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesSearch = searchQuery === '' || 
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.reporterName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.reporterEmail.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesType = typeFilter === 'all' || item.type === typeFilter;
      const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      
      return matchesSearch && matchesType && matchesCategory && matchesStatus;
    });
  }, [items, searchQuery, typeFilter, categoryFilter, statusFilter]);

  const handleLogout = () => {
    setAdminLoggedIn(false);
    toast({ title: 'Logged out', description: 'You have been logged out.' });
    navigate('/admin');
  };

  const handleStatusChange = (item: Item, newStatus: ItemStatus) => {
    updateItem(item.id, { status: newStatus, notes: itemNotes || item.notes });
    refreshItems();
    setSelectedItem(null);
    setItemNotes('');
    toast({
      title: 'Status updated',
      description: `Item marked as ${STATUS_LABELS[newStatus]}.`,
    });
  };

  const handleDelete = (item: Item) => {
    if (confirm('Are you sure you want to delete this item?')) {
      dbDeleteItem(item.id);
      refreshItems();
      setSelectedItem(null);
      toast({ title: 'Item deleted', description: 'The item has been removed.' });
    }
  };

  const getStatusBadgeVariant = (status: ItemStatus) => {
    switch (status) {
      case 'pending': return 'secondary';
      case 'held': return 'default';
      case 'claimed': return 'outline';
      case 'disposed': return 'destructive';
      default: return 'secondary';
    }
  };

  const stats = useMemo(() => getStats(), [items]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage lost and found items</p>
        </div>
        <Button variant="outline" onClick={handleLogout} className="gap-2">
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Items</CardDescription>
            <CardTitle className="text-2xl">{stats.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Pending Review</CardDescription>
            <CardTitle className="text-2xl text-destructive">{stats.pending}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Currently Held</CardDescription>
            <CardTitle className="text-2xl text-primary">{stats.held}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Claimed</CardDescription>
            <CardTitle className="text-2xl text-muted-foreground">{stats.claimed}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search items, reporters..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="lost">Lost</SelectItem>
                  <SelectItem value="found">Found</SelectItem>
                </SelectContent>
              </Select>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {(Object.entries(CATEGORY_LABELS) as [ItemCategory, string][]).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {(Object.entries(STATUS_LABELS) as [ItemStatus, string][]).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon" onClick={refreshItems}>
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Items Table */}
      <Card>
        <CardContent className="p-0">
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No items found</h3>
              <p className="text-muted-foreground">
                {items.length === 0 
                  ? "No items have been reported yet."
                  : "Try adjusting your filters."}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="hidden md:table-cell">Description</TableHead>
                  <TableHead className="hidden lg:table-cell">Reporter</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map(item => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Badge variant={item.type === 'lost' ? 'destructive' : 'default'}>
                        {item.type === 'lost' ? 'Lost' : 'Found'}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      {CATEGORY_LABELS[item.category]}
                    </TableCell>
                    <TableCell className="hidden md:table-cell max-w-xs truncate">
                      {item.description}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {item.reporterName}
                    </TableCell>
                    <TableCell>
                      {format(new Date(item.date), 'MMM d')}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(item.status)}>
                        {STATUS_LABELS[item.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => { setSelectedItem(item); setItemNotes(item.notes || ''); }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Item Detail Dialog */}
      <Dialog open={!!selectedItem} onOpenChange={() => { setSelectedItem(null); setItemNotes(''); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Badge variant={selectedItem?.type === 'lost' ? 'destructive' : 'default'}>
                {selectedItem?.type === 'lost' ? 'Lost' : 'Found'}
              </Badge>
              {selectedItem && CATEGORY_LABELS[selectedItem.category]}
            </DialogTitle>
            <DialogDescription>
              Reported on {selectedItem && format(new Date(selectedItem.createdAt), 'MMM d, yyyy')}
            </DialogDescription>
          </DialogHeader>
          
          {selectedItem && (
            <div className="space-y-4">
              <div>
                <Label className="text-muted-foreground">Description</Label>
                <p className="mt-1">{selectedItem.description}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Location</Label>
                  <p className="mt-1">{selectedItem.location}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Date</Label>
                  <p className="mt-1">{format(new Date(selectedItem.date), 'MMM d, yyyy')}</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <Label className="text-muted-foreground">Reporter</Label>
                <p className="mt-1 font-medium">{selectedItem.reporterName}</p>
                <p className="text-sm text-muted-foreground">{selectedItem.reporterEmail}</p>
                {selectedItem.reporterPhone && (
                  <p className="text-sm text-muted-foreground">{selectedItem.reporterPhone}</p>
                )}
              </div>

              <div>
                <Label htmlFor="notes">Admin Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Add notes about this item..."
                  value={itemNotes}
                  onChange={(e) => setItemNotes(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          )}
          
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="destructive"
              size="sm"
              onClick={() => selectedItem && handleDelete(selectedItem)}
              className="gap-1"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
            <div className="flex gap-2 flex-1 justify-end">
              {selectedItem?.status !== 'held' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => selectedItem && handleStatusChange(selectedItem, 'held')}
                >
                  Mark as Held
                </Button>
              )}
              {selectedItem?.status !== 'claimed' && (
                <Button
                  size="sm"
                  onClick={() => selectedItem && handleStatusChange(selectedItem, 'claimed')}
                  className="gap-1"
                >
                  <Check className="h-4 w-4" />
                  Mark Claimed
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboardPage;
