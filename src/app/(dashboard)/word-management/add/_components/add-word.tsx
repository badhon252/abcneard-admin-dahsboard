"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, X, Upload, FileText, Download, CheckCircle2, Trash2, Info, ChevronRight, ListPlus } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { CategoryWordsResponse } from "@/lib/types/categorydata";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function AddWordForm() {
  const session = useSession();
  const token = session?.data?.accessToken;

  const [formData, setFormData] = useState({
    word: "",
    description: "",
    pronunciation: "",
    categoryWordId: "",
    partOfSpeech: "",
  });

  const [synonyms, setSynonyms] = useState<string[]>([]);
  const [examples, setExamples] = useState<string[]>([]);
  const [synonymInput, setSynonymInput] = useState("");
  const [exampleInput, setExampleInput] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState<"single" | "bulk">("single");

  /* ------------------ GET CATEGORY WORDS ------------------ */

  const { data, isLoading } = useQuery<CategoryWordsResponse>({
    queryKey: ["categorywords"],
    enabled: !!token,
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/categoryword/get-all-categorywords`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error("Failed to fetch categories");

      return res.json();
    },
  });

  const categories = data?.data || [];

  /* ------------------ ADD WORD API ------------------ */

  const mutation = useMutation({
    mutationFn: async (body: {
      word: string;
      description: string;
      pronunciation: string;
      categoryWordId: string;
      partOfSpeech: string;
      synonyms: string[];
      examples: string[];
      wordType: string;
    }) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/wordmanagement/create-wordmanagement`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        }
      );

      if (!res.ok) throw new Error("Failed to add word");

      return res.json();
    },
    onSuccess: () => {
      toast.success("Word added successfully");
      handleCancel();
    },
    onError: () => {
      toast.error("Something went wrong");
    },
  });

  /* ------------------ BULK UPLOAD API ------------------ */

  const bulkMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/wordmanagement/bulk-upload`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData?.message || "Failed to bulk upload words");
      }

      return res.json();
    },
    onSuccess: () => {
      toast.success("Words uploaded successfully");
      setFile(null);
      // Reset the file input manually if needed
      const fileInput = document.getElementById("csv-upload") as HTMLInputElement;
      if (fileInput) fileInput.value = "";
    },
    onError: (error: Error) => {
      toast.error(error.message || "Something went wrong during bulk upload");
    },
  });

  /* ------------------ HANDLERS ------------------ */

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const addSynonym = () => {
    if (!synonymInput.trim()) return;

    setSynonyms([...synonyms, synonymInput]);
    setSynonymInput("");
  };

  const addExample = () => {
    if (!exampleInput.trim()) return;

    setExamples([...examples, exampleInput]);
    setExampleInput("");
  };

  const removeSynonym = (index: number) => {
    setSynonyms(synonyms.filter((_, i) => i !== index));
  };

  const removeExample = (index: number) => {
    setExamples(examples.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const body = {
      ...formData,
      synonyms,
      examples,
      wordType: "Entire",
    };

    mutation.mutate(body);
  };

  const handleCancel = () => {
    setFormData({
      word: "",
      description: "",
      pronunciation: "",
      categoryWordId: "",
      partOfSpeech: "",
    });

    setSynonyms([]);
    setExamples([]);
    setSynonymInput("");
    setExampleInput("");
    setFile(null);
    const fileInput = document.getElementById("csv-upload") as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  return (
    <div className="w-full max-w-5xl mx-auto pb-12">
      {/* Header Section */}
      <div className="mb-8 space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
          <ListPlus className="text-primary w-8 h-8" />
          Add New Words
        </h1>
        <p className="text-muted-foreground">
          Expand your dictionary by adding individual words manually or uploading them in bulk using a CSV file.
        </p>
      </div>

      {/* Tab Switcher */}
      <div className="flex p-1 bg-gray-100 rounded-lg w-fit mb-8">
        <button
          onClick={() => setActiveTab("single")}
          className={cn(
            "px-6 py-2 rounded-md text-sm font-medium transition-all duration-200",
            activeTab === "single"
              ? "bg-white text-primary shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          )}
        >
          Single Word
        </button>
        <button
          onClick={() => setActiveTab("bulk")}
          className={cn(
            "px-6 py-2 rounded-md text-sm font-medium transition-all duration-200",
            activeTab === "bulk"
              ? "bg-white text-primary shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          )}
        >
          Bulk Upload
        </button>
      </div>

      <div className="transition-all duration-300">
        {activeTab === "single" ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Content Card */}
              <Card className="lg:col-span-2 shadow-sm border-gray-200">
                <CardHeader>
                  <CardTitle className="text-xl">Basic Information</CardTitle>
                  <CardDescription>Enter the core details for the new word.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Word */}
                  <div className="space-y-2">
                    <Label htmlFor="word" className="text-sm font-medium">Word</Label>
                    <Input
                      id="word"
                      placeholder="e.g. Opportunity"
                      value={formData.word}
                      onChange={(e) => handleChange("word", e.target.value)}
                      className="h-11 border-gray-200 focus:border-primary transition-all"
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-sm font-medium">Description</Label>
                    <Input
                      id="description"
                      placeholder="Provide a clear definition..."
                      value={formData.description}
                      onChange={(e) => handleChange("description", e.target.value)}
                      className="h-11 border-gray-200 focus:border-primary transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Pronunciation */}
                    <div className="space-y-2">
                      <Label htmlFor="pronunciation" className="text-sm font-medium">Pronunciation</Label>
                      <Input
                        id="pronunciation"
                        placeholder="e.g. /ˌɒpəˈtjuːnəti/"
                        value={formData.pronunciation}
                        onChange={(e) => handleChange("pronunciation", e.target.value)}
                        className="h-11 border-gray-200 focus:border-primary transition-all"
                      />
                    </div>

                    {/* Part Of Speech */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Part Of Speech</Label>
                      <Select onValueChange={(v) => handleChange("partOfSpeech", v)}>
                        <SelectTrigger className="h-11 border-gray-200 bg-white">
                          <SelectValue placeholder="Select Part Of Speech" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Noun">Noun</SelectItem>
                          <SelectItem value="Verb">Verb</SelectItem>
                          <SelectItem value="Adjective">Adjective</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Category */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Category</Label>
                    <Select onValueChange={(v) => handleChange("categoryWordId", v)}>
                      <SelectTrigger className="h-11 border-gray-200 bg-white">
                        <SelectValue placeholder="Select Category" />
                      </SelectTrigger>
                      <SelectContent>
                        {isLoading ? (
                          <SelectItem value="loading">Loading...</SelectItem>
                        ) : (
                          categories.map((cat) => (
                            <SelectItem key={cat._id} value={cat._id}>
                              {cat.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Sidebar Content (Synonyms & Examples) */}
              <div className="space-y-6">
                {/* Synonyms Card */}
                <Card className="shadow-sm border-gray-200 overflow-hidden">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Plus className="w-4 h-4 text-primary" /> Synonyms
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-2">
                      <Input
                        value={synonymInput}
                        placeholder="Add synonym..."
                        onChange={(e) => setSynonymInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSynonym())}
                        className="h-9 border-gray-200 transition-all"
                      />
                      <button
                        type="button"
                        onClick={addSynonym}
                        className="p-2 bg-primary/10 text-primary rounded-md hover:bg-primary hover:text-white transition-all flex items-center justify-center shrink-0"
                      >
                        <Plus size={18} />
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2 min-h-[40px] items-start">
                      {synonyms.length === 0 ? (
                        <p className="text-xs text-muted-foreground italic py-2">No synonyms added yet.</p>
                      ) : (
                        synonyms.map((item, i) => (
                          <Badge
                            key={i}
                            variant="secondary"
                            className="pl-3 pr-1 py-1 gap-1 flex items-center bg-blue-50 text-blue-700 border-blue-100 group"
                          >
                            {item}
                            <button
                              type="button"
                              onClick={() => removeSynonym(i)}
                              className="p-0.5 rounded-full hover:bg-red-100 hover:text-red-600 transition-colors"
                            >
                              <X size={12} />
                            </button>
                          </Badge>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Examples Card */}
                <Card className="shadow-sm border-gray-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <ListPlus className="w-4 h-4 text-primary" /> Examples
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add sentence..."
                        value={exampleInput}
                        onChange={(e) => setExampleInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addExample())}
                        className="h-9 border-gray-200 transition-all"
                      />
                      <button
                        type="button"
                        onClick={addExample}
                        className="p-2 bg-primary/10 text-primary rounded-md hover:bg-primary hover:text-white transition-all flex items-center justify-center shrink-0"
                      >
                        <Plus size={18} />
                      </button>
                    </div>
                    <div className="flex flex-col gap-2 min-h-[40px]">
                      {examples.length === 0 ? (
                        <p className="text-xs text-muted-foreground italic py-2">No examples added yet.</p>
                      ) : (
                        examples.map((item, i) => (
                          <div
                            key={i}
                            className="flex items-start justify-between bg-gray-50 p-3 rounded-lg border border-gray-100 group text-sm"
                          >
                            <span className="text-gray-700">{item}</span>
                            <button
                              type="button"
                              onClick={() => removeExample(i)}
                              className="text-gray-400 hover:text-red-500 transition-colors shrink-0"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-4 pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={handleCancel}
                className="text-gray-500 hover:text-gray-900"
              >
                Reset Form
              </Button>
              <Button
                type="submit"
                disabled={mutation.isPending}
                className="bg-primary hover:bg-primary/90 text-white h-11 px-8 rounded-lg shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
              >
                {mutation.isPending ? "Saving..." : (
                  <div className="flex items-center gap-2 font-semibold">
                    Complete Entry <ChevronRight size={18} />
                  </div>
                )}
              </Button>
            </div>
          </form>
        ) : (
          /* BULK UPLOAD MODE */
          <div className="max-w-3xl mx-auto space-y-6">
            <Card className="border-2 border-dashed border-gray-200 shadow-none bg-white p-8">
              <CardContent className="flex flex-col items-center justify-center space-y-6 p-0 py-8">
                <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center border-2 border-blue-100 shadow-inner group">
                  <Upload className="w-10 h-10 text-primary transition-transform group-hover:-translate-y-1" />
                </div>
                
                <div className="text-center space-y-2">
                  <h3 className="text-xl font-semibold text-gray-900">Upload your CSV file</h3>
                  <p className="text-sm text-gray-500 max-w-xs mx-auto">
                    Drag and drop your word list here or click to browse files.
                  </p>
                </div>

                <div className="w-full max-w-md relative">
                  <Input
                    id="csv-upload"
                    type="file"
                    accept=".csv"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="flex items-center justify-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100">
                    {file ? (
                      <div className="flex items-center gap-3 text-emerald-600">
                        <FileText size={20} className="shrink-0" />
                        <span className="truncate max-w-[240px]">{file.name}</span>
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-100 px-2">
                          {(file.size / 1024).toFixed(1)} KB
                        </Badge>
                      </div>
                    ) : (
                      "Select CSV File"
                    )}
                  </div>
                </div>

                {file && (
                  <Button
                    onClick={() => bulkMutation.mutate(file)}
                    disabled={bulkMutation.isPending}
                    className="w-full max-w-xs bg-emerald-600 hover:bg-emerald-700 text-white h-11 shadow-lg shadow-emerald-200/50"
                  >
                    {bulkMutation.isPending ? "Processing..." : (
                      <div className="flex items-center gap-2 font-semibold font-xl">
                        <CheckCircle2 size={18} /> Upload {file.name}
                      </div>
                    )}
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Guidance Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 flex gap-3">
                <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-blue-900">Format Requirement</p>
                  <p className="text-xs text-blue-700 leading-relaxed">
                    Ensure your CSV has these exact headers: <code className="bg-blue-100 px-1 rounded">Word</code>, <code className="bg-blue-100 px-1 rounded">Description</code>, <code className="bg-blue-100 px-1 rounded">Example</code>, <code className="bg-blue-100 px-1 rounded">Category</code>, <code className="bg-blue-100 px-1 rounded">Tags</code>.
                  </p>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex gap-3 group cursor-pointer hover:bg-gray-100 transition-colors">
                <Download className="w-5 h-5 text-gray-500 shrink-0 mt-0.5 group-hover:text-primary" />
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-gray-900">Need a Template?</p>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Download our sample CSV to ensure your data is formatted correctly before uploading.
                  </p>
                  <button className="text-xs font-semibold text-primary flex items-center gap-1 mt-1">
                    Download Sample.csv <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}