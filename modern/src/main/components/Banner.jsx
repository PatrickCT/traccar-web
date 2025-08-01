/* eslint-disable import/no-extraneous-dependencies */
import React from 'react';
import Marquee from 'react-fast-marquee';

const Banner = ({
  style = {}, autoFill = false, play = true, pauseOnHover = false, pauseOnClick = false, direction = 'left', speed = 50, delay = 0, loop = 0, gradient = false, gradientColor = 'white', gradientWidth = 200, onFinish = () => { }, onCycleComplete = null, children = null,
}) => (
  <Marquee
    style={{
      ...style, zIndex: 9999, position: 'absolute', top: '2rem', backgroundColor: 'white', width: '60vw', left: '20vw', fontSize: '25px',
    }}
    autoFill={autoFill}
    play={play}
    pauseOnHover={pauseOnHover}
    pauseOnClick={pauseOnClick}
    direction={direction}
    speed={speed}
    delay={delay}
    loop={loop}
    gradient={gradient}
    gradientColor={gradientColor}
    gradientWidth={gradientWidth}
    onFinish={onFinish}
    onCycleComplete={onCycleComplete}
  >
    {children}
  </Marquee>
);

export default Banner;
