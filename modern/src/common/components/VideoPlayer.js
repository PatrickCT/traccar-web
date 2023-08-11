import React from 'react';

const VideoPlayer = ({ videoSrc }) => (
  <video autoPlay muted loop playsInline>
    <source src={videoSrc} type="video/mp4" />
    Your browser does not support the video tag.
    <track src="captions_es.vtt" kind="captions" label="spanish_captions" />
  </video>
);

export default VideoPlayer;
