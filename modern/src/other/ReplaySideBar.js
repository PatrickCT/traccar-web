/* eslint-disable no-restricted-globals */
/* eslint-disable no-unused-vars */
/* eslint-disable prefer-rest-params */
/* eslint-disable react/no-this-in-sfc */
import { Popup } from 'maplibre-gl';
import { useNavigate } from 'react-router-dom';
import {
  Box, Button, IconButton, ListItemText, MenuItem, Paper, Select, Slider, Toolbar, Typography, useMediaQuery, useTheme, ListItemButton, ListItemIcon,
  Menu,
} from '@mui/material';
import React, {
  memo, useEffect, useState,
} from 'react';
import makeStyles from '@mui/styles/makeStyles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MenuIcon from '@mui/icons-material/Menu';
import TuneIcon from '@mui/icons-material/Tune';
import DownloadIcon from '@mui/icons-material/Download';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import FastForwardIcon from '@mui/icons-material/FastForward';
import FastRewindIcon from '@mui/icons-material/FastRewind';
import { KeyboardArrowDownOutlined } from '@mui/icons-material';
import ReportFilter from '../reports/components/ReportFilter';
import { useTranslation } from '../common/components/LocalizationProvider';
import Modal from '../main/components/BasicModal';

import { createPopUpSimple, streetView } from '../common/util/mapPopup';
import { dateDifference } from '../common/util/utils';

const useStyles = makeStyles((theme) => ({
  root: {
    height: '100%',
  },
  sidebar: {
    display: 'flex',
    flexDirection: 'column',
    position: 'fixed',
    zIndex: 3,
    // left: 0,
    top: 0,
    margin: theme.spacing(1.5),
    width: theme.dimensions.drawerWidthDesktop,

    [theme.breakpoints.down('md')]: {
      width: '88%',
      margin: 0,
    },
  },
  title: {
    flexGrow: 1,
    color: 'white',
  },
  slider: {
    width: '100%',
  },
  controls: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  row: {
    display: 'flex',
    justifyContent: 'start',
    alignItems: 'center',
  },
  formControlLabel: {
    height: '100%',
    width: '100%',
    paddingRight: theme.spacing(1),
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    padding: '1px',
    paddingLeft: '20px',
    paddingRight: '20px',
    width: '100%',
    [theme.breakpoints.down('md')]: {
      margin: theme.spacing(2),
      position: 'fixed',
      width: '90%',
      bottom: '8%',
    },
    [theme.breakpoints.up('md')]: {
      // marginTop: theme.spacing(1),
    },
    lineHeight: '1px',
    backgroundColor: 'transparent',
    '&:hover': {
      backgroundColor: 'white',
    },
  },
  track: ({ values }) => ({
    height: 4, // Customize track height
    borderRadius: 2, // Customize track border radius
    background: `linear-gradient(to right,
      green 0%,
      green ${(values[0] / 200) * 100}%,
      orange ${(values[1] / 200) * 100}%,
      red 100%)`, // Define gradient colors based on current slider values
  }),
}));

