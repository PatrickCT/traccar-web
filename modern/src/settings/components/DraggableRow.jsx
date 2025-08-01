/* eslint-disable import/no-extraneous-dependencies */
import { GridRow } from '@mui/x-data-grid';
import { useDrag } from '@use-gesture/react';
import React, { useRef } from 'react';

const DraggableRow = (props) => {
  const ref = useRef(null);

  useDrag(({ values, last, target }) => {
    const rowBeingDragged = target.closest('[data-rowindex]');

    const [x, y] = values;
    const immediateElem = document.elementFromPoint(x, y);

    const rowDraggedOver = immediateElem?.closest('[data-rowindex]');
    if (!rowDraggedOver || !rowBeingDragged) return;

    // Your dragging logic here.....

    if (last) {
      // Your drag end logic here.....
    }
  }, { target: ref });

  return <GridRow style={{ userSelect: 'none', touchAction: 'none' }} ref={ref} {...props} />;
};

export default DraggableRow;
