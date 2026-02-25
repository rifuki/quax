"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ImageUploadModal } from "@/components/modal";
import { useUser } from "../hooks/use-user";
import { useUpdateUser } from "../hooks/use-update-user";
import { 
  User, Lock, Eye, EyeOff, Camera, Key, Save, 
  Monitor, Smartphone, Globe, LogOut, AlertTriangle
} from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "@/lib/api";

interface Session {
  id: string;
  device: string;
  location: string;
  ip: string;
  created_at: string;
  is_current: boolean;
}

// Loading component
function ProfileLoading() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
    </div>
  );
}

// Not logged in component
function ProfileNotLoggedIn() {
  return <div className="text-center py-8">Not logged in</div>;
}

// Main profile content
function ProfileContent({ user }: { user: NonNullable<ReturnType<typeof useUser>['data']> }) {
  const { isPending: isUpdating, mutateAsync: updateUser } = useUpdateUser();
  
  // Modal state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  
  // Profile form state
  const [name, setName] = useState(user.name || "");
  const [username, setUsername] = useState(user.username || "");
  const [email, setEmail] = useState(user.email || "");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(user.avatar_url || null);
  
  // Password form state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [currentPasswordError, setCurrentPasswordError] = useState<string | null>(null);

  // Sessions state
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);

  // Fetch sessions on mount
  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    setLoadingSessions(true);
    try {
      const response = await apiClient.get('/auth/sessions');
      setSessions(response.data?.data || []);
    } catch {
      // Fallback to mock data
      setSessions([
        { id: "1", device: "Chrome on macOS", location: "Jakarta, Indonesia", ip: "182.1.xxx.xxx", created_at: new Date().toISOString(), is_current: true },
        { id: "2", device: "Safari on iPhone", location: "Jakarta, Indonesia", ip: "182.1.xxx.xxx", created_at: new Date(Date.now() - 7200000).toISOString(), is_current: false },
      ]);
    } finally {
      setLoadingSessions(false);
    }
  };

  const handleAvatarUpload = async (file: File) => {
    const formData = new FormData();
    formData.append('avatar', file);

    const response = await apiClient.post('/users/avatar', formData, {
      headers: { 'Content-Type': undefined }, // let browser set multipart boundary
    });

    const avatarUrl = response.data?.data?.avatar_url;
    if (avatarUrl) setAvatarUrl(avatarUrl);
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const updates: { name?: string; username?: string; email?: string } = {};
    
    if (name !== user.name) updates.name = name;
    if (username !== user.username) updates.username = username;
    if (email !== user.email) updates.email = email;
    
    if (Object.keys(updates).length > 0) {
      try {
        await updateUser(updates);
        toast.success("Profile updated successfully");
      } catch {
        toast.error("Failed to update profile");
      }
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setCurrentPasswordError(null);

    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    try {
      await apiClient.post('/auth/change-password', {
        current_password: currentPassword,
        new_password: newPassword
      });
      toast.success("Password changed successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordError(null);
      setCurrentPasswordError(null);
    } catch (error: any) {
      if (error.response?.status === 401) {
        setCurrentPasswordError("Current password is incorrect");
      } else {
        setPasswordError("Failed to change password. Please try again.");
      }
    }
  };

  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value);
    if (value && newPassword && value !== newPassword) {
      setPasswordError("Passwords do not match");
    } else {
      setPasswordError(null);
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    try {
      await apiClient.delete(`/auth/sessions/${sessionId}`);
      setSessions(sessions.filter(s => s.id !== sessionId));
      toast.success("Session revoked");
    } catch {
      toast.error("Failed to revoke session");
    }
  };

  const handleLogoutAll = async () => {
    try {
      await apiClient.delete('/auth/sessions');
      toast.success("All other sessions logged out");
      fetchSessions();
    } catch {
      toast.error("Failed to logout sessions");
    }
  };

  const isProfileChanged = 
    name !== user.name || 
    username !== (user.username || "") || 
    email !== user.email;
  
  const isPasswordValid = 
    currentPassword && 
    newPassword && 
    confirmPassword && 
    newPassword === confirmPassword &&
    newPassword.length >= 8;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Upload Modal */}
      <ImageUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUpload={handleAvatarUpload}
        title="Upload Profile Photo"
        description="Select a profile photo. Recommended: Square image, at least 200x200px."
        maxSizeMB={2}
      />

      {/* Profile Header Card */}
      <Card className="overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-orange-500 to-red-600" />
        <CardContent className="relative pt-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-12 mb-6">
            <div className="relative">
              <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
                <AvatarImage src={avatarUrl || undefined} />
                <AvatarFallback className="bg-gradient-to-br from-orange-500 to-red-600 text-white text-3xl font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <Button 
                size="icon" 
                variant="secondary" 
                className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full shadow-md"
                onClick={() => setIsUploadModalOpen(true)}
              >
                <Camera className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex-1 pb-2">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold">{user.name}</h1>
                <Badge variant={user.role === "admin" ? "destructive" : "secondary"}>
                  {user.role === "admin" ? "Administrator" : "User"}
                </Badge>
              </div>
              <p className="text-muted-foreground">{user.email}</p>
            </div>
          </div>

          {/* User Stats Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-t">
            <div className="text-center sm:text-left">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Username</p>
              <p className="font-medium">{user.username || "Not set"}</p>
            </div>
            <div className="text-center sm:text-left">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Joined</p>
              <p className="font-medium">
                {user.created_at 
                  ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                  : "-"
                }
              </p>
            </div>
            <div className="text-center sm:text-left">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Role</p>
              <p className="font-medium capitalize">{user.role}</p>
            </div>
            <div className="text-center sm:text-left">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Status</p>
              <div className="flex items-center justify-center sm:justify-start gap-1.5">
                <span className="h-2 w-2 rounded-full bg-green-500" />
                <span className="font-medium">Active</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
        </TabsList>

        {/* General Tab */}
        <TabsContent value="general" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Information
              </CardTitle>
              <CardDescription>
                Update your personal information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileSubmit} className="space-y-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your full name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="username"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                  />
                </div>
                <div className="flex justify-end">
                  <Button type="submit" disabled={isUpdating || !isProfileChanged}>
                    {isUpdating ? "Saving..." : <><Save className="mr-2 h-4 w-4" /> Save Changes</>}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Change Password
              </CardTitle>
              <CardDescription>
                Update your password to keep your account secure
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="current-password"
                      type={showCurrentPassword ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => {
                        setCurrentPassword(e.target.value);
                        setCurrentPasswordError(null);
                      }}
                      placeholder="Enter current password"
                      className={currentPasswordError ? "border-destructive" : ""}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    >
                      {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  {currentPasswordError && (
                    <p className="text-sm text-destructive">{currentPasswordError}</p>
                  )}
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <div className="relative">
                    <Input
                      id="new-password"
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">Minimum 8 characters</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                    placeholder="Confirm new password"
                    className={passwordError && confirmPassword ? "border-destructive" : ""}
                  />
                  {passwordError && confirmPassword && (
                    <p className="text-sm text-destructive">{passwordError}</p>
                  )}
                </div>
                <div className="flex justify-end">
                  <Button type="submit" disabled={!isPasswordValid}>
                    <Key className="mr-2 h-4 w-4" /> Update Password
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sessions Tab */}
        <TabsContent value="sessions" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="h-5 w-5" />
                Active Sessions
              </CardTitle>
              <CardDescription>
                Manage your active sessions on all devices
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingSessions ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
                </div>
              ) : (
                <div className="space-y-4">
                  {sessions.map((session) => (
                    <div key={session.id} className="flex items-center justify-between p-4 rounded-lg border bg-card">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          {session.device.includes("iPhone") || session.device.includes("Android") ? (
                            <Smartphone className="h-5 w-5 text-primary" />
                          ) : (
                            <Monitor className="h-5 w-5 text-primary" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{session.device}</span>
                            {session.is_current && (
                              <Badge variant="outline" className="text-green-600 border-green-600">Current</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-0.5">
                            <Globe className="h-3 w-3" />
                            {session.location}
                            <span className="text-border">|</span>
                            {session.ip}
                            <span className="text-border">|</span>
                            {new Date(session.created_at).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      {!session.is_current && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleRevokeSession(session.id)}
                        >
                          <LogOut className="h-4 w-4 mr-1" /> Revoke
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <Separator className="my-6" />

              <div className="flex items-center justify-between p-4 rounded-lg border border-destructive/20 bg-destructive/5">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
                  <div>
                    <h4 className="font-medium text-destructive">Logout All Devices</h4>
                    <p className="text-sm text-muted-foreground">
                      This will immediately terminate all other active sessions
                    </p>
                  </div>
                </div>
                <Button variant="destructive" onClick={handleLogoutAll}>
                  Logout All
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Main export component
export function UserProfile() {
  const { data: user, isLoading } = useUser();

  if (isLoading) {
    return <ProfileLoading />;
  }

  if (!user) {
    return <ProfileNotLoggedIn />;
  }

  return <ProfileContent user={user} />;
}
