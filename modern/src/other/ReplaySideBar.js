import { useNavigate } from 'react-router-dom';
import {
  Box, IconButton, Paper, Slider, Toolbar, Typography,
} from '@mui/material';
import React, {
  memo, useState,
} from 'react';
import makeStyles from '@mui/styles/makeStyles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import TuneIcon from '@mui/icons-material/Tune';
import DownloadIcon from '@mui/icons-material/Download';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import FastForwardIcon from '@mui/icons-material/FastForward';
import FastRewindIcon from '@mui/icons-material/FastRewind';
import ReportFilter from '../reports/components/ReportFilter';
import { useTranslation } from '../common/components/LocalizationProvider';

const useStyles = makeStyles((theme) => ({
  root: {
    height: '100%',
  },
  sidebar: {
    display: 'flex',
    flexDirection: 'column',
    position: 'fixed',
    zIndex: 3,
    left: 0,
    top: 0,
    // margin: theme.spacing(1.5),
    // width: theme.dimensions.drawerWidthDesktop,
    margin: 0,
    width: '97.5%',
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

  // console.log(value, perc, marks);
  return (
    <Box
      sx={{
        width: '100%',
        margin: '16px',
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
  setExpanded, setIndex, setPlaying, handleDownload, handleChange, handleSubmit, changeSpeed, index, max, playing, expanded,
}) => {
  // console.log('ReplaySideBar');

  const [speed, setSpeed] = useState(500);
  const [value, setValue] = React.useState([50, 100]);

  const classes = useStyles({ values: value });
  const navigate = useNavigate();
  const t = useTranslation();

  return (
    <div className={classes.sidebar}>
      <Paper elevation={3} square>
        <Toolbar>
          <IconButton edge="start" sx={{ mr: 2 }} onClick={() => navigate(-1)}>
            <ArrowBackIcon style={{ color: 'white' }} />
          </IconButton>
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
            <Slider
              className={classes.slider}
              value={1001 - speed}
              onChange={(_, value) => setSpeed(1001 - value)}
              onChangeCommitted={(_, value) => changeSpeed(_, 1001 - value)}
              max={1001}
              step={1}
              valueLabelDisplay="auto"
              // marks={Array.from({ length: 1001 }, (_, index) => ({ value: 1000 - index }))}
              marks={null}
            />
            {/* <Slider
              className={classes.slider}
              classes={{ track: classes.track }}
              value={value}
              onChange={(_, value) => setValue(value)}
              onChangeCommitted={handleChange}
              max={200}
              step={1}
            /> */}
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
            />
          </>
        ) : (
          <ReportFilter handleSubmit={handleSubmit} fullScreen showOnly />
        )}
      </Paper>

    </div>
  );
};

export default memo(ReplaySideBar);
