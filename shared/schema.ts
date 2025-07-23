import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  decimal,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table (mandatory for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (mandatory for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").notNull().default("user"), // 'user' or 'admin'
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const books = pgTable("books", {
  id: serial("id").primaryKey(),
  title: varchar("title").notNull(),
  author: varchar("author").notNull(),
  isbn: varchar("isbn").unique(),
  category: varchar("category").notNull(),
  description: text("description"),
  coverImageUrl: varchar("cover_image_url"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  totalCopies: integer("total_copies").notNull().default(1),
  availableCopies: integer("available_copies").notNull().default(1),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const borrowedBooks = pgTable("borrowed_books", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  bookId: integer("book_id").notNull().references(() => books.id),
  borrowedAt: timestamp("borrowed_at").defaultNow(),
  dueDate: timestamp("due_date").notNull(),
  returnedAt: timestamp("returned_at"),
  status: varchar("status").notNull().default("borrowed"), // 'borrowed', 'returned', 'overdue'
});

export const purchases = pgTable("purchases", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  bookId: integer("book_id").notNull().references(() => books.id),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  purchasedAt: timestamp("purchased_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  borrowedBooks: many(borrowedBooks),
  purchases: many(purchases),
}));

export const booksRelations = relations(books, ({ many }) => ({
  borrowedBooks: many(borrowedBooks),
  purchases: many(purchases),
}));

export const borrowedBooksRelations = relations(borrowedBooks, ({ one }) => ({
  user: one(users, {
    fields: [borrowedBooks.userId],
    references: [users.id],
  }),
  book: one(books, {
    fields: [borrowedBooks.bookId],
    references: [books.id],
  }),
}));

export const purchasesRelations = relations(purchases, ({ one }) => ({
  user: one(users, {
    fields: [purchases.userId],
    references: [users.id],
  }),
  book: one(books, {
    fields: [purchases.bookId],
    references: [books.id],
  }),
}));

// Insert schemas
export const insertBookSchema = createInsertSchema(books).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  isbn: z.string().optional(),
  description: z.string().optional(),
  coverImageUrl: z.string().optional(),
});

export const insertBorrowedBookSchema = createInsertSchema(borrowedBooks).omit({
  id: true,
  borrowedAt: true,
});

export const insertPurchaseSchema = createInsertSchema(purchases).omit({
  id: true,
  purchasedAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Book = typeof books.$inferSelect;
export type InsertBook = z.infer<typeof insertBookSchema>;
export type BorrowedBook = typeof borrowedBooks.$inferSelect;
export type InsertBorrowedBook = z.infer<typeof insertBorrowedBookSchema>;
export type Purchase = typeof purchases.$inferSelect;
export type InsertPurchase = z.infer<typeof insertPurchaseSchema>;

// Extended types for joins
export type BorrowedBookWithDetails = BorrowedBook & {
  book: Book;
};

export type PurchaseWithDetails = Purchase & {
  book: Book;
};
