import {
  FormControl, InputLabel,
  MenuItem,
  Select,
} from '@mui/material';
import React, { useState } from 'react';
import {
  CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import usePositionAttributes from '../common/attributes/usePositionAttributes';
import { useTranslation } from '../common/components/LocalizationProvider';
import PageLayout from '../common/components/PageLayout';
import {
  altitudeFromMeters, distanceFromMeters, speedFromKnots, volumeFromLiters,
} from '../common/util/converter';
import { formatTime } from '../common/util/formatter';
import { useAttributePreference, usePreference } from '../common/util/preferences';
import { useCatch } from '../reactHelper';
import useReportStyles from './common/useReportStyles';
import ReportFilter from './components/ReportFilter';
import ReportsMenu from './components/ReportsMenu';

const ChartReportPage = () => {
  const classes = useReportStyles();
  const t = useTranslation();

  const positionAttributes = usePositionAttributes(t);

  const distanceUnit = useAttributePreference('distanceUnit');
  const altitudeUnit = useAttributePreference('altitudeUnit');
  const speedUnit = useAttributePreference('speedUnit');
  const volumeUnit = useAttributePreference('volumeUnit');
  const hours12 = usePreference('twelveHourFormat');

  const [items, setItems] = useState([]);
  const [type, setType] = useState('speed');

  const values = items.map((it) => it[type]);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const valueRange = maxValue - minValue;

  const handleSubmit = useCatch(async ({ deviceId, from, to }) => {
    const query = new URLSearchParams({ deviceId, from, to });
    const response = await fetch(`/api/reports/route?${query.toString()}`, {
      headers: { Accept: 'application/json' },
    });
    if (response.ok) {
      const positions = await response.json();
      const formattedPositions = positions.map((position) => {
        const data = { ...position, ...position.attributes };
        const formatted = {};
        formatted.fixTime = formatTime(position.fixTime, 'time', hours12);
        Object.keys(data).forEach((key) => {
          const value = data[key];
          if (typeof value === 'number') {
            const definition = positionAttributes[key] || {};
            switch (definition.dataType) {
              case 'speed':
                formatted[key] = speedFromKnots(value, speedUnit).toFixed(2);
                break;
              case 'altitude':
                formatted[key] = altitudeFromMeters(value, altitudeUnit).toFixed(2);
                break;
              case 'distance':
                formatted[key] = distanceFromMeters(value, distanceUnit).toFixed(2);
                break;
              case 'volume':
                formatted[key] = volumeFromLiters(value, volumeUnit).toFixed(2);
                break;
              case 'hours':
                formatted[key] = (value / 1000).toFixed(2);
                break;
              default:
                formatted[key] = value;
                break;
            }
          }
        });
        return formatted;
      });
      setItems(formattedPositions);
    } else {
      throw Error(await response.text());
    }
  });

  return (
    <PageLayout menu={<ReportsMenu />} breadcrumbs={['reportTitle', 'reportChart']}>
      <ReportFilter handleSubmit={handleSubmit} showOnly>
        <div className={classes.filterItem}>
          <FormControl fullWidth>
            <InputLabel>{t('reportChartType')}</InputLabel>
            <Select label={t('reportChartType')} value={type} onChange={(e) => setType(e.target.value)}>
              {Object.keys(positionAttributes).filter((key) => ['speed', 'rpm', 'fuel', 'temp', 'temp1', 'temp2', 'temp3', 'temp4'].some((f) => key.includes(f))).filter((key) => positionAttributes[key].type === 'number' && key !== 'odometer').map((key) => (
                <MenuItem key={key} value={key}>{positionAttributes[key].name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>
      </ReportFilter>
      {items.length > 0 && (
        <div className={classes.chart}>
          <ResponsiveContainer>
            <LineChart
              data={items}
              margin={{
                top: 10, right: 40, left: 0, bottom: 10,
              }}
            >
              <XAxis dataKey="fixTime" />
              <YAxis type="number" tickFormatter={(value) => value.toFixed(2)} domain={[minValue - valueRange / 5, maxValue + valueRange / 5]} />
              <CartesianGrid strokeDasharray="3 3" />
              <Tooltip formatter={(value, key) => [value, positionAttributes[key].name]} />
              <Line type="monotone" dataKey={type} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </PageLayout>
  );
};

export default ChartReportPage;
