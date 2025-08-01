import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AuthGuardProps {
  children: React.ReactNode;
  requirePhoneVerification?: boolean;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ 
  children, 
  requirePhoneVerification = true 
}) => {
  const { user, loading, isPhoneVerified, authError, clearAuthError } = useAuth();
  const [loadingTimeout, setLoadingTimeout] = useState(false);

  // Set a timeout for loading state to prevent infinite loading
  useEffect(() => {
    if (loading) {
      const timeout = setTimeout(() => {
        setLoadingTimeout(true);
      }, 10000); // 10 seconds timeout

      return () => clearTimeout(timeout);
    } else {
      setLoadingTimeout(false);
    }
  }, [loading]);

  // Handle loading timeout or auth error
  if (loadingTimeout || authError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary/20">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 text-destructive">
              <AlertTriangle className="w-12 h-12" />
            </div>
            <CardTitle className="text-destructive">
              {authError ? 'Authentication Error' : 'Connection Timeout'}
            </CardTitle>
            <CardDescription>
              {authError || 'Authentication is taking longer than expected. This might be due to a connection issue.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Please try refreshing the page or sign in again.
              </p>
              <div className="flex flex-col gap-2">
                <Button 
                  onClick={() => {
                    if (authError) {
                      clearAuthError?.();
                    }
                    setLoadingTimeout(false);
                    window.location.reload();
                  }}
                  variant="default"
                  className="w-full"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh Page
                </Button>
                <Button 
                  onClick={() => {
                    if (authError) {
                      clearAuthError?.();
                    }
                    window.location.href = '/auth';
                  }}
                  variant="outline"
                  className="w-full"
                >
                  Go to Sign In
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary/20">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Loading...</CardTitle>
            <CardDescription>
              Please wait while we verify your authentication.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto" />
            <p className="text-sm text-muted-foreground mt-4">
              This should only take a moment...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Redirect to auth if no user
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Redirect to auth if phone verification is required but not verified
  if (requirePhoneVerification && !isPhoneVerified) {
    return <Navigate to="/auth" replace />;
  }

  // Render protected content
  return <>{children}</>;
};

export default AuthGuard;