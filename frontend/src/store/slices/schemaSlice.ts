import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { supabase } from '../../lib/supabase';
import type { Database } from '../../types/supabase';

type Section = Database['public']['Tables']['sections']['Row'];
type MapFeatureType = Database['public']['Tables']['map_feature_types']['Row'];

interface SchemaState {
  sections: Section[];
  mapFeatureTypes: MapFeatureType[];
  loading: boolean;
  error: string | null;
}

const initialState: SchemaState = {
  sections: [],
  mapFeatureTypes: [],
  loading: false,
  error: null,
};

// Async thunks
export const fetchSections = createAsyncThunk(
  'schema/fetchSections',
  async () => {
    const { data, error } = await supabase
      .from('sections')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
  }
);

export const fetchMapFeatureTypes = createAsyncThunk(
  'schema/fetchMapFeatureTypes',
  async () => {
    const { data, error } = await supabase
      .from('map_feature_types')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
  }
);

export const createSection = createAsyncThunk(
  'schema/createSection',
  async (section: { name: string; description: string | null }) => {
    const { data, error } = await supabase
      .from('sections')
      .insert([{
        name: section.name,
        description: section.description,
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating section:', error);
      throw new Error(error.message);
    }

    if (!data) {
      throw new Error('No data returned from insert operation');
    }

    return data;
  }
);

export const createMapFeatureType = createAsyncThunk(
  'schema/createMapFeatureType',
  async (featureType: Database['public']['Tables']['map_feature_types']['Insert']) => {
    const { data, error } = await supabase
      .from('map_feature_types')
      .insert(featureType)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
);

export const updateSection = createAsyncThunk(
  'schema/updateSection',
  async ({ id, ...updates }: Database['public']['Tables']['sections']['Update'] & { id: string }) => {
    const { data, error } = await supabase
      .from('sections')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
);

export const updateMapFeatureType = createAsyncThunk(
  'schema/updateMapFeatureType',
  async ({ id, ...updates }: Database['public']['Tables']['map_feature_types']['Update'] & { id: string }) => {
    const { data, error } = await supabase
      .from('map_feature_types')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
);

export const deleteSection = createAsyncThunk(
  'schema/deleteSection',
  async (id: string) => {
    const { error } = await supabase
      .from('sections')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return id;
  }
);

export const deleteMapFeatureType = createAsyncThunk(
  'schema/deleteMapFeatureType',
  async (id: string) => {
    const { error } = await supabase
      .from('map_feature_types')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return id;
  }
);

const schemaSlice = createSlice({
  name: 'schema',
  initialState,
  reducers: {
    // Handle real-time updates
    sectionAdded(state, action) {
      state.sections.push(action.payload);
    },
    sectionUpdated(state, action) {
      const index = state.sections.findIndex(s => s.id === action.payload.id);
      if (index !== -1) {
        state.sections[index] = action.payload;
      }
    },
    sectionDeleted(state, action) {
      state.sections = state.sections.filter(s => s.id !== action.payload);
    },
    mapFeatureTypeAdded(state, action) {
      state.mapFeatureTypes.push(action.payload);
    },
    mapFeatureTypeUpdated(state, action) {
      const index = state.mapFeatureTypes.findIndex(ft => ft.id === action.payload.id);
      if (index !== -1) {
        state.mapFeatureTypes[index] = action.payload;
      }
    },
    mapFeatureTypeDeleted(state, action) {
      state.mapFeatureTypes = state.mapFeatureTypes.filter(ft => ft.id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch sections
      .addCase(fetchSections.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSections.fulfilled, (state, action) => {
        state.sections = action.payload;
        state.loading = false;
      })
      .addCase(fetchSections.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch sections';
      })
      // Fetch map feature types
      .addCase(fetchMapFeatureTypes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMapFeatureTypes.fulfilled, (state, action) => {
        state.mapFeatureTypes = action.payload;
        state.loading = false;
      })
      .addCase(fetchMapFeatureTypes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch map feature types';
      })
      // Create section
      .addCase(createSection.fulfilled, (state, action) => {
        state.sections.push(action.payload);
      })
      // Create map feature type
      .addCase(createMapFeatureType.fulfilled, (state, action) => {
        state.mapFeatureTypes.push(action.payload);
      })
      // Update section
      .addCase(updateSection.fulfilled, (state, action) => {
        const index = state.sections.findIndex(s => s.id === action.payload.id);
        if (index !== -1) {
          state.sections[index] = action.payload;
        }
      })
      // Update map feature type
      .addCase(updateMapFeatureType.fulfilled, (state, action) => {
        const index = state.mapFeatureTypes.findIndex(ft => ft.id === action.payload.id);
        if (index !== -1) {
          state.mapFeatureTypes[index] = action.payload;
        }
      })
      // Delete section
      .addCase(deleteSection.fulfilled, (state, action) => {
        state.sections = state.sections.filter(s => s.id !== action.payload);
      })
      // Delete map feature type
      .addCase(deleteMapFeatureType.fulfilled, (state, action) => {
        state.mapFeatureTypes = state.mapFeatureTypes.filter(ft => ft.id !== action.payload);
      });
  },
});

export const {
  sectionAdded,
  sectionUpdated,
  sectionDeleted,
  mapFeatureTypeAdded,
  mapFeatureTypeUpdated,
  mapFeatureTypeDeleted,
} = schemaSlice.actions;

export default schemaSlice.reducer; 