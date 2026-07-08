import axios from 'axios';
import { supabase } from '@/utils/supabase';

const BASE_URL = process.env.EXPO_PUBLIC_NEXTJS_API_URL ?? 'http://localhost:3000';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

apiClient.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  return config;
});
