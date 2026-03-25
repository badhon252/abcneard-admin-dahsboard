"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Eye, User, Mail, Shield, Zap } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";

interface UserData {
  _id: string;
  name: string;
  email: string;
  status: "active" | "inactive";
  role: string;
  provider: string;
  balance: { aiChat: number; wordSwipe: number };
  subscription: { plan: string | null };
}

const UserList = () => {
  const session = useSession();
  const token = session?.data?.accessToken;

  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["all-users"],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/user/get-all-user`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  const users = data?.data || [];

  return (
    <div className="w-full p-6 bg-white rounded-lg shadow-sm border">
      <Table>
        <TableHeader className="bg-slate-50/50">
          <TableRow>
            <TableHead className="font-bold text-slate-700">
              User Name
            </TableHead>
            <TableHead className="font-bold text-slate-700">
              Email Name
            </TableHead>
            <TableHead className="font-bold text-slate-700 text-center">
              User Status
            </TableHead>
            <TableHead className="font-bold text-slate-700 text-right">
              Action
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading
            ? // Skeleton Loader
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-5 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-48" />
                  </TableCell>
                  <TableCell className="flex justify-center">
                    <Skeleton className="h-8 w-20 rounded-md" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="h-8 w-8 ml-auto rounded-full" />
                  </TableCell>
                </TableRow>
              ))
            : users.map((user: UserData) => (
                <TableRow
                  key={user._id}
                  className="hover:bg-slate-50/50 transition-colors"
                >
                  <TableCell className="font-medium text-slate-600">
                    {user.name}
                  </TableCell>
                  <TableCell className="text-slate-500">{user.email}</TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant="secondary"
                      className={`px-4 py-1 font-normal capitalize ${
                        user.status === "active"
                          ? "bg-green-100 text-green-600 hover:bg-green-100"
                          : "bg-red-100 text-red-400 hover:bg-red-100"
                      }`}
                    >
                      {user.status === "active" ? "Active" : "Deactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-green-500 hover:text-green-600 hover:bg-green-50"
                      onClick={() => setSelectedUser(user)}
                    >
                      <Eye className="w-5 h-5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
        </TableBody>
      </Table>

      {/* User Details Modal */}
      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold border-b pb-2">
              User Profile
            </DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-100 rounded-full">
                  <User className="w-5 h-5 text-slate-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-400 font-medium">
                    Full Name
                  </p>
                  <p className="font-semibold text-slate-700">
                    {selectedUser.name}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-100 rounded-full">
                  <Mail className="w-5 h-5 text-slate-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-400 font-medium">
                    Email Address
                  </p>
                  <p className="text-slate-700">{selectedUser.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="flex items-center gap-2 mb-1">
                    <Shield className="w-4 h-4 text-slate-500" />
                    <span className="text-xs font-bold text-slate-500 uppercase">
                      Plan
                    </span>
                  </div>
                  <p className="text-lg font-bold text-slate-700">
                    {selectedUser.subscription?.plan || "Free"}
                  </p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="flex items-center gap-2 mb-1">
                    <Zap className="w-4 h-4 text-yellow-500" />
                    <span className="text-xs font-bold text-slate-500 uppercase">
                      AI Chats
                    </span>
                  </div>
                  <p className="text-lg font-bold text-slate-700">
                    {selectedUser.balance?.aiChat}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserList;
