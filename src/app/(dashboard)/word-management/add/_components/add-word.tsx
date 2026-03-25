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
import { Plus, X } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { CategoryWordsResponse } from "@/lib/types/categorydata";

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
  };

  return (
    <div className="w-full mx-auto bg-[#F8FAFF] shadow-sm rounded-lg border">
      <div className="bg-[#E9EFFF] py-4 text-center">
        <h2 className="text-[#2563EB] text-2xl font-bold">Add New Words</h2>
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
              onChange={(e) =>
                handleChange("pronunciation", e.target.value)
              }
            />
          </div>

          {/* CATEGORY FROM API */}
          <div className="space-y-2">
            <Label>Category</Label>

            <Select

              onValueChange={(v) =>
                handleChange("categoryWordId", v)
              }
            >
              <SelectTrigger className="w-full">
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
        </div>

        {/* SYNONYMS */}

        <div className="space-y-2">
          <Label>Synonyms</Label>

          <div className="flex gap-2">
            <Input
              value={synonymInput}
              onChange={(e) => setSynonymInput(e.target.value)}
            />

            <Button type="button" onClick={addSynonym}>
              <Plus size={18} />
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            {synonyms.map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-2 bg-blue-100 px-3 py-1 rounded"
              >
                {item}

                <X
                  size={14}
                  className="cursor-pointer"
                  onClick={() => removeSynonym(i)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* EXAMPLES */}

        <div className="space-y-2">
          <Label>Examples</Label>

          <div className="flex gap-2">
            <Input
              placeholder="Give example"
              value={exampleInput}
              onChange={(e) => setExampleInput(e.target.value)}
            />

            <Button type="button" onClick={addExample}>
              <Plus size={18} />
            </Button>
          </div>

          <div className="flex flex-col gap-2">
            {examples.map((item, i) => (
              <div
                key={i}
                className="flex justify-between bg-blue-100 px-3 py-2 rounded"
              >
                {item}

                <X
                  size={14}
                  className="cursor-pointer"
                  onClick={() => removeExample(i)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* PART OF SPEECH */}

        <div className="space-y-2">
          <Label>Part Of Speech</Label>

          <Select
            onValueChange={(v) =>
              handleChange("partOfSpeech", v)
            }
          >
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

        {/* BUTTONS */}

        <div className="flex justify-end gap-3 pt-6">
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? "Adding..." : "Add Word"}
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}