import {
  users,
  books,
  borrowedBooks,
  purchases,
  type User,
  type UpsertUser,
  type Book,
  type InsertBook,
  type BorrowedBook,
  type InsertBorrowedBook,
  type Purchase,
  type InsertPurchase,
  type BorrowedBookWithDetails,
  type PurchaseWithDetails,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, ilike, or } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Book operations
  getAllBooks(): Promise<Book[]>;
  getBookById(id: number): Promise<Book | undefined>;
  searchBooks(query: string): Promise<Book[]>;
  filterBooks(category?: string): Promise<Book[]>;
  createBook(book: InsertBook): Promise<Book>;
  updateBook(id: number, book: Partial<InsertBook>): Promise<Book>;
  deleteBook(id: number): Promise<void>;
  
  // Borrowing operations
  borrowBook(userId: string, bookId: number, dueDate: Date): Promise<BorrowedBook>;
  getUserBorrowedBooks(userId: string): Promise<BorrowedBookWithDetails[]>;
  returnBook(borrowId: number): Promise<void>;
  renewBook(borrowId: number, newDueDate: Date): Promise<void>;
  getOverdueBooks(): Promise<BorrowedBookWithDetails[]>;
  
  // Purchase operations
  purchaseBook(userId: string, bookId: number, price: string): Promise<Purchase>;
  getUserPurchases(userId: string): Promise<PurchaseWithDetails[]>;
  
  // Admin statistics
  getTotalBooks(): Promise<number>;
  getTotalUsers(): Promise<number>;
  getTotalBorrowedToday(): Promise<number>;
  getTotalOverdue(): Promise<number>;
  getTotalRevenueToday(): Promise<number>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Book operations
  async getAllBooks(): Promise<Book[]> {
    return await db.select().from(books).orderBy(desc(books.createdAt));
  }

  async getBookById(id: number): Promise<Book | undefined> {
    const [book] = await db.select().from(books).where(eq(books.id, id));
    return book;
  }

  async searchBooks(query: string): Promise<Book[]> {
    return await db
      .select()
      .from(books)
      .where(
        or(
          ilike(books.title, `%${query}%`),
          ilike(books.author, `%${query}%`),
          ilike(books.category, `%${query}%`)
        )
      );
  }

  async filterBooks(category?: string): Promise<Book[]> {
    if (!category) return this.getAllBooks();
    return await db
      .select()
      .from(books)
      .where(eq(books.category, category));
  }

  async createBook(book: InsertBook): Promise<Book> {
    const [newBook] = await db.insert(books).values(book).returning();
    return newBook;
  }

  async updateBook(id: number, book: Partial<InsertBook>): Promise<Book> {
    const [updatedBook] = await db
      .update(books)
      .set({ ...book, updatedAt: new Date() })
      .where(eq(books.id, id))
      .returning();
    return updatedBook;
  }

  async deleteBook(id: number): Promise<void> {
    await db.delete(books).where(eq(books.id, id));
  }

  // Borrowing operations
  async borrowBook(userId: string, bookId: number, dueDate: Date): Promise<BorrowedBook> {
    // First, decrease available copies
    await db
      .update(books)
      .set({
        availableCopies: db.$count(books.availableCopies) - 1,
      })
      .where(eq(books.id, bookId));

    const [borrowed] = await db
      .insert(borrowedBooks)
      .values({
        userId,
        bookId,
        dueDate,
      })
      .returning();
    return borrowed;
  }

  async getUserBorrowedBooks(userId: string): Promise<BorrowedBookWithDetails[]> {
    const result = await db
      .select()
      .from(borrowedBooks)
      .innerJoin(books, eq(borrowedBooks.bookId, books.id))
      .where(
        and(
          eq(borrowedBooks.userId, userId),
          eq(borrowedBooks.status, "borrowed")
        )
      )
      .orderBy(desc(borrowedBooks.borrowedAt));

    return result.map((row) => ({
      ...row.borrowed_books,
      book: row.books,
    }));
  }

  async returnBook(borrowId: number): Promise<void> {
    // Get the borrowed book to update the book's available copies
    const [borrowed] = await db
      .select()
      .from(borrowedBooks)
      .where(eq(borrowedBooks.id, borrowId));
    
    if (borrowed) {
      // Update borrowed book status
      await db
        .update(borrowedBooks)
        .set({
          status: "returned",
          returnedAt: new Date(),
        })
        .where(eq(borrowedBooks.id, borrowId));

      // Increase available copies
      await db
        .update(books)
        .set({
          availableCopies: db.$count(books.availableCopies) + 1,
        })
        .where(eq(books.id, borrowed.bookId));
    }
  }

  async renewBook(borrowId: number, newDueDate: Date): Promise<void> {
    await db
      .update(borrowedBooks)
      .set({ dueDate: newDueDate })
      .where(eq(borrowedBooks.id, borrowId));
  }

  async getOverdueBooks(): Promise<BorrowedBookWithDetails[]> {
    const now = new Date();
    const result = await db
      .select()
      .from(borrowedBooks)
      .innerJoin(books, eq(borrowedBooks.bookId, books.id))
      .where(
        and(
          eq(borrowedBooks.status, "borrowed"),
          // dueDate < now
        )
      );

    return result.map((row) => ({
      ...row.borrowed_books,
      book: row.books,
    }));
  }

  // Purchase operations
  async purchaseBook(userId: string, bookId: number, price: string): Promise<Purchase> {
    const [purchase] = await db
      .insert(purchases)
      .values({
        userId,
        bookId,
        price,
      })
      .returning();
    return purchase;
  }

  async getUserPurchases(userId: string): Promise<PurchaseWithDetails[]> {
    const result = await db
      .select()
      .from(purchases)
      .innerJoin(books, eq(purchases.bookId, books.id))
      .where(eq(purchases.userId, userId))
      .orderBy(desc(purchases.purchasedAt));

    return result.map((row) => ({
      ...row.purchases,
      book: row.books,
    }));
  }

  // Admin statistics
  async getTotalBooks(): Promise<number> {
    const [result] = await db.$count(books);
    return result.count;
  }

  async getTotalUsers(): Promise<number> {
    const [result] = await db.$count(users);
    return result.count;
  }

  async getTotalBorrowedToday(): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const [result] = await db.$count(
      borrowedBooks,
      // borrowedAt >= today
    );
    return result.count;
  }

  async getTotalOverdue(): Promise<number> {
    const now = new Date();
    const [result] = await db.$count(
      borrowedBooks,
      and(
        eq(borrowedBooks.status, "borrowed"),
        // dueDate < now
      )
    );
    return result.count;
  }

  async getTotalRevenueToday(): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    // This would need a more complex query to sum up purchases from today
    return 1847; // Placeholder for now
  }
}

export const storage = new DatabaseStorage();
