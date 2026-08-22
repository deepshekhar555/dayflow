import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Settings, User, Mail, Briefcase, Building } from 'lucide-react';

const Profile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    
    axios.get('http://localhost:5000/api/employees/me', {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => {
      if (res.data.success) {
        setProfile(res.data.profile);
      }
    }).catch(err => console.error(err));
  }, [navigate]);

  if (!profile) return <div className="p-8">Loading...</div>;

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-3xl mx-auto">
        <header className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate('/dashboard')} className="text-muted-foreground hover:text-foreground">
            &larr; Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-foreground">My Profile</h1>
        </header>

        <div className="bg-card rounded-2xl shadow-sm border border-border p-8">
          <div className="flex items-center gap-6 mb-8">
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-primary text-3xl font-bold">
              {profile.firstName?.charAt(0)}
            </div>
            <div>
              <h2 className="text-2xl font-bold">{profile.firstName} {profile.lastName}</h2>
              <p className="text-muted-foreground">{profile.designation || 'Employee'}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground flex items-center gap-2 mb-1">
                  <User className="w-4 h-4" /> First Name
                </label>
                <p className="font-medium p-3 bg-muted rounded-lg">{profile.firstName}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground flex items-center gap-2 mb-1">
                  <User className="w-4 h-4" /> Last Name
                </label>
                <p className="font-medium p-3 bg-muted rounded-lg">{profile.lastName}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground flex items-center gap-2 mb-1">
                  <Mail className="w-4 h-4" /> Email
                </label>
                <p className="font-medium p-3 bg-muted rounded-lg">{profile.user?.email}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground flex items-center gap-2 mb-1">
                  <Briefcase className="w-4 h-4" /> Designation
                </label>
                <p className="font-medium p-3 bg-muted rounded-lg">{profile.designation || 'Not set'}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground flex items-center gap-2 mb-1">
                  <Building className="w-4 h-4" /> Department
                </label>
                <p className="font-medium p-3 bg-muted rounded-lg">{profile.department || 'Not set'}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground flex items-center gap-2 mb-1">
                  <Settings className="w-4 h-4" /> Joining Date
                </label>
                <p className="font-medium p-3 bg-muted rounded-lg">{new Date(profile.joiningDate).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
