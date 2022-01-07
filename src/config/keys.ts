import type { UUID } from '../types';

export const APPS_KEY = 'apps';
export const RESOURCES_KEY = 'resources';
export const ITEMS_KEY = 'items';

export const MUTATION_KEYS = {
  POST_ITEM: 'postItem',
  EDIT_ITEM: 'editItem',
  DELETE_ITEM: 'deleteItem',
  DELETE_ITEMS: 'deleteItems',
  COPY_ITEM: 'copyItem',
  COPY_PUBLIC_ITEM: 'copyPublicItem',
  COPY_ITEMS: 'copyItems',
  MOVE_ITEM: 'moveItem',
  MOVE_ITEMS: 'moveItems',
  SHARE_ITEM: 'shareItem',
  FILE_UPLOAD: 'fileUpload',
  SIGN_OUT: 'signOut',
  POST_ITEM_LOGIN: 'postItemLoginSignIn',
  buildItemMembershipsKey: (id: UUID) => [ITEMS_KEY, id, 'memberships'],
  DELETE_ITEM_TAG: 'deleteItemTag',
  POST_ITEM_TAG: 'postItemTags',
  PUT_ITEM_LOGIN: 'putItemLogin',
  EDIT_MEMBER: 'editMember',
  POST_ITEM_FLAG: 'postItemFlag',
  EDIT_ITEM_MEMBERSHIP: 'editItemMembership',
  DELETE_ITEM_MEMBERSHIP: 'deleteItemMembership',
  POST_ITEM_CHAT_MESSAGE: 'postChatMessage',
  RECYCLE_ITEM: 'recycleItem',
  RECYCLE_ITEMS: 'recycleItems',
  RESTORE_ITEMS: 'restoreItems',
  POST_ITEM_CATEGORY: 'postItemCategory',
  DELETE_ITEM_CATEGORY: 'deleteItemCategory',
  UPLOAD_ITEM_THUMBNAIL: 'uploadItemThumbnail',
  UPLOAD_AVATAR: 'uploadAvatar',
};
