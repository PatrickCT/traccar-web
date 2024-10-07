import React from 'react';
import { useSelector } from 'react-redux';
import {
  Container,
  Drawer, Paper, Table, TableBody, TableCell, TableHead, TableRow, Toolbar, Typography,
} from '@mui/material';
import { makeStyles } from '@mui/styles';

import { prefixString } from '../common/util/stringUtils';
import { useTranslation } from '../common/components/LocalizationProvider';
import PositionValue from '../common/components/PositionValue';
import { isMobile } from '../common/util/utils';

const useStyles = makeStyles(() => ({
  drawer: {
    position: 'absolute',
  },
  drawerMobile: {
  },
  toolbar: {
    width: isMobile() ? '100%' : '100%',
    minHeight: '30px',
  },
  title: {
    flexGrow: 1,
    color: 'white',

  },
  tableRow: {
    height: '10px', // Adjust the height of each row
  },
  tableCell: {
    padding: '2px',
    lineHeight: 1,
  },
}));

const PositionDrawer = ({ open, onClose }) => {
  const classes = useStyles();
  const t = useTranslation();

  const position = useSelector((state) => state.devices.selectedPosition);

  const deviceName = useSelector((state) => {
    if (position) {
      const device = state.devices.items[position.deviceId];
      if (device) {
        return device.name.substr(0, 80);
      }
    }
    return null;
  });

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      variant={isMobile() ? 'temporary' : 'permanent'}
      sx={{
        flexShrink: 1,
        '& .MuiDrawer-paper': isMobile() ? {
          boxSizing: 'border-box',
        } : {
          top: '50%',
          height: '50%',
          width: '20%',
          boxSizing: 'border-box',
        },
      }}
      className={isMobile() ? classes.drawerMobile : classes.drawer}
    // ModalProps={{
    //   keepMounted: true, // Better open performance on mobile.
    // }}
    >
      <Toolbar className={classes.toolbar} disableGutters>
        <Typography variant="h6" className={classes.title}>
          Unidad:
          &nbsp;
          {deviceName}

        </Typography>
      </Toolbar>
      <div className={classes.content}>
        <Container>
          <Paper>
            <Table style={{ height: 400, width: '100%' }}>
              <TableHead>
                <TableRow>
                  {/* <TableCell>{t('stateName')}</TableCell> */}
                  <TableCell style={{ lineHeight: 1, padding: 2 }}>{t('sharedName')}</TableCell>
                  <TableCell style={{ lineHeight: 1, padding: 2 }}>{t('stateValue')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {position && Object.getOwnPropertyNames(position).filter((it) => it !== 'attributes').map((property) => (
                  <TableRow key={property}>
                    {/* <TableCell>{property}</TableCell> */}
                    <TableCell style={{ lineHeight: 1, padding: 2 }}><strong>{t(prefixString('position', property))}</strong></TableCell>
                    <TableCell style={{ lineHeight: 1, padding: 2 }}><PositionValue position={position} property={property} /></TableCell>
                  </TableRow>
                ))}
                {position && Object.getOwnPropertyNames(position.attributes).map((attribute) => (
                  <TableRow key={attribute} className={classes.tableRow}>
                    {/* <TableCell>{attribute}</TableCell> */}
                    <TableCell style={{ lineHeight: 1, padding: 2 }}><strong>{t(prefixString('position', attribute)) || t(prefixString('device', attribute))}</strong></TableCell>
                    <TableCell style={{ lineHeight: 1, padding: 2 }}><PositionValue position={position} attribute={attribute} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </Container>
      </div>
    </Drawer>
  );
};

export default PositionDrawer;
