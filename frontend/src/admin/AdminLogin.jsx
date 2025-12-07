import React, { useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { toast } from "sonner";
import { adminLogin } from "../services/adminService";
import { Crown } from "lucide-react";

export default function AdminLogin({ onSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const submit = async () => {
    const res = await adminLogin(email, password);
    if (!res.success) return toast.error(res.message);

    toast.success("Admin logged in!");
    localStorage.setItem("adminToken", res.token);
    onSuccess();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--royal-cream)]">
      <Card className="w-full max-w-md border-2 border-[var(--royal-gold)]/40 shadow-xl">
        <CardHeader className="text-center">
          <Crown className="h-10 w-10 text-[var(--royal-gold)] mx-auto mb-2" />
          <CardTitle className="text-[var(--royal-maroon)] text-xl">
            Admin Login
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <Input
            placeholder="Admin Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border-[var(--royal-gold)]"
          />

          <Input
            type="password"
            placeholder="Admin Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border-[var(--royal-gold)]"
          />

          <Button
            className="w-full bg-gradient-to-r from-[var(--royal-maroon)] to-[var(--royal-copper)] text-white"
            onClick={submit}
          >
            Login
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
