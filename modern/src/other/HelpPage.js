import React, { useState } from 'react';
import {
  AppBar, Button, IconButton, Toolbar,
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import VideoModal from '../common/components/VideoModal';
import { useTranslation } from '../common/components/LocalizationProvider';

const videoData = [
  {
    id: 1,
    title: 'Video login',
    videoUrl: './videos/file.mp4',
    thumbnailUrl: './videos/output.png',
  },
  // Add more videos...
];

const HelpPage = () => {
  const t = useTranslation();
  const navigate = useNavigate();
  const [selectedVideo, setSelectedVideo] = useState(null);

  const openVideoModal = (video) => {
    setSelectedVideo(video);
  };

  const closeVideoModal = () => {
    setSelectedVideo(null);
  };

  return (
    <>
      <AppBar>
        <Toolbar>
          <IconButton color="inherit" edge="start" sx={{ mr: 2 }} onClick={() => navigate('/')}>
            <ArrowBack style={{ color: 'white' }} />
          </IconButton>
          {t('help')}
        </Toolbar>
      </AppBar>
      <div className="help-page">
        <div style={{ position: 'relative', top: '80px', display: 'grid', gap: '25px', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }} className="video-list">
          {videoData.map((video) => (
            <div style={{ paddingLeft: '25px' }} className="video-item" key={video.id}>
              <p>{video.title}</p>
              <img
                style={{ width: '250px' }}
                src={video.thumbnailUrl}
                alt={`Thumbnail for ${video.title}`}
              />
              <br />
              <Button
                onClick={() => openVideoModal(video)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === 'Space') {
                    openVideoModal(video);
                  }
                }}
              >
                Ver
              </Button>
            </div>
          ))}
        </div>
        {selectedVideo && (
          <VideoModal
            videoUrl={selectedVideo.videoUrl}
            onClose={closeVideoModal}
          />
        )}
      </div>
    </>
  );
};

export default HelpPage;
