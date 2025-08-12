import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { MapPin, Plus, Home, Briefcase, Star, Trash2, Edit } from "lucide-react";

interface SavedAddress {
  id: string;
  label: string;
  address: string;
  latitude: number;
  longitude: number;
  is_default: boolean;
  created_at: string;
}

interface SavedAddressesProps {
  userId: string;
}

export const SavedAddresses = ({ userId }: SavedAddressesProps) => {
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<SavedAddress | null>(null);
  const [formData, setFormData] = useState({
    label: "",
    address: "",
    latitude: 0,
    longitude: 0,
    is_default: false
  });

  useEffect(() => {
    fetchSavedAddresses();
  }, [userId]);

  const fetchSavedAddresses = async () => {
    try {
      const { data, error } = await supabase
        .from('customer_saved_locations')
        .select('*')
        .eq('customer_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAddresses(data || []);
    } catch (error) {
      console.error('Error fetching saved addresses:', error);
      toast.error('Failed to load saved addresses');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAddress = async () => {
    if (!formData.label.trim() || !formData.address.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      if (editingAddress) {
        // Update existing address
        const { error } = await supabase
          .from('customer_saved_locations')
          .update({
            label: formData.label,
            address: formData.address,
            latitude: formData.latitude,
            longitude: formData.longitude,
            is_default: formData.is_default
          })
          .eq('id', editingAddress.id);

        if (error) throw error;
        toast.success('Address updated successfully');
      } else {
        // Create new address
        const { error } = await supabase
          .from('customer_saved_locations')
          .insert({
            customer_id: userId,
            label: formData.label,
            address: formData.address,
            latitude: formData.latitude,
            longitude: formData.longitude,
            is_default: formData.is_default
          });

        if (error) throw error;
        toast.success('Address saved successfully');
      }

      fetchSavedAddresses();
      setIsAddDialogOpen(false);
      setEditingAddress(null);
      setFormData({ label: "", address: "", latitude: 0, longitude: 0, is_default: false });
    } catch (error) {
      console.error('Error saving address:', error);
      toast.error('Failed to save address');
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    try {
      const { error } = await supabase
        .from('customer_saved_locations')
        .delete()
        .eq('id', addressId);

      if (error) throw error;
      toast.success('Address deleted successfully');
      fetchSavedAddresses();
    } catch (error) {
      console.error('Error deleting address:', error);
      toast.error('Failed to delete address');
    }
  };

  const handleEditAddress = (address: SavedAddress) => {
    setEditingAddress(address);
    setFormData({
      label: address.label,
      address: address.address,
      latitude: address.latitude,
      longitude: address.longitude,
      is_default: address.is_default
    });
    setIsAddDialogOpen(true);
  };

  const getAddressIcon = (label: string) => {
    const lowerLabel = label.toLowerCase();
    if (lowerLabel.includes('home')) return <Home className="w-4 h-4" />;
    if (lowerLabel.includes('work') || lowerLabel.includes('office')) return <Briefcase className="w-4 h-4" />;
    return <MapPin className="w-4 h-4" />;
  };

  if (loading) {
    return (
      <Card className="glass">
        <CardContent className="p-6">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Saved Addresses
          </span>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-gradient-primary">
                <Plus className="w-4 h-4 mr-2" />
                Add Address
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingAddress ? 'Edit Address' : 'Add New Address'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="label">Label</Label>
                  <Input
                    id="label"
                    value={formData.label}
                    onChange={(e) => setFormData(prev => ({ ...prev, label: e.target.value }))}
                    placeholder="e.g., Home, Work, Gym"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="Enter complete address"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_default"
                    checked={formData.is_default}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_default: e.target.checked }))}
                    className="rounded"
                  />
                  <Label htmlFor="is_default" className="text-sm">
                    Set as default address
                  </Label>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleSaveAddress} className="flex-1 bg-gradient-primary">
                    {editingAddress ? 'Update' : 'Save'} Address
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsAddDialogOpen(false);
                      setEditingAddress(null);
                      setFormData({ label: "", address: "", latitude: 0, longitude: 0, is_default: false });
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {addresses.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <MapPin className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No saved addresses yet</p>
            <p className="text-sm">Add frequently used addresses for faster booking</p>
          </div>
        ) : (
          <div className="space-y-3">
            {addresses.map((address) => (
              <div
                key={address.id}
                className="flex items-start gap-3 p-3 rounded-lg border border-border bg-card/50 hover:bg-card/80 transition-colors"
              >
                <div className="mt-1 text-primary">
                  {getAddressIcon(address.label)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-sm">{address.label}</h4>
                    {address.is_default && (
                      <Star className="w-3 h-3 text-yellow-500 fill-current" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {address.address}
                  </p>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditAddress(address)}
                    className="h-8 w-8 p-0"
                  >
                    <Edit className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteAddress(address.id)}
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};