import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/hooks/supabaseClient';
import { Loader2 } from 'lucide-react';
import type { ProfileInsert } from '@/types/database.types';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  // Function to ensure profile exists
  const ensureProfileExists = async (userId: string, userEmail: string, userName?: string) => {
    try {
      // Check if profile already exists
      const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is "not found"
        console.error('Error checking profile:', fetchError);
        return;
      }

      // If profile doesn't exist, create it
      if (!existingProfile) {
        const profileData: ProfileInsert = {
          id: userId,
          email: userEmail,
          full_name: userName || userEmail.split('@')[0], // Use email username if no name provided
        };

        const { error: insertError } = await supabase
          .from('profiles')
          .insert(profileData as any);

        if (insertError) {
          console.error('Error creating profile:', insertError);
        } else {
          console.log('✅ Profile created successfully');
        }
      } else {
        console.log('✅ Profile already exists');
      }
    } catch (err) {
      console.error('Error in ensureProfileExists:', err);
    }
  };

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const queryParams = new URLSearchParams(window.location.search);
        
        // Check for error in URL
        const errorParam = queryParams.get('error') || hashParams.get('error');
        const errorDescription = queryParams.get('error_description') || hashParams.get('error_description');
        
        if (errorParam) {
          throw new Error(errorDescription || errorParam);
        }

        // Try to get code from query params (PKCE flow)
        const code = queryParams.get('code');
        
        if (code) {
          // PKCE flow - exchange code for session
          console.log('🔄 Exchanging code for session...');
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

          if (exchangeError) {
            throw exchangeError;
          }

          if (data.session) {
            console.log('✅ OAuth session established:', data.session);
            
            // Ensure profile exists for this user
            await ensureProfileExists(
              data.session.user.id,
              data.session.user.email!,
              data.session.user.user_metadata?.full_name || data.session.user.user_metadata?.name
            );
            
            navigate('/dashboard', { replace: true });
            return;
          }
        }

        // Check for hash fragments (implicit flow - email confirmation, magic links, etc.)
        const accessToken = hashParams.get('access_token');
        
        if (accessToken) {
          console.log('✅ Session found in URL hash (implicit flow)');
          // Session is automatically set by Supabase client
          // Just verify and redirect
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();
          
          if (sessionError) throw sessionError;
          
          if (session) {
            console.log('✅ Session verified:', session);
            
            // Ensure profile exists for this user
            await ensureProfileExists(
              session.user.id,
              session.user.email!,
              session.user.user_metadata?.full_name || session.user.user_metadata?.name
            );
            
            navigate('/dashboard', { replace: true });
            return;
          }
        }

        // If we get here, check if there's already a session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) throw sessionError;
        
        if (session) {
          console.log('✅ Existing session found:', session);
          
          // Ensure profile exists for this user
          await ensureProfileExists(
            session.user.id,
            session.user.email!,
            session.user.user_metadata?.full_name || session.user.user_metadata?.name
          );
          
          navigate('/dashboard', { replace: true });
          return;
        }

        // No code, no session - something went wrong
        throw new Error('No authorization code or session found. Please try signing in again.');

      } catch (err: any) {
        console.error('❌ OAuth callback error:', err);
        setError(err.message || 'Failed to complete authentication');
        
        // Redirect back to login after showing error briefly
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 3000);
      }
    };

    handleCallback();
  }, [navigate]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20">
        <div className="text-center space-y-4">
          <div className="text-red-500 text-xl font-semibold">Authentication Error</div>
          <div className="text-muted-foreground">{error}</div>
          <div className="text-sm text-muted-foreground">Redirecting to login...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20">
      <div className="text-center space-y-4">
        <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
        <div className="text-xl font-semibold">Completing sign in...</div>
        <div className="text-muted-foreground">Please wait while we verify your account</div>
      </div>
    </div>
  );
};

export default AuthCallback;
