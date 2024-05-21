import * as React from 'react';
import Box from '@mui/material/Box';
import { ClickAwayListener } from '@mui/base/ClickAwayListener';
import Fab from '@mui/material/Fab';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';

export default function LeadingClickAway() {
  const [open, setOpen] = React.useState(false);

  const handleClick = () => {
    setOpen((prev) => !prev);
  };

  const handleClickAway = () => {
    setOpen(false);
  };

  const styles = {
    position: 'absolute',
    top: 60,
    right: 0,
    left: 0,
    zIndex: 1,
    border: '1px solid',
    p: 1,
    bgcolor: 'background.paper',
  };

  return (
    <ClickAwayListener mouseEvent="onMouseDown" touchEvent="onTouchStart" onClickAway={handleClickAway}>
      <Box sx={{ position: 'relative' }}>
        {/* <button type="button" onClick={handleClick}>
          Open menu dropdown
        </button> */}
        <Fab variant="extended" style={{marginTop: '1%', fontSize: "medium"}} onClick={handleClick}> <PeopleOutlineIcon sx={{ mr: 1 }} /> Users </Fab>
        {open ? (
          <Box sx={styles}>
            Click me, I will stay visible until you click outside.
          </Box>
        ) : null}
      </Box>
    </ClickAwayListener>
  );
}
