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
  Avatar,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Divider,
} from '@mui/material';
import {
  Map,
  ListAlt,
  CloudOff,
  CloudDone,
  GpsFixed,
  PhotoCamera,
  Logout,
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const DRAWER_WIDTH = 240;
const TOOLBAR_HEIGHT = 64;
const BOTTOM_NAV_HEIGHT = 56;

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [syncStatus, setSyncStatus] = React.useState<'online' | 'offline'>('online');
  const [menuAnchor, setMenuAnchor] = React.useState<null | HTMLElement>(null);
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(!isMobile);
  const { signOut, session } = useAuth();

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

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        height: TOOLBAR_HEIGHT,
        px: 2
      }}>
        <Typography variant="h6" noWrap>
          FieldHive
        </Typography>
        <IconButton onClick={toggleDrawer}>
          <ChevronLeftIcon />
        </IconButton>
      </Box>
      <Divider />
      <List sx={{ flexGrow: 1, overflowY: 'auto' }}>
        {menuItems.map((item) => (
          <ListItem key={item.path} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => navigate(item.path)}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ 
      display: 'flex', 
      height: '100vh',
      overflow: 'hidden'
    }}>
      <AppBar 
        position="fixed"
        sx={{
          width: { sm: isDrawerOpen ? `calc(100% - ${DRAWER_WIDTH}px)` : '100%' },
          ml: { sm: isDrawerOpen ? `${DRAWER_WIDTH}px` : 0 },
          transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Toolbar sx={{ minHeight: { xs: TOOLBAR_HEIGHT, sm: TOOLBAR_HEIGHT } }}>
          <IconButton
            color="inherit"
            edge="start"
            onClick={toggleDrawer}
            sx={{ mr: 2, display: isDrawerOpen ? 'none' : 'block' }}
          >
            <MenuIcon />
          </IconButton>
          
          <Box sx={{ flexGrow: 1 }} />
          
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

          {/* User Avatar */}
          <IconButton
            size="small"
            sx={{ ml: 1 }}
            onClick={handleMenuOpen}
          >
            <Avatar sx={{ width: 32, height: 32 }}>
              {session?.user?.email?.[0].toUpperCase()}
            </Avatar>
          </IconButton>

          <Menu
            anchorEl={menuAnchor}
            open={Boolean(menuAnchor)}
            onClose={handleMenuClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <MenuItem onClick={handleMenuClose}>Sync Data</MenuItem>
            <MenuItem onClick={handleMenuClose}>Download Maps</MenuItem>
            <MenuItem onClick={handleMenuClose}>Settings</MenuItem>
            <MenuItem onClick={handleSignOut}>
              <Logout sx={{ mr: 1 }} />
              Sign Out
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Drawer */}
      <Drawer
        variant={isMobile ? 'temporary' : 'persistent'}
        open={isDrawerOpen}
        onClose={toggleDrawer}
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
          },
        }}
      >
        {drawer}
      </Drawer>
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          height: '100vh',
          overflow: 'hidden',
          pt: `${TOOLBAR_HEIGHT}px`,
          pb: isMobile ? `${BOTTOM_NAV_HEIGHT}px` : 0,
          transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          marginLeft: isDrawerOpen ? 0 : `-${DRAWER_WIDTH}px`,
        }}
      >
        <Outlet />
      </Box>

      {/* Mobile bottom navigation */}
      {isMobile && (
        <BottomNavigation
          value={location.pathname}
          onChange={(_, newPath) => navigate(newPath)}
          sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            height: BOTTOM_NAV_HEIGHT,
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