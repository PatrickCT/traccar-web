/* eslint-disable prefer-const */
/* eslint-disable arrow-parens */
/* eslint-disable no-unused-vars */
export const clusterThreshold = 50; // Cluster distance threshold in meters
export const gridCellSize = 0.002; // Approx 200m x 200m at the equator, adjust as needed
let clusterMap = {};

export const toGridIndex = (lat, lng) => ({
  x: Math.floor(lng / gridCellSize),
  y: Math.floor(lat / gridCellSize),
});

export const distanceBetweenPoints = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const d = R * c; // Distance in meters
  return d;
};

export const checkClusters = (markers) => {
  const grid = {};
  const clusters = [];

  clusterMap = {};

  markers.forEach(marker => {
    const { x, y } = toGridIndex(marker.latitude, marker.longitude);
    const gridKey = `${x}-${y}`;

    if (!grid[gridKey]) {
      grid[gridKey] = [];
    }
    grid[gridKey].push(marker);
  });

  Object.keys(grid).forEach(gridKey => {
    const cellMarkers = grid[gridKey];

    cellMarkers.forEach((marker, index) => {
      const cluster = [marker];
      const { x, y } = toGridIndex(marker.latitude, marker.longitude);

      // Check the same cell and the 8 neighboring cells
      const neighbors = [
        { x: 0, y: 0 }, { x: 1, y: 0 }, { x: -1, y: 0 },
        { x: 0, y: 1 }, { x: 0, y: -1 }, { x: 1, y: 1 },
        { x: 1, y: -1 }, { x: -1, y: 1 }, { x: -1, y: -1 },
      ];

      neighbors.forEach(offset => {
        const neighborKey = `${x + offset.x}-${y + offset.y}`;
        const neighborMarkers = grid[neighborKey] || [];

        neighborMarkers.forEach(otherMarker => {
          if (otherMarker.id !== marker.id) {
            const distance = distanceBetweenPoints(
              marker.latitude,
              marker.longitude,
              otherMarker.latitude,
              otherMarker.longitude,
            );

            if (distance <= clusterThreshold) {
              cluster.push(otherMarker);
              cluster.forEach(p => clusterMap[p.deviceId] = true);
            }
          }
        });
      });

      if (cluster.length > 1) {
        clusters.push(cluster);
      }
    });
  });

  // console.log('Clusters: ', clusters);
  // console.log('Cluster Map: ', Object.keys(clusterMap).length, clusterMap);
};

export const isInCluster = (id) => !!clusterMap[id];
