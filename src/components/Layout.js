"use client";

import { useState } from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
  Avatar,
  Divider,
  CssBaseline,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import DashboardIcon from "@mui/icons-material/Dashboard";
import LogoutIcon from "@mui/icons-material/Logout";
import CampaignIcon from '@mui/icons-material/Campaign';
import PeopleIcon from '@mui/icons-material/People';
import NotificationsIcon from "@mui/icons-material/Notifications";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";

const drawerWidth = 240;

export default function Layout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(true); // Control de la barra lateral
  const router = useRouter();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  const handleLogout = () => {
    signOut({ callbackUrl: "/login" }); // Cierra sesión y redirige al login
  };
  

  const drawer = (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        bgcolor: "#1A202C",
        color: "#fff",
      }}
    >
      <Toolbar>
        <Avatar
          src="https://trasplantecapilar.pe/wp-content/uploads/2024/09/logo-ifc.jpg"
          alt="Usuario"
          sx={{ width: 60, height: 60, mx: "auto" }}
        />
      </Toolbar>
      <Divider sx={{ bgcolor: "#2D3748" }} />
      <List>
        <ListItem
          button="true"
          onClick={() => router.push("/dashboard")}
          sx={{
            "&:hover": { bgcolor: "#2D3748" },
            px: 3,
            py: 1.5,
          }}
        >
          <ListItemIcon sx={{ color: "#fff" }}>
            <DashboardIcon />
          </ListItemIcon>
          <ListItemText primary="Dashboard" />
        </ListItem>
        {/*
        <ListItem
          button="true"
          onClick={() => router.push("/settings")}
          sx={{
            "&:hover": { bgcolor: "#2D3748" },
            px: 3,
            py: 1.5,
          }}
        >
          <ListItemIcon sx={{ color: "#fff" }}>
            <SettingsIcon />
          </ListItemIcon>
          <ListItemText primary="Configuración" />
        </ListItem>
          */}
        <ListItem
          button="true"
          onClick={() => router.push("/campaigns")}
          sx={{
            "&:hover": { bgcolor: "#2D3748" },
            px: 3,
            py: 1.5,
          }}
        >
          <ListItemIcon sx={{ color: "#fff" }}>
            <CampaignIcon />
          </ListItemIcon>
          <ListItemText primary="Campañas" />
        </ListItem>
        <ListItem
          button="true"
          onClick={() => router.push("/clientes")}
          sx={{
            "&:hover": { bgcolor: "#2D3748" },
            px: 3,
            py: 1.5,
          }}
        >
          <ListItemIcon sx={{ color: "#fff" }}>
            <PeopleIcon />
          </ListItemIcon>
          <ListItemText primary="Clientes" />
        </ListItem>
      </List>
      <Divider sx={{ bgcolor: "#2D3748" }} />
      <List>
        <ListItem
          button="true"
          onClick={handleLogout}
          sx={{
            "&:hover": { bgcolor: "#E53E3E" },
            px: 3,
            py: 1.5,
          }}
        >
          <ListItemIcon sx={{ color: "#fff" }}>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary="Cerrar Sesión" />
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", height: "auto" }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          bgcolor: "#2C5282",
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={toggleDrawer}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ flexGrow: 1, fontWeight: "bold" }}
          >
            IFC 
          </Typography>
          <IconButton color="inherit" sx={{ mr: 2 }}>
            <NotificationsIcon />
          </IconButton>
          <Avatar alt="Usuario" src="https://trasplantecapilar.pe/wp-content/uploads/2024/09/logo-ifc.jpg" />
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{
          width: isDrawerOpen ? drawerWidth : 0,
          flexShrink: 0,
          transition: "width 0.3s",
        }}
        aria-label="menu"
      >
        <Drawer
          variant="permanent"
          open={isDrawerOpen}
          sx={{
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: isDrawerOpen ? drawerWidth : 0,
              overflowX: "hidden",
              transition: "width 0.3s",
            },
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
          transition: "margin-left 0.3s",
          bgcolor: "#F7FAFC",
          height: "100%"
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}
