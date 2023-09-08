import React, { useState } from 'react';
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

  return (
    <div className={classes.header}>
      <TextField
        variant="outlined"
        placeholder={t('sharedSearch')}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
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
