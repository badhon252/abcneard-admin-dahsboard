"use client";

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

import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";

export default function WordManagementTable() {
  const session = useSession();
  const token = session?.data?.accessToken;

  const { data, isLoading } = useQuery({
    queryKey: ["wordmanagements"],
    enabled: !!token,
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/wordmanagement/get-all-wordmanagement`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error("Failed to fetch word managements");

      return res.json();
    },
  });

  const words = data?.data || [];
  const meta = data?.meta;

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-GB");
  };

  return (
    <div className="w-full mx-auto min-h-screen">

      {/* Header */}
      <div className="flex justify-end mb-4">
        <Button className="bg-[#2563EB] hover:bg-blue-700 text-white rounded-md px-4 py-2 flex gap-2">
          <Plus size={18} />
          Add words
        </Button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-sm shadow-sm border border-gray-100 overflow-hidden">
        <Table>
          <TableHeader className="bg-white">
            <TableRow className="hover:bg-transparent border-none">
              <TableHead className="text-center font-bold text-black py-6">
                Word
              </TableHead>
              <TableHead className="text-center font-bold text-black">
                Added Date
              </TableHead>
              <TableHead className="text-center font-bold text-black">
                Category
              </TableHead>
              <TableHead className="text-center font-bold text-black">
                Action
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-6">
                  Loading...
                </TableCell>
              </TableRow>
            ) : (
              words.map((item: any, index: number) => (
                <TableRow
                  key={item._id}
                  className={`${
                    index % 2 === 0 ? "bg-[#F8FAFB]" : "bg-white"
                  } border-none hover:bg-blue-50/30 transition-colors`}
                >
                  <TableCell className="text-center py-4 text-gray-700 capitalize">
                    {item.word}
                  </TableCell>

                  <TableCell className="text-center py-4 text-gray-700">
                    {formatDate(item.createdAt)}
                  </TableCell>

                  <TableCell className="text-center py-4 text-gray-700">
                    {item.categoryType}
                  </TableCell>

                  <TableCell className="text-center py-4">
                    <div className="flex justify-center items-center gap-4">
                      <button className="text-emerald-500 hover:text-emerald-600">
                        <Eye size={20} />
                      </button>

                      <button className="text-blue-500 hover:text-blue-600">
                        <SquarePen size={20} />
                      </button>

                      <button className="text-red-400 hover:text-red-500">
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
          Showing{" "}
          <span className="font-semibold">
            {words.length}
          </span>{" "}
          of{" "}
          <span className="font-semibold">
            {meta?.totalWordmanagements}
          </span>{" "}
          results
        </p>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 bg-slate-100 border-slate-300"
          >
            <ChevronLeft size={20} />
          </Button>

          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 bg-white border-slate-300 font-semibold"
          >
            {meta?.page}
          </Button>

          <Button
            variant="default"
            size="icon"
            className="h-9 w-9 bg-[#2563EB]"
          >
            <ChevronRight size={20} />
          </Button>
        </div>
      </div>
    </div>
  );
}