'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AdminSidebar from '@/components/AdminSidebar';


type User = {
  _id: string;
  name: string;
  email: string;
  role: string;
  isBanned: boolean;
  isVerified: boolean;
  createdAt: string;
};

export default function Users() {
  const { data: rawSession, status } = useSession();
 const session = rawSession;
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    if (status === 'unauthenticated' || (session && session.user.role !== 'Admin')) {
      router.push('/auth/signin');
    } else {
      const fetchUsers = async () => {
        try {
          const res = await fetch(`/api/users?search=${search}&page=${page}&limit=${itemsPerPage}`);
          if (res.ok) {
            const data = await res.json();
            setUsers(data.users);
            setTotalPages(data.totalPages);
          } else {
            console.error('Error fetching users:', await res.text());
          }
        } catch (error) {
          console.error('Error fetching users:', error);
        }
      };
      fetchUsers();
    }
  }, [session, status, router, search, page]);

  const handleRoleUpdate = async (id: string, role: string) => {
    try {
      const res = await fetch(`/api/users?id=${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });
      if (res.ok) {
        setUsers(users.map((user) => (user._id === id ? { ...user, role } : user)));
        alert(`User role updated to ${role} successfully`);
      } else {
        console.error('Error updating role:', await res.text());
        alert('Failed to update user role');
      }
    } catch (error) {
      console.error('Error updating role:', error);
      alert('Failed to update user role');
    }
  };

  const handleBanToggle = async (id: string, isBanned: boolean) => {
    try {
      const res = await fetch(`/api/users?id=${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isBanned }),
      });
      if (res.ok) {
        setUsers(users.map((user) => (user._id === id ? { ...user, isBanned } : user)));
        alert(`User ${isBanned ? 'banned' : 'unbanned'} successfully`);
      } else {
        console.error('Error updating ban status:', await res.text());
        alert('Failed to update ban status');
      }
    } catch (error) {
      console.error('Error updating ban status:', error);
      alert('Failed to update ban status');
    }
  };

  if (status === 'loading') return <div>Loading...</div>;

  return (
    <div className="container mx-auto p-4 flex flex-col md:flex-row gap-4">
      <AdminSidebar />
      <div className="md:w-3/4">
        <Card className="bg-base-white border-accent-beige">
          <CardContent className="p-6">
            <h1 className="text-3xl font-heading text-primary-darkgreen mb-4">Users</h1>
            <div className="mb-4">
              <Input
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border-accent-beige max-w-md"
              />
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Registered</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user: User) => (
                  <TableRow key={user._id}>
                    <TableCell className="max-w-xs truncate" title={user.name}>
                      {user.name}
                    </TableCell>
                    <TableCell className="max-w-xs truncate" title={user.email}>
                      {user.email}
                    </TableCell>
                    <TableCell>
                      <Select
                        value={user.role}
                        onValueChange={(value) => handleRoleUpdate(user._id, value)}
                      >
                        <SelectTrigger className="border-accent-beige w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="User">User</SelectItem>
                          <SelectItem value="Admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>{user.isBanned ? 'Banned' : user.isVerified ? 'Verified' : 'Unverified'}</TableCell>
                    <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        className="border-accent-beige text-primary-darkgreen hover:bg-accent-beige"
                        onClick={() => handleBanToggle(user._id, !user.isBanned)}
                      >
                        {user.isBanned ? 'Unban' : 'Ban'}
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