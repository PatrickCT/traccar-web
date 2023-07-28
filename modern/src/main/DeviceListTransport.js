import React, { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import makeStyles from '@mui/styles/makeStyles';
import { FixedSizeList } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { devicesActions } from '../store';
import { useEffectAsync } from '../reactHelper';
import DeviceRowTransporte from './DeviceRowTransports';

const useStyles = makeStyles((theme) => ({
  list: {
    maxHeight: '100%',
  },
  listInner: {
    position: 'relative',
    margin: theme.spacing(1.5, 0),
  },
}));

const DeviceListTransport = ({ devices }) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const listInnerEl = useRef(null);

  if (listInnerEl.current) {
    listInnerEl.current.className = classes.listInner;
  }

  const [, setTime] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => setTime(Date.now()), 60000);
    return () => {
      clearInterval(interval);
    };
  }, []);

  useEffectAsync(async () => {
    const response = await fetch('/api/devices');
    if (response.ok) {
      dispatch(devicesActions.refresh(await response.json()));
    } else {
      throw Error(await response.text());
    }
  }, []);

  return (
    <AutoSizer onClick={() => dispatch(devicesActions.select(null))} className={classes.list}>
      {({ height, width }) => (
        <FixedSizeList
          width={width}
          height={height}
          itemCount={devices.length}
          itemData={devices}
          itemSize={72}
          overscanCount={10}
          innerRef={listInnerEl}
          position="relative"
        >
          {DeviceRowTransporte}
        </FixedSizeList>
      )}
    </AutoSizer>
  );
};

export default DeviceListTransport;
