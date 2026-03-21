"use client";

import React, { useRef, useCallback, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import {
  Bold, Italic, Underline, Strikethrough,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, Quote, Code,
  Image, Link as LinkIcon, Minus, Undo, Redo,
  Heading1, Heading2, Heading3, Type,
  Upload, Loader2
} from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const supabase = createClient();
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Initialize editor only once to avoid re-rendering issues and cursor resets
  React.useEffect(() => {
    if (editorRef.current && !editorRef.current.innerHTML && value) {
      editorRef.current.innerHTML = value;
    }
  }, []);

  // Sync internal content with external changes only if necessary (e.g. from state loads)
  React.useEffect(() => {
    if (editorRef.current && value !== editorRef.current.innerHTML) {
      // Small optimization: only update if the change came from outside (not from user typing)
      // This happens normally when an article is loaded initially or reset.
    }
  }, [value]);

  const execCommand = useCallback((command: string, cmdValue?: string) => {
    document.execCommand(command, false, cmdValue);
    // Sync content back
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
    // We don't focus() here on every command because some triggers need the selection to remain.
  }, [onChange]);

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange]);

  // Support for standard shortcuts if browser doesn't handle them natively well
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.metaKey || e.ctrlKey) {
      switch(e.key.toLowerCase()) {
        case 'b': e.preventDefault(); execCommand('bold'); break;
        case 'i': e.preventDefault(); execCommand('italic'); break;
        case 'u': e.preventDefault(); execCommand('underline'); break;
        case 'z': {
          if (e.shiftKey) { e.preventDefault(); execCommand('redo'); }
          else { e.preventDefault(); execCommand('undo'); }
          break;
        }
        case 'y': e.preventDefault(); execCommand('redo'); break;
      }
    }
  }, [execCommand]);

  const insertLink = useCallback(() => {
    const url = prompt("Enter the URL:");
    if (url) {
      execCommand("createLink", url);
    }
  }, [execCommand]);

  const insertImage = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    setIsUploading(true);
    const toastId = toast.loading("Uploading image to storage...");

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `editor/${fileName}`;

      const { data, error: uploadError } = await supabase.storage
        .from("content")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("content")
        .getPublicUrl(filePath);

      const img = `<img src="${publicUrl}" alt="${file.name}" style="max-width:100%;height:auto;border-radius:12px;margin:16px 0;" />`;
      execCommand("insertHTML", img);
      toast.success("Image integrated successfully", { id: toastId });
    } catch (error: any) {
      toast.error("Upload failed: " + error.message, { id: toastId });
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  }, [execCommand, supabase]);

  const handleDocUpload = useCallback(() => {
    docInputRef.current?.click();
  }, []);

  const handleDocFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Read text-based documents
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (editorRef.current) {
        // Convert plain text line breaks to HTML paragraphs
        const htmlContent = content
          .split('\n\n')
          .map(para => `<p>${para.replace(/\n/g, '<br/>')}</p>`)
          .join('');
        editorRef.current.innerHTML = htmlContent;
        onChange(htmlContent);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }, [onChange]);

  const ToolbarButton = ({ onClick, active, children, title }: { onClick: () => void; active?: boolean; children: React.ReactNode; title: string }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`w-8 h-8 flex items-center justify-center rounded-md transition-all duration-200 ${
        active 
          ? 'bg-[#093C15] text-white shadow-sm' 
          : 'text-[#1d1d1f]/70 hover:bg-black/5 hover:text-[#1d1d1f]'
      }`}
    >
      {children}
    </button>
  );

  const ToolbarDivider = () => (
    <div className="w-px h-6 bg-black/10 mx-1" />
  );

  return (
    <div className="border border-black/5 rounded-[1.5rem] overflow-hidden bg-white shadow-sm flex flex-col h-full">
      {/* Word-like Toolbar - Sticky */}
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-black/5 px-4 py-3">
        {/* Row 1: Main formatting */}
        <div className="flex items-center gap-0.5 flex-wrap">
          {/* Text Style Dropdown-like buttons */}
          <ToolbarButton onClick={() => execCommand("formatBlock", "<p>")} title="Normal Text">
            <Type className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton onClick={() => execCommand("formatBlock", "<h1>")} title="Heading 1">
            <Heading1 className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton onClick={() => execCommand("formatBlock", "<h2>")} title="Heading 2">
            <Heading2 className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton onClick={() => execCommand("formatBlock", "<h3>")} title="Heading 3">
            <Heading3 className="w-4 h-4" />
          </ToolbarButton>

          <ToolbarDivider />

          {/* Basic formatting */}
          <ToolbarButton onClick={() => execCommand("bold")} title="Bold (Ctrl+B)">
            <Bold className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton onClick={() => execCommand("italic")} title="Italic (Ctrl+I)">
            <Italic className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton onClick={() => execCommand("underline")} title="Underline (Ctrl+U)">
            <Underline className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton onClick={() => execCommand("strikeThrough")} title="Strikethrough">
            <Strikethrough className="w-4 h-4" />
          </ToolbarButton>

          <ToolbarDivider />

          {/* Alignment */}
          <ToolbarButton onClick={() => execCommand("justifyLeft")} title="Align Left">
            <AlignLeft className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton onClick={() => execCommand("justifyCenter")} title="Align Center">
            <AlignCenter className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton onClick={() => execCommand("justifyRight")} title="Align Right">
            <AlignRight className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton onClick={() => execCommand("justifyFull")} title="Justify">
            <AlignJustify className="w-4 h-4" />
          </ToolbarButton>

          <ToolbarDivider />

          {/* Lists */}
          <ToolbarButton onClick={() => execCommand("insertUnorderedList")} title="Bullet List">
            <List className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton onClick={() => execCommand("insertOrderedList")} title="Numbered List">
            <ListOrdered className="w-4 h-4" />
          </ToolbarButton>

          <ToolbarDivider />

          {/* Block elements */}
          <ToolbarButton onClick={() => execCommand("formatBlock", "<blockquote>")} title="Blockquote">
            <Quote className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton onClick={() => execCommand("formatBlock", "<pre>")} title="Code Block">
            <Code className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton onClick={() => execCommand("insertHorizontalRule")} title="Horizontal Rule">
            <Minus className="w-4 h-4" />
          </ToolbarButton>

          <ToolbarDivider />

          {/* Media */}
          <ToolbarButton onClick={insertLink} title="Insert Link">
            <LinkIcon className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton onClick={insertImage} title="Insert Image" active={isUploading}>
            {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Image className="w-4 h-4" />}
          </ToolbarButton>

          <ToolbarDivider />

          {/* Undo/Redo */}
          <ToolbarButton onClick={() => execCommand("undo")} title="Undo (Ctrl+Z)">
            <Undo className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton onClick={() => execCommand("redo")} title="Redo (Ctrl+Y)">
            <Redo className="w-4 h-4" />
          </ToolbarButton>

          <ToolbarDivider />

          {/* Upload Document */}
          <button
            type="button"
            onClick={handleDocUpload}
            title="Upload Word Document"
            className="flex items-center gap-1.5 px-3 h-8 rounded-md text-[12px] font-bold text-[#093C15] bg-[#e8f5e8] hover:bg-[#d4efd4] transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            Upload .doc
          </button>
        </div>
      </div>

      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />
      <input
        ref={docInputRef}
        type="file"
        accept=".doc,.docx,.txt,.rtf,.md"
        onChange={handleDocFileUpload}
        className="hidden"
      />

      {/* Editable Content Area - The "Word Document" canvas */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        data-placeholder={placeholder || "Start writing your article..."}
        className="min-h-[500px] p-8 md:p-12 text-[16px] leading-[1.8] text-[#1d1d1f] focus:outline-none
          prose prose-lg max-w-none
          prose-headings:font-bold prose-headings:text-[#1d1d1f] prose-headings:tracking-tight
          prose-h1:text-3xl prose-h1:mb-6 prose-h1:mt-8
          prose-h2:text-2xl prose-h2:mb-4 prose-h2:mt-6
          prose-h3:text-xl prose-h3:mb-3 prose-h3:mt-5
          prose-p:mb-4
          prose-a:text-[#093C15] prose-a:underline prose-a:decoration-[#41cc00]/40 prose-a:underline-offset-4
          prose-blockquote:border-l-4 prose-blockquote:border-[#41cc00] prose-blockquote:pl-6 prose-blockquote:italic prose-blockquote:text-[#1d1d1f]/70
          prose-code:bg-[#f0f0f0] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
          prose-img:rounded-2xl prose-img:shadow-md
          prose-ul:pl-6 prose-ol:pl-6
          prose-li:mb-2
          prose-hr:border-black/10
          empty:before:content-[attr(data-placeholder)] empty:before:text-black/30 empty:before:pointer-events-none
        "
      />
      
      {/* Status bar like Word */}
      <div className="bg-[#fafafa] border-t border-border px-4 py-2 flex items-center justify-between text-[11px] text-[#1d1d1f]/50 font-medium">
        <span>Rich Text Editor</span>
        <span>{value ? value.replace(/<[^>]*>/g, '').split(/\s+/).filter(Boolean).length : 0} words</span>
      </div>
    </div>
  );
}
