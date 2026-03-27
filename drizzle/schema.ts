import { pgTable, varchar, text, boolean, real, timestamp } from 'drizzle-orm/pg-core';

export const products = pgTable('products', {
  id: varchar('id').primaryKey(),
  slug: varchar('slug').unique().notNull(),
  name: varchar('name').notNull(),
  category: varchar('category').notNull(),
  condition: varchar('condition', { enum: ['new', 'pre-owned'] }),
  price: real('price').notNull(),
  currency: varchar('currency').default('USD').notNull(),
  description: text('description').notNull(),
  image: varchar('image').notNull(),
  inStock: boolean('in_stock').default(true).notNull(),
  featured: boolean('featured').default(false).notNull(),
  tags: text('tags').array().default([]).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const categories = pgTable('categories', {
  id: varchar('id').primaryKey(),
  label: varchar('label').notNull(),
  icon: varchar('icon').notNull(),
  slug: varchar('slug').unique().notNull(),
});

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
export type Category = typeof categories.$inferSelect;
