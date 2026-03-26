/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import {
  Plus,
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading1,
  Heading2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

// Rich Text Editor Component
function RichTextEditor({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: placeholder || "Write description...",
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "prose prose-sm max-w-none focus:outline-none min-h-[200px] p-4",
      },
    },
    immediatelyRender: false, // This fixes the SSR hydration issue
  });

  // Sync editor content with form value when it changes externally
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [editor, value]);

  if (!mounted) {
    return (
      <div className="border border-[#BFDBFE] rounded-lg overflow-hidden bg-white">
        <div className="border-b border-[#BFDBFE] p-2 flex gap-1 flex-wrap bg-gray-50">
          <div className="h-8 w-8 bg-gray-200 rounded"></div>
          <div className="h-8 w-8 bg-gray-200 rounded"></div>
          <div className="h-8 w-8 bg-gray-200 rounded"></div>
          <div className="h-8 w-8 bg-gray-200 rounded"></div>
          <div className="h-8 w-8 bg-gray-200 rounded"></div>
          <div className="h-8 w-8 bg-gray-200 rounded"></div>
        </div>
        <div className="min-h-[200px] p-4 bg-white">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!editor) return null;

  return (
    <div className="border border-[#BFDBFE] rounded-lg overflow-hidden bg-white">
      <div className="border-b border-[#BFDBFE] p-2 flex gap-1 flex-wrap bg-gray-50">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`h-8 w-8 p-0 ${editor.isActive("bold") ? "bg-gray-200" : ""}`}
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`h-8 w-8 p-0 ${editor.isActive("italic") ? "bg-gray-200" : ""}`}
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          className={`h-8 w-8 p-0 ${editor.isActive("heading", { level: 1 }) ? "bg-gray-200" : ""}`}
        >
          <Heading1 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          className={`h-8 w-8 p-0 ${editor.isActive("heading", { level: 2 }) ? "bg-gray-200" : ""}`}
        >
          <Heading2 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`h-8 w-8 p-0 ${editor.isActive("bulletList") ? "bg-gray-200" : ""}`}
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`h-8 w-8 p-0 ${editor.isActive("orderedList") ? "bg-gray-200" : ""}`}
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}

