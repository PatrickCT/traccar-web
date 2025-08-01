import React, { memo } from 'react';
import MapCoverage from '../map/coverage/MapCoverage';
import MapPromotions from '../map/promotions/MapPromotions';
import MapShare from '../map/share/MapShare';
import MapPopup from '../map/showpopup/MapPopup';
// import MapHorizontalButton from '../map/Buttons/MapHorizontalButton';
import { useAdministrator } from '../common/util/permissions';
import { showCoberturaMap } from '../common/util/utils';
import MapHelp from '../map/help/MapHelp';
import { modals } from './LinksModal';

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
      <MapHelp />
      {/* {!readonly && (
        <MapHorizontalButton title="Reportes anteriores al 29 de septiembre" enabled onClick={(() => window.open('http://rastreo.gpstracker.mx:8089', '_blank').focus())} />
      )} */}
    </>
  );
};

export default memo(MainMapButtons);
