import { useMemo } from 'react';

export default (t) => useMemo(() => ({
  'processing.copyAttributes': {
    name: t('attributeProcessingCopyAttributes'),
    type: 'string',
  },
  'decoder.timezone': {
    name: t('sharedTimezone'),
    type: 'string',
  },
  // turbanRoute: {
  //   name: t('turbanRoute'),
  //   type: 'ruta',
  // },
}), [t]);
