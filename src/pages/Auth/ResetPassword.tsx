import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Lock, Zap, AlertCircle, Sun, Moon, CheckCircle, ArrowLeft } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ResetPasswordFormData {
  password: string;
  confirmPassword: string;
}

// Theme switcher component using next-themes
const ThemeSwitcher: React.FC = () => {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      className="fixed top-4 right-4 h-10 w-10 rounded-full"
    >
      {theme === 'dark' ? (
        <Sun className="h-5 w-5" />
      ) : (
        <Moon className="h-5 w-5" />
      )}
    </Button>
  );
};

const ResetPassword: React.FC = () => {
  const [formData, setFormData] = useState<ResetPasswordFormData>({
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<ResetPasswordFormData>>({});
  const [isTokenValid, setIsTokenValid] = useState<boolean | null>(null);
  const [isPasswordReset, setIsPasswordReset] = useState(false);
  const [token, setToken] = useState<string>('');

  // Simulate checking token validity on component mount
  useEffect(() => {
    const checkTokenValidity = async () => {
      // Extract token from URL params (in real app)
      const urlParams = new URLSearchParams(window.location.search);
      const resetToken = urlParams.get('token') || 'sample-token';
      setToken(resetToken);

      try {
        // TODO: Validate token with backend
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
        setIsTokenValid(true);
      } catch (error) {
        console.error('Token validation error:', error);
        setIsTokenValid(false);
      }
    };

    checkTokenValidity();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name as keyof ResetPasswordFormData]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<ResetPasswordFormData> = {};
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      // TODO: Implement password reset logic
      console.log('Password reset attempt:', { token, password: formData.password });
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      setIsPasswordReset(true);
    } catch (error) {
      console.error('Password reset error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    // TODO: Navigate to login page
    console.log('Navigate to login');
  };

  // Loading state while validating token
  if (isTokenValid === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4 relative overflow-y-auto">
        <ThemeSwitcher />
        <div className="flex items-center justify-center min-h-[calc(100vh-2rem)] py-8">
          <div className="text-center space-y-4">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-muted-foreground">Validating reset link...</p>
          </div>
        </div>
      </div>
    );
  }  // Invalid token state
  if (isTokenValid === false) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4 relative overflow-y-auto">
        <ThemeSwitcher />
        <div className="flex items-center justify-center min-h-[calc(100vh-2rem)] py-8">
          <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-6">
            <div className="flex items-center justify-center">
              <div className="bg-gradient-to-br from-destructive to-destructive/80 p-4 rounded-3xl shadow-lg ring-1 ring-destructive/20">
                <AlertCircle className="w-10 h-10 text-destructive-foreground" />
              </div>
            </div>
            <div className="space-y-3">
              <div className="text-4xl font-bold">
                Invalid Link
              </div>
              <span className="text-muted-foreground text-sm">
                This password reset link is invalid or has expired
              </span>
            </div>
          </div>

          <Card>
            <CardContent className="pt-6">
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  The password reset link you used is either invalid or has expired. Please request a new password reset link.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <Button
                  variant="outline"
                  onClick={() => {/* TODO: Navigate to forgot password */}}
                  className="w-full h-12 text-base font-semibold"
                >
                  Request New Reset Link
                </Button>

                <div className="text-center">
                  <Button
                    variant="link"
                    onClick={handleBackToLogin}
                    className="p-0 h-auto font-semibold inline-flex items-center"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Sign in
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          </div>
        </div>
      </div>
    );
  }

  // Success state after password reset
  if (isPasswordReset) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4 relative overflow-y-auto">
        <ThemeSwitcher />
        <div className="flex items-center justify-center min-h-[calc(100vh-2rem)] py-8">
          <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-6">
            <div className="flex items-center justify-center">
              <div className="bg-gradient-to-br from-green-500 to-green-600 p-4 rounded-3xl shadow-lg ring-1 ring-green-500/20">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
            </div>
            <div className="space-y-3">
              <div className="text-4xl font-bold">
                Password Reset!
              </div>
              <span className="text-muted-foreground text-sm">
                Your password has been successfully reset
              </span>
            </div>
          </div>

          <Card>
            <CardContent className="pt-6">
              <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20 mb-6">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-sm text-green-700 dark:text-green-400">
                  Your password has been successfully updated. You can now sign in with your new password.
                </AlertDescription>
              </Alert>

              <Button
                onClick={handleBackToLogin}
                className="w-full h-12 text-base font-semibold bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 shadow-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
              >
                Continue to Sign In
              </Button>
            </CardContent>
          </Card>
          </div>
        </div>
      </div>
    );
  }

  // Main reset password form
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4 relative overflow-y-auto">
      {/* Theme Switcher */}
      <ThemeSwitcher />
      
      <div className="flex items-center justify-center min-h-[calc(100vh-2rem)] py-8">
        <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center space-y-6">
          <div className="flex items-center justify-center">
            <div className="bg-gradient-to-br from-primary to-primary/80 p-4 rounded-3xl shadow-lg ring-1 ring-primary/20">
              <Zap className="w-10 h-10 text-primary-foreground" />
            </div>
          </div>
          <div className="space-y-3">
            <div className="text-4xl font-bold">
              Set new password
            </div>
            <span className="text-muted-foreground text-sm">
              Your new password must be different from previous used passwords
            </span>
          </div>
        </div>

        {/* Reset Password Form */}
        <Card>
          <CardHeader className="space-y-3 pb-8">
            <CardTitle className="text-3xl font-bold text-center">Create New Password</CardTitle>
            <CardDescription className="text-center text-base">
              Enter your new password below
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Password Field */}
              <div className="space-y-3">
                <Label htmlFor="password" className="text-base font-medium">
                  New Password
                </Label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your new password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`pl-12 pr-12 h-12 text-base ${
                      errors.password ? 'border-destructive focus-visible:border-destructive' : ''
                    }`}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                    )}
                  </Button>
                </div>
                {errors.password && (
                  <Alert variant="destructive" className="py-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-sm">
                      {errors.password}
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-3">
                <Label htmlFor="confirmPassword" className="text-base font-medium">
                  Confirm New Password
                </Label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm your new password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`pl-12 pr-12 h-12 text-base ${
                      errors.confirmPassword ? 'border-destructive focus-visible:border-destructive' : ''
                    }`}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                    )}
                  </Button>
                </div>
                {errors.confirmPassword && (
                  <Alert variant="destructive" className="py-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-sm">
                      {errors.confirmPassword}
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 text-base font-semibold bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 shadow-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {isLoading && (
                  <div className="inline-block mr-3 h-5 w-5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                )}
                {isLoading ? 'Updating Password...' : 'Update Password'}
              </Button>
            </form>

            {/* Back to Login */}
            <div className="text-center pt-6">
              <Button
                variant="link"
                onClick={handleBackToLogin}
                className="p-0 h-auto font-semibold inline-flex items-center"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Sign in
              </Button>
            </div>
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
