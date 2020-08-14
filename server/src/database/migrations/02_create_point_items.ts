import Knex from 'knex';

export async function up(knex: Knex) {
  return knex.schema.createTable('point_items', table=> {
    table.increments('id').primary;
    table.integer('points_id').references('id').inTable('poitns');
    table.integer('items_id').references('id').inTable('items');
  })
}

export async function down(knex: Knex) {
  return knex.schema.dropTable('point_items')
}