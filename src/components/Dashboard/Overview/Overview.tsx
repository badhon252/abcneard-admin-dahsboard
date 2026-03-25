"use client";
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';

import { Users, UserCheck, FileText } from 'lucide-react';

// Mock Data for Line Chart
const performanceData = [
  { name: 'JAN', thisYear: 0, lastYear: 0 },
  { name: 'FEB', thisYear: 40, lastYear: 30 },
  { name: 'MAR', thisYear: 82, lastYear: 60 },
  { name: 'APR', thisYear: 65, lastYear: 90 },
  { name: 'MAY', thisYear: 62, lastYear: 80 },
  { name: 'JUN', thisYear: 65, lastYear: 65 },
  { name: 'JUL', thisYear: 10, lastYear: 60 },
  { name: 'AUG', thisYear: 15, lastYear: 40 },
  { name: 'SEP', thisYear: 60, lastYear: 50 },
  { name: 'OCT', thisYear: 70, lastYear: 75 },
  { name: 'NOV', thisYear: 10, lastYear: 75 },
  { name: 'DEC', thisYear: 0, lastYear: 0 },
];

// Mock Data for Donut Chart
const categoryData = [
  { name: 'Tech', value: 60, color: '#FF7F50' },
  { name: 'Design', value: 20, color: '#AED9E0' },
  { name: 'Culture', value: 16, color: '#1E90FF' },
  { name: 'Nature', value: 4, color: '#00C49F' },
];

export default function Dashboard() {
  return (
    <div className="p-8 bg-gray-50 min-h-screen space-y-6">
      
      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Total User" value="132,570" icon={<Users className="text-green-600" />} />
        <StatCard title="Active User" value="32,570" icon={<UserCheck className="text-orange-400" />} />
        <StatCard title="Total Quizzes" value="71" icon={<FileText className="text-black" />} />
      </div>

      {/* Main Graph Card */}
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-bold">Quiz average performance</CardTitle>
          <div className="flex gap-2">
            <div className="flex items-center gap-1 text-xs"><span className="w-2 h-2 rounded-full bg-purple-500"/> This Year</div>
            <div className="flex items-center gap-1 text-xs"><span className="w-2 h-2 rounded-full bg-pink-400"/> Last Year</div>
          </div>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10}} />
              <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10}} unit="%" />
              <Tooltip />
              <Line type="monotone" dataKey="thisYear" stroke="#8b5cf6" strokeWidth={2} strokeDasharray="5 5" dot={false} />
              <Line type="monotone" dataKey="lastYear" stroke="#f472b6" strokeWidth={2} strokeDasharray="5 5" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Donut Chart */}
        <Card className="lg:col-span-1">
          <CardContent className="pt-6">
            <div className="h-[250px] relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={categoryData} innerRadius={60} outerRadius={80} paddingAngle={0} dataKey="value">
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4 text-sm text-gray-600">
              <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#FF7F50]"/> 120 Tech</div>
              <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#AED9E0]"/> 80 Design</div>
              <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#1E90FF]"/> 60 Culture</div>
              <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#00C49F]"/> 40 Nature</div>
            </div>
          </CardContent>
        </Card>

        {/* Leaderboard */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">This month</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={`https://i.pravatar.cc/150?u=${i}`} />
                    <AvatarFallback>M</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">Monica@company.com</p>
                    <p className="text-xs text-muted-foreground">Design</p>
                  </div>
                </div>
                <div className="font-semibold text-sm text-gray-700">780 Pts</div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
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