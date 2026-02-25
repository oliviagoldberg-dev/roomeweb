"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils/cn";

interface ComboboxProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  maxResults?: number;
  className?: string;
  inputClassName?: string;
  labelClassName?: string;
}

export function Combobox({
  label,
  placeholder,
  value,
  onChange,
  options,
  maxResults = 8,
  className,
  inputClassName,
  labelClassName,
}: ComboboxProps) {
  const [query, setQuery] = useState(value);
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Keep query in sync when value changes externally
  useEffect(() => { setQuery(value); }, [value]);

  // Close on outside click
  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, []);

  const filtered = query.trim().length === 0
    ? []
    : options
        .filter(o => o.toLowerCase().includes(query.toLowerCase()))
        .slice(0, maxResults);

  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setQuery(val);
    onChange(val);
    setOpen(true);
    setHighlighted(-1);
  }

  function handleSelect(option: string) {
    setQuery(option);
    onChange(option);
    setOpen(false);
    setHighlighted(-1);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open || filtered.length === 0) {
      if (e.key === "ArrowDown" && query.trim()) setOpen(true);
      return;
    }
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlighted(h => {
          const next = Math.min(h + 1, filtered.length - 1);
          scrollItemIntoView(next);
          return next;
        });
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlighted(h => {
          const next = Math.max(h - 1, 0);
          scrollItemIntoView(next);
          return next;
        });
        break;
      case "Enter":
        e.preventDefault();
        if (highlighted >= 0) handleSelect(filtered[highlighted]);
        break;
      case "Escape":
        setOpen(false);
        break;
    }
  }

  function scrollItemIntoView(index: number) {
    const list = listRef.current;
    if (!list) return;
    const item = list.children[index] as HTMLElement | undefined;
    item?.scrollIntoView({ block: "nearest" });
  }

  // Highlight matched portion of text
  function highlight(text: string) {
    if (!query.trim()) return text;
    const idx = text.toLowerCase().indexOf(query.toLowerCase());
    if (idx === -1) return text;
    return (
      <>
        {text.slice(0, idx)}
        <mark className="bg-roome-core/20 text-roome-core rounded px-0.5 not-italic">
          {text.slice(idx, idx + query.length)}
        </mark>
        {text.slice(idx + query.length)}
      </>
    );
  }

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {label && (
        <label className={cn("block text-sm font-medium text-gray-600 mb-1", labelClassName)}>
          {label}
        </label>
      )}
      <input
        type="text"
        value={query}
        onChange={handleInput}
        onFocus={() => { if (query.trim()) setOpen(true); }}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        autoComplete="off"
        spellCheck={false}
        className={cn(
          "w-full px-4 py-3 rounded-2xl bg-gray-100 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-roome-core/50 focus:bg-white transition",
          inputClassName
        )}
      />
      {open && filtered.length > 0 && (
        <ul
          ref={listRef}
          className="absolute z-50 left-0 right-0 mt-1 bg-white border border-gray-100 rounded-2xl shadow-xl max-h-56 overflow-y-auto"
        >
          {filtered.map((option, i) => (
            <li
              key={option}
              onMouseDown={() => handleSelect(option)}
              className={cn(
                "px-4 py-2.5 text-sm cursor-pointer transition-colors",
                i === highlighted
                  ? "bg-roome-core text-white [&_mark]:bg-white/30 [&_mark]:text-white"
                  : "text-gray-800 hover:bg-gray-50"
              )}
            >
              {highlight(option)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
