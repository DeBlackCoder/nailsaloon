import type { Metadata } from "next";
import AdminDashboardClient from "@/components/admin/AdminDashboardClient";
import AdminAuthGate from "@/components/admin/AdminAuthGate";
export const metadata: Metadata = { title: "Admin Dashboard — Nail Studio" };
export default function AdminPage() {
  return (
    <AdminAuthGate>
      <AdminDashboardClient />
    </AdminAuthGate>
  );
}
