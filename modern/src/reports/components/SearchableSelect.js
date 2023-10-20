import React, { useState } from 'react';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { InputAdornment, ListSubheader } from '@mui/material';
import { SearchOutlined } from '@mui/icons-material';
import { useTranslation } from '../../common/components/LocalizationProvider';

const SearchSelect = ({ options, label, value, onChange, multiple }) => {
  const t = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const filteredOptions = options.filter((option) => option.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <FormControl fullWidth>
      <InputLabel>{label}</InputLabel>
      <Select label={label} value={value} onChange={onChange} multiple={multiple}>
        <ListSubheader>
          <TextField
            size="small"
            // Autofocus on textfield
            autoFocus
            placeholder={t('sharedSearch')}
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchOutlined />
                </InputAdornment>
              ),
            }}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key !== 'Escape') {
                // Prevents autoselecting item while typing (default Select behaviour)
                e.stopPropagation();
              }
            }}
            value={searchQuery}
          />
        </ListSubheader>
        {filteredOptions.map((option) => (
          <MenuItem key={option.id} value={option.id}>
            {option.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default SearchSelect;
