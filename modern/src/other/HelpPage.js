import React, { useEffect, useState } from 'react';
import {
  AppBar, Button, IconButton, Snackbar, Toolbar,
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import VideoModal from '../common/components/VideoModal';
import { useTranslation } from '../common/components/LocalizationProvider';
import { snackBarDurationLongMs } from '../common/util/duration';

// const videoData = [
//   {
//     id: 1,
//     title: 'Video login',
//     videoUrl: './videos/file.mp4',
//     thumbnailUrl: './videos/output.png',
//   },
//   // Add more videos...
// ];

const HelpPage = () => {
  const t = useTranslation();
  const navigate = useNavigate();
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [videoData, setVideoData] = useState([]);
  const [notifications, setNotifications] = useState([]);

  const openVideoModal = (video) => {
    setSelectedVideo(video);
  };

  const closeVideoModal = () => {
    setSelectedVideo(null);
  };

  useEffect(() => {
    // Fetch the data from the JSON file
    fetch('/help/videos.json')
      .then((response) => response.json())
      .then((data) => setVideoData(data))
      .catch((error) => setNotifications([{
        id: 1,
        show: true,
        message: error,
      }]));
  }, []);

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

        {notifications.map((notification) => (
          <Snackbar
            key={notification.id}
            open={notification.show}
            message={notification.message}
            autoHideDuration={snackBarDurationLongMs}
            onClose={() => setNotifications([])}
          />
        ))}
      </div>
    </>
  );
};

export default HelpPage;
