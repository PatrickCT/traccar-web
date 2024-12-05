/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import React, { useRef, useState } from 'react';
import './ExpandableCard.css';
import {
  Button, Card, CardActions, CardContent, CardHeader, IconButton,
} from '@mui/material';
import { Close } from '@mui/icons-material';

const ExpandableCard = ({ content, children, onSave }) => {
  const cardRef = useRef(null);
  const [isAnimated, setIsAnimated] = useState(false);

  const clearAnimation = (event) => {
    event.target.classList.remove('animate');
    event.target.removeEventListener('transitionend', clearAnimation);
  };

  const animateCard = () => {
    const card = cardRef.current;

    // FIRST
    const first = card.getBoundingClientRect();
    const backColor = window.getComputedStyle(card).backgroundColor;

    // Toggle animation class
    setIsAnimated((prev) => !prev);

    // LAST
    const last = card.getBoundingClientRect();

    // INVERT
    const invert = {
      x: first.left - last.left,
      y: first.top - last.top,
      sx: first.width / last.width,
      sy: first.height / last.height,
    };

    // Apply transformation for animation
    card.style.transform = `translate(${invert.x}px, ${invert.y}px) scale(${invert.sx}, ${invert.sy})`;
    card.style.backgroundColor = backColor;

    // PLAY
    requestAnimationFrame(() => {
      card.classList.add('animate');
      card.style.transform = '';
      card.style.backgroundColor = '';
      card.addEventListener('transitionend', clearAnimation);
    });
  };

  return (
    <div
      ref={cardRef}
      className={`card ${isAnimated ? 'animated' : ''}`}
      onClick={isAnimated ? (() => { }) : animateCard}
    >
      {isAnimated ? (
        <Card>
          <CardHeader
            action={
              (
                <IconButton
                  size="large"
                  onClick={animateCard}
                >
                  <Close />
                </IconButton>
              )
            }

          />
          <CardContent>
            {children}
          </CardContent>
          <CardActions
            disableSpacing
            sx={{
              alignSelf: 'stretch',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'flex-end',
              // 👇 Edit padding to further adjust position
              p: 1,
            }}
          >
            <Button
              variant="contained"
              onClick={() => {
                animateCard();
                onSave();
              }}
              size="large"
            >
              Terminar encuesta
            </Button>
          </CardActions>
        </Card>
      ) : content}
    </div>
  );
};

export default ExpandableCard;
