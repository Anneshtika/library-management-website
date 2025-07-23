import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { Book } from "@shared/schema";

interface BookCardProps {
  book: Book;
}

export default function BookCard({ book }: BookCardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isProcessing, setIsProcessing] = useState(false);

  const borrowMutation = useMutation({
    mutationFn: async () => {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 14); // 2 weeks from now
      
      return await apiRequest("POST", "/api/borrow", {
        bookId: book.id,
        dueDate: dueDate.toISOString(),
      });
    },
    onSuccess: () => {
      toast({
        title: "Book Borrowed",
        description: `You have successfully borrowed "${book.title}". Due in 2 weeks.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/books"] });
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
        title: "Borrowing Failed",
        description: (error as Error).message || "Failed to borrow book",
        variant: "destructive",
      });
    },
  });

  const purchaseMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/purchase", {
        bookId: book.id,
        price: book.price,
      });
    },
    onSuccess: () => {
      toast({
        title: "Book Purchased",
        description: `You have successfully purchased "${book.title}".`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/purchases"] });
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
        title: "Purchase Failed",
        description: (error as Error).message || "Failed to purchase book",
        variant: "destructive",
      });
    },
  });

  const handleBorrow = () => {
    setIsProcessing(true);
    borrowMutation.mutate();
    setTimeout(() => setIsProcessing(false), 1000);
  };

  const handlePurchase = () => {
    setIsProcessing(true);
    purchaseMutation.mutate();
    setTimeout(() => setIsProcessing(false), 1000);
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />);
    }
    
    if (hasHalfStar) {
      stars.push(<Star key="half" className="w-3 h-3 fill-yellow-400 text-yellow-400 opacity-50" />);
    }
    
    for (let i = stars.length; i < 5; i++) {
      stars.push(<Star key={i} className="w-3 h-3 text-gray-300" />);
    }

    return stars;
  };

  const getAvailabilityStatus = () => {
    if (book.availableCopies === 0) {
      return { text: "Checked Out", color: "bg-library-error text-white", canBorrow: false };
    } else if (book.availableCopies <= 2) {
      return { text: `${book.availableCopies} Available`, color: "bg-library-warning text-white", canBorrow: true };
    } else {
      return { text: "Available", color: "bg-library-success text-white", canBorrow: true };
    }
  };

  const availability = getAvailabilityStatus();

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <img 
        src={book.coverImageUrl || "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=400"} 
        alt={book.title}
        className="w-full h-48 object-cover"
      />
      <CardContent className="p-4">
        <h3 className="font-semibold text-gray-800 mb-1 truncate">{book.title}</h3>
        <p className="text-sm text-gray-600 mb-2">{book.author}</p>
        <div className="flex items-center mb-2">
          <div className="flex">
            {renderStars(parseFloat(book.rating || "0"))}
          </div>
          <span className="text-xs text-gray-500 ml-1">({book.rating || "0"})</span>
        </div>
        <div className="flex justify-between items-center mb-3">
          <Badge className={`text-xs ${availability.color}`}>
            {availability.text}
          </Badge>
          <span className="text-sm font-bold text-library-primary">${book.price}</span>
        </div>
        <div className="flex space-x-2">
          <Button 
            className="flex-1 bg-library-primary hover:bg-library-primary/90 text-white text-sm"
            onClick={handleBorrow}
            disabled={!availability.canBorrow || isProcessing || borrowMutation.isPending}
          >
            {borrowMutation.isPending ? "Borrowing..." : availability.canBorrow ? "Borrow" : "Waitlist"}
          </Button>
          <Button 
            className="flex-1 bg-library-accent hover:bg-library-accent/90 text-white text-sm"
            onClick={handlePurchase}
            disabled={isProcessing || purchaseMutation.isPending}
          >
            {purchaseMutation.isPending ? "Buying..." : "Buy"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
