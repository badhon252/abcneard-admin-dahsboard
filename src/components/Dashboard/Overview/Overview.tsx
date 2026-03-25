"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { Users, UserCheck, FileText } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

export default function Dashboard() {
  const session = useSession();
  const token = session?.data?.accessToken;

  // Filter state
  const [filter, setFilter] = useState<"Day" | "Week" | "Month" | "Year">("Year");

  // Fetch leaderboard & stats
  const { data, isLoading } = useQuery({
    queryKey: ["leaderboard-data", filter], // refetch if filter changes
    enabled: !!token,
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/leaderboard/all-data?filter=${filter}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error("Failed to fetch leaderboard data");
      return res.json();
    },
  });

  if (isLoading) return <p>Loading dashboard...</p>;

  const stats = data?.data?.stats || {};
  const performanceTrend = data?.data?.performanceTrend || [];

  return (
    <div className="p-8 bg-gray-50 min-h-screen space-y-6">
      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Users"
          value={stats.totalUsers?.toString() || "0"}
          icon={<Users className="text-green-600" />}
        />
        <StatCard
          title="Active Users"
          value={stats.activeUsers?.toString() || "0"}
          icon={<UserCheck className="text-orange-400" />}
        />
        <StatCard
          title="Total Questions"
          value={stats.totalQuestions?.toString() || "0"}
          icon={<FileText className="text-black" />}
        />
      </div>

      {/* Performance Trend Chart */}
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-bold">Quiz Average Performance</CardTitle>

          {/* Filter Select */}
          <Select value={filter} onValueChange={(v) => setFilter(v as "Day" | "Week" | "Month" | "Year")}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Day">Day</SelectItem>
              <SelectItem value="Week">Week</SelectItem>
              <SelectItem value="Month">Month</SelectItem>
              <SelectItem value="Year">Year</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>

        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={performanceTrend.map((item: { label: string; currentYear: number; lastYear: number; }) => ({
                name: item.label,
                thisYear: item.currentYear,
                lastYear: item.lastYear,
              }))}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} unit="%" />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="thisYear"
                stroke="#8b5cf6"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="lastYear"
                stroke="#f472b6"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ title, value, icon }: { title: string; value: string; icon: React.ReactNode }) {
  return (
    <Card>
      <CardContent className="p-6 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <h3 className="text-2xl font-bold">{value}</h3>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg">{icon}</div>
      </CardContent>
    </Card>
  );
}