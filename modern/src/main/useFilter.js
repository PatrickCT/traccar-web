import moment from 'moment';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';

export default (keyword, filter, filterSort, filterMap, positions, setFilteredDevices, setFilteredPositions) => {
  const groups = useSelector((state) => state.groups.items);
  const devices = useSelector((state) => state.devices.items);

  useEffect(() => {
    const deviceGroups = (device) => {
      const groupIds = new Set(); // Use Set to track visited groupIds
      let { groupId } = device;

      while (groupId) {
        if (groupIds.has(groupId)) {
          // console.error('Cycle detected in groupId references:', groupId);
          break; // Prevent infinite loop
        }

        groupIds.add(groupId);
        groupId = groups[groupId]?.groupId || 0;
      }

      return [...groupIds]; // Convert Set back to an array
    };

    const filtered = Object.values(devices)
      .filter((device) => !filter.statuses.length || filter.statuses.includes(device.status))
      .filter((device) => !filter.groups.length || deviceGroups(device).some((id) => filter.groups.includes(id)))
      .filter((device) => {
        const lowerCaseKeyword = keyword.toLowerCase();
        return [device.name].some((s) => s && s.toLowerCase().includes(lowerCaseKeyword));
      });
    switch (filterSort) {
      case 'name':
        filtered.sort((device1, device2) => device1.name.localeCompare(device2.name));
        break;
      case 'lastUpdate':
        filtered.sort((device1, device2) => {
          const time1 = device1.lastUpdate ? moment(device1.lastUpdate).valueOf() : 0;
          const time2 = device2.lastUpdate ? moment(device2.lastUpdate).valueOf() : 0;
          return time2 - time1;
        });
        break;
      default:
        break;
    }
    setFilteredDevices(filtered);
    setFilteredPositions(filterMap
      ? filtered.map((device) => positions[device.id]).filter(Boolean)
      : Object.values(positions));

    // Object.keys(window.players || {}).forEach((player) => {
    //   if (![...(filterMap
    //     ? filtered.map((device) => positions[device.id]).filter(Boolean)
    //     : Object.values(positions)).map((p) => p.deviceId)].includes(player)) {
    //     window.players[player].reset('filter');
    //   }
    // });
  }, [keyword, filter, filterSort, filterMap, groups, devices, positions, setFilteredDevices, setFilteredPositions]);
};
