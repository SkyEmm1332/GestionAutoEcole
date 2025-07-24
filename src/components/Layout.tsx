import React, { useState, createContext, useContext, useRef, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  Tooltip,
  Snackbar,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  School as SchoolIcon,
  DirectionsCar as DirectionsCarIcon,
  Assignment as AssignmentIcon,
  Person as PersonIcon,
  AccountBalance as AccountBalanceIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import CustomCalendar from './CustomCalendar';
import PaymentIcon from '@mui/icons-material/Payment';
import MuiAlert, { AlertColor } from '@mui/material/Alert';

type EventType = 'examen-code' | 'examen-conduite' | 'cours-conduite' | 'visite-medicale';

const drawerWidth = 240;

const menuItems: MenuItem[] = [
  { text: 'Tableau de bord', icon: <DashboardIcon />, path: '/', children: [] },
  { text: 'Candidats', icon: <PeopleIcon />, children: [
    { text: 'Nouveau candidat', path: '/candidates/new' },
    { text: 'Liste des candidats', path: '/candidates/list' },
    { text: 'Historique', path: '/candidates/history' },
  ] },
  { text: 'Cours théoriques', icon: <SchoolIcon />, children: [ { text: 'Liste des cours', path: '/theoretical-courses' } ] },
  { text: 'Cours pratiques', icon: <DirectionsCarIcon />, children: [ { text: 'Liste des cours', path: '/practical-courses' } ] },
  { text: 'Examens', icon: <AssignmentIcon />, children: [ 
    { text: 'Liste des examens', path: '/exams' },
    { text: 'Candidats protégés', path: '/exams/proteges' }
  ] },
  { text: 'Personnel', icon: <PersonIcon />, children: [ { text: 'Liste des moniteurs', path: '/instructors' } ] },
  { text: 'Administration', icon: <AccountBalanceIcon />, children: [ { text: 'Gestion', path: '/administration' } ] },
  { text: 'Configuration', icon: <SettingsIcon />, children: [ { text: 'Paramètres', path: '/settings' } ] },
  { text: 'Versements', icon: <PaymentIcon />, children: [ { text: 'Liste des versements', path: '/payments' } ] },
];

const eventColors: Record<EventType, string> = {
  'examen-code': '#1976d2',
  'examen-conduite': '#d32f2f',
  'cours-conduite': '#388e3c',
  'visite-medicale': '#fbc02d',
};

const events: { date: Date; type: EventType; label: string }[] = [
  { date: new Date(2024, 5, 10), type: 'examen-code', label: 'Examen de code' },
  { date: new Date(2024, 5, 15), type: 'examen-conduite', label: 'Examen de conduite' },
  { date: new Date(2024, 5, 20), type: 'cours-conduite', label: 'Cours de conduite' },
  { date: new Date(2024, 5, 25), type: 'visite-medicale', label: 'Visite médicale' },
];

// Définir un type pour les items du menu
interface MenuSubItem {
  text: string;
  path: string;
}
interface MenuItem {
  text: string;
  icon: React.ReactNode;
  path?: string;
  children?: MenuSubItem[];
}

// CONTEXTE GLOBAL POUR LES ALERTES
export const SnackbarContext = createContext({
  showMessage: (message: string, severity?: AlertColor) => {},
});

const SnackbarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState<AlertColor>('info');

  const showMessage = (msg: string, sev: AlertColor = 'info') => {
    setMessage(msg);
    setSeverity(sev);
    setOpen(true);
  };

  return (
    <SnackbarContext.Provider value={{ showMessage }}>
      {children}
      <Snackbar open={open} autoHideDuration={3500} onClose={() => setOpen(false)} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <MuiAlert elevation={6} variant="filled" onClose={() => setOpen(false)} severity={severity} sx={{ width: '100%' }}>
          {message}
        </MuiAlert>
      </Snackbar>
    </SnackbarContext.Provider>
  );
};

