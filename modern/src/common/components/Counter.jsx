import React, { useState } from 'react';

import useAnimationFrame from './useAnimationFrame';
import useInterpolation from './useInterpolation';

const Counter = () => {
  const [time, setTime] = useState(0);
  // 1s of interpolation time
  const [fps, setFps] = useInterpolation(1000);
  useAnimationFrame((e) => {
    setFps(1 / e.delta);
    setTime(e.time);
  }, []);
  return (
    <div style={{ position: 'fixed', right: 50, zIndex: 9 }}>
      {time.toFixed(1)}
      s
      <br />
      {fps && Math.floor(fps.value)}
      FPS
    </div>
  );
};

export default Counter;
