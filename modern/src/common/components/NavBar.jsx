import React from 'react';
import {
  AppBar, Toolbar, Typography, IconButton,
  Box,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';

const Navbar = ({ children, setOpenDrawer, title, titleColor = 'black' }) => (
  <AppBar position="sticky" color="inherit">
    <Toolbar>
      {setOpenDrawer && (
        <IconButton
          color="inherit"
          edge="start"
          sx={{ mr: 2 }}
          onClick={() => setOpenDrawer(true)}
        >
          <MenuIcon />
        </IconButton>
      )}
      <Typography color={titleColor} variant="h6" noWrap>
        {title}
      </Typography>

      <Box sx={{ ml: 'auto' }}>{children}</Box>
    </Toolbar>
  </AppBar>
);

export default Navbar;
