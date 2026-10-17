import { createClient } from '@supabase/supabase-js';
import { auth } from '../firebase/firebaseClient';
import { env } from '../config/env';
import type { Database } from '../types/database'; // generar tipos

// La identidad vive en Firebase: cada petición a Supabase lleva el token del
// usuario actual. Las políticas RLS leen de ahí el `sub` (firebase_uid).
// Sin sesión se devuelve null y Supabase usa la clave anónima.
export const supabase = createClient(env.supabaseUrl, env.supabaseAnonKey, {
  accessToken: async () => (await auth.currentUser?.getIdToken()) ?? null,
});
