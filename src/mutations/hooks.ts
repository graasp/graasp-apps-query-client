import { useMutation } from 'react-query';
import { MUTATION_KEYS } from '../config/keys';
import { CreateAppSetting } from '../types';

const postAppSetting = useMutation<unknown, unknown, CreateAppSetting>(
  MUTATION_KEYS.POST_APP_SETTING,
).mutate;

export { postAppSetting };
