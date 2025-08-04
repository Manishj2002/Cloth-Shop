'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AdminSidebar from '@/components/AdminSidebar';

export default function Reviews() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [reviews, setReviews] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    if (status === 'unauthenticated' || (session && session.user.role !== 'Admin')) {
      router.push('/auth/signin');
    } else {
      const fetchReviews = async () => {
        const res = await fetch(`/api/reviews?page=${page}&limit=${itemsPerPage}`);
        const data = await res.json();
        setReviews(data.reviews);
        setTotalPages(data.totalPages);
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
      }
    } catch (error) {
      console.error('Error updating review:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/reviews?id=${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setReviews(reviews.filter((review) => review._id !== id));
      }
    } catch (error) {
      console.error('Error deleting review:', error);
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
                {reviews.map((review) => (
                  <TableRow key={review._id}>
                    <TableCell>{review.user?.name || 'N/A'}</TableCell>
                    <TableCell>{review.product?.name || 'N/A'}</TableCell>
                    <TableCell>{review.rating}</TableCell>
                    <TableCell>{review.comment}</TableCell>
                    <TableCell>{review.isApproved ? 'Approved' : 'Pending'}</TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        className="border-accent-beige text-primary-darkgreen hover:bg-accent-beige mr-2"
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