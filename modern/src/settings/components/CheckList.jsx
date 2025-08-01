/* eslint-disable  arrow-body-style */
/* eslint-disable  no-unused-vars */
import { CheckBox } from '@mui/icons-material';
import { FormControlLabel, List, ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import React, { memo } from 'react';

const CheckList = memo(({ items, selected, handleSelect }) => {
  return (
    <List sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper', maxHeight: '70vh', overflowY: 'auto', minWidth: '-webkit-fill-available' }}>
      {items.map((item) => {
        const labelId = `checkbox-list-label-${item.id}`;
        return (
          <ListItem
            key={item.id}
            disablePadding
          >
            <FormControlLabel control={<CheckBox checked={false} />} label={item.name} />
          </ListItem>
        );
      })}
    </List>
  );
});

export default CheckList;
