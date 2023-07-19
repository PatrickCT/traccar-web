import { React, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
// eslint-disable-next-line import/no-extraneous-dependencies
// import { Moment } from 'react-moment';
import moment from 'moment';
import Button from '@mui/material/Button';
import DropdownComponents from '../../common/components/DropdownComponent';
import { useEffectAsync } from '../../reactHelper';
import '../../common/tickets.css';
import { useTranslation } from '../../common/components/LocalizationProvider';

const TableExist = ({ deviceId, handleLoadInfo }) => {
  const t = useTranslation();

  const [, setInfo] = useState({});
  const [toDay, setDate] = useState(null);
  const [optionSelected, setOption] = useState(null);

  const user = useSelector((state) => state.session.user);

  useEffect(() => {
    setDate(moment().format('YYYY-MM-D'));
  }, [toDay]);

  useEffectAsync(async () => {
    const response = await fetch(`api/devices/${deviceId}/ticket`);
    console.log(response);
    if (response.ok) {
      const information = await response.json();
      setInfo(information);
      handleLoadInfo(information);
    } else {
      throw Error(await response.text());
    }
  }, []);

  const handleSelectedOption = (value) => {
    setOption(value);
  };

  const handleChangeHour = () => {};

  return (
    <div>
      <div className="btn-change">
        <Button size="small" onClick={handleChangeHour}>
          {t('changeExitTime')}
        </Button>
      </div>
      <DropdownComponents
        setOption={handleSelectedOption}
        selectOption={optionSelected}
        label=""
        options={[
          { label: 'New York', value: 'NY' },
          { label: 'Rome', value: 'RM' },
          { label: 'London', value: 'LDN' },
          { label: 'Istanbul', value: 'IST' },
          { label: 'Paris', value: 'PRS' },
        ]}
      />
      <div className="checador">
        <div className="columns col1">
          {t('checker')}
          <br />
          <div className="nameChecker">{user.name}</div>
        </div>
        <div className="columns col2">
          {t('date')}
          <br />
          <div className="nameChecker">{toDay}</div>
        </div>
      </div>
      <div className="headerExitst">
        <div className="columns headerCol1">
          {t('referencePoint')}
        </div>
        <div className="columns headerCol2">
          {t('arrives')}
          /
          {t('exits')}
        </div>
        <div className="columns headerCol3">
          #
        </div>
      </div>

      <div className="bodyExitst">
        <div className="columns bodyCol1">
          Nombre de punto
        </div>
        <div className="columns bodyCol2">
          12:00
          /
          12:10
        </div>
        <div className="columns bodyCol3">
          #
        </div>
      </div>
    </div>
  );
};

export default TableExist;
