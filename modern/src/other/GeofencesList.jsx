import {
  Divider, InputAdornment, List, ListItemButton, ListItemText,
  ListSubheader,
  TextField,
  Tooltip,
} from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import React, {
  Fragment, useEffect, useRef, useState,
} from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { SearchOutlined } from '@mui/icons-material';
import { useCatchCallback } from '../reactHelper';
import CollectionActions from '../settings/components/CollectionActions';
import { geofencesActions } from '../store';

const useStyles = makeStyles(() => ({
  list: {
    maxHeight: '100%',
    overflow: 'auto',
  },
  icon: {
    width: '25px',
    height: '25px',
    filter: 'brightness(0) invert(1)',
  },
}));

const GeofencesList = ({ onGeofenceSelected }) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const debounceDelay = 300;
  const inputRef = useRef(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  const items = useSelector((state) => state.geofences.items);

  const refreshGeofences = useCatchCallback(async () => {
    const response = await fetch('/api/geofences');
    if (response.ok) {
      dispatch(geofencesActions.refresh(await response.json()));
    } else {
      throw Error(await response.text());
    }
  }, [dispatch]);

  // Debounce the search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, debounceDelay); // Adjust the delay as needed

    // Cleanup the timeout if the component unmounts or the query changes
    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  // Effect to focus the input field
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [debouncedQuery]);

  const filteredOptions = Object.values(items).filter((option) => (option && option.name.toLowerCase().includes(debouncedQuery.toLowerCase())));

  return (
    <List className={classes.list}>
      <ListSubheader>
        <TextField
          size="small"
          autoFocus
          placeholder="Buscar"
          fullWidth
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchOutlined />
              </InputAdornment>
            ),
          }}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key !== 'Escape') {
              e.stopPropagation();
            }
          }}
          value={searchQuery}
          inputRef={inputRef} // Add the ref here
        />
      </ListSubheader>
      {filteredOptions.map((item, index, list) => (
        <Fragment key={item.id}>
          <ListItemButton key={item.id} onClick={() => onGeofenceSelected(item.id)}>
            <ListItemText primary={`${item.id} - ${item.name}`} />
            {item.attributes.groupChange && (<Tooltip title="Cambio de grupo"><span style={{ color: 'red', fontSize: '20px' }}>&#8633;</span></Tooltip>)}
            {item.restricted && (
              <Tooltip title={item.allowed ? 'Parada permitida' : 'Parada no permitida'}>
                <span style={{ fontSize: '16px' }}>
                  {item.allowed ? '✅' : '❌'}
                </span>
              </Tooltip>
            )}

            <CollectionActions itemId={item.id} editPath="/settings/geofence" endpoint="geofences" setTimestamp={refreshGeofences} />
          </ListItemButton>
          {index < list.length - 1 ? <Divider /> : null}
        </Fragment>
      ))}
    </List>
  );
};

export default GeofencesList;
