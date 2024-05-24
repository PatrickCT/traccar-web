import React, { useState, useEffect, useRef } from 'react';
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
  const [debouncedQuery, setDebouncedQuery] = useState(searchQuery);
  const inputRef = useRef(null);

  // Debounce the search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300); // Adjust the delay as needed

    // Cleanup the timeout if the component unmounts or the query changes
    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  // Effect to focus the input field
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [debouncedQuery]);

  const filteredOptions = options.filter((option) => (option && option.name.toLowerCase().includes(debouncedQuery.toLowerCase())));

  return (
    <FormControl fullWidth>
      <InputLabel>{label}</InputLabel>
      <Select label={label} value={value} onChange={onChange} multiple={multiple}>
        <ListSubheader>
          <TextField
            size="small"
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
                e.stopPropagation();
              }
            }}
            value={searchQuery}
            inputRef={inputRef} // Add the ref here
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
