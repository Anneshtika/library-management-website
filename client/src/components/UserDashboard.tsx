import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { BookAudio, ShoppingBag } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { BorrowedBookWithDetails, PurchaseWithDetails } from "@shared/schema";

export default function UserDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: borrowedBooks, isLoading: borrowedLoading } = useQuery<BorrowedBookWithDetails[]>({
    queryKey: ["/api/borrowed"],
  });

  const { data: purchases, isLoading: purchasesLoading } = useQuery<PurchaseWithDetails[]>({
    queryKey: ["/api/purchases"],
  });

  const renewMutation = useMutation({
    mutationFn: async (borrowId: number) => {
      const newDueDate = new Date();
      newDueDate.setDate(newDueDate.getDate() + 14); // Extend by 2 weeks
      
      return await apiRequest("POST", `/api/renew/${borrowId}`, {
        newDueDate: newDueDate.toISOString(),
      });
    },
    onSuccess: () => {
      toast({
        title: "Book Renewed",
        description: "Your book has been renewed for another 2 weeks.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/borrowed"] });
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
        title: "Renewal Failed",
        description: (error as Error).message || "Failed to renew book",
        variant: "destructive",
      });
    },
  });

  const getStatus = (dueDate: string) => {
    const due = new Date(dueDate);
    const now = new Date();
    const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 3600 * 24));

    if (diffDays < 0) {
      return { text: "Overdue", color: "bg-library-error text-white" };
    } else if (diffDays <= 3) {
      return { text: "Due Soon", color: "bg-library-warning text-white" };
    } else {
      return { text: "On Time", color: "bg-library-success text-white" };
    }
  };

  return (
    <section id="my-books" className="mb-12">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">My Library</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Currently Borrowed Books */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <BookAudio className="text-library-primary mr-2" />
              Currently Borrowed
            </h3>
            
            {borrowedLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                    <Skeleton className="w-12 h-16" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                      <Skeleton className="h-3 w-1/4" />
                    </div>
                    <Skeleton className="h-8 w-16" />
                  </div>
                ))}
              </div>
            ) : borrowedBooks && borrowedBooks.length > 0 ? (
              <div className="space-y-4">
                {borrowedBooks.map((borrowed) => {
                  const status = getStatus(borrowed.dueDate.toString());
                  return (
                    <div key={borrowed.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                      <img 
                        src={borrowed.book.coverImageUrl || "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=60&h=80"} 
                        alt={borrowed.book.title}
                        className="w-12 h-16 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-800">{borrowed.book.title}</h4>
                        <p className="text-sm text-gray-600">
                          Due: {new Date(borrowed.dueDate).toLocaleDateString()}
                        </p>
                        <Badge className={`text-xs mt-1 ${status.color}`}>
                          {status.text}
                        </Badge>
                      </div>
                      <Button 
                        size="sm"
                        className="bg-library-primary hover:bg-library-primary/90 text-white"
                        onClick={() => renewMutation.mutate(borrowed.id)}
                        disabled={renewMutation.isPending}
                      >
                        {renewMutation.isPending ? "Renewing..." : "Renew"}
                      </Button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-600 text-center py-8">No borrowed books at the moment.</p>
            )}
          </CardContent>
        </Card>

        {/* Purchase History */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <ShoppingBag className="text-library-accent mr-2" />
              Purchase History
            </h3>
            
            {purchasesLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                    <Skeleton className="w-12 h-16" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                      <Skeleton className="h-3 w-1/4" />
                    </div>
                    <Skeleton className="h-8 w-20" />
                  </div>
                ))}
              </div>
            ) : purchases && purchases.length > 0 ? (
              <div className="space-y-4">
                {purchases.map((purchase) => (
                  <div key={purchase.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                    <img 
                      src={purchase.book.coverImageUrl || "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=60&h=80"} 
                      alt={purchase.book.title}
                      className="w-12 h-16 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-800">{purchase.book.title}</h4>
                      <p className="text-sm text-gray-600">
                        Purchased: {new Date(purchase.purchasedAt!).toLocaleDateString()}
                      </p>
                      <p className="text-sm font-medium text-library-primary">${purchase.price}</p>
                    </div>
                    <Button 
                      size="sm"
                      className="bg-library-secondary hover:bg-library-secondary/90 text-white"
                    >
                      Download
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 text-center py-8">No purchases yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
