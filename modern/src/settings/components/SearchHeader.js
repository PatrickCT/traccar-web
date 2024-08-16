import React, { useEffect, useState } from 'react';
import { IconButton, TextField, Tooltip } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import { SearchOutlined } from '@mui/icons-material';
import { useTranslation } from '../../common/components/LocalizationProvider';

export const filterByKeyword = (keyword) => (item) => !keyword || JSON.stringify(item).toLowerCase().includes(keyword.toLowerCase());

const useStyles = makeStyles((theme) => ({
  header: {
    position: 'sticky',
    left: 0,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'stretch',
    padding: theme.spacing(3, 2, 2),
  },
}));

const SearchHeader = ({ keyword, setKeyword }) => {
  // const theme = useTheme();
  const classes = useStyles();
  const t = useTranslation();
  const [search, setSearch] = useState(keyword);
  const [debounceSearch, setDebounceSearch] = useState(keyword);

  const handleInputChange = (event) => setSearch(event.target.value);

  useEffect(() => {
    const timeoutId = setTimeout(() => setDebounceSearch(search), 1000);

    return () => clearTimeout(timeoutId);
  }, [search, 500]);

  useEffect(() => setKeyword(debounceSearch), [debounceSearch]);

  return (
    <div className={classes.header}>
      <TextField
        variant="outlined"
        placeholder={t('sharedSearch')}
        value={search}
        onChange={handleInputChange}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            setKeyword(search);
          }
        }}
        style={{ flexGrow: 1 }}
      />
      <Tooltip
        title={t('sharedSearch')}
      >
        <IconButton
          color="inherit"
          edge="end"
          sx={{ mr: 2 }}
          onClick={() => setKeyword(search)}
        >
          <SearchOutlined />
        </IconButton>
      </Tooltip>
    </div>
  );
};

export default SearchHeader;
