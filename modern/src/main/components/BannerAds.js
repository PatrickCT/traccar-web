import React, { useEffect, useState } from 'react';

const AdBanner = ({ animationName = 'ad-banner-raiseBanner', align = 'bottom', width = '100%', delay = 3, children }) => {
  const [showBanner, setShowBanner] = useState(false);

  // Show the banner after 3 seconds on page load
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowBanner(true);
    }, delay * 1000);

    return () => clearTimeout(timer); // Cleanup on unmount
  }, []);

  return (
    <div>
      {showBanner && (
        <div id="banner" style={{ display: showBanner ? 'block' : 'none', [align]: 0 }}>
          <div className="ad-banner" style={{ width, [align]: 0, animationName }}>
            <div className="ad-banner-wrap">
              {children}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdBanner;
