import React from 'react';
import {
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Paper,
  Typography,
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';

const MOCK_FORMS = [
  { id: 1, name: 'Site Inspection', lastModified: '2024-02-18' },
  { id: 2, name: 'Equipment Check', lastModified: '2024-02-17' },
  { id: 3, name: 'Safety Audit', lastModified: '2024-02-16' },
];

export default function FormList() {
  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom>
        Forms
      </Typography>
      <List>
        {MOCK_FORMS.map((form) => (
          <ListItem key={form.id}>
            <ListItemText
              primary={form.name}
              secondary={`Last modified: ${form.lastModified}`}
            />
            <ListItemSecondaryAction>
              <IconButton edge="end" aria-label="edit" sx={{ mr: 1 }}>
                <Edit />
              </IconButton>
              <IconButton edge="end" aria-label="delete">
                <Delete />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
    </Paper>
  );
} 