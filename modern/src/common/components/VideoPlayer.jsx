import React from 'react';

const VideoPlayer = ({ videoSrc, controls = false, styled = false }) => (
  <video style={styled ? { width: '100%', height: '75vh' } : {}} autoPlay muted loop playsInline controls={controls}>
    <source src={videoSrc} type="video/mp4" />
    Your browser does not support the video tag.
    <track src="captions_es.vtt" kind="captions" label="spanish_captions" />
  </video>
);

export default VideoPlayer;
