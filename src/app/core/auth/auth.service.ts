import { Injectable, signal, computed } from '@angular/core';
import { SupabaseClient, Session, User } from '@supabase/supabase-js';
import { supabase } from '../supabase/supabase.client';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly _session = signal<Session | null>(null);
  private readonly _user = signal<User | null>(null);
  private readonly _loading = signal(true);

  readonly session = computed(() => this._session());
  readonly user = computed(() => this._user());
  readonly isAuthenticated = computed(() => !!this._session());
  readonly loading = computed(() => this._loading());

  constructor() {
    this.initSession();
  }

  private async initSession() {
    const { data: { session } } = await supabase.auth.getSession();
    this._session.set(session);
    this._user.set(session?.user ?? null);
    this._loading.set(false);

    supabase.auth.onAuthStateChange((_event, session) => {
      this._session.set(session);
      this._user.set(session?.user ?? null);
    });
  }

  async login(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  }

  async register(email: string, password: string, displayName: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName },
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    });
    if (error) throw error;

    if (data.user) {
      await supabase.from('profiles').insert({
        id: data.user.id,
        email,
        display_name: displayName,
      });
    }

    return data;
  }

  async logout() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }
}
