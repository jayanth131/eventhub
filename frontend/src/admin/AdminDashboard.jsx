import React, { useEffect, useState } from "react";
import AdminSidebar from "./AdminSidebar";
import PendingVendors from "./PendingVendors";
import ApprovedVendors from "./ApprovedVendors";
import RejectedVendors from "./RejectedVendors";

import {
  getPendingVendors,
  getApprovedVendors,
  getRejectedVendors
} from "./adminService";

export default function AdminDashboard({ onLogout }) {
  const [page, setPage] = useState("pending");
  const [pending, setPending] = useState([]);
  const [approved, setApproved] = useState([]);
  const [rejected, setRejected] = useState([]);

  const load = async () => {
    if (page === "pending") {
      const res = await getPendingVendors();
      setPending(res.vendors || []);
    }
    if (page === "approved") {
      const res = await getApprovedVendors();
      setApproved(res.vendors || []);
    }
    if (page === "rejected") {
      const res = await getRejectedVendors();
      setRejected(res.vendors || []);
    }
    if (page === "logout") {
      localStorage.removeItem("authToken");
      onLogout();
    }
  };

  useEffect(() => {
    load();
  }, [page]);

  return (
    <div className="flex min-h-screen bg-[var(--royal-cream)]">
      <AdminSidebar page={page} setPage={setPage} />

      <main className="flex-1 p-6">
        {page === "pending" && (
          <>
            <h1 className="text-3xl text-[var(--royal-maroon)] font-bold mb-4">
              Pending Vendor Approvals
            </h1>
            <PendingVendors list={pending} refresh={load} />
          </>
        )}

        {page === "approved" && (
          <>
            <h1 className="text-3xl text-[var(--royal-maroon)] font-bold mb-4">
              Approved Vendors
            </h1>
            <ApprovedVendors list={approved} />
          </>
        )}

        {page === "rejected" && (
          <>
            <h1 className="text-3xl text-[var(--royal-maroon)] font-bold mb-4">
              Rejected Vendors
            </h1>
            <RejectedVendors list={rejected} />
          </>
        )}
      </main>
    </div>
  );
}