const Layout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [miniDrawer, setMiniDrawer] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [openCalendar, setOpenCalendar] = useState(false);
  const [openSubMenu, setOpenSubMenu] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [popoverAnchor, setPopoverAnchor] = useState<null | HTMLElement>(null);
  const iconRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [fixedPopover, setFixedPopover] = useState<string | null>(null);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };
  const handleMiniDrawerToggle = () => {
    setMiniDrawer((prev) => !prev);
  };

  const handleMenuClick = (key: string) => {
    const item = menuItems.find(i => i.text === key);
    if (item && item.path) {
      navigate(item.path);
      setOpenSubMenu(null);
    } else {
      setOpenSubMenu(prev => prev === key ? null : key);
    }
  };

  const getActiveMenuText = () => {
    for (const item of menuItems) {
      if (item.children) {
        const found = item.children.find(sub => sub.path === location.pathname);
        if (found) return found.text;
      }
    }
    return 'Tableau de bord';
  };

  const isMenuItemActive = (item: MenuItem): boolean => {
    if (item.path && location.pathname === item.path) return true;
    if (item.children) {
      return item.children.some((sub: MenuSubItem) => location.pathname === sub.path);
    }
    return false;
  };

  const drawer = (
    <Box sx={{
      background: '#181a20',
      height: '100%',
      boxShadow: 2,
      overflow: 'hidden',
      overflowY: 'auto',
      maxHeight: '100vh',
      scrollbarGutter: 'stable',
      '&::-webkit-scrollbar': { width: 8, background: '#23242a' },
      '&::-webkit-scrollbar-thumb': { background: '#444857', borderRadius: 4 },
      '&::-webkit-scrollbar-thumb:hover': { background: '#666b7a' },
      scrollbarColor: '#444857 #23242a',
      scrollbarWidth: 'thin',
    }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 2 }}>
        <img
          src={process.env.PUBLIC_URL + '/logo.png'}
          alt="Logo Auto-école"
          style={{ height: 70, width: 'auto', maxWidth: 120, objectFit: 'contain', borderRadius: 8, padding: 2, display: 'block' }}
        />
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 1, mb: 1, width: '100%' }}>
          <Box sx={{ mr: 1 }}>
            <img
              src="https://randomuser.me/api/portraits/women/44.jpg"
              alt="Profil"
              style={{ width: 38, height: 38, borderRadius: '50%', objectFit: 'cover', border: '2px solid #fff' }}
            />
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <Typography sx={{ color: '#fff', fontWeight: 900, fontSize: 13, fontFamily: 'Montserrat, Arial, sans-serif', lineHeight: 1.1 }}>
              Kouassi Yah Henriette
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.2 }}>
              <Box sx={{ width: 11, height: 11, borderRadius: '50%', background: '#00e676', mr: 0.7, border: '2px solid #181a20' }} />
              <Typography sx={{ color: '#bdbdbd', fontWeight: 500, fontSize: 12, fontFamily: 'Montserrat, Arial, sans-serif' }}>
                Bienvenue
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)', mb: 1 }} />
      <List sx={{ px: 0, py: 0 }}>
        {menuItems.map((item) => {
          const active = isMenuItemActive(item);
          return (
          <React.Fragment key={item.text}>
              <ListItem disablePadding
                onMouseEnter={() => miniDrawer && setHovered(item.text)}
                onMouseLeave={() => miniDrawer && setHovered(null)}
              >
              <ListItemButton
                disableRipple
                  selected={active}
                  sx={{
                    background: active ? '#23242a' : 'transparent',
                    borderLeft: active ? '5px solid #fbc02d' : '5px solid transparent',
                    '&:hover': {
                      background: active ? '#23242a' : 'rgba(251,192,45,0.08)',
                      borderLeft: '5px solid #fbc02d',
                    },
                    minHeight: 44,
                    fontSize: 14,
                    transition: 'background 0.2s, border-left 0.2s',
                  }}
                onClick={() => handleMenuClick(item.text)}
              >
                  <ListItemIcon sx={{ color: active ? '#fbc02d' : '#fff', fontSize: 18, transition: 'color 0.2s' }}>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} sx={{ color: active ? '#fbc02d' : '#fff', fontWeight: 600, fontSize: 14, transition: 'color 0.2s' }} />
                </ListItemButton>
                {/* Sous-menu en popover au survol, uniquement en miniDrawer */}
                {item.children && miniDrawer && hovered === item.text && (
                  <Box
                    sx={{
                      position: 'absolute',
                      left: 72,
                      top: 0,
                      zIndex: 2000,
                      bgcolor: '#23242a',
                      boxShadow: 3,
                      borderRadius: 2,
                      minWidth: 180,
                      py: 1,
                      mt: 0.5,
                    }}
                    onMouseEnter={() => setHovered(item.text)}
                    onMouseLeave={() => setHovered(null)}
                  >
                    <List sx={{ p: 0 }}>
                      {item.children.map((sub) => (
                        <ListItemButton
                          key={sub.text}
                          selected={location.pathname === sub.path}
                          onClick={() => navigate(sub.path)}
                          sx={{
                            color: location.pathname === sub.path ? '#fbc02d' : '#fff',
                            background: 'transparent',
                            fontSize: 13,
                            width: '100%',
                            '& .MuiListItemText-root': { transition: 'color 0.2s' },
                            '&:hover .MuiListItemText-primary': { color: '#fbc02d' },
                            pl: 2,
                          }}
                        >
                          <ListItemText primary={sub.text} sx={{ color: location.pathname === sub.path ? '#fbc02d' : '#fff', fontSize: 13, transition: 'color 0.2s' }} />
              </ListItemButton>
                      ))}
                    </List>
                  </Box>
                )}
            </ListItem>
              {/* Sous-menu classique déroulant, uniquement si menu non miniDrawer */}
              {item.children && !miniDrawer && (
              <Box
                sx={{
                  maxHeight: openSubMenu === item.text ? 500 : 0,
                  opacity: openSubMenu === item.text ? 1 : 0,
                  overflow: 'hidden',
                  transition: 'max-height 0.4s cubic-bezier(.4,0,.2,1), opacity 0.3s',
                  bgcolor: '#23242a',
                  mb: 1,
                  width: '100%',
                  px: 0
                }}
              >
                <List sx={{ pl: 0, pr: 0, py: 0, width: '100%' }}>
                  {item.children.map((sub) => (
                    <ListItemButton
                      key={sub.text}
                      selected={location.pathname === sub.path}
                      onClick={() => navigate(sub.path)}
                        sx={{
                          color: location.pathname === sub.path ? '#fbc02d' : '#fff',
                          background: 'transparent',
                          fontSize: 13,
                          width: '100%',
                          '& .MuiListItemText-root': { transition: 'color 0.2s' },
                          '&:hover .MuiListItemText-primary': { color: '#fbc02d' },
                          pl: 4,
                        }}
                      >
                        <ListItemText primary={sub.text} sx={{ color: location.pathname === sub.path ? '#fbc02d' : '#fff', fontSize: 13, transition: 'color 0.2s' }} />
                    </ListItemButton>
                  ))}
                </List>
              </Box>
            )}
          </React.Fragment>
          );
        })}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${miniDrawer ? 72 : drawerWidth}px)` },
          ml: { sm: `${miniDrawer ? 72 : drawerWidth}px` },
          background: '#181a20',
          color: '#fff',
          boxShadow: '0 4px 16px 0 rgba(23,78,166,0.12)',
          zIndex: 1201
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleMiniDrawerToggle}
            sx={{ mr: 2, display: { xs: 'block', sm: 'block' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography
            variant="h5"
            noWrap
            component="div"
            sx={{ flexGrow: 1, fontWeight: 800, letterSpacing: 1, cursor: 'pointer', transition: 'color 0.2s', '&:hover': { color: '#fbc02d' } }}
            onClick={() => navigate('/')}
          >
            {getActiveMenuText()}
          </Typography>
          <Button
            color="primary"
            variant="contained"
            onClick={() => setOpenCalendar(true)}
            sx={{
              mr: 2,
              fontWeight: 700,
              borderRadius: 0,
              px: 2.5,
              background: '#181a20',
              color: '#fff',
              '&:hover': { background: '#23242a', color: '#fff' }
            }}
          >
            Calendrier
          </Button>
          <Button
            color="secondary"
            variant="contained"
            onClick={() => navigate('/exams')}
            sx={{
              fontWeight: 700,
              borderRadius: 0,
              px: 2.5,
              boxShadow: 'none',
              background: '#800020',
              '&:hover': { background: '#a83232' }
            }}
          >
            Programmer un examen
          </Button>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: miniDrawer ? 72 : drawerWidth }, flexShrink: { sm: 0 }, transition: 'width 0.35s cubic-bezier(.4,0,.2,1)' }}
      >
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: miniDrawer ? 72 : drawerWidth,
              transition: 'width 0.35s cubic-bezier(.4,0,.2,1)',
              overflowX: 'hidden',
              background: '#181a20',
            },
          }}
          open
        >
          {miniDrawer ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 2, height: '100%' }}>
              <img
                src={process.env.PUBLIC_URL + '/logo.png'}
                alt="Logo Auto-école"
                style={{ height: 40, width: 'auto', maxWidth: 48, objectFit: 'contain', borderRadius: 8, padding: 2, display: 'block' }}
              />
              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 3, gap: 2 }}>
                {menuItems.map((item, idx) => (
                  <Box key={item.text} sx={{ position: 'relative' }}
                    onMouseEnter={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
                      setHovered(item.text);
                      if (iconRefs.current[idx]) setPopoverAnchor(iconRefs.current[idx]);
                    }}
                    onMouseLeave={() => {
                      setHovered(null);
                      if (!fixedPopover) setPopoverAnchor(null);
                    }}
                  >
                    <IconButton
                      ref={el => iconRefs.current[idx] = el}
                      color={location.pathname.startsWith((item.children && item.children[0]?.path) || '/' + item.text.toLowerCase().replace(/ /g, '-')) ? 'warning' : 'default'}
                      sx={{ color: location.pathname.startsWith((item.children && item.children[0]?.path) || '/' + item.text.toLowerCase().replace(/ /g, '-')) ? '#fbc02d' : '#fff', mb: 1, fontSize: 24 }}
                      onClick={() => {
                        if (item.children && item.children.length > 0) {
                          if (fixedPopover === item.text) {
                            setFixedPopover(null);
                            setPopoverAnchor(null);
                            setHovered(null);
                          } else {
                            setFixedPopover(item.text);
                            setPopoverAnchor(iconRefs.current[idx]);
                            setHovered(item.text);
                          }
                        } else {
                          if (item.path) navigate(item.path);
                        }
                    }}
                  >
                    {item.icon}
                  </IconButton>
                    {/* Popover sous-menu au hover ou figé */}
                    {item.children && (hovered === item.text || fixedPopover === item.text) && popoverAnchor && (
                      <Box
                        sx={{
                          position: 'fixed',
                          left: popoverAnchor.getBoundingClientRect().right + 8,
                          top: popoverAnchor.getBoundingClientRect().top,
                          zIndex: 3000,
                          bgcolor: '#23242a',
                          boxShadow: 3,
                          borderRadius: 2,
                          minWidth: 180,
                          py: 1,
                          mt: 0.5,
                        }}
                        onMouseEnter={() => setHovered(item.text)}
                        onMouseLeave={() => {
                          setHovered(null);
                          if (!fixedPopover) setPopoverAnchor(null);
                        }}
                      >
                        <List sx={{ p: 0 }}>
                          {item.children.map((sub) => (
                            <ListItemButton
                              key={sub.text}
                              selected={location.pathname === sub.path}
                              onClick={() => navigate(sub.path)}
                              sx={{
                                color: location.pathname === sub.path ? '#fbc02d' : '#fff',
                                background: 'transparent',
                                fontSize: 13,
                                width: '100%',
                                '& .MuiListItemText-root': { transition: 'color 0.2s' },
                                '&:hover .MuiListItemText-primary': { color: '#fbc02d' },
                                pl: 2,
                              }}
                            >
                              <ListItemText primary={sub.text} sx={{ color: location.pathname === sub.path ? '#fbc02d' : '#fff', fontSize: 13, transition: 'color 0.2s' }} />
                            </ListItemButton>
                          ))}
                        </List>
                      </Box>
                    )}
                  </Box>
                ))}
              </Box>
            </Box>
          ) : (
            drawer
          )}
        </Drawer>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${miniDrawer ? 72 : drawerWidth}px)` },
          mt: '64px'
        }}
      >
        <SnackbarProvider>
          <Outlet />
        </SnackbarProvider>
      </Box>
      <Dialog open={openCalendar} onClose={() => setOpenCalendar(false)} maxWidth={false}
        PaperProps={{ sx: { minWidth: 700, maxWidth: 700, width: 700, minHeight: 420 } }}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, pb: 1 }}>
          <span>Calendrier</span>
          <IconButton onClick={() => setOpenCalendar(false)} size="small">
            <span style={{ fontSize: 22, fontWeight: 700 }}>&#10005;</span>
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <CustomCalendar />
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default Layout;
export {}; 