import React from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  BottomNavigation,
  BottomNavigationAction,
  useMediaQuery,
  useTheme,
  IconButton,
  Badge,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Map,
  ListAlt,
  CloudOff,
  CloudDone,
  MoreVert,
  GpsFixed,
  PhotoCamera,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [syncStatus, setSyncStatus] = React.useState<'online' | 'offline'>('online');
  const [menuAnchor, setMenuAnchor] = React.useState<null | HTMLElement>(null);

  // Simulate offline detection
  React.useEffect(() => {
    const handleOnline = () => setSyncStatus('online');
    const handleOffline = () => setSyncStatus('offline');
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const menuItems = [
    { text: 'Map', icon: <Map />, path: '/' },
    { text: 'Forms', icon: <ListAlt />, path: '/forms' },
  ];

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <AppBar position="fixed">
        <Toolbar sx={{ minHeight: { xs: 56, sm: 64 } }}>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            FieldHive
          </Typography>
          
          {/* Sync Status Indicator */}
          <Badge
            color={syncStatus === 'online' ? 'success' : 'error'}
            variant="dot"
            sx={{ mr: 1 }}
          >
            {syncStatus === 'online' ? <CloudDone /> : <CloudOff />}
          </Badge>

          {/* Quick Action Buttons */}
          <IconButton color="inherit" size="large">
            <GpsFixed />
          </IconButton>
          
          <IconButton color="inherit" size="large">
            <PhotoCamera />
          </IconButton>

          <IconButton color="inherit" onClick={handleMenuOpen}>
            <MoreVert />
          </IconButton>

          <Menu
            anchorEl={menuAnchor}
            open={Boolean(menuAnchor)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={handleMenuClose}>Sync Data</MenuItem>
            <MenuItem onClick={handleMenuClose}>Download Maps</MenuItem>
            <MenuItem onClick={handleMenuClose}>Settings</MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 1, sm: 2 },
          pt: { xs: '56px', sm: '64px' },
          pb: isMobile ? '56px' : '0',
          overflowY: 'auto',
          backgroundColor: '#f5f5f5'
        }}
      >
        {children}
      </Box>

      {isMobile && (
        <BottomNavigation
          value={location.pathname}
          onChange={(_, newPath) => navigate(newPath)}
          sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            height: 56,
            borderTop: 1,
            borderColor: 'divider',
            backgroundColor: 'white',
            boxShadow: '0 -2px 4px rgba(0,0,0,0.1)',
            zIndex: theme.zIndex.appBar - 1
          }}
        >
          {menuItems.map((item) => (
            <BottomNavigationAction
              key={item.path}
              label={item.text}
              icon={item.icon}
              value={item.path}
              sx={{
                '& .MuiBottomNavigationAction-label': {
                  fontSize: '0.75rem',
                  '&.Mui-selected': { fontSize: '0.75rem' }
                }
              }}
            />
          ))}
        </BottomNavigation>
      )}
    </Box>
  );
} 