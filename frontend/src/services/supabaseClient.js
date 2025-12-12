import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create client only if credentials are provided
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Check if Supabase is configured
export const isSupabaseConfigured = () => {
  return supabase !== null;
};

// Athletes table operations
export const athleteService = {
  async getAll() {
    if (!supabase) return { data: [], error: null };
    const { data, error } = await supabase
      .from('athletes')
      .select('*')
      .order('created_at', { ascending: false });
    return { data: data || [], error };
  },

  async create(athlete) {
    if (!supabase) return { data: null, error: 'Supabase not configured' };
    const { data, error } = await supabase
      .from('athletes')
      .insert([athlete])
      .select()
      .single();
    return { data, error };
  },

  async update(id, updates) {
    if (!supabase) return { data: null, error: 'Supabase not configured' };
    const { data, error } = await supabase
      .from('athletes')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  },

  async delete(id) {
    if (!supabase) return { error: 'Supabase not configured' };
    const { error } = await supabase
      .from('athletes')
      .delete()
      .eq('id', id);
    return { error };
  }
};

// Sessions table operations
export const sessionService = {
  async getAll() {
    if (!supabase) return { data: [], error: null };
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .order('created_at', { ascending: false });
    return { data: data || [], error };
  },

  async getByAthleteId(athleteId) {
    if (!supabase) return { data: [], error: null };
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('athlete_id', athleteId)
      .order('created_at', { ascending: false });
    return { data: data || [], error };
  },

  async create(session) {
    if (!supabase) return { data: null, error: 'Supabase not configured' };
    const { data, error } = await supabase
      .from('sessions')
      .insert([session])
      .select()
      .single();
    return { data, error };
  },

  async update(id, updates) {
    if (!supabase) return { data: null, error: 'Supabase not configured' };
    const { data, error } = await supabase
      .from('sessions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  },

  async delete(id) {
    if (!supabase) return { error: 'Supabase not configured' };
    const { error } = await supabase
      .from('sessions')
      .delete()
      .eq('id', id);
    return { error };
  }
};

// Analysis results table operations
// Always use localStorage - Supabase analyses table may not exist
export const analysisService = {
  async save(analysisData) {
    // Always save to localStorage for reliability
    const stored = JSON.parse(localStorage.getItem('joc_analyses') || '[]');
    const newAnalysis = {
      ...analysisData,
      id: Date.now(),
      created_at: new Date().toISOString()
    };
    stored.push(newAnalysis);
    // Keep only last 100 analyses to prevent localStorage bloat
    if (stored.length > 100) {
      stored.splice(0, stored.length - 100);
    }
    localStorage.setItem('joc_analyses', JSON.stringify(stored));

    // Try to sync to Supabase if configured (non-blocking, fire-and-forget)
    if (supabase) {
      supabase.from('analyses').insert([{
        kick_type: analysisData.kickType,
        overall_score: analysisData.overallScore,
        form_score: analysisData.formScore,
        power_score: analysisData.powerScore,
        balance_score: analysisData.balanceScore,
        analysis_date: new Date().toISOString(),
        metrics: analysisData.metrics
      }]).then(() => {}).catch(() => {});
      // Silently ignore - localStorage is the primary storage
    }

    return { data: newAnalysis, error: null };
  },

  async getRecent(limit = 10) {
    // Always read from localStorage for reliability
    const stored = JSON.parse(localStorage.getItem('joc_analyses') || '[]');
    return { data: stored.slice(-limit).reverse(), error: null };
  },

  // Clear all stored analyses
  clearAll() {
    localStorage.removeItem('joc_analyses');
    return { error: null };
  }
};

export default supabase;
