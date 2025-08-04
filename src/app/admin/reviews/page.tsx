'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AdminSidebar from '@/components/AdminSidebar';


type User = {
  name?: string;
};

type Product = {
  name?: string;
};

type Review = {
  _id: string;
  user?: User;
  product?: Product;
  rating: number;
  comment: string;
  isApproved: boolean;
};


export default function Reviews() {
  const { data: rawSession, status } = useSession();
 const session = rawSession;
  const router = useRouter();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    if (status === 'unauthenticated' || (session && session.user.role !== 'Admin')) {
      router.push('/auth/signin');
    } else {
      const fetchReviews = async () => {
        try {
          const res = await fetch(`/api/reviews?page=${page}&limit=${itemsPerPage}`);
          if (res.ok) {
            const data = await res.json();
            setReviews(data.reviews);
            setTotalPages(data.totalPages);
          } else {
            console.error('Error fetching reviews:', await res.text());
          }
        } catch (error) {
          console.error('Error fetching reviews:', error);
        }
      };
      fetchReviews();
    }
  }, [session, status, router, page]);

  const handleToggleApproval = async (id: string, isApproved: boolean) => {
    try {
      const res = await fetch(`/api/reviews?id=${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isApproved }),
      });
      if (res.ok) {
        setReviews(reviews.map((review) => (review._id === id ? { ...review, isApproved } : review)));
        alert(`Review ${isApproved ? 'approved' : 'disapproved'} successfully`);
      } else {
        console.error('Error updating review:', await res.text());
        alert('Failed to update review status');
      }
    } catch (error) {
      console.error('Error updating review:', error);
      alert('Failed to update review status');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this review?')) {
      try {
        const res = await fetch(`/api/reviews?id=${id}`, {
          method: 'DELETE',
        });
        if (res.ok) {
          setReviews(reviews.filter((review) => review._id !== id));
          alert('Review deleted successfully');
        } else {
          console.error('Error deleting review:', await res.text());
          alert('Failed to delete review');
        }
      } catch (error) {
        console.error('Error deleting review:', error);
        alert('Failed to delete review');
      }
    }
  };

  if (status === 'loading') return <div>Loading...</div>;

  return (
    <div className="container mx-auto p-4 flex flex-col md:flex-row gap-4">
      <AdminSidebar />
      <div className="md:w-3/4">
        <Card className="bg-base-white border-accent-beige">
          <CardContent className="p-6">
            <h1 className="text-3xl font-heading text-primary-darkgreen mb-4">Reviews</h1>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Comment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reviews.map((review: Review) => (
                  <TableRow key={review._id}>
                    <TableCell>{review.user?.name || 'N/A'}</TableCell>
                    <TableCell>{review.product?.name || 'N/A'}</TableCell>
                    <TableCell>{review.rating}</TableCell>
                    <TableCell className="max-w-xs truncate" title={review.comment}>
                      {review.comment}
                    </TableCell>
                    <TableCell>{review.isApproved ? 'Approved' : 'Pending'}</TableCell>
                    <TableCell className="flex space-x-2">
                      <Button
                        variant="outline"
                        className="border-accent-beige text-primary-darkgreen hover:bg-accent-beige"
                        onClick={() => handleToggleApproval(review._id, !review.isApproved)}
                      >
                        {review.isApproved ? 'Disapprove' : 'Approve'}
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => handleDelete(review._id)}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="flex justify-between mt-4">
              <Button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="bg-primary-darkgreen text-base-white hover:bg-primary-navy"
              >
                Previous
              </Button>
              <span className="text-primary-darkgreen">Page {page} of {totalPages}</span>
              <Button
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
                className="bg-primary-darkgreen text-base-white hover:bg-primary-navy"
              >
                Next
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}