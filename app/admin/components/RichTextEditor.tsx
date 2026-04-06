'use client';

import { useState, useRef, useEffect } from 'react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  // Sync editor content when value prop changes externally (e.g. AI enhance)
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const execCommand = (command: string, value: string = '') => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      editorRef.current.focus();
      handleInput();
    }
  };

  const ToolbarButton = ({
    command,
    icon,
    active,
    title,
  }: {
    command: string;
    icon: React.ReactNode;
    active?: boolean;
    title: string;
  }) => (
    <button
      type="button"
      onClick={() => execCommand(command)}
      title={title}
      className={`rounded p-1.5 transition ${
        active ? 'bg-red-100 text-red-600' : 'text-zinc-600 hover:bg-zinc-100'
      }`}
    >
      {icon}
    </button>
  );

  return (
    <div
      className={`rounded-xl border bg-white overflow-hidden transition ${
        isFocused ? 'border-red-300 ring-2 ring-red-100' : 'border-zinc-200'
      }`}
    >
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 border-b border-zinc-100 px-2 py-1.5 bg-zinc-50/50">
        <ToolbarButton
          command="bold"
          title="Bold"
          icon={
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3.744h-.753v11.25h6.75a3.75 3.75 0 0 0 3.75-3.75 3.75 3.75 0 0 0-3.75-3.75H6.75Zm0 0v-1.5m0 1.5h7.5a3.75 3.75 0 0 1 0 7.5h-7.5v-7.5Z" />
            </svg>
          }
        />
        <ToolbarButton
          command="italic"
          title="Italic"
          icon={
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.25h7.5m-7.5 13.5h7.5m5.25-13.5-7.5 13.5" />
            </svg>
          }
        />
        <ToolbarButton
          command="underline"
          title="Underline"
          icon={
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 3.75v11.25a5.25 5.25 0 0 1-10.5 0V3.75m10.5 0H21m-15 0H3m12.75 15h-7.5" />
            </svg>
          }
        />
        <div className="w-px h-5 bg-zinc-200 mx-1" />
        <ToolbarButton
          command="insertUnorderedList"
          title="Bullet List"
          icon={
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 5.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
            </svg>
          }
        />
        <ToolbarButton
          command="insertOrderedList"
          title="Numbered List"
          icon={
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.242 5.992h12m-12 6.003h12m-12 6.003h12M3.75 5.992h.01m-.01 6.003h.01m-.01 6.003h.01" />
            </svg>
          }
        />
        <div className="w-px h-5 bg-zinc-200 mx-1" />
        <ToolbarButton
          command="justifyLeft"
          title="Align Left"
          icon={
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h10.5m-10.5 5.25h16.5" />
            </svg>
          }
        />
        <ToolbarButton
          command="justifyCenter"
          title="Align Center"
          icon={
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M7.5 12h9m-12 5.25h16.5" />
            </svg>
          }
        />
        <div className="w-px h-5 bg-zinc-200 mx-1" />
        <ToolbarButton
          command="removeFormat"
          title="Clear Formatting"
          icon={
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75 14.25 14.25m-4.5 0 4.5-4.5m-9-3.75h.008v.008H5.25V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM9.75 6.75h.008v.008H9.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM14.25 6.75h.008v.008H14.25V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM19.5 6.75h.008v.008H19.5V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
            </svg>
          }
        />
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className="min-h-[120px] px-3 py-2 text-sm text-zinc-700 outline-none empty:before:content-[attr(data-placeholder)] empty:before:text-zinc-400"
        data-placeholder={placeholder || 'Enter description...'}
        suppressContentEditableWarning
      />
    </div>
  );
}
