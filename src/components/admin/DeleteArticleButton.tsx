"use client";

import { useState } from "react";
import { Trash2, AlertCircle, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { deleteArticle } from "@/app/actions/content";
import { toast } from "sonner";

export function DeleteArticleButton({ id, title }: { id: string; title: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteArticle(id);
      toast.success("Article deleted");
      setIsOpen(false);
    } catch (error) {
      toast.error("Failed to delete article");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="inline-block">
      <button 
        onClick={() => setIsOpen(true)}
        className="p-2 text-[#1d1d1f]/40 hover:text-red-500 transition-colors" 
        title="Delete"
      >
        <Trash2 className="h-4 w-4" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[2rem] p-10 max-w-sm w-full shadow-2xl border border-black/5 animate-in zoom-in-95 duration-300">
            <div className="flex items-start justify-between mb-8">
              <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center text-red-500 shadow-inner">
                <AlertCircle className="w-7 h-7" />
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 -mr-4 -mt-4 text-black/20 hover:text-black/60 transition-colors"
                type="button"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <h3 className="text-2xl font-bold text-[#1d1d1f] font-bricolage mb-3 tracking-tight">Delete Post</h3>
            <p className="text-[15px] text-[#1d1d1f]/60 leading-relaxed mb-10">
              Are you sure you want to delete <span className="font-bold text-[#1d1d1f]">"{title}"</span>? This action is permanent and cannot be undone.
            </p>

            <div className="flex gap-4">
              <Button 
                variant="ghost" 
                onClick={() => setIsOpen(false)}
                className="flex-1 h-12 rounded-2xl bg-black/[0.03] border-none hover:bg-black/[0.06] text-[#1d1d1f] font-bold"
                type="button"
              >
                Cancel
              </Button>
              <Button 
                variant="primary" 
                onClick={handleDelete}
                isLoading={isDeleting}
                className="flex-1 h-12 rounded-2xl bg-red-500 hover:bg-red-600 text-white border-none shadow-lg shadow-red-200 font-bold"
                type="button"
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
