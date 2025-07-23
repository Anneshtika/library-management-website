import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { BookOpen, Users, Clock, DollarSign, Plus, Edit, Trash2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import AddBookDialog from "./AddBookDialog";
import type { Book } from "@shared/schema";

interface AdminStats {
  totalBooks: number;
  totalUsers: number;
  borrowedToday: number;
  overdue: number;
  revenueToday: number;
}

export default function AdminPanel() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showAddBook, setShowAddBook] = useState(false);

  const { data: stats, isLoading: statsLoading } = useQuery<AdminStats>({
    queryKey: ["/api/admin/stats"],
  });

  const { data: books, isLoading: booksLoading } = useQuery<Book[]>({
    queryKey: ["/api/books"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (bookId: number) => {
      return await apiRequest("DELETE", `/api/books/${bookId}`);
    },
    onSuccess: () => {
      toast({
        title: "Book Deleted",
        description: "The book has been successfully deleted.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/books"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error as Error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Delete Failed",
        description: (error as Error).message || "Failed to delete book",
        variant: "destructive",
      });
    },
  });

  const handleDelete = (bookId: number, title: string) => {
    if (confirm(`Are you sure you want to delete "${title}"?`)) {
      deleteMutation.mutate(bookId);
    }
  };

  const getStatusBadge = (availableCopies: number, totalCopies: number) => {
    if (availableCopies === 0) {
      return <Badge className="bg-library-error text-white">Out of Stock</Badge>;
    } else if (availableCopies <= totalCopies * 0.2) {
      return <Badge className="bg-library-warning text-white">Low Stock</Badge>;
    } else {
      return <Badge className="bg-library-success text-white">Available</Badge>;
    }
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Admin Panel</h2>
        <Button 
          onClick={() => setShowAddBook(true)}
          className="bg-library-accent hover:bg-library-accent/90 text-white flex items-center"
        >
          <Plus className="mr-2 w-4 h-4" />
          Add New Book
        </Button>
      </div>
      
      {/* Admin Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {statsLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-8 w-16" />
                  </div>
                  <Skeleton className="h-8 w-8 rounded" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : stats ? (
          <>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Books</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalBooks}</p>
                  </div>
                  <BookOpen className="text-library-primary text-2xl" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Borrowed Today</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.borrowedToday}</p>
                  </div>
                  <Clock className="text-library-secondary text-2xl" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Overdue Books</p>
                    <p className="text-2xl font-bold text-library-error">{stats.overdue}</p>
                  </div>
                  <Users className="text-library-error text-2xl" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Revenue Today</p>
                    <p className="text-2xl font-bold text-library-success">${stats.revenueToday}</p>
                  </div>
                  <DollarSign className="text-library-success text-2xl" />
                </div>
              </CardContent>
            </Card>
          </>
        ) : null}
      </div>

      {/* Book Management Table */}
      <Card>
        <CardContent className="p-0">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">Book Inventory</h3>
          </div>
          <div className="overflow-x-auto">
            {booksLoading ? (
              <div className="p-6 space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-10 w-8" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                ))}
              </div>
            ) : books && books.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Book</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {books.map((book) => (
                    <TableRow key={book.id}>
                      <TableCell>
                        <div className="flex items-center">
                          <img 
                            className="h-10 w-8 object-cover rounded mr-4" 
                            src={book.coverImageUrl || "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=60&h=80"} 
                            alt={book.title}
                          />
                          <div>
                            <div className="text-sm font-medium text-gray-900">{book.title}</div>
                            <div className="text-sm text-gray-500">ISBN: {book.isbn || 'N/A'}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-900">{book.author}</TableCell>
                      <TableCell className="text-sm text-gray-900">{book.category}</TableCell>
                      <TableCell>
                        {getStatusBadge(book.availableCopies, book.totalCopies)}
                      </TableCell>
                      <TableCell className="text-sm text-gray-900">${book.price}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm" className="text-library-primary hover:text-library-primary/80">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-library-error hover:text-library-error/80"
                            onClick={() => handleDelete(book.id, book.title)}
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="p-8 text-center text-gray-600">
                No books in the inventory yet.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <AddBookDialog 
        open={showAddBook} 
        onOpenChange={setShowAddBook}
      />
    </>
  );
}
