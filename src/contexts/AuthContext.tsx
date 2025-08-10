import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, UserProfile } from '@/lib/supabase';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  signUp: (phone: string, username: string, password: string) => Promise<{ error: string | null }>;
  signIn: (username: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error: string | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user || null);
      
      if (session?.user) {
        await fetchUserProfile(session.user.id);
      }
      
      setLoading(false);
    };

    getInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user || null);
        
        if (session?.user) {
          await fetchUserProfile(session.user.id);
        } else {
          setUserProfile(null);
        }
        
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        return;
      }

      setUserProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const signUp = async (phone: string, username: string, password: string) => {
    try {
      setLoading(true);
      
      const { data: existingUser } = await supabase
        .from('user_profiles')
        .select('username')
        .eq('username', username)
        .single();

      if (existingUser) {
        return { error: 'Имя пользователя уже занято' };
      }

      const email = `${username}@messenger.app`;
      
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: undefined
        }
      });

      if (authError) {
        console.error('Auth error:', authError);
        return { error: authError.message };
      }

      if (authData.user) {
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert({
            id: authData.user.id,
            username,
            phone,
            theme: 'light'
          });

        if (profileError) {
          console.error('Profile error:', profileError);
          return { error: 'Ошибка создания профиля' };
        }

        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (signInError) {
          console.error('Auto sign-in error:', signInError);
        }
      }

      return { error: null };
    } catch (error) {
      return { error: 'Произошла ошибка при регистрации' };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (username: string, password: string) => {
    try {
      setLoading(true);
      
      // Проверяем существует ли пользователь с таким username
      const { data: existingUser, error: userError } = await supabase
        .from('user_profiles')
        .select('id, username')
        .eq('username', username)
        .single();

      if (userError || !existingUser) {
        return { error: 'Пользователь с таким именем не найден' };
      }

      const email = `${username}@messenger.app`;
      
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          return { error: 'Неверный пароль' };
        }
        return { error: 'Ошибка входа в систему' };
      }

      return { error: null };
    } catch (error) {
      return { error: 'Произошла ошибка при входе' };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    try {
      if (!user) return { error: 'Пользователь не авторизован' };

      if (updates.username && updates.username !== userProfile?.username) {
        const { data: existingUser } = await supabase
          .from('user_profiles')
          .select('username')
          .eq('username', updates.username)
          .neq('id', user.id)
          .single();

        if (existingUser) {
          return { error: 'Имя пользователя уже занято' };
        }
      }

      const { error } = await supabase
        .from('user_profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) {
        return { error: 'Ошибка обновления профиля' };
      }

      await fetchUserProfile(user.id);
      return { error: null };
    } catch (error) {
      return { error: 'Произошла ошибка при обновлении профиля' };
    }
  };

  const value = {
    user,
    userProfile,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};