import { Feature, Geometry } from 'geojson';

export interface BaseField {
  id: string;
  label: string;
  required: boolean;
  description?: string;
  placeholder?: string;
  hidden?: boolean;
  validation?: {
    custom?: string;
    message?: string;
  };
  conditionalLogic?: {
    dependsOn: string;
    condition: 'equals' | 'notEquals' | 'contains' | 'greaterThan' | 'lessThan';
    value: string | number | boolean;
    action: 'show' | 'hide' | 'require' | 'optional';
  }[];
}

export interface TextField extends BaseField {
  type: 'text';
  config: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    patternError?: string;
  };
}

export interface SelectField extends BaseField {
  type: 'select';
  config: {
    options: { label: string; value: string }[];
    multiple?: boolean;
    allowSearch?: boolean;
  };
}

export interface NumberField extends BaseField {
  type: 'slider' | 'dial';
  config: {
    min: number;
    max: number;
    step: number;
    unit?: string;
    displayFormat?: string;
  };
}

export interface PhotoField extends BaseField {
  type: 'photo';
  config: {
    maxPhotos: number;
    allowGallery: boolean;
    requireLocation: boolean;
    compressionQuality: number;
  };
}

export interface BarcodeField extends BaseField {
  type: 'barcode';
  config: {
    barcodeTypes: ('qr' | 'code128' | 'ean' | 'upc' | 'pdf417')[];
    saveImage: boolean;
  };
}

export interface LocationField extends BaseField {
  type: 'location';
  config: {
    accuracy: 'high' | 'medium' | 'low';
    collectAltitude: boolean;
    collectHeading: boolean;
  };
}

export interface SwitchField extends BaseField {
  type: 'switch';
  config: Record<string, never>;
}

export type FormField = 
  | TextField 
  | SelectField 
  | NumberField 
  | PhotoField 
  | BarcodeField 
  | LocationField 
  | SwitchField;

export interface FeatureForm {
  fields: FormField[];
}

export interface InspectionForm {
  id: string;
  name: string;
  description: string;
  fields: FormField[];
}

export interface MapFeatureType {
  id: string;
  name: string;
  description: string;
  geometryType: 'Point' | 'LineString' | 'Polygon';
  style: {
    color: string;
    icon?: string;
  };
  featureForm: FeatureForm;
  hasInspectionForm: boolean;
  inspectionForm?: InspectionForm;
}

export interface Section {
  id: string;
  name: string;
  description: string;
  mapFeatureTypes: MapFeatureType[];
} 