"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { subscribeToNewsletter } from "@/app/actions/newsletter";
import { Loader2 } from "lucide-react";

export function NewsletterForm() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await subscribeToNewsletter(formData);
      if (result.success) {
        toast.success(result.message);
        setFormData({ firstName: "", lastName: "", email: "" });
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } catch (error: any) {
      toast.error(error.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/60 backdrop-blur-md p-6 md:p-8 rounded-[1.25rem] border border-white shadow-sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5 border-none">
            <label className="text-[12px] font-bold text-[#093C15]/60 uppercase tracking-wider">
              First name
            </label>
            <input
              type="text"
              required
              className="w-full h-[46px] bg-white border border-black/5 rounded-lg px-4 text-[#1d1d1f] text-[14px] focus:border-[#41cc00] focus:ring-2 focus:ring-[#41cc00]/20 outline-none transition-all placeholder:text-black/20 shadow-sm"
              placeholder="Dami"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[12px] font-bold text-[#093C15]/60 uppercase tracking-wider">
              Last name
            </label>
            <input
              type="text"
              required
              className="w-full h-[46px] bg-white border border-black/5 rounded-lg px-4 text-[#1d1d1f] text-[14px] focus:border-[#41cc00] focus:ring-2 focus:ring-[#41cc00]/20 outline-none transition-all placeholder:text-black/20 shadow-sm"
              placeholder="Sere"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-1.5 pb-2">
          <label className="text-[12px] font-bold text-[#093C15]/60 uppercase tracking-wider">
            Email address
          </label>
          <input
            type="email"
            required
            className="w-full h-[46px] bg-white border border-black/5 rounded-lg px-4 text-[#1d1d1f] text-[14px] focus:border-[#41cc00] focus:ring-2 focus:ring-[#41cc00]/20 outline-none transition-all placeholder:text-black/20 shadow-sm"
            placeholder="dami@example.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-[52px] bg-[#093C15] text-white font-bold text-[15px] rounded-lg hover:bg-[#06290e] transition-colors shadow-md flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Subscribing...
            </>
          ) : (
            "Subscribe"
          )}
        </button>
      </form>
    </div>
  );
}
