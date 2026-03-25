"use client";

import React, { useState, useEffect } from "react";
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
import { Plus, X } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { CategoryWordsResponse } from "@/lib/types/categorydata";
import { useRouter } from "next/navigation";

interface EditWordFormProps {
  wordId: string;
}

export default function EditWordForm({ wordId }: EditWordFormProps) {
  const session = useSession();
  const token = session?.data?.accessToken;
  const router = useRouter();

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
  const [isInitialized, setIsInitialized] = useState(false);

  /* ------------------ GET CATEGORY WORDS ------------------ */
  const { data: categoriesData, isLoading: catLoading } = useQuery<CategoryWordsResponse>({
    queryKey: ["categorywords"],
    enabled: !!token,
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/categoryword/get-all-categorywords`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error("Failed to fetch categories");
      return res.json();
    },
  });

  const categories = categoriesData?.data || [];

  /* ------------------ GET SINGLE WORD ------------------ */
  const { data: wordData, isLoading: wordLoading } = useQuery({
    queryKey: ["word", wordId],
    enabled: !!token && !!wordId,
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/wordmanagement/get-single-wordmanagement/${wordId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error("Failed to fetch word");
      return res.json();
    },
  });

  /* ------------------ INITIALIZE FORM ------------------ */
  useEffect(() => {
    if (!wordData || isInitialized) return;

    const word = wordData.data;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFormData({
      word: word.word,
      description: word.description,
      pronunciation: word.pronunciation,
      categoryWordId: word.categoryWordId,
      partOfSpeech: word.partOfSpeech,
    });
    setSynonyms(word.synonyms || []);
    setExamples(word.examples || []);
    setIsInitialized(true);
  }, [wordData, isInitialized]);

  /* ------------------ UPDATE WORD ------------------ */
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
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/wordmanagement/update-wordmanagement/${wordId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        }
      );
      if (!res.ok) throw new Error("Failed to update word");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Word updated successfully!");
      router.back();
    },
    onError: () => toast.error("Failed to update word"),
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

  const removeSynonym = (index: number) => {
    setSynonyms(synonyms.filter((_, i) => i !== index));
  };

  const addExample = () => {
    if (!exampleInput.trim()) return;
    setExamples([...examples, exampleInput]);
    setExampleInput("");
  };

  const removeExample = (index: number) => {
    setExamples(examples.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({ ...formData, synonyms, examples, wordType: "Entire" });
  };

  const handleCancel = () => {
    router.back();
  };

  if (wordLoading) return <p>Loading word data...</p>;

  return (
    <div className="w-full mx-auto bg-[#F8FAFF] shadow-sm rounded-lg border">
      <div className="bg-[#E9EFFF] py-4 text-center">
        <h2 className="text-[#2563EB] text-2xl font-bold">Edit Word</h2>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-5">
        {/* Word */}
        <div className="space-y-2">
          <Label>Word</Label>
          <Input
            placeholder="Opportunity"
            value={formData.word}
            onChange={(e) => handleChange("word", e.target.value)}
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label>Description</Label>
          <Input
            placeholder="Description"
            value={formData.description}
            onChange={(e) => handleChange("description", e.target.value)}
          />
        </div>

        {/* Pronunciation + Category */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Pronunciation</Label>
            <Input
              placeholder="/ˌɒpəˈtjuːnəti/"
              value={formData.pronunciation}
              onChange={(e) => handleChange("pronunciation", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Category</Label>
            <Select
              value={formData.categoryWordId}
              onValueChange={(v) => handleChange("categoryWordId", v)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent>
                {catLoading ? (
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
        </div>

        {/* Synonyms */}
        <div className="space-y-2">
          <Label>Synonyms</Label>
          <div className="flex gap-2">
            <Input value={synonymInput} onChange={(e) => setSynonymInput(e.target.value)} />
            <Button type="button" onClick={addSynonym}>
              <Plus size={18} />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {synonyms.map((item, i) => (
              <div key={i} className="flex items-center gap-2 bg-blue-100 px-3 py-1 rounded">
                {item}
                <X size={14} className="cursor-pointer" onClick={() => removeSynonym(i)} />
              </div>
            ))}
          </div>
        </div>

        {/* Examples */}
        <div className="space-y-2">
          <Label>Examples</Label>
          <div className="flex gap-2">
            <Input value={exampleInput} onChange={(e) => setExampleInput(e.target.value)} />
            <Button type="button" onClick={addExample}>
              <Plus size={18} />
            </Button>
          </div>
          <div className="flex flex-col gap-2">
            {examples.map((item, i) => (
              <div key={i} className="flex justify-between bg-blue-100 px-3 py-2 rounded">
                {item}
                <X size={14} className="cursor-pointer" onClick={() => removeExample(i)} />
              </div>
            ))}
          </div>
        </div>

        {/* Part of Speech */}
        <div className="space-y-2">
          <Label>Part Of Speech</Label>
          <Select value={formData.partOfSpeech} onValueChange={(v) => handleChange("partOfSpeech", v)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Part Of Speech" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Noun">Noun</SelectItem>
              <SelectItem value="Verb">Verb</SelectItem>
              <SelectItem value="Adjective">Adjective</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 pt-6">
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? "Updating..." : "Update Word"}
          </Button>
          <Button type="button" variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}