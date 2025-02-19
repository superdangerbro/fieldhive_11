import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  Card,
  CardContent,
  IconButton,
  Collapse,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  ExpandMore as ExpandMoreIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../store';
import { useSchemaSubscription } from '../hooks/useSchemaSubscription';
import {
  fetchSections,
  fetchMapFeatureTypes,
  createSection,
  updateSection,
  deleteSection,
  createMapFeatureType,
  updateMapFeatureType,
  deleteMapFeatureType,
} from '../store/slices/schemaSlice';
import MapFeatureTypeForm from './MapFeatureTypeForm';
import type { Section, MapFeatureType } from '../types/schema';

export default function SectionManager() {
  const dispatch = useAppDispatch();
  const { sections, mapFeatureTypes, loading, error } = useAppSelector((state) => state.schema);
  const [openDialog, setOpenDialog] = useState(false);
  const [newSection, setNewSection] = useState({ name: '', description: '' });
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [showFeatureTypeForm, setShowFeatureTypeForm] = useState(false);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [editingSection, setEditingSection] = useState<Section | null>(null);

  // Subscribe to real-time updates
  useSchemaSubscription();

  // Fetch initial data
  useEffect(() => {
    dispatch(fetchSections());
    dispatch(fetchMapFeatureTypes());
  }, [dispatch]);

  const handleAddSection = async () => {
    if (!newSection.name.trim()) return;

    try {
      const result = await dispatch(createSection({
        name: newSection.name.trim(),
        description: newSection.description?.trim() || null,
      })).unwrap();

      if (result) {
        setNewSection({ name: '', description: '' });
        setOpenDialog(false);
      }
    } catch (error) {
      console.error('Failed to create section:', error);
      if (error instanceof Error) {
        dispatch({ type: 'schema/setError', payload: error.message });
      } else {
        dispatch({ type: 'schema/setError', payload: 'Failed to create section' });
      }
    }
  };

  const handleEditSection = async () => {
    if (!editingSection) return;

    try {
      await dispatch(updateSection({
        id: editingSection.id,
        name: editingSection.name,
        description: editingSection.description,
      })).unwrap();
      setEditingSection(null);
      setOpenDialog(false);
    } catch (error) {
      console.error('Failed to update section:', error);
    }
  };

  const handleDeleteSection = async (sectionId: string) => {
    if (!window.confirm('Are you sure you want to delete this section?')) return;

    try {
      await dispatch(deleteSection(sectionId)).unwrap();
    } catch (error) {
      console.error('Failed to delete section:', error);
    }
  };

  const handleAddMapFeatureType = (sectionId: string) => {
    setSelectedSectionId(sectionId);
    setShowFeatureTypeForm(true);
  };

  const handleSaveMapFeatureType = async (featureType: MapFeatureType) => {
    if (!selectedSectionId) return;

    try {
      await dispatch(createMapFeatureType({
        ...featureType,
        section_id: selectedSectionId,
      })).unwrap();
      setShowFeatureTypeForm(false);
      setSelectedSectionId(null);
    } catch (error) {
      console.error('Failed to create map feature type:', error);
    }
  };

  const handleDeleteMapFeatureType = async (typeId: string) => {
    if (!window.confirm('Are you sure you want to delete this feature type?')) return;

    try {
      await dispatch(deleteMapFeatureType(typeId)).unwrap();
    } catch (error) {
      console.error('Failed to delete map feature type:', error);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h5">Categories</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setEditingSection(null);
            setOpenDialog(true);
          }}
        >
          Add Category
        </Button>
      </Box>

      {sections.map((section) => (
        <Card key={section.id} sx={{ mb: 2 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">{section.name}</Typography>
              <Box>
                <IconButton onClick={() => setExpandedSection(expandedSection === section.id ? null : section.id)}>
                  <ExpandMoreIcon
                    sx={{
                      transform: expandedSection === section.id ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.3s',
                    }}
                  />
                </IconButton>
                <IconButton onClick={() => {
                  setEditingSection(section);
                  setOpenDialog(true);
                }}>
                  <EditIcon />
                </IconButton>
                <IconButton onClick={() => handleDeleteSection(section.id)}>
                  <DeleteIcon />
                </IconButton>
              </Box>
            </Box>
            <Typography color="textSecondary">{section.description}</Typography>
          </CardContent>

          <Collapse in={expandedSection === section.id}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="subtitle1">Map Feature Types</Typography>
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={() => handleAddMapFeatureType(section.id)}
                >
                  Add New Type
                </Button>
              </Box>
              
              <List>
                {mapFeatureTypes
                  .filter(type => type.section_id === section.id)
                  .map((type) => (
                    <ListItem key={type.id}>
                      <ListItemText
                        primary={type.name}
                        secondary={
                          <React.Fragment>
                            <Typography component="span" variant="body2" color="textSecondary">
                              {type.description}
                            </Typography>
                            <br />
                            <Typography component="span" variant="body2" color="textSecondary">
                              Geometry: {type.geometry_type} • Fields: {
                                type.has_inspection_form
                                  ? (type.inspection_form as any)?.fields?.length || 0
                                  : (type.feature_form as any)?.fields?.length || 0
                              }
                            </Typography>
                          </React.Fragment>
                        }
                      />
                      <ListItemSecondaryAction>
                        <IconButton edge="end" sx={{ mr: 1 }}>
                          <EditIcon />
                        </IconButton>
                        <IconButton edge="end" onClick={() => handleDeleteMapFeatureType(type.id)}>
                          <DeleteIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
              </List>
            </CardContent>
          </Collapse>
        </Card>
      ))}

      {/* Add/Edit Section Dialog */}
      <Dialog open={openDialog} onClose={() => {
        setOpenDialog(false);
        setEditingSection(null);
      }}>
        <DialogTitle>{editingSection ? 'Edit Category' : 'Add New Category'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Category Name"
            fullWidth
            value={editingSection ? editingSection.name : newSection.name}
            onChange={(e) => {
              if (editingSection) {
                setEditingSection({ ...editingSection, name: e.target.value });
              } else {
                setNewSection({ ...newSection, name: e.target.value });
              }
            }}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={3}
            value={editingSection ? editingSection.description : newSection.description}
            onChange={(e) => {
              if (editingSection) {
                setEditingSection({ ...editingSection, description: e.target.value });
              } else {
                setNewSection({ ...newSection, description: e.target.value });
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setOpenDialog(false);
            setEditingSection(null);
          }}>
            Cancel
          </Button>
          <Button
            onClick={editingSection ? handleEditSection : handleAddSection}
            variant="contained"
            disabled={!(editingSection ? editingSection.name : newSection.name)}
          >
            {editingSection ? 'Save' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Map Feature Type Form Dialog */}
      <MapFeatureTypeForm
        open={showFeatureTypeForm}
        onClose={() => {
          setShowFeatureTypeForm(false);
          setSelectedSectionId(null);
        }}
        onSave={handleSaveMapFeatureType}
      />
    </Box>
  );
} 