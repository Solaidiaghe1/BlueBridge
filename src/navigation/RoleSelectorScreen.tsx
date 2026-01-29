import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useSignIn, useSignUp, useUser, useAuth } from '@clerk/clerk-expo';
import { Feather } from '@expo/vector-icons';
import { useUserSync } from '../context/UserSyncContext';

const colors = {
  background: '#F9FAFB',
  primary: '#0EA5E9',
  primaryDark: '#0369A1',
  success: '#10B981',
  textPrimary: '#0F172A',
  textSecondary: '#6B7280',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  white: '#FFFFFF',
};

const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 14,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
};

const borderRadius = {
  md: 8,
  lg: 12,
  xxl: 16,
};

const typography = {
  fontSize: {
    sm: 12,
    md: 14,
    base: 14,
    lg: 16,
    xl: 20,
    xxl: 18,
    xxxl: 24,
    huge: 28,
  },
  fontWeight: {
    medium: '500',
    semiBold: '600',
    bold: '700',
  },
} as const;

const shadows = {
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
};

interface RoleSelectorScreenProps {
  onClientSelect: () => void;
  onServiceSelect: () => void;
}

export const RoleSelectorScreen: React.FC<RoleSelectorScreenProps> = ({
  onClientSelect,
  onServiceSelect,
}) => {
  const { user, isSignedIn, isLoaded } = useUser();
  const { signIn, setActive: setSignInActive, isLoaded: signInLoaded } = useSignIn();
  const { signUp, setActive: setSignUpActive, isLoaded: signUpLoaded } = useSignUp();
  const { signOut } = useAuth();
  const { syncUser } = useUserSync();
  
  const [selectedRole, setSelectedRole] = useState<'client' | 'service' | null>(null);
  const [authMode, setAuthMode] = useState<'signIn' | 'signUp' | 'verify'>('signIn');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const syncAttempted = useRef(false);

  // Reset syncAttempted when user signs out
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      console.log('[RoleSelectorScreen] User signed out, resetting syncAttempted');
      syncAttempted.current = false;
      setSelectedRole(null);
    }
  }, [isLoaded, isSignedIn]);

  // 🔥 Listen for user becoming authenticated and verified
  useEffect(() => {
    if (!isLoaded || !isSignedIn || !user || !selectedRole) return;
    if (syncAttempted.current) return;

    syncAttempted.current = true;
    console.log('✅ User authenticated and verified:', user.id);
    console.log('🔄 Syncing user to Supabase...');

    // Sync user to Supabase after Clerk authentication completes
    const performSync = async () => {
      try {
        const supabaseUser = await syncUser(selectedRole === 'client' ? 'client' : 'worker');
        
        if (supabaseUser) {
          console.log('✅ User synced to Supabase:', supabaseUser);
          
          // Navigate based on role
          if (selectedRole === 'client') {
            onClientSelect();
          } else {
            onServiceSelect();
          }
        } else {
          syncAttempted.current = false;
          Alert.alert('Error', 'Failed to sync user profile. Please try again.');
        }
      } catch (error) {
        syncAttempted.current = false;
        console.error('Sync error:', error);
        Alert.alert('Error', 'Failed to sync user profile. Please contact support.');
      }
    };

    performSync();
  }, [isLoaded, isSignedIn, user, selectedRole]);

  // If user is already signed in, don't show auth screen
  if (isSignedIn && selectedRole) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ marginTop: 20, color: colors.textSecondary, marginBottom: 20 }}>
          Setting up your profile...
        </Text>
        <TouchableOpacity onPress={() => {
            syncAttempted.current = false;
            signOut();
        }}>
          <Text style={{ color: colors.primary, fontWeight: '600' }}>Cancel & Sign Out</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const handleSignIn = async () => {
    if (!signInLoaded) return;

    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    setLoading(true);
    try {
      console.log('🔄 Signing in with Clerk...');
      
      const result = await signIn.create({
        identifier: email,
        password,
      });

      console.log('✅ Clerk sign in successful');
      await setSignInActive({ session: result.createdSessionId });
      
      console.log('✅ Session active - useEffect will trigger sync when user loads');
      
    } catch (err: any) {
      console.error('Sign in error:', err);
      Alert.alert('Sign In Failed', err.errors?.[0]?.message || 'Please try again');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    if (!signUpLoaded) return;

    if (!firstName || !lastName || !email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      console.log('🔄 Creating Clerk account...');
      
      const result = await signUp.create({
        emailAddress: email,
        password,
        firstName: firstName,
        lastName: lastName,
      });

      console.log('✅ Clerk account created with name:', firstName, lastName);

      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      
      setAuthMode('verify');
      
    } catch (err: any) {
      console.error('Signup error:', err);
      Alert.alert('Sign Up Failed', err.errors?.[0]?.message || 'Please try again');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmail = async () => {
    if (!signUpLoaded || !signInLoaded) return;
    
    if (!verificationCode || verificationCode.length !== 6) {
      Alert.alert('Error', 'Please enter the 6-digit verification code');
      return;
    }

    setLoading(true);
    try {
      console.log('🔄 Verifying email with code...');
      
      let signInSessionId = null;

      try {
        const result = await signUp.attemptEmailAddressVerification({
            code: verificationCode,
        });

        console.log('🔹 Verification Result Status:', result.status, 'SessionID:', result.createdSessionId);

        if (result.status === 'complete') {
            signInSessionId = result.createdSessionId;
        }
      } catch (err: any) {
        const isAlreadyVerified = err.errors?.some((e: any) => e.code === 'verification_already_verified') ||
                                  err.errors?.[0]?.message?.includes('already been verified');
        
        if (isAlreadyVerified) {
             console.log('⚠️ Email already verified.');
             if (signUp.status === 'complete' && signUp.createdSessionId) {
                 console.log('👉 Using existing signup session.');
                 signInSessionId = signUp.createdSessionId;
             } else {
                 console.log('🔄 Attempting fallback sign-in...');
                 try {
                     const signInResult = await signIn.create({
                         identifier: email,
                         password,
                     });
                     if (signInResult.status === 'complete') {
                         signInSessionId = signInResult.createdSessionId;
                     }
                 } catch (signInErr) {
                     console.error('❌ Fallback sign-in failed', signInErr);
                     throw signInErr;
                 }
             }
        } else {
            throw err;
        }
      }

      if (signInSessionId) {
          console.log('✅ Email verified, setting active session...');
          await setSignUpActive({ session: signInSessionId });
          console.log('✅ Session active - useEffect will trigger sync when user loads');
      } else {
          console.log('⚠️ Verification successful but no session ID. Attempting final recovery via Sign In...');
          try {
             // If we rely on email/password from state
             const recoveryResult = await signIn.create({ identifier: email, password });
             if (recoveryResult.status === 'complete') {
                  console.log('✅ Final recovery successful.');
                  await setSignInActive({ session: recoveryResult.createdSessionId });
                  return; 
             }
          } catch (recError) {
              console.error('❌ Final recovery failed:', recError);
          }
          throw new Error('Verification failed to produce a valid session.');
      }
      
    } catch (err: any) {
      console.error('Verification error:', err);
      Alert.alert('Verification Failed', err.errors?.[0]?.message || err.message || 'Invalid code. Please try again');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!signUpLoaded) return;

    setLoading(true);
    try {
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      Alert.alert('Code Resent', 'Check your email for a new verification code');
    } catch (err: any) {
      Alert.alert('Error', 'Failed to resend code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (authMode === 'signIn') {
      handleSignIn();
    } else {
      handleSignUp();
    }
  };

  if (!selectedRole) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <View style={styles.logoDot} />
              <Text style={styles.logoText}>BlueBridge</Text>
            </View>
            <Text style={styles.title}>Welcome to BlueBridge</Text>
            <Text style={styles.subtitle}>Choose how you'd like to use the app</Text>
          </View>

          <View style={styles.roleCards}>
            <TouchableOpacity
              style={[styles.roleCard, shadows.xl]}
              onPress={() => setSelectedRole('client')}
              activeOpacity={0.7}
            >
              <View style={[styles.roleIcon, { backgroundColor: colors.primary + '20' }]}>
                <Feather name="search" size={32} color={colors.primary} />
              </View>
              <Text style={styles.roleTitle}>I need a service</Text>
              <Text style={styles.roleDescription}>
                Find and hire skilled blue-collar workers
              </Text>
              <View style={styles.roleButton}>
                <Text style={styles.roleButtonText}>Continue as Client</Text>
                <Feather name="arrow-right" size={20} color={colors.primary} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.roleCard, shadows.xl]}
              onPress={() => setSelectedRole('service')}
              activeOpacity={0.7}
            >
              <View style={[styles.roleIcon, { backgroundColor: colors.success + '20' }]}>
                <Feather name="tool" size={32} color={colors.success} />
              </View>
              <Text style={styles.roleTitle}>I provide services</Text>
              <Text style={styles.roleDescription}>
                Find clients and grow your business
              </Text>
              <View style={styles.roleButton}>
                <Text style={styles.roleButtonText}>Continue as Worker</Text>
                <Feather name="arrow-right" size={20} color={colors.success} />
              </View>
            </TouchableOpacity>
          </View>

          <Text style={styles.tagline}>
            Connecting communities with trusted professionals
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (authMode === 'verify') {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.authHeader}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => {
                setAuthMode('signUp');
                setVerificationCode('');
              }}
            >
              <Feather name="arrow-left" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
            <View style={styles.logoContainer}>
              <View style={styles.logoDot} />
              <Text style={styles.logoText}>BlueBridge</Text>
            </View>
            <View style={{ width: 40 }} />
          </View>

          <View style={styles.verificationIconContainer}>
            <View style={styles.verificationIconCircle}>
              <Feather name="mail" size={48} color={colors.primary} />
            </View>
          </View>

          <Text style={styles.authTitle}>Verify Your Email</Text>
          <Text style={styles.authSubtitle}>
            We sent a 6-digit code to{'\n'}
            <Text style={styles.emailHighlight}>{email}</Text>
          </Text>

          <View style={styles.authForm}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Verification Code</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter 6-digit code"
                value={verificationCode}
                onChangeText={setVerificationCode}
                keyboardType="number-pad"
                maxLength={6}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
                autoFocus
              />
            </View>

            <TouchableOpacity
              style={[styles.submitButton, loading && styles.submitButtonDisabled]}
              onPress={handleVerifyEmail}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.submitButtonText}>Verify Email</Text>
              )}
            </TouchableOpacity>

            <View style={styles.resendContainer}>
              <Text style={styles.resendText}>Didn't receive the code?</Text>
              <TouchableOpacity
                onPress={handleResendCode}
                disabled={loading}
              >
                <Text style={[styles.resendLink, loading && styles.resendLinkDisabled]}>
                  Resend Code
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.authHeader}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setSelectedRole(null)}
          >
            <Feather name="arrow-left" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <View style={styles.logoContainer}>
            <View style={styles.logoDot} />
            <Text style={styles.logoText}>BlueBridge</Text>
          </View>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.roleBadge}>
          <Feather
            name={selectedRole === 'client' ? 'search' : 'tool'}
            size={16}
            color={selectedRole === 'client' ? colors.primary : colors.success}
          />
          <Text style={styles.roleBadgeText}>
            {selectedRole === 'client' ? 'Client Mode' : 'Worker Mode'}
          </Text>
        </View>

        <Text style={styles.authTitle}>
          {authMode === 'signIn' ? 'Sign In' : 'Create Account'}
        </Text>
        <Text style={styles.authSubtitle}>
          {authMode === 'signIn'
            ? 'Welcome back! Sign in to continue'
            : 'Join BlueBridge and get started'}
        </Text>

        <View style={styles.authForm}>
          {authMode === 'signUp' && (
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>First Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your first name"
                value={firstName}
                onChangeText={setFirstName}
                autoCapitalize="words"
                autoCorrect={false}
                editable={!loading}
              />
            </View>
          )}

          {authMode === 'signUp' && (
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Last Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your last name"
                value={lastName}
                onChangeText={setLastName}
                autoCapitalize="words"
                autoCorrect={false}
                editable={!loading}
              />
            </View>
          )}

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />
          </View>

          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.submitButtonText}>
                {authMode === 'signIn' ? 'Sign In' : 'Sign Up'}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.authToggle}>
          <Text style={styles.authToggleText}>
            {authMode === 'signIn' ? "Don't have an account?" : 'Already have an account?'}
          </Text>
          <TouchableOpacity
            onPress={() => setAuthMode(authMode === 'signIn' ? 'signUp' : 'signIn')}
          >
            <Text style={styles.authToggleLink}>
              {authMode === 'signIn' ? 'Sign Up' : 'Sign In'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xxxl,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  logoDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
  },
  logoText: {
    fontSize: typography.fontSize.huge,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
  },
  title: {
    fontSize: typography.fontSize.xxxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.fontSize.lg,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  roleCards: {
    width: '100%',
    maxWidth: 400,
    gap: spacing.lg,
    marginBottom: spacing.xl,
  },
  roleCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xxl,
    padding: spacing.xl,
    borderWidth: 2,
    borderColor: colors.gray200,
    alignItems: 'center',
  },
  roleIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  roleTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  roleDescription: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  roleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  roleButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.primary,
  },
  tagline: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: spacing.xl,
  },
  authHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: colors.gray100,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 20,
    gap: spacing.xs,
    marginBottom: spacing.lg,
  },
  roleBadgeText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.textPrimary,
  },
  authTitle: {
    fontSize: typography.fontSize.xxxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  authSubtitle: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.xl,
  },
  authContainer: {
    flex: 1,
    width: '100%',
    paddingHorizontal: spacing.lg,
  },
  authForm: {
    width: '100%',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  inputContainer: {
    marginBottom: spacing.lg,
  },
  inputLabel: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray200,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: typography.fontSize.md,
    color: colors.textPrimary,
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
  authToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
    gap: spacing.xs,
  },
  authToggleText: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
  },
  authToggleLink: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.primary,
  },
  verificationIconContainer: {
    alignItems: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
  },
  verificationIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary + '10',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emailHighlight: {
    fontWeight: typography.fontWeight.semiBold,
    color: colors.primary,
  },
  resendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xl,
    gap: spacing.xs,
  },
  resendText: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
  },
  resendLink: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.primary,
  },
  resendLinkDisabled: {
    opacity: 0.5,
  },
  signInInsteadButton: {
    marginTop: spacing.xl,
    padding: spacing.md,
    alignItems: 'center',
  },
  signInInsteadText: {
    fontSize: typography.fontSize.base,
    color: colors.primary,
    fontWeight: typography.fontWeight.medium,
    textDecorationLine: 'underline',
  },
});
