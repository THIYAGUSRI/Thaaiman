import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  useTheme,
  useMediaQuery,
  Button,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Close as CloseIcon,
  Dashboard as DashboardIcon,
  AddBox as AddBoxIcon,
  ListAlt as ListAltIcon,
  Inventory as InventoryIcon,
  AccountCircle,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import AdminHeader from './AdminHeader'; 


export default function AdminLayout({ children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [anchorElCreate, setAnchorElCreate] = useState(null);
  const [anchorElLists, setAnchorElLists] = useState(null);
  const [anchorElOrder, setAnchorElOrder] = useState(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleMenuOpen = (event, setter) => {
    setter(event.currentTarget);
  };

  const handleMenuClose = (setter) => {
    setter(null);
  };

  const navItems = [
    { title: 'Dashboard', icon: <DashboardIcon />, link: '/adminhome' },
    {
      title: 'Create New',
      icon: <AddBoxIcon />,
      subItems: [
        { text: 'Create Product', link: '/createproductdetail' },
        { text: 'Create Category', link: '/createcategorydetail' },
        { text: 'Create Event', link: '/createeventdetail' },
        { text: 'Create Video', link: '/createvideo' },
      ],
    },
    {
      title: 'Lists',
      icon: <ListAltIcon />,
      subItems: [
        { text: 'Products List', link: '/adminproductdetail' },
        { text: 'Categories List', link: '/admincategorydetail' },
        { text: 'Events List', link: '/admineventdetail' },
        { text: 'Videos List', link: '/adminvideodetail' },
      ],
    },
    {
      title: 'User',
      icon: <AccountCircle />,
      subItems: [
        { text: 'Customer Details', link: '/admincustomerdetail' },
        { text: 'Delivery Center Detail', link: '/admindeliverycentredetail' },        
      ],
    },
    {
      title: 'Order',
      icon: <InventoryIcon />,
      link: '/adminorderdetail'      
    },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* 1. Your Existing AdminHeader - Always at the very top */}
      <AdminHeader />

      {/* 2. Secondary Navbar - Admin Panel Navigation (below AdminHeader) */}
      <AppBar
        position="sticky"
        sx={{
          top: 65, 
          bgcolor: 'white',
          color: 'text.primary',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          zIndex: theme.zIndex.appBar,
        }}
      >
        <Toolbar >
          {/* Logo / Title */}
          {/* <Typography
            variant="h6"
            fontWeight="bold"
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Admin Panel
          </Typography> */}

          {/* Desktop Navigation */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 2 }}>
            {navItems.map((item, index) => (
              <Box key={index}>
                {item.link ? (
                  <Button
                    component={Link}
                    to={item.link}
                    startIcon={item.icon}
                    sx={{
                      color: 'text.primary',
                      textTransform: 'none',
                      fontWeight: 'large',
                      '&:hover': {
                        bgcolor: 'primary.light',
                        color: 'primary.contrastText',
                      },
                    }}
                  >
                    {item.title}
                  </Button>
                ) : (
                  <Button
                    startIcon={item.icon}
                    onClick={(e) =>
                      handleMenuOpen(
                        e,
                        index === 1
                          ? setAnchorElCreate
                          : index === 2
                          ? setAnchorElLists
                          : setAnchorElOrder
                      )
                    }
                    sx={{
                      color: 'text.primary',
                      textTransform: 'none',
                      fontWeight: 'large',
                      '&:hover': {
                        bgcolor: 'primary.light',
                        color: 'primary.contrastText',
                      },
                    }}
                  >
                    {item.title}
                  </Button>
                )}

                {/* Dropdown Menus */}
                {item.subItems && (
                  <Menu
                    anchorEl={
                      index === 1
                        ? anchorElCreate
                        : index === 2
                        ? anchorElLists
                        : anchorElOrder
                    }
                    open={Boolean(
                      index === 1
                        ? anchorElCreate
                        : index === 2
                        ? anchorElLists
                        : anchorElOrder
                    )}
                    onClose={() =>
                      handleMenuClose(
                        index === 1
                          ? setAnchorElCreate
                          : index === 2
                          ? setAnchorElLists
                          : setAnchorElOrder
                      )
                    }
                    PaperProps={{
                      sx: { mt: 1, borderRadius: 2, boxShadow: 3 },
                    }}
                  >
                    {item.subItems.map((sub, i) => (
                      <MenuItem
                        key={i}
                        component={Link}
                        to={sub.link}
                        onClick={() =>
                          handleMenuClose(
                            index === 1
                              ? setAnchorElCreate
                              : index === 2
                              ? setAnchorElLists
                              : setAnchorElOrder
                          )
                        }
                      >
                        <ListItemText primary={sub.text} />
                      </MenuItem>
                    ))}
                  </Menu>
                )}
              </Box>
            ))}
          </Box>

          {/* Mobile Hamburger */}
          <IconButton
            onClick={handleMobileMenuToggle}
            sx={{ display: { xs: 'flex', md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer Menu */}
      <Drawer
        anchor="right"
        open={mobileMenuOpen}
        onClose={handleMobileMenuToggle}
        PaperProps={{ sx: { width: 280 } }}
      >
        <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" fontWeight="bold">
            Admin Panel
          </Typography>
          <IconButton onClick={handleMobileMenuToggle}>
            <CloseIcon sx={{ color: 'white' }} />
          </IconButton>
        </Box>

        <List>
          {navItems.map((item, index) => (
            <React.Fragment key={index}>
              {item.divider && <Divider />}
              {item.link ? (
                <ListItem disablePadding>
                  <ListItemButton
                    component={Link}
                    to={item.link}
                    onClick={handleMobileMenuToggle}
                  >
                    <ListItemIcon>{item.icon}</ListItemIcon>
                    <ListItemText primary={item.title} />
                  </ListItemButton>
                </ListItem>
              ) : (
                <>
                  <ListItem disablePadding>
                    <ListItemButton>
                      <ListItemIcon>{item.icon}</ListItemIcon>
                      <ListItemText primary={item.title} />
                    </ListItemButton>
                  </ListItem>
                  {item.subItems?.map((sub, i) => (
                    <ListItem key={i} disablePadding sx={{ pl: 4 }}>
                      <ListItemButton
                        component={Link}
                        to={sub.link}
                        onClick={handleMobileMenuToggle}
                      >
                        <ListItemText primary={sub.text} />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </>
              )}
            </React.Fragment>
          ))}
        </List>
      </Drawer>

      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: '#f9fafb',
          minHeight: 'calc(100vh - 128px)', // Adjust if AdminHeader + Navbar total height changes
          pt: 4,
          pb: 6,
        }}
      >
        {children}
      </Box>
    </Box>
  );
}