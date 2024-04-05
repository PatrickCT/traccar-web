import React, { useState } from 'react';
import {
  AppBar,
  Breadcrumbs,
  Divider,
  Drawer,
  IconButton,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MenuIcon from '@mui/icons-material/Menu';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from './LocalizationProvider';

const useStyles = makeStyles((theme) => ({
  desktopRoot: {
    height: '100%',
    display: 'flex',
  },
  mobileRoot: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  desktopDrawer: {
    width: theme.dimensions.drawerWidthDesktop,
  },
  mobileDrawer: {
    width: theme.dimensions.drawerWidthTablet,
  },
  mobileToolbar: {
    zIndex: 1,
  },
  content: {
    flexGrow: 1,
    alignItems: 'stretch',
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto',
  },
}));

export const PageTitle = ({ breadcrumbs }) => {
  const theme = useTheme();
  const t = useTranslation();

  const desktop = useMediaQuery(theme.breakpoints.up('md'));

  if (desktop) {
    return (
      <Typography color="white" variant="h6" noWrap>{t(breadcrumbs[0])}</Typography>
    );
  }
  return (
    <Breadcrumbs style={{ color: 'white' }}>
      {breadcrumbs.slice(0, -1).map((breadcrumb) => (
        <Typography variant="h6" color="white" key={breadcrumb}>{t(breadcrumb) || breadcrumb}</Typography>
      ))}
      <Typography variant="h6" color="white">{t(breadcrumbs[breadcrumbs.length - 1]) || breadcrumbs[breadcrumbs.length - 1]}</Typography>
    </Breadcrumbs>
  );
};

const PageLayout = ({ menu, breadcrumbs, children }) => {
  const classes = useStyles();
  const theme = useTheme();
  const navigate = useNavigate();

  const desktop = useMediaQuery(theme.breakpoints.up('md'));

  const [openDrawer, setOpenDrawer] = useState(false);

  return desktop ? (
    <div className={classes.desktopRoot}>
      {menu ? (
        <Drawer
          variant="permanent"
          className={classes.desktopDrawer}
          classes={{ paper: classes.desktopDrawer }}
        >
          <Toolbar>
            <IconButton color="inherit" edge="start" sx={{ mr: 2 }} onClick={() => navigate('/')}>
              <ArrowBackIcon style={{ color: 'white' }} />
            </IconButton>
            <PageTitle breadcrumbs={breadcrumbs} />
          </Toolbar>
          <Divider />
          {menu}
        </Drawer>
      ) : (<div />)}

      <div className={classes.content}>{children}</div>
    </div>
  ) : (
    <div className={classes.mobileRoot}>
      {menu ? (
        <Drawer
          variant="temporary"
          open={openDrawer}
          onClose={() => setOpenDrawer(false)}
          classes={{ paper: classes.mobileDrawer }}
        >
          {menu}
        </Drawer>
      ) : (<div />)}
      {menu ? (
        <AppBar className={classes.mobileToolbar} position="static" color="inherit">
          <Toolbar>
            <IconButton color="inherit" edge="start" sx={{ mr: 2 }} onClick={() => setOpenDrawer(true)}>
              <MenuIcon style={{ color: 'white' }} />
            </IconButton>
            <PageTitle breadcrumbs={breadcrumbs} />
          </Toolbar>
        </AppBar>
      ) : (<div />)}

      <div className={classes.content}>{children}</div>
    </div>
  );
};

export default PageLayout;
