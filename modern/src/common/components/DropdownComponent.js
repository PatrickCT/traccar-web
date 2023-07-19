import { React } from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import { Dropdown } from 'primereact/dropdown';
import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.min.css';
import { useTranslation } from './LocalizationProvider';

const DropdownComponents = ({ setOption, options, selectOption, label }) => {
  const t = useTranslation();

  return (
    <div className="card flex justify-content-center dropdown">
      <Dropdown
        value={selectOption}
        onChange={
          (e) => setOption(e.value)
        }
        options={options}
        optionLabel="label"
        filter
        placeholder={t(label)}
        className="w-full md:w-14rem"
      />
    </div>
  );
};

export default DropdownComponents;
