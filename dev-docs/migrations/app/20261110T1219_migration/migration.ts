#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/822d7d3d4ec9cd98501b968ed6fe38134cd66fe946866a27454d2958c465bda9/contract';
import endContract from '../../snapshots/822d7d3d4ec9cd98501b968ed6fe38134cd66fe946866a27454d2958c465bda9/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/92fc322a68901af76252a3d36704a866928ceacbf7a8acf8b36d4210ade137cd/contract';
import startContract from '../../snapshots/92fc322a68901af76252a3d36704a866928ceacbf7a8acf8b36d4210ade137cd/contract.json' with { type: 'json' };
import {
  Migration,
  MigrationCLI,
  checkExpression,
  col,
  fn,
  lit,
  primaryKey,
  sql,
} from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createTable({
        schema: 'public',
        table: 'Friend',
        columns: [
          col('friendId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('type', 'text', {
            notNull: true,
            default: lit('pending'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('userId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [
          primaryKey(['userId', 'friendId']),
          checkExpression('Friend_type_check_89e02a8c', sql`"type" IN ('pending', 'accepted')`),
        ],
      }),
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
      this.createTable({
        schema: 'public',
        table: 'Organization',
        columns: [
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('name', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'UserOrganizations',
        columns: [
          col('organizationId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('role', 'text', {
            notNull: true,
            default: lit('viewer'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('userId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [
          primaryKey(['userId', 'organizationId']),
          checkExpression(
            'UserOrganizations_role_check_8ddc8756',
            sql`"role" IN ('owner', 'editor', 'contributor', 'viewer')`,
          ),
        ],
      }),
      this.addUnique({
        schema: 'public',
        table: 'Organization',
        constraint: 'Organization_name_key',
        columns: ['name'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Friend',
        index: 'Friend_friendId_idx_7ad40ec8',
        columns: ['friendId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Friend',
        index: 'Friend_userId_idx_a489d58a',
        columns: ['userId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'UserOrganizations',
        index: 'UserOrganizations_organizationId_idx_2e17ef41',
        columns: ['organizationId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'UserOrganizations',
        index: 'UserOrganizations_userId_idx_a489d58a',
        columns: ['userId'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Friend',
        foreignKey: {
          name: 'Friend_userId_fkey',
          columns: ['userId'],
          references: { schema: 'public', table: 'User', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Friend',
        foreignKey: {
          name: 'Friend_friendId_fkey',
          columns: ['friendId'],
          references: { schema: 'public', table: 'User', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'UserOrganizations',
        foreignKey: {
          name: 'UserOrganizations_userId_fkey',
          columns: ['userId'],
          references: { schema: 'public', table: 'User', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'UserOrganizations',
        foreignKey: {
          name: 'UserOrganizations_organizationId_fkey',
          columns: ['organizationId'],
          references: { schema: 'public', table: 'Organization', columns: ['id'] },
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
