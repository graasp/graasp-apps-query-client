import { type JSX, useContext, useState } from 'react';

import { Construction, Loop } from '@mui/icons-material';
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControl,
  FormLabel,
  IconButton,
  MenuItem,
  Select,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';

import { Context, HttpMethod, LocalContext, Member, PermissionLevel } from '@graasp/sdk';

import { useQueryClient } from '@tanstack/react-query';

import { LOCAL_CONTEXT_KEY } from '../config/keys.js';
import { UpdateArgument } from './utils/hooks.js';
import { TokenContext } from './withToken.js';

type Props = {
  members: Member[];
  context: LocalContext;
  setContext: (arg: UpdateArgument<LocalContext>) => void;
};

const GraaspContextDevTool = ({ members, context, setContext }: Props): JSX.Element => {
  const [open, setOpen] = useState(false);
  const token = useContext(TokenContext);
  const toggleToolsState = (): void => {
    setOpen((prev) => !prev);
  };
  const queryClient = useQueryClient();

  const handleResetDB = (): void => {
    fetch('/__mocks/reset', { method: HttpMethod.Delete });
  };

  const handleNotifyDBOfContext = <K extends keyof LocalContext>(
    key: K,
    newValue: LocalContext[K],
  ): void => {
    fetch('/__mocks/context', {
      method: HttpMethod.Post,
      body: JSON.stringify({ ...context, [key]: newValue }),
      headers: [['authorization', token]],
    }).then(() => {
      console.debug('invalidating local Context');
      queryClient.refetchQueries(LOCAL_CONTEXT_KEY);
    });
  };

  const onChange = <K extends keyof LocalContext>(key: K, newValue: LocalContext[K]): void => {
    handleNotifyDBOfContext(key, newValue);
    setContext(() => ({ [key]: newValue }));
  };

  return (
    <Box position="fixed" zIndex={9999} top={0} right={0} m={2}>
      <IconButton onClick={toggleToolsState}>
        <Construction />
      </IconButton>
      <Dialog open={open} onClose={toggleToolsState}>
        <DialogTitle>Graasp Dev Tools</DialogTitle>
        <DialogContent>
          <Stack direction="column" spacing={1}>
            <FormControl>
              <FormLabel>Context</FormLabel>
              <ToggleButtonGroup
                color="primary"
                size="small"
                value={context.context}
                exclusive
                onChange={(_e, newContext) => onChange('context', newContext)}
              >
                <ToggleButton value={Context.Builder}>Builder</ToggleButton>
                <ToggleButton value={Context.Player}>Player</ToggleButton>
                <ToggleButton value={Context.Analytics}>Analytics</ToggleButton>
              </ToggleButtonGroup>
            </FormControl>
            <FormControl>
              <FormLabel>Permission</FormLabel>
              <ToggleButtonGroup
                color="primary"
                size="small"
                value={context.permission}
                exclusive
                onChange={(_e, newPermission) => onChange('permission', newPermission)}
              >
                <ToggleButton value={PermissionLevel.Read}>Read</ToggleButton>
                <ToggleButton value={PermissionLevel.Write}>Write</ToggleButton>
                <ToggleButton value={PermissionLevel.Admin}>Admin</ToggleButton>
              </ToggleButtonGroup>
            </FormControl>
            {/* Needs some work to work correctly */}
            <FormControl disabled>
              <Select
                value={context.accountId}
                onChange={({ target }) => onChange('accountId', target.value)}
              >
                {members.map((member) => (
                  <MenuItem key={member.id} value={member.id}>
                    {member.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button startIcon={<Loop />} color="error" variant="contained" onClick={handleResetDB}>
              Reset DB
            </Button>
          </Stack>
        </DialogContent>
      </Dialog>
    </Box>
  );
};
export default GraaspContextDevTool;
