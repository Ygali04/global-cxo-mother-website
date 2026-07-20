import type { JSX } from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/portal/components/ui/card';
import { Input } from '@/portal/components/ui/input';
import { Label } from '@/portal/components/ui/label';
import { Button } from '@/portal/components/ui/button';
import { Textarea } from '@/portal/components/ui/textarea';
import { useAuth } from '@/portal/hooks/useAuth';

export default function UserSettings(): JSX.Element {
  const { user, updateProfile, logout } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone);
  const [linkedin, setLinkedin] = useState(user.linkedin);
  const [aboutMe, setAboutMe] = useState(user.aboutMe);
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl ?? '');

  const handleSave = () => {
    updateProfile({ name, phone, linkedin, aboutMe, avatarUrl: avatarUrl || undefined });
    toast.success('Profile updated.');
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) return;
    toast.error('Account deletion is not yet available. Contact support.');
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-10">
      <div className="mx-auto max-w-2xl px-4">
        <Button variant="ghost" className="mb-4" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>

        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mb-6">Account Settings</h1>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Update your personal information.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label>Profile Photo URL</Label>
              <div className="flex items-center gap-3">
                {avatarUrl && <img src={avatarUrl} alt="Avatar" className="h-14 w-14 rounded-full object-cover border" />}
                <Input value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} placeholder="https://example.com/photo.jpg" className="flex-1" />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label>Email</Label>
              <Input value={user.email} disabled />
              <p className="text-xs text-slate-400">Email cannot be changed.</p>
            </div>
            <div className="grid gap-2">
              <Label>Phone</Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label>LinkedIn</Label>
              <Input value={linkedin} onChange={(e) => setLinkedin(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label>About Me</Label>
              <Textarea value={aboutMe} onChange={(e) => setAboutMe(e.target.value)} rows={3} />
            </div>
            <Button onClick={handleSave}>Save Changes</Button>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Security</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" onClick={() => toast.info('Password reset coming soon.')}>
              Change Password
            </Button>
            <div>
              <Button variant="outline" onClick={async () => { await logout(); window.location.href = '/'; }}>
                Sign Out of All Devices
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-600">Danger Zone</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3 rounded-lg border border-red-200 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-medium text-slate-900">Delete Account</p>
                <p className="text-sm text-slate-500">Permanently delete your account and all associated data.</p>
              </div>
              <Button variant="outline" className="w-full shrink-0 whitespace-nowrap border-red-300 text-red-600 hover:bg-red-50 sm:w-auto" onClick={handleDeleteAccount}>
                Delete Account
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
