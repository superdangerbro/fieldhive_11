export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      sections: {
        Row: {
          id: string
          name: string
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      map_feature_types: {
        Row: {
          id: string
          section_id: string
          name: string
          description: string | null
          geometry_type: 'Point' | 'LineString' | 'Polygon'
          style: Json
          feature_form: Json
          has_inspection_form: boolean
          inspection_form: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          section_id: string
          name: string
          description?: string | null
          geometry_type: 'Point' | 'LineString' | 'Polygon'
          style: Json
          feature_form: Json
          has_inspection_form?: boolean
          inspection_form?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          section_id?: string
          name?: string
          description?: string | null
          geometry_type?: 'Point' | 'LineString' | 'Polygon'
          style?: Json
          feature_form?: Json
          has_inspection_form?: boolean
          inspection_form?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      icons: {
        Row: {
          id: string
          name: string
          category: string | null
          file_path: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          category?: string | null
          file_path: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          category?: string | null
          file_path?: string
          created_at?: string
        }
      }
      photos: {
        Row: {
          id: string
          file_path: string
          entity_type: 'feature' | 'inspection'
          entity_id: string
          location: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          file_path: string
          entity_type: 'feature' | 'inspection'
          entity_id: string
          location?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          file_path?: string
          entity_type?: 'feature' | 'inspection'
          entity_id?: string
          location?: Json | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
} 