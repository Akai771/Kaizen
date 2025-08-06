import React, { useState } from 'react';
import { Mail, Zap, AlertCircle, Sun, Moon, ArrowLeft, CheckCircle } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useNavigate } from 'react-router-dom';

interface ForgotPasswordFormData {
  email: string;
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

const ForgotPassword: React.FC = () => {
  const [formData, setFormData] = useState<ForgotPasswordFormData>({
    email: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<ForgotPasswordFormData>>({});
  const [isEmailSent, setIsEmailSent] = useState(false);
    const Navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name as keyof ForgotPasswordFormData]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<ForgotPasswordFormData> = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      // TODO: Implement forgot password logic
      console.log('Forgot password attempt:', formData);
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      setIsEmailSent(true);
    } catch (error) {
      console.error('Forgot password error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    Navigate('/'); // Assuming you have a Navigate function to go back to login
  };

  const handleResendEmail = async () => {
    setIsLoading(true);
    try {
      // TODO: Implement resend email logic
      console.log('Resend email attempt:', formData);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
    } catch (error) {
      console.error('Resend email error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isEmailSent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4 relative overflow-y-auto">
        {/* Theme Switcher */}
        <ThemeSwitcher />
        
        <div className="flex items-center justify-center min-h-[calc(100vh-2rem)] py-8">
          <div className="w-full max-w-md space-y-8">
          {/* Header */}
          <div className="text-center space-y-6">
            <div className="flex items-center justify-center">
              <div className="bg-gradient-to-br from-green-500 to-green-600 p-4 rounded-3xl shadow-lg ring-1 ring-green-500/20">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
            </div>
            <div className="space-y-3">
              <div className="text-4xl font-bold">
                Check your email
              </div>
              <span className="text-muted-foreground text-sm">
                We've sent a password reset link to your email
              </span>
            </div>
          </div>

          {/* Success Card */}
          <Card>
            <CardHeader className="space-y-3 pb-8">
              <CardTitle className="text-2xl font-bold text-center">Email Sent!</CardTitle>
              <CardDescription className="text-center text-base">
                We've sent a password reset link to <strong>{formData.email}</strong>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-sm text-green-700 dark:text-green-400">
                    Please check your inbox and click the reset link to continue. The link will expire in 24 hours.
                  </AlertDescription>
                </Alert>

                <div className="text-center space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Didn't receive the email? Check your spam folder or
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleResendEmail}
                    disabled={isLoading}
                    className="w-full h-12 text-base font-semibold"
                  >
                    {isLoading && (
                      <div className="inline-block mr-3 h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
                    )}
                    {isLoading ? 'Resending...' : 'Resend Email'}
                  </Button>
                </div>
              </div>

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
  }

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
              Forgot your password?
            </div>
            <span className="text-muted-foreground text-sm">
              No worries, we'll send you reset instructions
            </span>
          </div>
        </div>

        {/* Forgot Password Form */}
        <Card>
          <CardHeader className="space-y-3 pb-8">
            <CardTitle className="text-3xl font-bold text-center">Reset Password</CardTitle>
            <CardDescription className="text-center text-base">
              Enter your email address and we'll send you a link to reset your password
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div className="space-y-3">
                <Label htmlFor="email" className="text-base font-medium">
                  Email
                </Label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`pl-12 h-12 text-base ${
                      errors.email ? 'border-destructive focus-visible:border-destructive' : ''
                    }`}
                  />
                </div>
                {errors.email && (
                  <Alert variant="destructive" className="py-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-sm">
                      {errors.email}
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
                {isLoading ? 'Sending...' : 'Send Reset Link'}
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

export default ForgotPassword;
