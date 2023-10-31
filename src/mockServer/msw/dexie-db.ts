import { AppAction, AppData, AppSetting, DiscriminatedItem, Member } from '@graasp/sdk';

import Dexie from 'dexie';

import { Database, LocalContext } from '../../types';

type OptionalIndexed<T extends { id: string }, P extends keyof T = 'id'> = {
  [Key in keyof T as Key extends P ? Key : never]?: T[Key];
} & {
  [Key in keyof T as Key extends P ? never : Key]: T[Key];
};

export type IMockAppData = OptionalIndexed<AppData>;
export type IMockAppSetting = OptionalIndexed<AppSetting>;
export type IMockAppAction = OptionalIndexed<AppAction>;

export class AppMocks extends Dexie {
  item!: Dexie.Table<DiscriminatedItem, string>;

  member!: Dexie.Table<Member, string>;

  appContext!: Dexie.Table<LocalContext, string>;

  appData!: Dexie.Table<AppData, string>;

  appSetting!: Dexie.Table<AppSetting, string>;

  appAction!: Dexie.Table<AppAction, string>;

  constructor() {
    super('graasp-app-mocks');

    //
    // Define tables and indexes
    // (Here's where the implicit table props are dynamically created)
    //
    this.version(1).stores({
      item: 'id',
      member: 'id',
      appContext: 'memberId',
      appData: 'id, item.id, [item.id+creator.id], member.id, type, visibility',
      appSetting: 'id, item.id, name',
      appAction: 'id, memberId',
    });
  }

  seed(data: Partial<Database>): void {
    // pre-load the IndexDB with data
    if (data.items?.length) {
      this.item.bulkAdd(data.items);
    }
    if (data.members?.length) {
      this.member.bulkAdd(data.members);
    }
    if (data.appContext) {
      this.appContext.add(data.appContext, data.appContext.memberId);
    }
    if (data.appData?.length) {
      this.appData.bulkAdd(data.appData);
    }
    if (data.appSettings?.length) {
      this.appSetting.bulkAdd(data.appSettings);
    }
    if (data.appActions?.length) {
      this.appAction.bulkAdd(data.appActions);
    }
  }

  resetDB(data?: Partial<Database>): void {
    console.info('Resetting DB');
    this.tables.map((table) => table.clear());

    if (data) {
      console.info('Seeding DB with initial data');
      this.seed(data);
    }
  }
}
