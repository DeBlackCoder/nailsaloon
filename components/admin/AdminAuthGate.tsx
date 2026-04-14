"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GiNails } from "react-icons/gi";
import { FaArrowLeft } from "react-icons/fa";

const SESSION_KEY = "admin_authed";

export default function AdminAuthGate({ children }: { children: React.ReactNode }) {
  const [authed, setAuthed] = useState(false);
  const [checked, setChecked] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setAuthed(sessionStorage.getItem(SESSION_KEY) === "1");
    setChecked(true);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setTimeout(() => {
      const correct = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;
      if (password === correct) {
        sessionStorage.setItem(SESSION_KEY, "1");
        setAuthed(true);
      } else {
        setError("Incorrect password. Try again.");
      }
      setLoading(false);
    }, 400);
  };

  if (!checked) return null;
  if (authed) return <>{children}</>;

  return (
    <div className="min-h-screen bg-[#f2f2f2] flex items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-2">
            <GiNails className="text-5xl text-[#ff385c]" />
          </div>
          <CardTitle className="text-xl">Admin Access</CardTitle>
          <p className="text-sm text-[#6a6a6a] mt-1">Enter the admin password to continue</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={e => { setPassword(e.target.value); setError(""); }}
                placeholder="Password"
                autoFocus
                className="w-full rounded-lg border border-[#c1c1c1] bg-white px-4 py-3 text-sm text-[#222222] focus:outline-none focus:ring-2 focus:ring-[#ff385c]"
              />
            </div>
            {error && <p className="text-xs text-red-500 text-center">{error}</p>}
            <Button type="submit" variant="brand" className="w-full rounded-full" disabled={loading}>
              {loading ? "Checking..." : "Enter"}
            </Button>
            <a href="/" className="flex items-center justify-center gap-1 text-xs text-[#6a6a6a] hover:text-[#ff385c] transition-colors">
              <FaArrowLeft className="text-xs" /> Back to site
            </a>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
