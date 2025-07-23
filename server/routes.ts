import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertBookSchema, insertBorrowedBookSchema, insertPurchaseSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Book routes
  app.get("/api/books", async (req, res) => {
    try {
      const { search, category } = req.query;
      let books;
      
      if (search) {
        books = await storage.searchBooks(search as string);
      } else if (category) {
        books = await storage.filterBooks(category as string);
      } else {
        books = await storage.getAllBooks();
      }
      
      res.json(books);
    } catch (error) {
      console.error("Error fetching books:", error);
      res.status(500).json({ message: "Failed to fetch books" });
    }
  });

  app.get("/api/books/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const book = await storage.getBookById(id);
      if (!book) {
        return res.status(404).json({ message: "Book not found" });
      }
      res.json(book);
    } catch (error) {
      console.error("Error fetching book:", error);
      res.status(500).json({ message: "Failed to fetch book" });
    }
  });

  // Admin-only book management
  app.post("/api/books", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (user?.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const bookData = insertBookSchema.parse(req.body);
      const book = await storage.createBook(bookData);
      res.json(book);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid book data", errors: error.errors });
      }
      console.error("Error creating book:", error);
      res.status(500).json({ message: "Failed to create book" });
    }
  });

  app.put("/api/books/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (user?.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const id = parseInt(req.params.id);
      const bookData = insertBookSchema.partial().parse(req.body);
      const book = await storage.updateBook(id, bookData);
      res.json(book);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid book data", errors: error.errors });
      }
      console.error("Error updating book:", error);
      res.status(500).json({ message: "Failed to update book" });
    }
  });

  app.delete("/api/books/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (user?.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const id = parseInt(req.params.id);
      await storage.deleteBook(id);
      res.json({ message: "Book deleted successfully" });
    } catch (error) {
      console.error("Error deleting book:", error);
      res.status(500).json({ message: "Failed to delete book" });
    }
  });

  // Borrowing routes
  app.post("/api/borrow", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { bookId, dueDate } = req.body;
      
      const book = await storage.getBookById(bookId);
      if (!book || book.availableCopies === 0) {
        return res.status(400).json({ message: "Book not available for borrowing" });
      }

      const borrowed = await storage.borrowBook(userId, bookId, new Date(dueDate));
      res.json(borrowed);
    } catch (error) {
      console.error("Error borrowing book:", error);
      res.status(500).json({ message: "Failed to borrow book" });
    }
  });

  app.get("/api/borrowed", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const borrowedBooks = await storage.getUserBorrowedBooks(userId);
      res.json(borrowedBooks);
    } catch (error) {
      console.error("Error fetching borrowed books:", error);
      res.status(500).json({ message: "Failed to fetch borrowed books" });
    }
  });

  app.post("/api/return/:id", isAuthenticated, async (req: any, res) => {
    try {
      const borrowId = parseInt(req.params.id);
      await storage.returnBook(borrowId);
      res.json({ message: "Book returned successfully" });
    } catch (error) {
      console.error("Error returning book:", error);
      res.status(500).json({ message: "Failed to return book" });
    }
  });

  app.post("/api/renew/:id", isAuthenticated, async (req: any, res) => {
    try {
      const borrowId = parseInt(req.params.id);
      const { newDueDate } = req.body;
      await storage.renewBook(borrowId, new Date(newDueDate));
      res.json({ message: "Book renewed successfully" });
    } catch (error) {
      console.error("Error renewing book:", error);
      res.status(500).json({ message: "Failed to renew book" });
    }
  });

  // Purchase routes
  app.post("/api/purchase", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { bookId, price } = req.body;
      
      const purchase = await storage.purchaseBook(userId, bookId, price);
      res.json(purchase);
    } catch (error) {
      console.error("Error purchasing book:", error);
      res.status(500).json({ message: "Failed to purchase book" });
    }
  });

  app.get("/api/purchases", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const purchases = await storage.getUserPurchases(userId);
      res.json(purchases);
    } catch (error) {
      console.error("Error fetching purchases:", error);
      res.status(500).json({ message: "Failed to fetch purchases" });
    }
  });

  // Admin statistics
  app.get("/api/admin/stats", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (user?.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const [totalBooks, totalUsers, borrowedToday, overdue, revenueToday] = await Promise.all([
        storage.getTotalBooks(),
        storage.getTotalUsers(),
        storage.getTotalBorrowedToday(),
        storage.getTotalOverdue(),
        storage.getTotalRevenueToday(),
      ]);

      res.json({
        totalBooks,
        totalUsers,
        borrowedToday,
        overdue,
        revenueToday,
      });
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ message: "Failed to fetch admin stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
