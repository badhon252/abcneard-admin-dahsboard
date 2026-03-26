"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { useSession } from "next-auth/react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

import { toast } from "sonner";

interface CategoryFormData {
  name: string;
  description: string;
  isActive: boolean;
}

export default function AddCategory() {
  const { data: session } = useSession();
  const token = session?.accessToken;

  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CategoryFormData>({
    defaultValues: {
      isActive: true,
    },
  });

  const isActive = watch("isActive");

  const mutation = useMutation({
    mutationFn: async (data: CategoryFormData) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/categoryword/create-categoryword`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        }
      );

      if (!res.ok) {
        throw new Error("Failed to create category");
      }

      return res.json();
    },

    onSuccess: () => {
      toast.success("Category created successfully 🎉");
      router.push("/add-category");
    },

    onError: () => {
      toast.error("Failed to create category");
    },
  });

  const onSubmit = (data: CategoryFormData) => {
    mutation.mutate(data);
  };

  return (
    <div className=" mx-auto bg-white p-8 rounded-md shadow border">

      <h2 className="text-2xl font-semibold mb-6">Add Category</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

        {/* Name */}
        <div>
          <Label className="mb-2">Category Name</Label>
          <Input
            placeholder="Enter category name"
            {...register("name", { required: "Category name is required" })}
          />

          {errors.name && (
            <p className="text-red-500 text-sm mt-1">
              {errors.name.message}
            </p>
          )}
        </div>

        {/* Description */}
        <div>
          <Label className="mb-2">Description</Label>
          <Textarea
            placeholder="Enter description"
            rows={4}
            {...register("description", {
              required: "Description is required",
            })}
          />

          {errors.description && (
            <p className="text-red-500 text-sm mt-1">
              {errors.description.message}
            </p>
          )}
        </div>

        {/* Status */}
        <div className="flex items-center gap-3">
          <Switch
            checked={isActive}
            onCheckedChange={(checked) => setValue("isActive", checked)}
          />
          <span className="text-sm">
            {isActive ? "Active" : "Inactive"}
          </span>
        </div>

        {/* Submit */}
        <Button
          type="submit"
          className="bg-[#2563EB] hover:bg-blue-700 w-full"
        >
          {mutation.isPending ? "Creating..." : "Create Category"}
        </Button>

      </form>
    </div>
  );
}