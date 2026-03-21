"use client";

import { Twitter, Linkedin, Facebook, Link as LinkIcon, MessageCircle } from "lucide-react";
import { useState, useEffect } from "react";

export function SocialShareButtons({ title, slug }: { title: string; slug: string }) {
  const [copied, setCopied] = useState(false);
  const [url, setUrl] = useState(`https://tela.ng/blog/${slug}`);

  // Safely get the real window URL after React has hydrated
  useEffect(() => {
    // If we have a local dev environment url env, use that or window origin
    const origin = typeof window !== "undefined" ? window.location.origin : process.env.NEXT_PUBLIC_SITE_URL || "https://tela.ng";
    setUrl(`${origin}/blog/${slug}`);
  }, [slug]);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-[13px] font-bold text-[#1d1d1f]/40 uppercase tracking-wider mr-2">Share</span>
      <a
        href={`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="w-10 h-10 rounded-full bg-black/5 hover:bg-[#1DA1F2]/10 hover:text-[#1DA1F2] flex items-center justify-center transition-all text-[#1d1d1f]/60"
        title="Share on Twitter"
      >
        <Twitter className="w-4 h-4" />
      </a>
      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="w-10 h-10 rounded-full bg-black/5 hover:bg-[#0077B5]/10 hover:text-[#0077B5] flex items-center justify-center transition-all text-[#1d1d1f]/60"
        title="Share on LinkedIn"
      >
        <Linkedin className="w-4 h-4" />
      </a>
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="w-10 h-10 rounded-full bg-black/5 hover:bg-[#1877F2]/10 hover:text-[#1877F2] flex items-center justify-center transition-all text-[#1d1d1f]/60"
        title="Share on Facebook"
      >
        <Facebook className="w-4 h-4" />
      </a>
      <a
        href={`https://wa.me/?text=${encodedTitle}%20${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="w-10 h-10 rounded-full bg-black/5 hover:bg-[#25D366]/10 hover:text-[#25D366] flex items-center justify-center transition-all text-[#1d1d1f]/60"
        title="Share on WhatsApp"
      >
        <MessageCircle className="w-4 h-4" />
      </a>
      <button
        onClick={copyLink}
        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
          copied ? 'bg-[#41cc00]/10 text-[#41cc00]' : 'bg-black/5 hover:bg-black/10 text-[#1d1d1f]/60'
        }`}
        title={copied ? "Copied!" : "Copy link"}
      >
        <LinkIcon className="w-4 h-4" />
      </button>
    </div>
  );
}