const DiscreteSlider = (props) => {
  const {
    entityName,
    reverse,
    values,
    setValues,
    min,
    max,
    thresholdMarks,
    thresholdMarksTitles,
    style,
    ...rest
  } = props;

  const [value, setValue] = useState(
    reverse ? values.map((val) => -val) : values,
  );
  const [marks, setMarks] = useState(
    reverse ? thresholdMarks.map((val) => -val) : thresholdMarks,
  );
  const [perc, setPerc] = useState(
    reverse
      ? values.map((val) => parseInt((1 - Math.abs(val / max)) * 100, 10))
      : values.map((val) => (val / max) * 100),
  );

  const onChange = (e, tValues) => {
    const [minVal, maxVal] = tValues;
    if (maxVal > minVal && maxVal !== minVal) {
      setValue(tValues);
      setValues(tValues);
      if (!reverse) {
        setMarks([
          parseInt((min + minVal) / 2, 10),
          parseInt((minVal + maxVal) / 2, 10),
          parseInt((maxVal + max) / 2, 10),
        ]);
        setPerc(tValues.map((val) => (val / max) * 100));
      } else {
        setMarks([
          parseInt((-max + minVal) / 2, 10),
          parseInt((minVal + maxVal) / 2, 10),
          parseInt((maxVal + -min) / 2, 10),
        ]);
        setPerc(
          tValues.map((val) => parseInt((1 - Math.abs(val / max)) * 100, 10)),
        );
      }
    }
  };

  return (
    <Box
      sx={{
        width: '100%',
        margin: '0px',
      }}
    >
      <Typography
        id="discrete-slider"
        gutterBottom
        sx={{
          marginBottom: '40px',
        }}
      >
        {entityName}
      </Typography>
      <Slider
        sx={{
          '& .MuiSlider-track': {
            background: 'orange',
            borderColor: 'white',
          },
          '& .MuiSlider-thumb': {
            [`&:nth-of-type(${1}n)`]: {
              background: '#036104',
              '& span': {
                background: '#036104',
              },
            },
            [`&:nth-of-type(${2}n)`]: {
              background: 'red',
              '& span': {
                background: 'red',
              },
            },
          },
          '& .MuiSlider-mark': {
            background: 'none',
          },
          '& .MuiSlider-markLabel': {
            background: 'none',
          },
          '& .MuiSlider-rail': {
            opacity: 1,
            background: `linear-gradient(to right, #036104 0% ${perc[0]}%, orange ${perc[0]}% ${perc[1]}%, red ${perc[1]}% 100%)`,
          },
          '& .MuiSlider-valueLabel': {},
          ...style,
        }}
        valueLabelDisplay="on"
        valueLabelFormat={(x) => `< ${x}`}
        value={value}
        min={reverse ? -max : min}
        max={reverse ? -min : max}
        scale={(x) => (reverse ? -x : x)}
        marks={[
          { value: reverse ? -max : min, label: reverse ? max : min },
          ...marks.map((val, idx) => ({
            value: val,
            label: thresholdMarksTitles[idx],
          })),
          { value: reverse ? -min : max, label: reverse ? min : max },
        ]}
        onChange={onChange}
        // disabled
        {...rest}
      />
    </Box>
  );
};

