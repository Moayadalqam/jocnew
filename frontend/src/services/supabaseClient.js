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
export const analysisService = {
  async save(analysisData) {
    if (!supabase) {
      // Store locally if Supabase not configured
      const stored = JSON.parse(localStorage.getItem('joc_analyses') || '[]');
      const newAnalysis = { ...analysisData, id: Date.now(), created_at: new Date().toISOString() };
      stored.push(newAnalysis);
      localStorage.setItem('joc_analyses', JSON.stringify(stored));
      return { data: newAnalysis, error: null };
    }

    const { data, error } = await supabase
      .from('analyses')
      .insert([analysisData])
      .select()
      .single();
    return { data, error };
  },

  async getRecent(limit = 10) {
    if (!supabase) {
      const stored = JSON.parse(localStorage.getItem('joc_analyses') || '[]');
      return { data: stored.slice(-limit).reverse(), error: null };
    }

    const { data, error } = await supabase
      .from('analyses')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    return { data: data || [], error };
  }
};

export default supabase;
