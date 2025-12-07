const API = "http://localhost:5000/api/admin";

// ---------------------------
// ADMIN LOGIN
// ---------------------------
export const adminLogin = async (email, password) => {
  const res = await fetch(`${API}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();

  // Save the token properly
  if (data.success && data.token) {
    localStorage.setItem("authToken", data.token);
  }

  return data;
};

// ---------------------------
// GET PENDING VENDORS
// ---------------------------
export const getPendingVendors = async () => {
  const token = localStorage.getItem("authToken");
  console.log("token:",token)

  const res = await fetch(`${API}/vendors/pending`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return res.json();
};

// ---------------------------
// APPROVE VENDOR
// ---------------------------
export const approveVendor = async (id) => {
  const token = localStorage.getItem("authToken");

  const res = await fetch(`${API}/vendors/${id}/approve`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
  });

  return res.json();
};

// ---------------------------
// REJECT VENDOR
// ---------------------------
export const rejectVendor = async (id) => {
  const token = localStorage.getItem("authToken");

  const res = await fetch(`${API}/vendors/${id}/reject`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
  });

  return res.json();
};

export const getApprovedVendors = async () => {
  const token = localStorage.getItem("authToken");
  const res = await fetch(`${API}/vendors/approved`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
};

export const getRejectedVendors = async () => {
  const token = localStorage.getItem("authToken");
  const res = await fetch(`${API}/vendors/rejected`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
};
