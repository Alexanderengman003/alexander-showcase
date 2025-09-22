import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LogOut, X, Eye, EyeOff } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { supabase } from "@/integrations/supabase/client";
import Analytics from "@/pages/Analytics";

interface ProtectedAnalyticsProps {
  onClose?: () => void;
}

export default function ProtectedAnalytics({ onClose }: ProtectedAnalyticsProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    console.log('Attempting analytics login with username:', username);
    
    try {
      const { data, error } = await supabase.functions.invoke('verify-analytics-password', {
        body: { username, password }
      });
      
      console.log('Supabase function response:', { data, error });
      
      if (error) {
        console.error('Analytics login error:', error);
        setError("Authentication failed. Please try again.");
        return;
      }
      
      if (data?.success) {
        console.log('Authentication successful');
        setIsAuthenticated(true);
      } else {
        console.error('Authentication failed:', data?.error);
        setError(data?.error || "Invalid credentials");
      }
    } catch (error) {
      console.error('Analytics login error:', error);
      setError("Authentication failed. Please try again.");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUsername("");
    setPassword("");
    setError("");
  };

  const handleClose = () => {
    handleLogout();
    onClose?.();
  };

  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-background border border-border rounded-lg m-4 overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-border bg-card">
          <h1 className="text-2xl font-bold hidden sm:block">Analytics Dashboard</h1>
          <div className="flex items-center gap-4 sm:ml-auto">
            <ThemeToggle />
            <Button onClick={handleLogout} variant="outline" className="flex items-center gap-2">
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
            <Button onClick={handleClose} variant="outline" size="icon">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="overflow-auto max-h-[calc(100vh-8rem)]">
          <Analytics />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background/95 backdrop-blur-sm p-4">
      <div className="absolute top-6 right-6 flex items-center gap-4 z-10">
        <ThemeToggle />
        <Button onClick={handleClose} variant="outline" size="icon">
          <X className="h-4 w-4" />
        </Button>
      </div>
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Analytics Access</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
            <Button type="submit" className="w-full">
              Login
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}