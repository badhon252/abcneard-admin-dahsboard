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
  Eye,
  SquarePen,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { WordManagement, WordManagementResponse } from "@/lib/types/worddatatype";
import Link from "next/link";
import { toast } from "sonner";

export default function WordManagementTable() {
  const session = useSession();
  const token = session?.data?.accessToken;
  const queryClient = useQueryClient();

  const [open, setOpen] = React.useState(false);
  const [selectedWord, setSelectedWord] = React.useState<WordManagement>();
  const [page, setPage] = React.useState(1);
  const limit = 10;

  // Fetch words
  const { data, isLoading } = useQuery<WordManagementResponse>({
    queryKey: ["wordmanagements", page],
    enabled: !!token,
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/wordmanagement/get-all-wordmanagement?page=${page}&limit=${limit}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error("Failed to fetch word managements");
      return res.json();
    },
  });

  const words = data?.data || [];
  const meta = data?.meta;
  const totalPages = meta ? Math.ceil(meta.totalWordmanagements / limit) : 1;

  const formatDate = (date: string) => new Date(date).toLocaleDateString("en-GB");

  const handleView = (word: WordManagement) => {
    setSelectedWord(word);
    setOpen(true);
  };

  // DELETE mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/wordmanagement/delete-wordmanagement/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) throw new Error("Failed to delete word");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Word deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["wordmanagements", page] });
    },
    onError: () => {
      toast.error("Failed to delete word");
    },
  });

  return (
    <div className="w-full mx-auto min-h-screen">

      {/* Header */}
      <div className="flex justify-end mb-4">
        <Link href="/word-management/add">
          <Button className="bg-[#2563EB] hover:bg-blue-700 text-white rounded-md px-4 py-2 flex gap-2">
            <Plus size={18} /> Add words
          </Button>
        </Link>
      </div>

      {/* Table */}
      <div className="bg-white rounded-sm shadow-sm border border-gray-100 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-center font-bold py-6">Word</TableHead>
              <TableHead className="text-center font-bold">Added Date</TableHead>
              <TableHead className="text-center font-bold">Category</TableHead>
              <TableHead className="text-center font-bold">Action</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-6">Loading...</TableCell>
              </TableRow>
            ) : (
              words.map((item, index) => (
                <TableRow
                  key={item._id}
                  className={`${index % 2 === 0 ? "bg-[#F8FAFB]" : "bg-white"}`}
                >
                  <TableCell className="text-center py-4 capitalize">{item.word}</TableCell>
                  <TableCell className="text-center py-4">{formatDate(item.createdAt)}</TableCell>
                  <TableCell className="text-center py-4">{item.categoryType}</TableCell>

                  <TableCell className="text-center py-4">
                    <div className="flex justify-center gap-4">

                      {/* VIEW */}
                      <button
                        onClick={() => handleView(item)}
                        className="text-emerald-500 cursor-pointer hover:text-emerald-600"
                      >
                        <Eye size={20} />
                      </button>

                      {/* EDIT */}
                     <Link href={`/word-management/${item._id}`}>
                      <button className="text-blue-500 hover:text-blue-600">
                        <SquarePen className="cursor-pointer" size={20} />
                      </button>
                      </Link>

                      {/* DELETE */}
                      <button
                        onClick={() => deleteMutation.mutate(item._id)}
                        className="cursor-pointer text-red-400 hover:text-red-500"
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
          Showing <span className="font-semibold">{words.length}</span> of{" "}
          <span className="font-semibold">{meta?.totalWordmanagements}</span> results
        </p>

        <div className="flex gap-2 items-center">
          {/* Previous */}
          <Button
            variant="outline"
            size="icon"
            disabled={page === 1}
            onClick={() => setPage((prev) => prev - 1)}
          >
            <ChevronLeft size={18} />
          </Button>

          {/* Numbered Pagination */}
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
            if (p === 1 || p === totalPages || (p >= page - 1 && p <= page + 1)) {
              return (
                <Button
                  key={p}
                  variant={p === page ? "default" : "outline"}
                  size="icon"
                  onClick={() => setPage(p)}
                >
                  {p}
                </Button>
              );
            } else if ((p === page - 2 && page > 3) || (p === page + 2 && page < totalPages - 2)) {
              return <span key={p} className="px-2">...</span>;
            } else {
              return null;
            }
          })}

          {/* Next */}
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

      {/* View Modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Word Details</DialogTitle>
          </DialogHeader>

          {selectedWord && (
            <div className="space-y-4 text-sm">
              <div>
                <p className="font-semibold">Word</p>
                <p>{selectedWord.word}</p>
              </div>
              <div>
                <p className="font-semibold">Pronunciation</p>
                <p>{selectedWord.pronunciation}</p>
              </div>
              <div>
                <p className="font-semibold">Description</p>
                <p>{selectedWord.description}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

    </div>
  );
}