export default function SubscriptionPage() {
  const { data: session } = useSession();
  const token = session?.accessToken;
  const queryClient = useQueryClient();

  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: 0,
    currency: "KRW",
    interval: "month",
    wordSwipe: 0,
    aiChat: 0,
  });

  // --- API QUERIES ---
  const { data: subData, isLoading } = useQuery({
    queryKey: ["subscription-plans"],
    queryFn: async () => {
      const res = await fetch(
        `${API_BASE}/subscriptionplan/get-all-subscriptionplans`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      return res.json();
    },
    enabled: !!token,
  });

  // --- MUTATIONS ---
  const createMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await fetch(
        `${API_BASE}/subscriptionplan/create-subscriptionplan`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        },
      );
      return res.json();
    },
    onSuccess: (data) => {
      if (data.status === "ok") {
        queryClient.invalidateQueries({ queryKey: ["subscription-plans"] });
        toast.success("Subscription plan created successfully");
        setIsOpen(false);
        resetForm();
      } else {
        toast.error(data.message || "Failed to create plan");
      }
    },
  });

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      price: 0,
      currency: "KRW",
      interval: "month",
      wordSwipe: 0,
      aiChat: 0,
    });
  };

  const handleCreate = () => {
    const payload = {
      title: formData.title,
      description: formData.description,
      price: Number(formData.price),
      currency: formData.currency,
      interval: formData.interval,
      credits: {
        wordSwipe: Number(formData.wordSwipe),
        aiChat: Number(formData.aiChat),
      },
      status: "active",
    };
    createMutation.mutate(payload);
  };

  return (
    <div className="p-10 bg-[#F8FAFC] min-h-screen font-poppins">
      <h1 className="text-3xl font-bold text-center text-[#1E293B] mb-12">
        Subscription Update
      </h1>

      {/* Plan Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto mb-12">
        {isLoading
          ? Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-[450px] w-full rounded-2xl" />
            ))
          : subData?.data?.map((plan: any) => (
              <div
                key={plan._id}
                className="bg-white rounded-2xl p-8 shadow-sm border border-[#E2E8F0] flex flex-col"
              >
                <h2 className="text-xl font-semibold text-[#1E293B] mb-4">
                  {plan.title} Plan
                </h2>
                <div className="flex items-baseline mb-6">
                  <span className="text-3xl font-bold text-[#1E293B]">
                    {plan.currency === "KRW" ? "₩" : "$"}
                    {plan.price.toLocaleString()}
                  </span>
                  <span className="text-[#64748B] ml-1">/{plan.interval}</span>
                </div>

                <Button
                  disabled
                  className="w-full bg-[#E2E8F0] text-[#64748B] hover:bg-[#E2E8F0] rounded-xl h-12 mb-8 font-semibold"
                >
                  Current Plan
                </Button>

                <div className="prose prose-sm max-w-none text-[#475569]">
                  {plan?.description ? (
                    <div
                      dangerouslySetInnerHTML={{ __html: plan.description }}
                    />
                  ) : (
                    <p>No description available</p>
                  )}
                </div>
              </div>
            ))}
      </div>

      {/* Add Subscription Section */}
      <div className="max-w-7xl mx-auto border-2 border-dashed border-[#E2E8F0] rounded-2xl p-12 bg-white flex flex-col items-center text-center">
        <h3 className="text-2xl font-bold text-[#1E293B] flex items-center gap-2 mb-4">
          Add Your Subscriptions <Plus className="w-6 h-6" />
        </h3>
        <p className="text-[#64748B] max-w-2xl mb-8">
          Start by creating a subscription plan for your app. Adjust the
          pricing, configure the billing frequency, and add details.
        </p>
        <Button
          onClick={() => setIsOpen(true)}
          className="bg-[#3B82F6] hover:bg-blue-600 px-8 h-12 rounded-xl text-white font-medium"
        >
          Create a subscription plan
        </Button>
      </div>

      {/* --- Add Plan Modal --- */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl! p-0 border-none bg-[#F4F7FE] max-h-[800px] overflow-y-auto">
          <DialogHeader className="p-6 bg-[#E8F0FE]">
            <DialogTitle className="text-center text-[#3B82F6] text-2xl font-bold">
              Add Subscription
            </DialogTitle>
          </DialogHeader>

          <div className="p-10 space-y-6">
            <div>
              <label className="block text-sm font-medium text-[#475569] mb-2">
                Plan Title
              </label>
              <Input
                placeholder="Title"
                className="h-12 border-[#BFDBFE] focus-visible:ring-blue-200"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#475569] mb-2">
                Description
              </label>
              <RichTextEditor
                value={formData.description}
                onChange={(html) =>
                  setFormData({ ...formData, description: html })
                }
                placeholder="Write a detailed description of your subscription plan..."
              />
              <p className="text-xs text-[#94A3B8] mt-1">
                Use the toolbar to format your description. You can add
                headings, lists, bold, and italic text.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-[#475569] mb-2">
                  Price
                </label>
                <div className="relative">
                  <Input
                    type="number"
                    placeholder="Price"
                    className="h-12 border-[#BFDBFE] pr-8"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        price: Number(e.target.value),
                      })
                    }
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8]">
                    {formData.currency === "KRW" ? "₩" : "$"}
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#475569] mb-2">
                  Billing Interval
                </label>
                <Select
                  value={formData.interval}
                  onValueChange={(v) =>
                    setFormData({ ...formData, interval: v })
                  }
                >
                  <SelectTrigger className="h-12 border-[#BFDBFE] text-[#64748B]">
                    <SelectValue placeholder="Select interval" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="month">Per month</SelectItem>
                    <SelectItem value="year">Per year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-[#475569] mb-2">
                  Word Swipe Credits
                </label>
                <Input
                  type="number"
                  placeholder="Word Swipe credits"
                  className="h-12 border-[#BFDBFE]"
                  value={formData.wordSwipe}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      wordSwipe: Number(e.target.value),
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#475569] mb-2">
                  AI Chat Credits
                </label>
                <Input
                  type="number"
                  placeholder="AI chat credits"
                  className="h-12 border-[#BFDBFE]"
                  value={formData.aiChat}
                  onChange={(e) =>
                    setFormData({ ...formData, aiChat: Number(e.target.value) })
                  }
                />
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-6">
              <Button
                variant="outline"
                onClick={() => setIsOpen(false)}
                className="w-32 h-12 rounded-xl"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreate}
                disabled={createMutation.isPending}
                className="bg-[#3B82F6] hover:bg-blue-600 w-48 h-12 text-white font-semibold rounded-xl"
              >
                {createMutation.isPending ? "Creating..." : "Create plan"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
