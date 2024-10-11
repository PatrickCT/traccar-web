import React, { memo } from 'react';
import MapPopup from '../map/showpopup/MapPopup';
import MapShare from '../map/share/MapShare';
import MapCoverage from '../map/coverage/MapCoverage';
import MapPromotions from '../map/promotions/MapPromotions';
// import MapHorizontalButton from '../map/Buttons/MapHorizontalButton';
import { modals } from './MainModals';
import { useAdministrator } from '../common/util/permissions';
import { showCoberturaMap } from '../common/util/utils';

export const buttons = {};

const MainMapButtons = () => {
  const admin = useAdministrator();
  // const readonly = useRestriction('readonly');

  return (
    <>
      <MapPopup />
      <MapShare onClick={() => modals.locationModal(true)} />
      {admin && (
        <MapCoverage onClick={() => showCoberturaMap()} />
      )}
      <MapPromotions />
      {/* {!readonly && (
        <MapHorizontalButton title="Reportes anteriores al 29 de septiembre" enabled onClick={(() => window.open('http://rastreo.gpstracker.mx:8089', '_blank').focus())} />
      )} */}
    </>
  );
};

export default memo(MainMapButtons);
