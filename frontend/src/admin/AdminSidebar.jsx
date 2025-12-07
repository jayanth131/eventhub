import React from "react";

export default function AdminSidebar({ page, setPage }) {
  const itemClass = (p) =>
    `block px-4 py-2 rounded-lg cursor-pointer font-medium transition-all ${
      page === p
        ? "bg-white text-[var(--royal-maroon)] shadow-md"      // ACTIVE PAGE STYLE
        : "text-[var(--royal-gold)] hover:bg-[var(--royal-gold)]/20"   // INACTIVE ITEMS
    }`;

  return (
    <aside className="w-64 bg-[var(--royal-maroon)] border-r border-[var(--royal-gold)] p-4 space-y-4">
      <h2 className="text-xl text-white font-bold mb-4">
        Admin Dashboard
      </h2>

      <div onClick={() => setPage("pending")} className={itemClass("pending")}>
        Pending Vendors
      </div>

      <div onClick={() => setPage("approved")} className={itemClass("approved")}>
        Approved Vendors
      </div>

      <div onClick={() => setPage("rejected")} className={itemClass("rejected")}>
        Rejected Vendors
      </div>

      <div onClick={() => setPage("logout")} className={itemClass("logout")}>
        Logout
      </div>
    </aside>
  );
}
