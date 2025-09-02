import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { User, Phone, Mail, MapPin, Calendar } from "lucide-react";
import { ProfileImageUpload } from "@/components/profile/ProfileImageUpload";
import { SavedAddresses } from "@/components/profile/SavedAddresses";

const Profile = () => {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    full_name: "",
    email: "",
    phone_no: "",
    dob: "",
    preferred_payment_method: "",
    profile_picture_url: "",
  });

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setIsDarkMode(isDark);
    
    if (user) {
      fetchUserProfile();
    }
  }, [user]);

  const toggleDarkMode = () => {
    document.documentElement.classList.toggle('dark');
    setIsDarkMode(!isDarkMode);
  };

  const fetchUserProfile = async () => {
    try {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (userError) throw userError;

      const { data: customerData, error: customerError } = await supabase
        .from('customers')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (customerError && customerError.code !== 'PGRST116') {
        throw customerError;
      }

      setProfileData({
        full_name: userData?.full_name || "",
        email: userData?.email || "",
        phone_no: userData?.phone_no || "",
        dob: customerData?.dob || "",
        preferred_payment_method: customerData?.preferred_payment_method || "",
        profile_picture_url: userData?.profile_picture_url || "",
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile data');
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Update users table
      const { error: userError } = await supabase
        .from('users')
        .update({
          full_name: profileData.full_name,
          phone_no: profileData.phone_no,
        })
        .eq('id', user.id);

      if (userError) throw userError;

      // Update or insert into customers table
      const { error: customerError } = await supabase
        .from('customers')
        .upsert({
          id: user.id,
          dob: profileData.dob || null,
          preferred_payment_method: profileData.preferred_payment_method || null,
        });

      if (customerError) throw customerError;

      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpdate = (url: string) => {
    setProfileData(prev => ({ ...prev, profile_picture_url: url }));
  };

  return (
    <div className="min-h-screen bg-gradient-main text-foreground morphing-bg ev-particles">
      <Header isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
      
      <div className="container mx-auto px-4 pt-24 pb-16">
        <div className="max-w-2xl mx-auto space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-foreground mb-4">Profile Management</h1>
            <p className="text-muted-foreground">Manage your personal information and preferences</p>
          </div>

            <Card className="glass glass-hover card-hover-lift">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="p-2 rounded-full bg-gradient-primary electric-glow">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  Personal Information
                </CardTitle>
              </CardHeader>
            <CardContent className="space-y-6">
              {/* Profile Image Upload */}
              <div className="flex justify-center">
                <ProfileImageUpload
                  userId={user?.id || ""}
                  currentImageUrl={profileData.profile_picture_url}
                  userName={profileData.full_name}
                  onImageUpdate={handleImageUpdate}
                />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    value={profileData.full_name}
                    onChange={(e) => setProfileData(prev => ({ ...prev, full_name: e.target.value }))}
                    placeholder="Enter your full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    disabled
                    placeholder="Enter your Email"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone_no">Phone Number</Label>
                  <Input
                    id="phone_no"
                    value={profileData.phone_no}
                    onChange={(e) => setProfileData(prev => ({ ...prev, phone_no: e.target.value }))}
                    className="bg-muted"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dob">Date of Birth</Label>
                  <Input
                    id="dob"
                    type="date"
                    value={profileData.dob}
                    onChange={(e) => setProfileData(prev => ({ ...prev, dob: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="payment_method">Preferred Payment Method</Label>
                <select
                  id="payment_method"
                  value={profileData.preferred_payment_method}
                  onChange={(e) => setProfileData(prev => ({ ...prev, preferred_payment_method: e.target.value }))}
                  className="w-full px-3 py-2 border border-input bg-background rounded-md"
                >
                  <option value="">Select payment method</option>
                  <option value="upi">UPI</option>
                  <option value="card">Credit/Debit Card</option>
                  <option value="wallet">Wallet</option>
                  <option value="cash">Cash</option>
                </select>
              </div>

              <Button 
                onClick={handleSaveProfile} 
                disabled={loading}
                className="w-full bg-gradient-primary btn-electric energy-flow"
              >
                {loading ? "Saving..." : "Save Profile"}
              </Button>
            </CardContent>
          </Card>

          {/* Saved Addresses Section */}
          <SavedAddresses userId={user?.id || ""} />
        </div>
      </div>
    </div>
  );
};

export default Profile;