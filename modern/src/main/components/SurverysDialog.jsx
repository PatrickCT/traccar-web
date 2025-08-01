/* eslint-disable no-underscore-dangle */
import React, {
  forwardRef, memo, useEffect, useState,
} from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import ListItemText from '@mui/material/ListItemText';
import ListItemButton from '@mui/material/ListItemButton';
import List from '@mui/material/List';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CloseIcon from '@mui/icons-material/Close';
import Slide from '@mui/material/Slide';
import { useSelector } from 'react-redux';
import { PollOutlined } from '@mui/icons-material';
import {
  Badge, Card, CardContent, FormControl, FormControlLabel, FormLabel, Radio, RadioGroup, TextField,
} from '@mui/material';
import { isMobile } from '../../common/util/utils';
import ExpandableCard from './ExpandableCard';

const Transition = forwardRef((props, ref) => (<Slide direction="up" ref={ref} {...props} />));

const SurveysDialog = memo(() => {
  const user = useSelector((state) => state.session.user);

  const [open, setOpen] = useState(false);
  const [surveys, setSurveys] = useState([]);
  const [answers, setAnswers] = useState(null);
  const [surveyId, setSurveyId] = useState(null);

  const getAnswer = (question, survey) => {
    try {
      if (!question || !survey) return null;
      return survey?.Forms[0]?.Answers?.find((a) => a.question === question) || null;
    } catch (error) {
      return null;
    }
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setAnswers(null);
    setOpen(false);
  };

  const loadSurveys = async () => {
    setSurveys([]);
    // fetch('http://localhost:4000/api/external/surveys/traccar', {
    fetch('https://crmgpstracker.mx:4040/api/external/surveys/traccar', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json', // Ensure Content-Type is set to JSON
      },
      body: JSON.stringify({
        origin: window.location.hostname,
        gpsid: user.id,
        main: user.principal,
      }),
    })
      .then((response) => response.json())
      .then((result) => {
        setSurveys(result.data);
      });
  };

  // Function to handle answer updates with a fresh copy of selectedSurvey
  const handleAnswerChange = (questionId, newValue, isOption) => {
    const _answers = [...answers];
    // Clone selectedSurvey to create a new reference
    _answers.find((a) => a.question === questionId)[isOption ? 'option' : 'answer'] = newValue;

    setAnswers(_answers);
  };

  const saveAnswers = async () => {
    await fetch('https://crmgpstracker.mx:4040/api/external/surveys/traccar/answer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json', // Ensure Content-Type is set to JSON
      },
      body: JSON.stringify({
        campaign: surveyId,
        user: 0,
        client: null,
        gpsid: user.id,
        main: user.main ? null : user.principal,
        answers,
        origin: window.location.hostname,
      }),
    });
    await loadSurveys();
  };

  const cloneAnswers = (survey) => {
    setSurveyId(survey.id);
    setAnswers([]);

    const _answers = [];

    _answers.push(...survey.Questions.map((q) => ({
      question: q.id,
      option: getAnswer(q.id, survey)?.option || null,
      answer: getAnswer(q.id, survey)?.answer || null,
    })));

    setAnswers(_answers);
  };

  useEffect(() => {
    async function load() {
      await loadSurveys();
    }
    load();
  }, []);

  useEffect(() => {
    setOpen(surveys.filter((s) => s.completion < 90).length > 0);
  }, [surveys]);

  return (
    <>
      {surveys.filter((s) => s.completion < 90).length > 0 && (
        <Button
          id="btn-surveys"
          style={{ position: 'absolute', right: '1vw', bottom: (isMobile() ? '12vh' : '8vh'), minWidth: 0 }}
          variant="outlined"
          size="small"
          onClick={handleClickOpen}
        >
          <Badge
            badgeContent={surveys.filter((s) => s.completion < 90).length}
            color="primary"
          >
            <PollOutlined />
          </Badge>
        </Button>
      )}
      <Dialog
        fullScreen
        open={open}
        onClose={handleClose}
        TransitionComponent={Transition}
      >
        <AppBar position="fixed" color="primary" sx={{ top: 'auto', ...(isMobile() ? { bottom: 0 } : {}) }}>
          <Toolbar>
            {!isMobile() && (
              <IconButton
                edge="start"
                color="primary"
                onClick={handleClose}
                aria-label="close"
              >
                <CloseIcon style={{ color: 'white' }} />
              </IconButton>
            )}
            <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
              Encuestas
            </Typography>
            {isMobile() && (
              <IconButton
                edge="start"
                color="primary"
                onClick={handleClose}
                aria-label="close"
              >
                <CloseIcon style={{ color: 'white' }} />
              </IconButton>
            )}
          </Toolbar>
        </AppBar>
        <List>
          {!isMobile() && (
            <div key="sep1" style={{ height: '8vh' }} />
          )}
          {surveys.map((survey) => (
            <React.Fragment key={`frag-${survey.id}`}>
              <ExpandableCard
                key={survey.id}
                onSave={() => {
                  saveAnswers();
                }}
                content={(
                  <Card key={`c-${survey.id}`}>
                    <CardContent key={`cc-${survey.id}`}>
                      <ListItemButton
                        key={`lib-${survey.id}`}
                        onClick={() => {
                          cloneAnswers(survey);
                        }}
                      >
                        <ListItemText
                          key={`lit-${survey.id}`}
                          primary={survey.name}
                          secondary="Click para abrir"
                        />
                      </ListItemButton>
                    </CardContent>
                  </Card>
                )}
              >
                {survey.Questions.map((question) => (
                  <React.Fragment key={`question-frag-${question.id}`}>
                    {question.Options.length > 0 ? (
                      <FormControl key={`fc-${question.id}`}>
                        <FormLabel key={`fl-${question.id}`} id={`row-${question.id}`}>
                          {question.question}
                        </FormLabel>
                        <RadioGroup
                          key={`rg-${question.id}`}
                          row
                          value={answers?.find((a) => a.question === question.id)?.option}
                        >
                          {question.Options.map((option) => (
                            <FormControlLabel
                              key={`fcl-${question.id}-${option.id}`}
                              value={option.id}
                              control={<Radio disabled={(getAnswer(question.id, survey)?.option || null) !== null} />}
                              label={`${option.option}`}
                              onChange={(evt) => handleAnswerChange(question.id, evt.target.value, true)}
                            />
                          ))}
                        </RadioGroup>
                      </FormControl>
                    ) : (
                      <TextField
                        key={`tf-${question.id}`}
                        fullWidth
                        label={question.question}
                        id={question.id}
                        value={answers?.find((a) => a.question === question.id)?.answer || ''}
                        onChange={(evt) => handleAnswerChange(question.id, evt.target.value, false)}
                        disabled={(getAnswer(question.id, survey)?.answer || null) !== null}
                      />
                    )}
                    <div key={`space-${question.id}`} style={{ height: '2vh' }} />
                  </React.Fragment>
                ))}
              </ExpandableCard>
              <div key={`lastspace-${survey.id}`} style={{ height: '2vh' }} />
            </React.Fragment>
          ))}
          {isMobile() && (
            <div key="sep2" style={{ height: '8vh' }} />
          )}
        </List>
      </Dialog>
    </>
  );
});

export default SurveysDialog;
