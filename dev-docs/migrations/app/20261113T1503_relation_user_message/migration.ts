#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/245226d6a499199b2f2b9c5eec1cfef1c2724248ecb99fb474816c56023efe99/contract';
import startContract from '../../snapshots/245226d6a499199b2f2b9c5eec1cfef1c2724248ecb99fb474816c56023efe99/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/3a4af187cfbc2f5c9921cb5133bd6d6a565d6271c6dce1107af0451caf967cf0/contract';
import endContract from '../../snapshots/3a4af187cfbc2f5c9921cb5133bd6d6a565d6271c6dce1107af0451caf967cf0/contract.json' with { type: 'json' };
import { Migration, MigrationCLI } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createIndex({
        schema: 'public',
        table: 'Message',
        index: 'Message_senderId_idx_4689c490',
        columns: ['senderId'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Message',
        foreignKey: {
          name: 'Message_senderId_fkey',
          columns: ['senderId'],
          references: { schema: 'public', table: 'User', columns: ['id'] },
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
