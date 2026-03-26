/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { Eye, ChevronLeft, ChevronRight } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function QuizHistoryPage() {
  const { data: session } = useSession();
  const token = session?.accessToken;

  const [selectedQuiz, setSelectedQuiz] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // You can adjust this number

  // Fetch Quiz Data
  const { data: quizData, isLoading } = useQuery({
    queryKey: ["quizzes-admin"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/quiz/admin/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.json();
    },
    enabled: !!token,
  });

  const handleViewDetails = (quiz: any) => {
    setSelectedQuiz(quiz);
    setIsDetailsOpen(true);
  };

  // Get all quizzes from the response
  const allQuizzes = quizData?.data?.quizzes || [];
  const totalQuizzes = quizData?.data?.meta?.totalQuizzes || allQuizzes.length;

  // Calculate pagination
  const totalPages = Math.ceil(allQuizzes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentQuizzes = allQuizzes.slice(startIndex, endIndex);

  // Handle page change
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push("...");
        pageNumbers.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pageNumbers.push(1);
        pageNumbers.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pageNumbers.push(i);
        }
      } else {
        pageNumbers.push(1);
        pageNumbers.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push("...");
        pageNumbers.push(totalPages);
      }
    }

    return pageNumbers;
  };

  return (
    <div className="bg-[#F8FAFC] min-h-screen font-poppins">
      <div className="bg-white rounded-xl shadow-sm border border-[#F1F5F9] overflow-hidden">
        <Table>
          <TableHeader className="bg-[#F8FAFC]">
            <TableRow className="hover:bg-transparent border-b border-[#F1F5F9]">
              <TableHead className="font-bold text-[#1E293B] py-6 pl-8 text-center">
                Quiz
              </TableHead>
              <TableHead className="font-bold text-[#1E293B] text-center">
                Attempted Date
              </TableHead>
              <TableHead className="font-bold text-[#1E293B] text-center">
                User Name
              </TableHead>
              <TableHead className="font-bold text-[#1E293B] text-center">
                Action
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={4} className="p-4">
                      <Skeleton className="h-10 w-full" />
                    </TableCell>
                  </TableRow>
                ))
              : currentQuizzes.map((quiz: any) => (
                  <TableRow
                    key={quiz._id}
                    className="border-b border-[#F8FAFC] hover:bg-[#F8FAFC]/50 transition-colors"
                  >
                    <TableCell className="py-5 pl-8 text-[#1E293B] font-medium text-center">
                      {quiz.category?.name || "N/A"}
                    </TableCell>
                    <TableCell className="text-[#64748B] text-center">
                      {quiz.createdAt
                        ? format(new Date(quiz.createdAt), "dd-MM-yyyy")
                        : "—"}
                    </TableCell>
                    <TableCell className="text-[#64748B] text-center">
                      {quiz.user?.name || "Unknown"}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-center items-center">
                        <button
                          onClick={() => handleViewDetails(quiz)}
                          className="p-2 hover:bg-green-50 rounded-full transition-colors group"
                        >
                          <Eye className="w-5 h-5 text-[#4ADE80] group-hover:text-green-600" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>

        {/* Show message if no data */}
        {!isLoading && allQuizzes.length === 0 && (
          <div className="text-center py-8 text-[#64748B]">
            No quiz attempts found
          </div>
        )}
      </div>

      {/* Pagination (Figma Style) - Only show if there are quizzes */}
      {!isLoading && allQuizzes.length > 0 && (
        <div className="flex justify-between items-center mt-10 bg-[#E8F0FE] p-4 rounded-lg">
          <p className="text-[#64748B] text-sm font-medium">
            Showing {startIndex + 1} to {Math.min(endIndex, allQuizzes.length)}{" "}
            of {totalQuizzes} results
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="h-9 w-9 bg-white text-[#64748B] border-none shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>

            {getPageNumbers().map((page, index) => (
              <React.Fragment key={index}>
                {page === "..." ? (
                  <span className="h-9 w-9 flex items-center justify-center text-[#64748B]">
                    ...
                  </span>
                ) : (
                  <Button
                    onClick={() => goToPage(page as number)}
                    className={`h-9 w-9 border-none shadow-sm ${
                      currentPage === page
                        ? "bg-[#3B82F6] text-white hover:bg-blue-600"
                        : "bg-white text-[#1E293B] hover:bg-gray-100"
                    }`}
                  >
                    {page}
                  </Button>
                )}
              </React.Fragment>
            ))}

            <Button
              variant="outline"
              size="icon"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="h-9 w-9 bg-white text-[#64748B] border-none shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* --- Details Modal (See All Answers) --- */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 border-none bg-[#F4F7FE]">
          <DialogHeader className="p-6 bg-[#E8F0FE]">
            <DialogTitle className="text-center text-[#3B82F6] text-2xl font-bold">
              See All Answers
            </DialogTitle>
          </DialogHeader>

          <div className="p-8 space-y-8">
            {selectedQuiz?.attempt?.answeredQuestions?.map(
              (q: any, idx: number) => (
                <div key={idx} className="space-y-4">
                  <h3 className="text-[#475569] font-bold text-lg">
                    {idx + 1}. Question Title
                  </h3>

                  {/* Question Text Box */}
                  <div className="w-full bg-[#E8F0FE] border border-[#BFDBFE] rounded-lg p-4 text-[#3B82F6]">
                    {q.questionText}
                  </div>

                  <div className="space-y-2">
                    <p className="text-[#475569] font-semibold text-sm">
                      Selected Answer
                    </p>
                    <div className="w-full bg-[#F8FAFC] border border-[#4ADE80] rounded-lg p-4 text-[#4ADE80]">
                      {q.selectedAnswer}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-[#475569] font-semibold text-sm">
                      Correct Answer
                    </p>
                    <div className="w-full bg-[#F8FAFC] border border-[#4ADE80] rounded-lg p-4 text-[#4ADE80]">
                      {q.correctAnswer}
                    </div>
                  </div>
                </div>
              ),
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
