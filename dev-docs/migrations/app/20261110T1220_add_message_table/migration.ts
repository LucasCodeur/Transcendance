#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/822d7d3d4ec9cd98501b968ed6fe38134cd66fe946866a27454d2958c465bda9/contract';
import endContract from '../../snapshots/822d7d3d4ec9cd98501b968ed6fe38134cd66fe946866a27454d2958c465bda9/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/df8e1426f61c69f940a5ea20e58f4f14341001079c22ca3369fa8ebfc45e087d/contract';
import startContract from '../../snapshots/df8e1426f61c69f940a5ea20e58f4f14341001079c22ca3369fa8ebfc45e087d/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, fn, primaryKey, sql } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createTable({
        schema: 'public',
        table: 'Message',
        columns: [
          col('content', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('messageId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('receiverId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('senderId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('timestamp', 'timestamptz', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
        ],
        constraints: [primaryKey(['messageId'])],
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