const ReplaySideBar = ({
  setExpanded, setIndex, setPlaying, handleDownload, handleChange, handleSubmit, changeSpeed, index, max, playing, expanded, stops,
}) => {
  const [speed, setSpeed] = useState(500);
  const [value, setValue] = React.useState([50, 100]);
  const [showModalSpeed, setShowModalSpeed] = useState(false);
  const [showBack, setShowBack] = useState(true);
  const [open, setOpen] = useState(false);

  const [anchorMenu, setAnchorMenu] = React.useState(null);
  const openMenu = Boolean(anchorMenu);
  const handleClick = (event) => {
    setAnchorMenu(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorMenu(null);
  };

  const classes = useStyles({ values: value });
  const navigate = useNavigate();
  const t = useTranslation();
  const theme = useTheme();
  const desktop = useMediaQuery(theme.breakpoints.up('md'));

  useEffect(() => {
    window.streetView = streetView;
    setTimeout(() => setShowBack(document.querySelectorAll('[data-testid="ArrowBackIcon"]').length <= 1), 10);
  }, []);

  return (
    <div className={classes.sidebar}>
      <Paper elevation={3} square>
        <Toolbar>
          {showBack && (
            <IconButton edge="start" sx={{ mr: 2 }} onClick={() => navigate(-1)}>
              <ArrowBackIcon style={{ color: 'white' }} />
            </IconButton>
          )}
          {!desktop && !location.href.includes('replay') && (
            <IconButton color="inherit" edge="start" sx={{ mr: 2 }} onClick={() => window.openDrawer(true)}>
              <MenuIcon style={{ color: 'white' }} />
            </IconButton>
          )}

          <Typography variant="h6" className={classes.title}>{t('reportReplay')}</Typography>
          {!expanded && (
            <>
              <IconButton onClick={handleDownload}>
                <DownloadIcon style={{ color: 'white' }} />
              </IconButton>
              <IconButton edge="end" onClick={() => setExpanded(true)}>
                <TuneIcon style={{ color: 'white' }} />
              </IconButton>
            </>
          )}
        </Toolbar>
      </Paper>

      <Paper className={classes.content} square>
        {!expanded ? (
          <>
            <div className={classes.controls}>
              <div style={{ width: '95%', marginRight: '20px' }}>
                <Slider
                  className={classes.slider}
                  max={max - 1}
                  step={1}
                  marks={null}
                  value={index}
                  onChange={(_, index) => setIndex(_, index)}

                />
                <div className={classes.controls}>
                  {/* {`${index + 1}/${positions.length}`} */}
                  <IconButton onClick={() => setIndex(null, (index) => index - 1)} disabled={playing || index <= 0}>
                    <FastRewindIcon />
                  </IconButton>
                  <IconButton onClick={() => setPlaying(!playing)} disabled={index >= max - 1}>
                    {playing ? <PauseIcon /> : <PlayArrowIcon />}
                  </IconButton>
                  <IconButton onClick={() => setIndex(null, (index) => index + 1)} disabled={playing || index >= max - 1}>
                    <FastForwardIcon />
                  </IconButton>
                  {/* {formatTime(positions[index].fixTime, 'seconds', hours12)} */}
                </div>
              </div>
              <Select
                defaultValue={1000 - speed}
                value={1000 - speed}
                onChange={
                  (e) => {
                    setSpeed(1000 - e.target.value);
                    changeSpeed(null, 1000 - e.target.value);
                  }
                }
              >
                <MenuItem value={500}>1X</MenuItem>
                <MenuItem value={650}>2X</MenuItem>
                <MenuItem value={800}>4X</MenuItem>
                <MenuItem value={1000}>8X</MenuItem>
              </Select>
            </div>

            {!desktop && (
              <div className={classes.controls}>
                <div style={{ width: '75%', marginRight: '20px' }}>
                  <DiscreteSlider
                    reverse={false}
                    step={1}
                    values={value}
                    min={1}
                    max={200}
                    thresholdMarks={[value[0] / 2, value[1] / 2, 200 / 2]}
                    thresholdMarksTitles={['Normal', 'Rapido', 'Exceso']}
                    setValues={setValue}
                    onChangeCommitted={handleChange}
                    valueLabelDisplay={desktop ? 'on' : 'auto'}
                  />
                </div>
                <div>
                  <Button
                    id="basic-button"
                    aria-controls={openMenu ? 'basic-menu' : undefined}
                    aria-haspopup="true"
                    aria-expanded={openMenu ? 'true' : undefined}
                    onClick={handleClick}
                  >
                    Paradas
                  </Button>
                  <Menu
                    id="basic-menu"
                    anchorEl={anchorMenu}
                    open={openMenu}
                    onClose={handleClose}
                    MenuListProps={{
                      'aria-labelledby': 'basic-button',
                    }}
                  >
                    {openMenu &&
                      stops.map((item) => (
                        <MenuItem onClick={() => {
                          Array.from(document.getElementsByClassName('maplibregl-popup')).map((item) => item.remove());
                          new Popup({ closeOnClick: true, closeButton: false })
                            .setMaxWidth('400px')
                            .setOffset(40)
                            .setHTML(createPopUpSimple(item))
                            .setLngLat([item.longitude, item.latitude])
                            .addTo(window.map);
                        }}
                        >
                          {dateDifference(new Date(), new Date(), ['hours', 'minutes'], item.duration)}
                        </MenuItem>
                      ))}
                  </Menu>
                </div>
              </div>
            )}
          </>
        ) : (
          <ReportFilter handleSubmit={handleSubmit} fullScreen showOnly />
        )}
      </Paper>

      {!expanded && desktop && (
        <Paper className={classes.content} square>
          <Box>
            <div style={{ marginTop: '20px' }} className={classes.row}>
              <div style={{ width: '20px', height: '20px', backgroundColor: 'green', marginRight: '20px' }} />
              {`0 - ${value[0]} Km/h`}
            </div>
            <div style={{ marginTop: '20px' }} className={classes.row}>
              <div style={{ width: '20px', height: '20px', backgroundColor: 'orange', marginRight: '20px' }} />
              {`${value[0]} - ${value[1]} Km/h`}
            </div>
            <div style={{ marginTop: '20px' }} className={classes.row}>
              <div style={{ width: '20px', height: '20px', backgroundColor: 'red', marginRight: '20px' }} />
              {`${value[1]} - 200 Km/h`}
            </div>
            <div style={{ marginTop: '20px' }} className={classes.row}>
              <div style={{ width: '20px', height: '20px', backgroundColor: 'transparent', marginRight: '80%' }} />
              <Button onClick={() => setShowModalSpeed(true)}>Cambiar</Button>
            </div>
          </Box>
        </Paper>
      )}

      {!expanded && desktop && (
        <Paper className={classes.content} square>
          <Box
            sx={[
              open
                ? {
                  bgcolor: 'rgba(255, 255, 255, 1)',
                }
                : {
                  bgcolor: null,
                },
              open
                ? {
                  pb: 2,
                }
                : {
                  pb: 0,
                },
            ]}
          >
            <ListItemButton
              alignItems="flex-start"
              onClick={() => setOpen(!open)}
              sx={[
                {
                  px: 3,
                  pt: 2.5,
                },
                open
                  ? {
                    pb: 0,
                  }
                  : {
                    pb: 2.5,
                  },
                open
                  ? {
                    '&:hover, &:focus': {
                      '& svg': {
                        opacity: 1,
                      },
                    },
                  }
                  : {
                    '&:hover, &:focus': {
                      '& svg': {
                        opacity: 1,
                      },
                    },
                  },
              ]}
            >
              <ListItemText
                primary="Paradas"
                primaryTypographyProps={{
                  fontSize: 15,
                  fontWeight: 'medium',
                  lineHeight: '20px',
                  mb: '2px',
                }}
                sx={{ my: 0 }}
              />
              <KeyboardArrowDownOutlined
                sx={[
                  {
                    mr: -1,
                    opacity: 0,
                    transition: '0.2s',
                  },
                  open
                    ? {
                      transform: 'rotate(-180deg)',
                    }
                    : {
                      transform: 'rotate(0)',
                    },
                ]}
              />
            </ListItemButton>
            {open && desktop &&
              stops.map((item) => (
                <ListItemButton
                  key={item.positionId}
                  sx={{ py: 0, minHeight: 32, color: 'black' }}
                  onClick={(() => {
                    Array.from(document.getElementsByClassName('maplibregl-popup')).map((item) => item.remove());
                    new Popup({ closeOnClick: true, closeButton: false })
                      .setMaxWidth('400px')
                      .setOffset(40)
                      .setHTML(createPopUpSimple(item))
                      .setLngLat([item.longitude, item.latitude])
                      .addTo(window.map);
                  })}
                >
                  <ListItemIcon sx={{ color: 'inherit' }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={dateDifference(new Date(), new Date(), ['hours', 'minutes'], item.duration)}
                    primaryTypographyProps={{ fontSize: 14, fontWeight: 'medium' }}
                  />
                </ListItemButton>
              ))}
          </Box>
        </Paper>
      )}

      <Modal style={{ height: 'auto' }} isOpen={showModalSpeed} onClose={() => setShowModalSpeed(false)}>
        <DiscreteSlider
          reverse={false}
          step={1}
          values={value}
          min={1}
          max={200}
          thresholdMarks={[value[0] / 2, value[1] / 2, 200 / 2]}
          thresholdMarksTitles={['Normal', 'Rapido', 'Exceso']}
          setValues={setValue}
          onChangeCommitted={handleChange}
          valueLabelDisplay={desktop ? 'on' : 'auto'}
        />
      </Modal>
    </div>
  );
};

export default memo(ReplaySideBar);
