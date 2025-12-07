import React from "react";
import AdminVendorCard from "./AdminVendorCard";

export default function ApprovedVendors({ list }) {
  if (!list || list.length === 0) {
    return <p className="text-gray-600">No approved vendors</p>;
  }

  return (
    <div className="space-y-4">
      {list.map((v) => (
        <AdminVendorCard
          key={v._id}
          vendor={v}
          actions={
            <span className="text-green-700 font-semibold">Approved</span>
          }
        />
      ))}
    </div>
  );
}
