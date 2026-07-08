import { supabase } from '@/utils/supabase';
import type {
  LoginRequest,
  RegisterRequest,
  User,
} from '@/features/auth/types/auth-types';

type ProfileRow = {
  id: string;
  name: string;
  role: 'PARENT' | 'MEDIC' | 'POSYANDU' | 'ADMIN';
  wallet_address: string | null;
  is_active: boolean | null;
  doctor_id: string | null;
};

const toUser = (row: ProfileRow, email?: string): User => ({
  id: row.id,
  email: email ?? '',
  name: row.name,
  role: row.role,
  walletAddress: row.wallet_address,
  isActive: row.is_active ?? undefined,
  doctorId: row.doctor_id ?? undefined,
});

export const authService = {
  login: async (data: LoginRequest) => {
    const { data: authData, error } = await supabase.auth.signInWithPassword(data);
    if (error) throw new Error(error.message);
    if (!authData.session) throw new Error('Session tidak ditemukan.');
    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.session.user.id)
      .single();
    if (!profile) throw new Error('Profil pengguna tidak ditemukan.');
    return { session: authData.session, user: toUser(profile as unknown as ProfileRow, authData.session.user.email) };
  },

  register: async (data: RegisterRequest) => {
    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: { data: { name: data.name } },
    });
    if (error) throw new Error(error.message);
    if (!authData.user) throw new Error('Registrasi gagal.');
    if (authData.session) {
      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', authData.user.id)
        .single();
      return { session: authData.session, user: profile ? toUser(profile as unknown as ProfileRow, authData.session.user.email) : undefined };
    }
    return { session: null, user: undefined };
  },

  getMe: async (): Promise<User> => {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) throw new Error('User tidak ditemukan.');
    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();
    if (!profile) throw new Error('Profil tidak ditemukan.');
    return toUser(profile as unknown as ProfileRow, user.email);
  },
};
