import React, { useEffect, useState } from "react";
import { getPendingVendors, approveVendor, rejectVendor } from "./adminService";

export default function PendingVendors() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadPending = async () => {
    try {
      const data = await getPendingVendors();
      console.log("Pending Vendor API Response:", data);

      if (data.success && Array.isArray(data.vendors)) {
        setVendors(data.vendors);
      } else {
        setVendors([]);
      }
    } catch (err) {
      console.error("Error loading vendors:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadPending();
  }, []);

  if (loading) return <p>Loading pending vendors...</p>;

  return (
    <div className="p-6">
      <h2 className="text-xl text-[var(--royal-maroon)] font-bold mb-4">
        Pending Vendor Approvals
      </h2>

      {vendors.length === 0 ? (
        <p>No pending vendors</p>
      ) : (
        vendors.map(v => (
          <div
  key={v._id}
  className="border border-[var(--royal-gold)]/40 p-6 rounded-xl 
             bg-white shadow-md hover:shadow-lg transition-all"
>
  <p className="text-sm">
    <strong className="text-[var(--royal-maroon)]">Email:</strong> {v.email}
  </p>

  <p className="text-sm mt-1">
    <strong className="text-[var(--royal-maroon)]">User ID:</strong> {v.userId?._id}
  </p>

  {/* BUTTONS */}
  <div className="flex gap-4 mt-5">
    <button
      className="px-6 py-2 rounded-lg 
                 bg-[var(--royal-maroon)] text-white font-medium
                 border border-[var(--royal-gold)]
                 hover:bg-[var(--royal-copper)] transition-all shadow-sm"
      onClick={async () => {
        await approveVendor(v._id);
        loadPending();
      }}
    >
      Approve
    </button>

    <button
      className="px-6 py-2 rounded-lg 
                 bg-[var(--royal-maroon)] text-white font-medium
                 border border-[var(--royal-gold)]
                 hover:bg-[var(--royal-copper)] transition-all shadow-sm"
      onClick={async () => {
        await rejectVendor(v._id);
        loadPending();
      }}
    >
      Reject
    </button>
  </div>
</div>
))
      )}
    </div>
  );
}
