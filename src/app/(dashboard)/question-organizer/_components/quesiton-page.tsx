/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { Edit, Trash2, Plus, ChevronLeft, ChevronRight } from "lucide-react";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function QuestionPage() {
  const { data: session } = useSession();
  const token = session?.accessToken;
  const queryClient = useQueryClient();

  // State Management
  const [isOpen, setIsOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  const [formData, setFormData] = useState({
    questionText: "",
    options: ["", "", "", ""],
    correctAnswer: "",
    wordRef: "",
  });

  // --- API QUERIES ---

  // 1. Get Questions (Main Table)
  const { data: qData, isLoading: qLoading } = useQuery({
    queryKey: ["questions", filterCategory],
    queryFn: async () => {
      const url =
        filterCategory === "all"
          ? `${API_BASE}/question`
          : `${API_BASE}/question?categoryId=${filterCategory}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.json();
    },
    enabled: !!token,
  });

  // 2. Get All Categories (For filters and dropdowns)
  const { data: catData } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await fetch(
        `${API_BASE}/categoryword/get-all-categorywords`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      return res.json();
    },
    enabled: !!token,
  });

  // Helper: Find the name of the selected category for the word API
  const activeCategoryObject = useMemo(() => {
    return catData?.data?.find((c: any) => c._id === selectedCategory);
  }, [catData, selectedCategory]);

  // 3. Get Word References (Corrected Endpoint & Dependency)
  const { data: wordData, isLoading: wordLoading } = useQuery({
    queryKey: ["words", activeCategoryObject?.name],
    queryFn: async () => {
      const res = await fetch(
        `${API_BASE}/wordmanagement/get-all-wordmanagement?categoryType=${activeCategoryObject?.name}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      return res.json();
    },
    enabled: !!activeCategoryObject?.name && !!token,
  });

  // --- MUTATIONS ---

  const mutation = useMutation({
    mutationFn: async (payload: any) => {
      const url = editId
        ? `${API_BASE}/question/${editId}`
        : `${API_BASE}/question`;
      const method = editId ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      return res.json();
    },
    onSuccess: (data) => {
      if (data.status === "ok" || data.success) {
        queryClient.invalidateQueries({ queryKey: ["questions"] });
        toast.success(
          editId ? "Updated successfully" : "Published successfully",
        );
        closeModal();
      } else {
        toast.error(data.message || "Something went wrong");
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await fetch(`${API_BASE}/question/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["questions"] });
      toast.success("Question deleted");
    },
  });

  // --- HANDLERS ---

  const closeModal = () => {
    setIsOpen(false);
    setEditId(null);
    setFormData({
      questionText: "",
      options: ["", "", "", ""],
      correctAnswer: "",
      wordRef: "",
    });
    setSelectedCategory("");
  };

  const handleEdit = (q: any) => {
    setEditId(q._id);
    setSelectedCategory(q.category?._id || "");
    setFormData({
      questionText: q.questionText,
      options: q.options,
      correctAnswer: q.correctAnswer,
      wordRef: q.wordRef?._id || "",
    });
    setIsOpen(true);
  };

  const submitForm = () => {
    if (
      !selectedCategory ||
      !formData.wordRef ||
      !formData.correctAnswer ||
      !formData.questionText
    ) {
      return toast.error("Please fill all required fields");
    }
    mutation.mutate({
      ...formData,
      category: selectedCategory,
    });
  };

  return (
    <div className="bg-[#F8FAFC] min-h-screen font-poppins">
      {/* Header Actions */}
      <div className="flex justify-end items-center gap-4 mb-8">
        <Select onValueChange={setFilterCategory} defaultValue="all">
          <SelectTrigger className="w-[220px] bg-white border-[#E2E8F0] text-[#64748B] h-11">
            <SelectValue placeholder="Filter by Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {catData?.data?.map((c: any) => (
              <SelectItem key={c._id} value={c._id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Dialog open={isOpen} onOpenChange={(val) => !val && closeModal()}>
          <DialogTrigger asChild>
            <Button
              onClick={() => setIsOpen(true)}
              className="bg-[#3B82F6] hover:bg-blue-600 h-11 px-6 rounded-lg text-white font-medium flex gap-2"
            >
              <Plus className="w-5 h-5" /> Add New
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl p-10">
            <DialogHeader>
              <DialogTitle className="text-[#64748B] text-xl font-normal mb-4">
                {editId ? "Edit Question" : "Add New Question"}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-8">
              <div className="grid grid-cols-2 gap-6">
                {/* Category Selection */}
                <Select
                  value={selectedCategory}
                  onValueChange={setSelectedCategory}
                >
                  <SelectTrigger className="border-[#BFDBFE] text-[#64748B] h-12">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {catData?.data?.map((c: any) => (
                      <SelectItem key={c._id} value={c._id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Word Reference Selection (Corrected) */}
                <Select
                  value={formData.wordRef}
                  onValueChange={(val) =>
                    setFormData({ ...formData, wordRef: val })
                  }
                  disabled={!selectedCategory || wordLoading}
                >
                  <SelectTrigger className="border-[#BFDBFE] text-[#64748B] h-12">
                    <SelectValue
                      placeholder={
                        wordLoading ? "Loading..." : "Select Word Reference"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {wordData?.data?.map((w: any) => (
                      <SelectItem key={w._id} value={w._id}>
                        {w.word}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Question Text */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Question Text:
                </label>
                <Input
                  className="border-[#BFDBFE] h-12 focus-visible:ring-blue-200"
                  placeholder="Enter question text..."
                  value={formData.questionText}
                  onChange={(e) =>
                    setFormData({ ...formData, questionText: e.target.value })
                  }
                />
              </div>

              {/* Options Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Option input
                </label>
                <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                  {formData.options.map((opt, i) => (
                    <div
                      key={i}
                      className="flex items-center border border-[#BFDBFE] rounded-lg px-4 h-12 focus-within:border-blue-400 transition-colors"
                    >
                      <span className="text-[#94A3B8] mr-3 font-medium">
                        {i + 1}.
                      </span>
                      <input
                        className="w-full outline-none text-gray-600 placeholder-[#CBD5E1] bg-transparent"
                        placeholder="Type option..."
                        value={opt}
                        onChange={(e) => {
                          const newOpts = [...formData.options];
                          newOpts[i] = e.target.value;
                          setFormData({ ...formData, options: newOpts });
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Correct Answer Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Correct Answer
                </label>
                <Select
                  value={formData.correctAnswer}
                  onValueChange={(val) =>
                    setFormData({ ...formData, correctAnswer: val })
                  }
                >
                  <SelectTrigger className="border-[#BFDBFE] h-12 text-[#64748B]">
                    <SelectValue placeholder="Select correct option" />
                  </SelectTrigger>
                  <SelectContent>
                    {formData.options.map(
                      (opt, i) =>
                        opt && (
                          <SelectItem key={i} value={opt}>
                            {opt}
                          </SelectItem>
                        ),
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Modal Actions */}
              <div className="flex justify-end gap-4 pt-4">
                <Button
                  onClick={submitForm}
                  disabled={mutation.isPending}
                  className="bg-[#3B82F6] hover:bg-blue-600 w-40 h-12 text-white font-semibold rounded-lg"
                >
                  {mutation.isPending
                    ? "Processing..."
                    : editId
                      ? "Update"
                      : "Publish"}
                </Button>
                <Button
                  variant="outline"
                  onClick={closeModal}
                  className="border-[#3B82F6] text-[#3B82F6] hover:bg-blue-50 w-40 h-12 font-semibold rounded-lg"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Main Table Container */}
      <div className="bg-white rounded-xl shadow-sm border border-[#F1F5F9] overflow-hidden">
        <Table>
          <TableHeader className="bg-white">
            <TableRow className="hover:bg-transparent border-b border-[#F1F5F9]">
              <TableHead className="w-[40%] font-bold text-[#1E293B] py-6 pl-8">
                Question Name
              </TableHead>
              <TableHead className="font-bold text-[#1E293B]">Word</TableHead>
              <TableHead className="font-bold text-[#1E293B]">
                Category
              </TableHead>
              <TableHead className="font-bold text-[#1E293B] text-center">
                Action
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {qLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={4} className="p-4">
                    <Skeleton className="h-10 w-full" />
                  </TableCell>
                </TableRow>
              ))
            ) : Array.isArray(qData?.data?.questions) &&
              qData.data.questions.length > 0 ? (
              qData.data.questions.map((item: any) => (
                <TableRow
                  key={item._id}
                  className="border-b border-[#F8FAFC] hover:bg-[#F8FAFC]/50 transition-colors"
                >
                  <TableCell className="py-5 pl-8 text-[#64748B] font-medium">
                    {item.questionText}
                  </TableCell>
                  <TableCell className="text-[#64748B]">
                    {item.wordRef?.word || "—"}
                  </TableCell>
                  <TableCell className="text-[#64748B]">
                    {item.category?.name || "Uncategorized"}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-center items-center gap-3">
                      <button
                        onClick={() => handleEdit(item)}
                        className="p-2 hover:bg-green-50 rounded-full transition-colors group"
                      >
                        <Edit className="w-5 h-5 text-[#4ADE80] group-hover:text-green-600" />
                      </button>
                      <button
                        onClick={() => deleteMutation.mutate(item._id)}
                        className="p-2 hover:bg-red-50 rounded-full transition-colors group"
                      >
                        <Trash2 className="w-5 h-5 text-[#F87171] group-hover:text-red-600" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center py-20 text-[#64748B]"
                >
                  No questions found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Footer */}
      <div className="flex justify-between items-center mt-10">
        <p className="text-[#64748B] text-sm">
          Showing {qData?.data?.questions?.length || 0} of{" "}
          {qData?.data?.meta?.totalQuestions || 0} results
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-[#64748B] border border-[#E2E8F0]"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button className="h-9 w-9 bg-white text-[#64748B] border border-[#E2E8F0]">
            1
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 bg-[#3B82F6] text-white hover:bg-blue-600"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
