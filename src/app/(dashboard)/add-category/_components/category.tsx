"use client";

import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Button } from "@/components/ui/button";

import {
  Plus,
  SquarePen,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { toast } from "sonner";

interface CategoryWord {
  _id: string;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: string;
}

interface CategoryResponse {
  data: CategoryWord[];
  meta: {
    page: number;
    limit: number;
    totalCategoryWords: number;
    totalPages: number;
  };
}

export default function CategoryTable() {
  const session = useSession();
  const token = session?.data?.accessToken;
  const queryClient = useQueryClient();

  const [page, setPage] = React.useState(1);
  const limit = 10;

  const { data, isLoading } = useQuery<CategoryResponse>({
    queryKey: ["categories", page],
    enabled: !!token,
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/categoryword/get-all-categorywords?page=${page}&limit=${limit}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) throw new Error("Failed to fetch categories");
      return res.json();
    },
  });

  const categories = data?.data || [];
  const meta = data?.meta;
  const totalPages = meta?.totalPages || 1;

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-GB");

  // DELETE
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/categoryword/delete-categoryword/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) throw new Error("Delete failed");
      return res.json();
    },

    onSuccess: () => {
      toast.success("Category deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },

    onError: () => {
      toast.error("Delete failed");
    },
  });

  return (
    <div className="w-full mx-auto min-h-screen">

      {/* Header */}
      <div className="flex justify-end mb-4">
        <Link href="/add-category/add">
          <Button className="bg-[rgb(37,99,235)] hover:bg-blue-700 text-white flex gap-2">
            <Plus size={18} /> Add Category
          </Button>
        </Link>
      </div>

      {/* Table */}
      <div className="bg-white rounded-sm shadow-sm border border-gray-100 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-center font-bold py-6">Name</TableHead>
              <TableHead className="text-center font-bold">
                Description
              </TableHead>
              <TableHead className="text-center font-bold">Status</TableHead>
              <TableHead className="text-center font-bold">
                Created Date
              </TableHead>
              <TableHead className="text-center font-bold">Action</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-6">
                  Loading...
                </TableCell>
              </TableRow>
            ) : (
              categories.map((item, index) => (
                <TableRow
                  key={item._id}
                  className={index % 2 === 0 ? "bg-[#F8FAFB]" : "bg-white"}
                >
                  <TableCell className="text-center py-4 capitalize">
                    {item.name}
                  </TableCell>

                  <TableCell className="text-center py-4">
                    {item.description}
                  </TableCell>

                  <TableCell className="text-center py-4">
                    {item.isActive ? (
                      <span className="text-green-600 font-medium">
                        Active
                      </span>
                    ) : (
                      <span className="text-red-500 font-medium">
                        Inactive
                      </span>
                    )}
                  </TableCell>

                  <TableCell className="text-center py-4">
                    {formatDate(item.createdAt)}
                  </TableCell>

                  <TableCell className="text-center py-4">
                    <div className="flex justify-center gap-4">

                      {/* DELETE */}
                      <button
                        onClick={() => deleteMutation.mutate(item._id)}
                        className="text-red-500 hover:text-red-600"
                      >
                        <Trash2 size={20} />
                      </button>

                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="mt-6 flex items-center justify-between bg-[#E9EFFF] p-4 rounded-sm">
        <p className="text-sm text-gray-600">
          Showing <span className="font-semibold">{categories.length}</span> of{" "}
          <span className="font-semibold">
            {meta?.totalCategoryWords}
          </span>{" "}
          results
        </p>

        <div className="flex gap-2 items-center">
          <Button
            variant="outline"
            size="icon"
            disabled={page === 1}
            onClick={() => setPage((prev) => prev - 1)}
          >
            <ChevronLeft size={18} />
          </Button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Button
              key={p}
              variant={p === page ? "default" : "outline"}
              size="icon"
              onClick={() => setPage(p)}
            >
              {p}
            </Button>
          ))}

          <Button
            variant="outline"
            size="icon"
            disabled={page === totalPages}
            onClick={() => setPage((prev) => prev + 1)}
          >
            <ChevronRight size={18} />
          </Button>
        </div>
      </div>

    </div>
  );
}