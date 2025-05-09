import { SearchOutlined } from '@mui/icons-material';
import { InputAdornment, ListSubheader } from '@mui/material';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import React, {
  useEffect, useRef,
  useState,
} from 'react';
import { useTranslation } from '../../common/components/LocalizationProvider';
import { useEffectAsync } from '../../reactHelper';

const SearchSelect = ({
  label,
  fullWidth,
  multiple,
  value,
  emptyValue = 0,
  emptyTitle = '\u00a0',
  onChange,
  endpoint,
  data,
  keyGetter = (item) => item.id,
  titleGetter = (item) => item.name,
  dataGetter = (data) => data,
  debounceDelay = 300,
}) => {
  const t = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [items, setItems] = useState([]);
  const inputRef = useRef(null);

  // Debounce the search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, debounceDelay); // Adjust the delay as needed

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

  useEffectAsync(async () => {
    if (endpoint) {
      const response = await fetch(endpoint);
      if (response.ok) {
        const d = dataGetter(await response.json());
        setItems(d);
      } else {
        throw Error(await response.text());
      }
    } else if (data) {
      setItems(data);
    }
  }, []);

  const filteredOptions = items.filter((option) => (option && option.name.toLowerCase().includes(debouncedQuery.toLowerCase())));

  return (
    <FormControl fullWidth={fullWidth}>
      <InputLabel>{label}</InputLabel>
      <Select label={label} value={value ?? ''} onChange={onChange} multiple={multiple}>
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
        {!multiple && emptyValue !== null && (
          <MenuItem value={emptyValue}>{emptyTitle}</MenuItem>
        )}
        {filteredOptions.map((option) => (
          <MenuItem key={keyGetter(option)} value={keyGetter(option)}>
            {titleGetter(option)}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default SearchSelect;
