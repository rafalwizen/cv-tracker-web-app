import { Injectable, inject } from '@angular/core';
import { supabase } from '../supabase/supabase.client';
import { Application, ApplicationCreate, ApplicationUpdate, ApplicationStatus } from '../models/application.model';
import { AuthService } from '../auth/auth.service';

@Injectable({ providedIn: 'root' })
export class ApplicationService {
  private readonly auth = inject(AuthService);

  async getAll(): Promise<Application[]> {
    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .eq('user_id', this.auth.user()!.id)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data ?? [];
  }

  async getById(id: string): Promise<Application | null> {
    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .eq('id', id)
      .eq('user_id', this.auth.user()!.id)
      .single();

    if (error) throw error;
    return data;
  }

  async create(app: ApplicationCreate): Promise<Application> {
    const { data, error } = await supabase
      .from('applications')
      .insert({ ...app, user_id: this.auth.user()!.id })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async update(app: ApplicationUpdate): Promise<Application> {
    const { id, ...updates } = app;
    const { data, error } = await supabase
      .from('applications')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', this.auth.user()!.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('applications')
      .delete()
      .eq('id', id)
      .eq('user_id', this.auth.user()!.id);

    if (error) throw error;
  }

  async updateStatus(id: string, status: ApplicationStatus): Promise<Application> {
    return this.update({ id, status });
  }

  async uploadScreenshot(file: File, applicationId: string): Promise<string> {
    const userId = this.auth.user()!.id;
    const ext = file.name.split('.').pop();
    const path = `${userId}/${applicationId}.${ext}`;

    const { error } = await supabase.storage
      .from('job-screenshots')
      .upload(path, file, { upsert: true });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('job-screenshots')
      .getPublicUrl(path);

    return publicUrl;
  }

  async deleteScreenshot(path: string): Promise<void> {
    const { error } = await supabase.storage
      .from('job-screenshots')
      .remove([path]);

    if (error) throw error;
  }

  getScreenshotUrl(path: string): string {
    if (path.startsWith('http')) return path;
    const { data: { publicUrl } } = supabase.storage
      .from('job-screenshots')
      .getPublicUrl(path);
    return publicUrl;
  }
}
