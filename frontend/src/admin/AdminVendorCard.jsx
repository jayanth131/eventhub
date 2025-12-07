import React from "react";
import { MapPin, Phone, Mail, Check, X } from "lucide-react";

export default function AdminVendorCard({ vendor, actions, onApprove, onReject }) {
  return (
    <div className="bg-white border-2 border-[var(--royal-gold)]/40 shadow-md rounded-xl p-5 flex flex-col gap-4 hover:shadow-xl transition-all duration-300">

      {/* Top Section */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-[var(--royal-maroon)]">
          {vendor.businessName}
        </h2>

        <span className="text-sm text-gray-600">
          Category: <strong>{vendor.category}</strong>
        </span>
      </div>

      {/* Vendor Details */}
      <div className="space-y-2 text-gray-700">
        <p className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-[var(--royal-gold)]" />
          {vendor.email}
        </p>

        <p className="flex items-center gap-2">
          <Phone className="h-4 w-4 text-[var(--royal-gold)]" />
          {vendor.phone}
        </p>

        <p className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-[var(--royal-gold)]" />
          {vendor.location}
        </p>
      </div>

      {/* Footer Actions */}
      <div className="flex justify-end gap-3">
        {/* For approved & rejected lists */}
        {actions ? (
          <div className="text-right">{actions}</div>
        ) : (
          <>
            {/* Approve Button */}
            <button
              onClick={() => onApprove(vendor._id)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--royal-emerald)] text-white font-semibold shadow hover:bg-green-600 transition"
            >
              <Check className="h-4 w-4" /> Approve
            </button>

            {/* Reject Button */}
            <button
              onClick={() => onReject(vendor._id)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--royal-maroon)] text-white font-semibold shadow hover:bg-red-700 transition"
            >
              <X className="h-4 w-4" /> Reject
            </button>
          </>
        )}
      </div>
    </div>
  );
}
