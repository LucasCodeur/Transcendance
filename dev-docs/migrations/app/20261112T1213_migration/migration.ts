#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/245226d6a499199b2f2b9c5eec1cfef1c2724248ecb99fb474816c56023efe99/contract';
import endContract from '../../snapshots/245226d6a499199b2f2b9c5eec1cfef1c2724248ecb99fb474816c56023efe99/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/822d7d3d4ec9cd98501b968ed6fe38134cd66fe946866a27454d2958c465bda9/contract';
import startContract from '../../snapshots/822d7d3d4ec9cd98501b968ed6fe38134cd66fe946866a27454d2958c465bda9/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, fn, primaryKey, sql } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createTable({
        schema: 'public',
        table: 'RecoveryCode',
        columns: [
          col('codeHash', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('userId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.addColumn({
        schema: 'public',
        table: 'User',
        column: col('totpLastStep', 'int4', { codecRef: { codecId: 'pg/int4@1' } }),
      }),
      this.addUnique({
        schema: 'public',
        table: 'RecoveryCode',
        constraint: 'RecoveryCode_userId_codeHash_key',
        columns: ['userId', 'codeHash'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'RecoveryCode',
        index: 'RecoveryCode_userId_idx_a489d58a',
        columns: ['userId'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'RecoveryCode',
        foreignKey: {
          name: 'RecoveryCode_userId_fkey',
          columns: ['userId'],
          references: { schema: 'public', table: 'User', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
