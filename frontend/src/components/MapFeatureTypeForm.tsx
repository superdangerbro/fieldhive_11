import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  FormControlLabel,
  Checkbox,
  Grid,
  Tabs,
  Tab,
  Switch,
  Collapse,
  Chip,
  Slider,
  Alert,
  Avatar,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Rule as RuleIcon,
  PhotoCamera as PhotoIcon,
  QrCode as BarcodeIcon,
  LocationOn as LocationIcon,
  ToggleOn as SwitchIcon,
  LinearScale as SliderIcon,
  ControlCamera as DialIcon,
  Image as ImageIcon,
  Upload as UploadIcon,
} from '@mui/icons-material';
import {
  MapFeatureType,
  FormField,
  SelectField,
  NumberField,
} from '../types/schema';

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (mapFeatureType: MapFeatureType) => void;
}

interface FieldDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (field: FormField) => void;
  existingFields: FormField[];
  title: string;
  initialField?: FormField;
}

type FieldState = FormField;

const isSelectField = (field: FieldState): field is SelectField => 
  field.type === 'select';

const isNumberField = (field: FieldState): field is NumberField =>
  field.type === 'slider' || field.type === 'dial';

function FieldDialog({ open, onClose, onSave, existingFields, title, initialField }: FieldDialogProps) {
  const [field, setField] = useState<FieldState>(() => {
    if (initialField) {
      return initialField;
    }
    return {
      id: crypto.randomUUID(),
      type: 'text',
      label: '',
      required: false,
      description: '',
      placeholder: '',
      config: {
        minLength: 0,
        maxLength: 1000,
      },
      conditionalLogic: [],
    };
  });
  
  useEffect(() => {
    if (open && initialField) {
      setField(initialField);
    } else if (!open) {
      setField({
        id: crypto.randomUUID(),
        type: 'text',
        label: '',
        required: false,
        description: '',
        placeholder: '',
        config: {
          minLength: 0,
          maxLength: 1000,
        },
        conditionalLogic: [],
      });
    }
  }, [open, initialField]);

  const [showConditions, setShowConditions] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [newOption, setNewOption] = useState('');
  const [newCondition, setNewCondition] = useState({
    dependsOn: '',
    condition: 'equals' as const,
    value: '',
    action: 'show' as const,
  });

  const handleTypeChange = (newType: FormField['type']) => {
    const getInitialConfig = (type: FormField['type']) => {
      switch (type) {
        case 'text':
          return {
            minLength: 0,
            maxLength: 1000,
          };
        case 'select':
          return {
            options: [],
            multiple: false,
            allowSearch: true,
          };
        case 'slider':
        case 'dial':
          return {
            min: 0,
            max: 100,
            step: 1,
            unit: '',
            displayFormat: '0.0',
          };
        case 'photo':
          return {
            maxPhotos: 1,
            allowGallery: true,
            requireLocation: false,
            compressionQuality: 0.8,
          };
        case 'barcode':
          return {
            barcodeTypes: ['qr', 'code128'] as const,
            saveImage: true,
          };
        case 'location':
          return {
            accuracy: 'high' as const,
            collectAltitude: true,
            collectHeading: false,
          };
        case 'switch':
          return {};
      }
    };

    setField({
      ...field,
      id: field.id,
      type: newType,
      config: getInitialConfig(newType),
    } as FieldState);
  };

  const handleAddOption = () => {
    if (newOption.trim() && isSelectField(field)) {
      setField({
        ...field,
        config: {
          ...field.config,
          options: [...field.config.options, { label: newOption.trim(), value: newOption.trim() }],
        },
      });
      setNewOption('');
    }
  };

  const handleRemoveOption = (optionToRemove: string) => {
    if (isSelectField(field)) {
      setField({
        ...field,
        config: {
          ...field.config,
          options: field.config.options.filter(option => option.value !== optionToRemove),
        },
      });
    }
  };

  const handleAddCondition = () => {
    if (newCondition.dependsOn) {
      setField({
        ...field,
        conditionalLogic: [
          ...(field.conditionalLogic || []),
          { ...newCondition }
        ],
      });
      setNewCondition({
        dependsOn: '',
        condition: 'equals',
        value: '',
        action: 'show',
      });
    }
  };

  const handleRemoveCondition = (index: number) => {
    setField({
      ...field,
      conditionalLogic: field.conditionalLogic?.filter((_, i) => i !== index),
    });
  };

  const handleSave = () => {
    if (field.label) {
      const fieldToSave: FormField = {
        ...field,
        id: field.id || crypto.randomUUID(),
        required: field.required || false,
        description: field.description || '',
        placeholder: field.placeholder || '',
        conditionalLogic: field.conditionalLogic || [],
      };
      onSave(fieldToSave);
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          label="Field Label"
          value={field.label}
          onChange={(e) => setField({ ...field, label: e.target.value })}
          margin="normal"
          required
        />
        <FormControl fullWidth margin="normal">
          <InputLabel>Field Type</InputLabel>
          <Select
            value={field.type}
            onChange={(e) => handleTypeChange(e.target.value as FormField['type'])}
          >
            <MenuItem value="text">
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <EditIcon sx={{ mr: 1 }} /> Text
              </Box>
            </MenuItem>
            <MenuItem value="select">
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <RuleIcon sx={{ mr: 1 }} /> Select
              </Box>
            </MenuItem>
            <MenuItem value="switch">
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <SwitchIcon sx={{ mr: 1 }} /> Switch
              </Box>
            </MenuItem>
            <MenuItem value="slider">
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <SliderIcon sx={{ mr: 1 }} /> Slider
              </Box>
            </MenuItem>
            <MenuItem value="dial">
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <DialIcon sx={{ mr: 1 }} /> Dial
              </Box>
            </MenuItem>
            <MenuItem value="photo">
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <PhotoIcon sx={{ mr: 1 }} /> Photo
              </Box>
            </MenuItem>
            <MenuItem value="barcode">
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <BarcodeIcon sx={{ mr: 1 }} /> Barcode Scanner
              </Box>
            </MenuItem>
            <MenuItem value="location">
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <LocationIcon sx={{ mr: 1 }} /> Location
              </Box>
            </MenuItem>
          </Select>
        </FormControl>

        <FormControlLabel
          control={
            <Switch
              checked={field.required}
              onChange={(e) => setField({ ...field, required: e.target.checked })}
            />
          }
          label="Required"
        />

        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Field Configuration
          </Typography>
          <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
            {isSelectField(field) && (
              <Box>
                <FormControlLabel
                  control={
                    <Switch
                      checked={field.config.multiple || false}
                      onChange={(e) => setField({
                        ...field,
                        config: { ...field.config, multiple: e.target.checked },
                      })}
                    />
                  }
                  label="Allow Multiple Selection"
                />
                <Box sx={{ mt: 2 }}>
                  <TextField
                    fullWidth
                    label="Add Option"
                    value={newOption}
                    onChange={(e) => setNewOption(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddOption()}
                    InputProps={{
                      endAdornment: (
                        <Button onClick={handleAddOption}>Add</Button>
                      ),
                    }}
                  />
                  <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {field.config.options.map((option) => (
                      <Chip
                        key={option.value}
                        label={`${option.label} (${option.value})`}
                        onDelete={() => handleRemoveOption(option.value)}
                      />
                    ))}
                  </Box>
                </Box>
              </Box>
            )}
            {isNumberField(field) && (
              <Box>
                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Min"
                      value={field.config.min}
                      onChange={(e) => setField({
                        ...field,
                        config: { ...field.config, min: Number(e.target.value) },
                      })}
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Max"
                      value={field.config.max}
                      onChange={(e) => setField({
                        ...field,
                        config: { ...field.config, max: Number(e.target.value) },
                      })}
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Step"
                      value={field.config.step}
                      onChange={(e) => setField({
                        ...field,
                        config: { ...field.config, step: Number(e.target.value) },
                      })}
                    />
                  </Grid>
                </Grid>
                <TextField
                  fullWidth
                  label="Unit"
                  value={field.config.unit || ''}
                  onChange={(e) => setField({
                    ...field,
                    config: { ...field.config, unit: e.target.value },
                  })}
                  margin="normal"
                />
                {field.type === 'slider' && (
                  <Box sx={{ mt: 2, px: 2 }}>
                    <Typography gutterBottom>Preview</Typography>
                    <Slider
                      min={field.config.min}
                      max={field.config.max}
                      step={field.config.step}
                      valueLabelDisplay="auto"
                      marks
                    />
                  </Box>
                )}
              </Box>
            )}
          </Box>
        </Box>
        
        {existingFields.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={showConditions}
                  onChange={(e) => setShowConditions(e.target.checked)}
                />
              }
              label="Add Conditional Logic"
            />
            
            <Collapse in={showConditions}>
              <Box sx={{ mt: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Add Condition
                </Typography>
                <FormControl fullWidth margin="dense">
                  <InputLabel>Depends On</InputLabel>
                  <Select
                    value={newCondition.dependsOn}
                    onChange={(e) => setNewCondition({ ...newCondition, dependsOn: e.target.value })}
                  >
                    {existingFields.map((f) => (
                      <MenuItem key={f.id} value={f.id}>
                        {f.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl fullWidth margin="dense">
                  <InputLabel>Condition</InputLabel>
                  <Select
                    value={newCondition.condition}
                    onChange={(e) => setNewCondition({
                      ...newCondition,
                      condition: e.target.value as typeof newCondition.condition,
                    })}
                  >
                    <MenuItem value="equals">Equals</MenuItem>
                    <MenuItem value="notEquals">Not Equals</MenuItem>
                    <MenuItem value="contains">Contains</MenuItem>
                    <MenuItem value="greaterThan">Greater Than</MenuItem>
                    <MenuItem value="lessThan">Less Than</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  fullWidth
                  margin="dense"
                  label="Value"
                  value={newCondition.value}
                  onChange={(e) => setNewCondition({ ...newCondition, value: e.target.value })}
                />
                <FormControl fullWidth margin="dense">
                  <InputLabel>Action</InputLabel>
                  <Select
                    value={newCondition.action}
                    onChange={(e) => setNewCondition({
                      ...newCondition,
                      action: e.target.value as typeof newCondition.action,
                    })}
                  >
                    <MenuItem value="show">Show</MenuItem>
                    <MenuItem value="hide">Hide</MenuItem>
                    <MenuItem value="require">Make Required</MenuItem>
                    <MenuItem value="optional">Make Optional</MenuItem>
                  </Select>
                </FormControl>
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={handleAddCondition}
                  sx={{ mt: 1 }}
                  disabled={!newCondition.dependsOn || !newCondition.value}
                >
                  Add Condition
                </Button>

                {field.conditionalLogic && field.conditionalLogic.length > 0 && (
                  <List>
                    {field.conditionalLogic.map((logic, index) => (
                      <ListItem key={index}>
                        <ListItemText
                          primary={`When ${existingFields.find(f => f.id === logic.dependsOn)?.label} ${logic.condition} ${logic.value}`}
                          secondary={`Action: ${logic.action}`}
                        />
                        <ListItemSecondaryAction>
                          <IconButton
                            edge="end"
                            onClick={() => handleRemoveCondition(index)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                )}
              </Box>
            </Collapse>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={!field.label}
        >
          Add
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function IconSelector({ 
  selectedIcon, 
  onSelect,
  onUpload 
}: { 
  selectedIcon?: { id: string; url: string; name: string; }; 
  onSelect: (icon: { id: string; url: string; name: string; }) => void;
  onUpload: (file: File) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [icons, setIcons] = useState<Array<{ id: string; url: string; name: string; }>>([
    // TODO: Load from Supabase
  ]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      await onUpload(file);
    }
  };

  return (
    <>
      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Map Marker Icon
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar
            sx={{ 
              width: 48, 
              height: 48, 
              bgcolor: 'background.default',
              border: '1px solid',
              borderColor: 'divider',
              cursor: 'pointer'
            }}
            onClick={() => setOpen(true)}
          >
            {selectedIcon ? (
              <img src={selectedIcon.url} alt={selectedIcon.name} style={{ width: '100%', height: '100%' }} />
            ) : (
              <ImageIcon />
            )}
          </Avatar>
          <Box>
            <Button
              variant="outlined"
              startIcon={<ImageIcon />}
              onClick={() => setOpen(true)}
              sx={{ mr: 1 }}
            >
              Choose Icon
            </Button>
            <Button
              variant="outlined"
              startIcon={<UploadIcon />}
              onClick={() => fileInputRef.current?.click()}
            >
              Upload New
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              style={{ display: 'none' }}
            />
          </Box>
        </Box>
      </Box>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Select Icon</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {icons.map((icon) => (
              <Grid item key={icon.id} xs={4} sm={3} md={2}>
                <Box
                  sx={{
                    p: 1,
                    border: '1px solid',
                    borderColor: selectedIcon?.id === icon.id ? 'primary.main' : 'divider',
                    borderRadius: 1,
                    cursor: 'pointer',
                    '&:hover': {
                      borderColor: 'primary.main',
                    },
                  }}
                  onClick={() => {
                    onSelect(icon);
                    setOpen(false);
                  }}
                >
                  <Box
                    sx={{
                      width: '100%',
                      paddingTop: '100%',
                      position: 'relative',
                    }}
                  >
                    <img
                      src={icon.url}
                      alt={icon.name}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                      }}
                    />
                  </Box>
                  <Typography variant="caption" align="center" display="block" sx={{ mt: 0.5 }}>
                    {icon.name}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default function MapFeatureTypeForm({ open, onClose, onSave }: Props) {
  const [activeTab, setActiveTab] = useState(0);
  const [featureType, setFeatureType] = useState<Partial<MapFeatureType>>({
    name: '',
    description: '',
    geometryType: 'Point',
    style: {
      color: '#2196f3',
    },
    featureForm: {
      fields: [],
    },
    hasInspectionForm: false,
  });

  const [showFeatureFieldDialog, setShowFeatureFieldDialog] = useState(false);
  const [showInspectionFieldDialog, setShowInspectionFieldDialog] = useState(false);

  const [editingField, setEditingField] = useState<{ field: FormField; isInspection: boolean } | null>(null);

  const [errors, setErrors] = useState<{
    name?: string;
    geometryType?: string;
    inspectionForm?: string;
  }>({});

  const [selectedIcon, setSelectedIcon] = useState<{ id: string; url: string; name: string; } | undefined>();

  const handleEditField = (field: FormField, isInspection: boolean) => {
    setEditingField({ field, isInspection });
    if (isInspection) {
      setShowInspectionFieldDialog(true);
    } else {
      setShowFeatureFieldDialog(true);
    }
  };

  const handleDeleteField = (fieldId: string, isInspection: boolean) => {
    if (isInspection && featureType.inspectionForm) {
      setFeatureType({
        ...featureType,
        inspectionForm: {
          ...featureType.inspectionForm,
          fields: featureType.inspectionForm.fields.filter(f => f.id !== fieldId),
        },
      });
    } else {
      setFeatureType({
        ...featureType,
        featureForm: {
          fields: featureType.featureForm?.fields.filter(f => f.id !== fieldId) || [],
        },
      });
    }
  };

  const handleAddFeatureField = (field: FormField) => {
    if (editingField && !editingField.isInspection) {
      // Update existing field
      setFeatureType({
        ...featureType,
        featureForm: {
          fields: featureType.featureForm?.fields.map(f => 
            f.id === editingField.field.id ? { ...field, id: f.id } : f
          ) || [],
        },
      });
      setEditingField(null);
    } else {
      // Add new field
      setFeatureType({
        ...featureType,
        featureForm: {
          fields: [...(featureType.featureForm?.fields || []), field],
        },
      });
    }
    setShowFeatureFieldDialog(false);
  };

  const handleAddInspectionField = (field: FormField) => {
    if (!featureType.inspectionForm) return;

    if (editingField && editingField.isInspection) {
      // Update existing field
      setFeatureType({
        ...featureType,
        inspectionForm: {
          ...featureType.inspectionForm,
          fields: featureType.inspectionForm.fields.map(f =>
            f.id === editingField.field.id ? { ...field, id: f.id } : f
          ),
        },
      });
      setEditingField(null);
    } else {
      // Add new field
      setFeatureType({
        ...featureType,
        inspectionForm: {
          ...featureType.inspectionForm,
          fields: [...(featureType.inspectionForm.fields || []), field],
        },
      });
    }
    setShowInspectionFieldDialog(false);
  };

  const handleToggleInspectionForm = (event: React.ChangeEvent<HTMLInputElement>) => {
    const hasInspectionForm = event.target.checked;
    setFeatureType({
      ...featureType,
      hasInspectionForm,
      inspectionForm: hasInspectionForm
        ? {
            id: crypto.randomUUID(),
            name: '',
            description: '',
            fields: [],
          }
        : undefined,
    });
  };

  const handleIconUpload = async (file: File) => {
    // TODO: Upload to Supabase Storage and create icon record
    console.log('Uploading icon:', file);
  };

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!featureType.name?.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!featureType.geometryType) {
      newErrors.geometryType = 'Geometry type is required';
    }

    if (featureType.hasInspectionForm && !featureType.inspectionForm?.name?.trim()) {
      newErrors.inspectionForm = 'Inspection form name is required when enabled';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateForm()) {
      onSave({
        ...featureType as MapFeatureType,
        id: crypto.randomUUID(),
      });
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Add New Map Feature Type</DialogTitle>
      <DialogContent>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            {Object.values(errors).filter(Boolean).length > 0 && (
              <Alert severity="error" sx={{ mb: 2 }}>
                Please fix the following errors:
                <ul style={{ margin: 0, paddingLeft: 20 }}>
                  {Object.values(errors).filter(Boolean).map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </Alert>
            )}
            <TextField
              fullWidth
              label="Name"
              value={featureType.name}
              onChange={(e) => {
                setFeatureType({ ...featureType, name: e.target.value });
                setErrors({ ...errors, name: undefined });
              }}
              margin="normal"
              required
              error={!!errors.name}
              helperText={errors.name}
            />
            <TextField
              fullWidth
              label="Description"
              value={featureType.description}
              onChange={(e) => setFeatureType({ ...featureType, description: e.target.value })}
              margin="normal"
              multiline
              rows={2}
            />
            <FormControl fullWidth margin="normal" error={!!errors.geometryType}>
              <InputLabel required>Geometry Type</InputLabel>
              <Select
                value={featureType.geometryType}
                onChange={(e) => {
                  setFeatureType({ ...featureType, geometryType: e.target.value as MapFeatureType['geometryType'] });
                  setErrors({ ...errors, geometryType: undefined });
                }}
              >
                <MenuItem value="Point">Point</MenuItem>
                <MenuItem value="LineString">Line</MenuItem>
                <MenuItem value="Polygon">Polygon</MenuItem>
              </Select>
              {errors.geometryType && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 2 }}>
                  {errors.geometryType}
                </Typography>
              )}
            </FormControl>
            <TextField
              fullWidth
              label="Color"
              type="color"
              value={featureType.style?.color}
              onChange={(e) => setFeatureType({
                ...featureType,
                style: { ...featureType.style, color: e.target.value },
              })}
              margin="normal"
            />
            
            {featureType.geometryType === 'Point' && (
              <IconSelector
                selectedIcon={selectedIcon}
                onSelect={setSelectedIcon}
                onUpload={handleIconUpload}
              />
            )}
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
              <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
                <Tab label="Feature Form" />
                <Tab label="Inspection Form" />
              </Tabs>
            </Box>

            {activeTab === 0 && (
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">Feature Form Fields</Typography>
                  <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={() => {
                      setEditingField(null);
                      setShowFeatureFieldDialog(true);
                    }}
                  >
                    Add Field
                  </Button>
                </Box>
                <List>
                  {featureType.featureForm?.fields.map((field) => (
                    <ListItem key={field.id}>
                      <ListItemText
                        primary={field.label}
                        secondary={
                          <React.Fragment>
                            <Typography component="span" variant="body2">
                              Type: {field.type} {field.required ? '• Required' : ''}
                            </Typography>
                            {field.conditionalLogic && field.conditionalLogic.length > 0 && (
                              <Box sx={{ mt: 0.5 }}>
                                <Typography component="span" variant="body2" color="primary">
                                  <RuleIcon sx={{ fontSize: 16, verticalAlign: 'text-bottom', mr: 0.5 }} />
                                  Has conditional logic
                                </Typography>
                              </Box>
                            )}
                          </React.Fragment>
                        }
                      />
                      <ListItemSecondaryAction>
                        <IconButton 
                          edge="end" 
                          sx={{ mr: 1 }}
                          onClick={() => handleEditField(field, false)}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton 
                          edge="end"
                          onClick={() => handleDeleteField(field.id, false)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}

            {activeTab === 1 && (
              <Box>
                <FormControlLabel
                  control={
                    <Switch
                      checked={featureType.hasInspectionForm}
                      onChange={handleToggleInspectionForm}
                    />
                  }
                  label="Enable Inspection Form"
                />

                <Collapse in={featureType.hasInspectionForm}>
                  <Box sx={{ mt: 2 }}>
                    <TextField
                      fullWidth
                      label="Form Name"
                      value={featureType.inspectionForm?.name || ''}
                      onChange={(e) => {
                        setFeatureType({
                          ...featureType,
                          inspectionForm: {
                            ...featureType.inspectionForm!,
                            name: e.target.value,
                          },
                        });
                        setErrors({ ...errors, inspectionForm: undefined });
                      }}
                      margin="normal"
                      required
                      error={!!errors.inspectionForm}
                      helperText={errors.inspectionForm}
                    />
                    <TextField
                      fullWidth
                      label="Form Description"
                      value={featureType.inspectionForm?.description || ''}
                      onChange={(e) => setFeatureType({
                        ...featureType,
                        inspectionForm: {
                          ...featureType.inspectionForm!,
                          description: e.target.value,
                        },
                      })}
                      margin="normal"
                      multiline
                      rows={2}
                    />

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, mt: 3 }}>
                      <Typography variant="h6">Inspection Form Fields</Typography>
                      <Button
                        variant="outlined"
                        startIcon={<AddIcon />}
                        onClick={() => {
                          setEditingField(null);
                          setShowInspectionFieldDialog(true);
                        }}
                      >
                        Add Field
                      </Button>
                    </Box>

                    <List>
                      {featureType.inspectionForm?.fields.map((field) => (
                        <ListItem key={field.id}>
                          <ListItemText
                            primary={field.label}
                            secondary={
                              <React.Fragment>
                                <Typography component="span" variant="body2">
                                  Type: {field.type} {field.required ? '• Required' : ''}
                                </Typography>
                                {field.conditionalLogic && field.conditionalLogic.length > 0 && (
                                  <Box sx={{ mt: 0.5 }}>
                                    <Typography component="span" variant="body2" color="primary">
                                      <RuleIcon sx={{ fontSize: 16, verticalAlign: 'text-bottom', mr: 0.5 }} />
                                      Has conditional logic
                                    </Typography>
                                  </Box>
                                )}
                              </React.Fragment>
                            }
                          />
                          <ListItemSecondaryAction>
                            <IconButton 
                              edge="end" 
                              sx={{ mr: 1 }}
                              onClick={() => handleEditField(field, true)}
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton 
                              edge="end"
                              onClick={() => handleDeleteField(field.id, true)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </ListItemSecondaryAction>
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                </Collapse>
              </Box>
            )}
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          onClick={handleSave} 
          variant="contained"
          disabled={Object.values(errors).filter(Boolean).length > 0}
        >
          Save
        </Button>
      </DialogActions>

      {/* Feature Field Dialog */}
      <FieldDialog
        open={showFeatureFieldDialog}
        onClose={() => {
          setShowFeatureFieldDialog(false);
          setEditingField(null);
        }}
        onSave={handleAddFeatureField}
        existingFields={featureType.featureForm?.fields || []}
        title={editingField && !editingField.isInspection ? "Edit Feature Field" : "Add Feature Field"}
        initialField={editingField && !editingField.isInspection ? editingField.field : undefined}
      />

      {/* Inspection Field Dialog */}
      <FieldDialog
        open={showInspectionFieldDialog}
        onClose={() => {
          setShowInspectionFieldDialog(false);
          setEditingField(null);
        }}
        onSave={handleAddInspectionField}
        existingFields={featureType.inspectionForm?.fields || []}
        title={editingField && editingField.isInspection ? "Edit Inspection Field" : "Add Inspection Field"}
        initialField={editingField && editingField.isInspection ? editingField.field : undefined}
      />
    </Dialog>
  );
} 