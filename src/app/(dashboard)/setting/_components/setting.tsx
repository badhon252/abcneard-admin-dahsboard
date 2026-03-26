"use client";

import React, { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SquarePen, ChevronRight } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

export default function PersonalInformation() {
  const session = useSession();
  const token = session?.data?.accessToken;
  const queryClient = useQueryClient();

  const [profile, setProfile] = useState({
    name: "",
    country: "",
    city: "",
  });

  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch profile data
  const { data, isLoading } = useQuery({
    queryKey: ["my-profile"],
    enabled: !!token,
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/user/get-my-profile`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error("Failed to fetch profile");
      return res.json();
    },
  });

  // Populate form and existing image when data is loaded
  useEffect(() => {
    if (data?.data) {
      const apiData = data.data;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setProfile({
        name: apiData.name || "",
        country: apiData.country || "",
        city: apiData.city || "",
      });
      if (apiData.profileImage?.secure_url) {
        setProfileImagePreview(apiData.profileImage.secure_url);
      }
    }
  }, [data]);

  // Mutation for saving profile
  const saveProfileMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/user/update-user`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        }
      );
      if (!res.ok) throw new Error("Failed to update profile");
      return res.json();
    },
    onSuccess: () => {
     toast.success("Profile updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["my-profile"] });
    },
    onError: (err) => {
      alert(err.message || "Failed to update profile");
    },
  });

  // Handle save button click
  const handleSave = () => {
    const formData = new FormData();
    formData.append("name", profile.name);
    formData.append("country", profile.country);
    formData.append("city", profile.city);
    if (profileImageFile) formData.append("image", profileImageFile);
    saveProfileMutation.mutate(formData);
  };

  // Avatar upload handlers
  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setProfileImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  if (isLoading) return <p>Loading profile...</p>;

  return (
    <div className="w-full mx-auto p-8 bg-[#F8F9FB] min-h-screen">
      {/* Header Section */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Personal Information</h1>
          <div className="flex items-center text-sm text-gray-500 mt-1">
            <span>Dashboard</span>
            <ChevronRight size={14} className="mx-1" />
            <span className="text-gray-400">Edit Personal Information</span>
          </div>
        </div>
        <Button
          onClick={handleSave}
          className="bg-[#4285F4] hover:bg-blue-600 text-white rounded-md px-6 py-2 flex gap-2"
        >
          Save Changes
          <SquarePen size={16} />
        </Button>
      </div>

      {/* Profile Picture */}
      <div className="mb-8">
        <Label className="text-sm font-medium text-gray-600 block mb-3">
          Your Profile Picture
        </Label>
        <div onClick={handleAvatarClick} className="cursor-pointer inline-block">
          <Avatar className="h-32 w-32 rounded-xl border-2 border-white shadow-sm">
            {profileImagePreview ? (
              <AvatarImage src={profileImagePreview} alt="Profile Image" />
            ) : (
              <AvatarFallback className="rounded-xl">{profile.name[0]}</AvatarFallback>
            )}
          </Avatar>
        </div>
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {/* Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
        <div className="space-y-2">
          <Label className="text-sm font-semibold text-gray-700">Name</Label>
          <Input
            value={profile.name}
            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
            className="bg-[#F1F3F6] border-gray-200 focus:bg-white h-11"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-semibold text-gray-700">Country</Label>
          <Input
            value={profile.country}
            onChange={(e) => setProfile({ ...profile, country: e.target.value })}
            className="bg-[#F1F3F6] border-gray-200 focus:bg-white h-11"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-semibold text-gray-700">City/State</Label>
          <Input
            value={profile.city}
            onChange={(e) => setProfile({ ...profile, city: e.target.value })}
            className="bg-[#F1F3F6] border-gray-200 focus:bg-white h-11"
          />
        </div>
      </div>
    </div>
  );
}