"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Eye, 
  Trash2, 
  ChevronLeft, 
  ChevronRight, 
  Hash, 
  User, 
  Mail, 
  Shield, 
  Calendar, 
  CreditCard, 
  Receipt, 
  Clock 
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../../components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "../../../../components/ui/dialog";
import { Badge } from "../../../../components/ui/badge";
import { Skeleton } from "../../../../components/ui/skeleton";
import { Button } from "../../../../components/ui/button";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { format } from "date-fns";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

interface PaymentData {
  _id: string;
  userName: string;
  email: string;
  subscription: string;
  status: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  canceledAt: string | null;
  latestInvoiceId: string;
  stripeCheckoutSessionId: string;
  createdAt: string;
  updatedAt: string;
}

const PaymentHistoryList = () => {
  const { data: session } = useSession() as { data: { accessToken?: string } | null };
  const token = session?.accessToken;
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [selectedPayment, setSelectedPayment] = useState<PaymentData | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["payment-history", page, limit],
    queryFn: async () => {
      const res = await fetch(
        `${API_BASE}/payment/payment-history?page=${page}&limit=${limit}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!res.ok) throw new Error("Failed to fetch payment history");
      return res.json();
    },
    enabled: !!token,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`${API_BASE}/payment/payment-history/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("Failed to delete payment history");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payment-history"] });
      toast.success("Payment history deleted successfully");
      setDeleteId(null);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete payment history");
    },
  });

  const payments = data?.data || [];
  const meta = data?.meta || { totalPage: 1, total: 0 };

  const handleDelete = () => {
    if (deleteId) {
      deleteMutation.mutate(deleteId);
    }
  };

  const getStatusBadge = (status: string) => {
    if (!status) return <Badge className="bg-slate-100 text-slate-600">N/A</Badge>;
    switch (status.toLowerCase()) {
      case "active":
        return <Badge className="bg-green-100 text-green-600 hover:bg-green-100">Active</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-600 hover:bg-yellow-100">Pending</Badge>;
      case "failed":
        return <Badge className="bg-red-100 text-red-600 hover:bg-red-100">Failed</Badge>;
      case "canceled":
        return <Badge className="bg-gray-100 text-gray-600 hover:bg-gray-100">Canceled</Badge>;
      default:
        return <Badge className="bg-slate-100 text-slate-600 hover:bg-slate-100">{status}</Badge>;
    }
  };

  const formatDateSafely = (dateStr: string | null, formatStr: string = "MMM dd, yyyy") => {
    if (!dateStr) return "N/A";
    try {
      return format(new Date(dateStr), formatStr);
    } catch {
      return "Invalid Date";
    }
  };

  return (
    <div className="w-full p-6 bg-white rounded-lg shadow-sm border">
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Payment History</h2>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow>
              <TableHead className="font-bold text-slate-700 whitespace-nowrap">User Name</TableHead>
              <TableHead className="font-bold text-slate-700 whitespace-nowrap">Email</TableHead>
              <TableHead className="font-bold text-slate-700 whitespace-nowrap">Subscription</TableHead>
              <TableHead className="font-bold text-slate-700 text-center whitespace-nowrap">Status</TableHead>
              <TableHead className="font-bold text-slate-700 text-center whitespace-nowrap">Date</TableHead>
              <TableHead className="font-bold text-slate-700 text-right whitespace-nowrap">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell className="text-center"><Skeleton className="h-8 w-20 mx-auto rounded-md" /></TableCell>
                    <TableCell className="text-center"><Skeleton className="h-5 w-24 mx-auto" /></TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                         <Skeleton className="h-8 w-8 rounded-full" />
                         <Skeleton className="h-8 w-8 rounded-full" />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              : payments.map((payment: PaymentData) => (
                  <TableRow key={payment._id} className="hover:bg-slate-50/50 transition-colors">
                    <TableCell className="font-medium text-slate-600 whitespace-nowrap">{payment.userName}</TableCell>
                    <TableCell className="text-slate-500 whitespace-nowrap">{payment.email}</TableCell>
                    <TableCell className="text-slate-500 whitespace-nowrap">{payment.subscription}</TableCell>
                    <TableCell className="text-center">{getStatusBadge(payment.status)}</TableCell>
                    <TableCell className="text-center text-slate-500 whitespace-nowrap">
                      {formatDateSafely(payment.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-blue-500 hover:text-blue-600 hover:bg-blue-50"
                          onClick={() => setSelectedPayment(payment)}
                        >
                          <Eye className="w-5 h-5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:text-red-600 hover:bg-red-50"
                          onClick={() => setDeleteId(payment._id)}
                        >
                          <Trash2 className="w-5 h-5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {!isLoading && meta.totalPage > 1 && (
        <div className="flex items-center justify-between mt-6 px-2">
          <p className="text-sm text-slate-500">
            Showing <span className="font-medium">{(page - 1) * limit + 1}</span> to{" "}
            <span className="font-medium">{Math.min(page * limit, meta.total)}</span> of{" "}
            <span className="font-medium">{meta.total}</span> records
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-2"
            >
              <ChevronLeft className="h-4 w-4 mr-1" /> Previous
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: meta.totalPage }).map((_, i) => (
                <Button
                  key={i}
                  variant={page === i + 1 ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPage(i + 1)}
                  className="h-9 w-9 p-0"
                >
                  {i + 1}
                </Button>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              disabled={page === meta.totalPage}
              onClick={() => setPage((p) => Math.min(meta.totalPage, p + 1))}
              className="px-2"
            >
              Next <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      <Dialog open={!!selectedPayment} onOpenChange={() => setSelectedPayment(null)}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold border-b pb-2">
              Payment Details
            </DialogTitle>
          </DialogHeader>
          {selectedPayment && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
              <DetailItem icon={<User className="w-4 h-4" />} label="User Name" value={selectedPayment.userName} />
              <DetailItem icon={<Mail className="w-4 h-4" />} label="Email" value={selectedPayment.email} />
              <DetailItem icon={<Shield className="w-4 h-4" />} label="Subscription" value={selectedPayment.subscription} />
              <DetailItem icon={<Clock className="w-4 h-4" />} label="Status" value={selectedPayment.status} />
              <DetailItem icon={<CreditCard className="w-4 h-4" />} label="Stripe Customer ID" value={selectedPayment.stripeCustomerId} />
              <DetailItem icon={<CreditCard className="w-4 h-4" />} label="Stripe Sub ID" value={selectedPayment.stripeSubscriptionId} />
              <DetailItem icon={<Calendar className="w-4 h-4" />} label="Period Start" value={formatDateSafely(selectedPayment.currentPeriodStart)} />
              <DetailItem icon={<Calendar className="w-4 h-4" />} label="Period End" value={formatDateSafely(selectedPayment.currentPeriodEnd)} />
              <DetailItem icon={<Receipt className="w-4 h-4" />} label="Latest Invoice" value={selectedPayment.latestInvoiceId} />
              <DetailItem icon={<Hash className="w-4 h-4" />} label="Checkout Session" value={selectedPayment.stripeCheckoutSessionId} />
              <DetailItem icon={<Calendar className="w-4 h-4" />} label="Created At" value={formatDateSafely(selectedPayment.createdAt, "MMM dd, yyyy HH:mm")} />
              <DetailItem icon={<Calendar className="w-4 h-4" />} label="Updated At" value={formatDateSafely(selectedPayment.updatedAt, "MMM dd, yyyy HH:mm")} />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this payment record? This action will set it as deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button 
                variant="destructive" 
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const DetailItem = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | boolean | null }) => (
  <div className="flex items-start gap-3 p-2 rounded-lg bg-slate-50 border border-slate-100">
    <div className="p-2 bg-white rounded-full shadow-sm mt-1 shrink-0">
      {icon}
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">{label}</p>
      <p className="text-sm font-semibold text-slate-700 break-all leading-tight italic">{value === null || value === "" ? "N/A" : String(value)}</p>
    </div>
  </div>
);

export default PaymentHistoryList;
