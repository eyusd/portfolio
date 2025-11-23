"use client";

import { useVirtualizer } from "@tanstack/react-virtual";
import { useRef, useMemo, useState } from "react";
import katex from "katex";

interface Make10ListProps {
  solutions: string[];
}

export function Make10List({ solutions }: Make10ListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const parentRef = useRef<HTMLDivElement>(null);

  // Filter solutions based on search term (search by index)
  const filteredSolutions = useMemo(() => {
    if (!searchTerm) return solutions;
    const term = searchTerm.toLowerCase().trim();
    return solutions.filter((_, index) => {
      const digits = String(index).padStart(4, "0");
      return digits.includes(term);
    });
  }, [solutions, searchTerm]);

  // Setup virtualizer
  const virtualizer = useVirtualizer({
    count: filteredSolutions.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50,
    overscan: 10,
  });

  // Render LaTeX to HTML
  const renderLatex = (latex: string) => {
    try {
      return katex.renderToString(latex, {
        displayMode: false,
        throwOnError: false,
      });
    } catch {
      return `<span class="text-red-500">${latex}</span>`;
    }
  };

  // Get original index from filtered list
  const getOriginalIndex = (filteredIndex: number) => {
    if (!searchTerm) return filteredIndex;
    const term = searchTerm.toLowerCase().trim();
    let count = 0;
    for (let i = 0; i < solutions.length; i++) {
      const digits = String(i).padStart(4, "0");
      if (digits.includes(term)) {
        if (count === filteredIndex) return i;
        count++;
      }
    }
    return filteredIndex;
  };

  return (
    <div className="w-full">
      {/* Search bar: offset from the top nav so it isn't hidden behind the site's top bar */}
      <div className="sticky top-14 z-20 bg-background/95 backdrop-blur pt-2 pb-2">
        <input
          type="text"
          placeholder="Search by 4-digit number (e.g., 0001, 1234)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground font-mono"
        />
        <p className="text-sm text-muted-foreground mt-2 mb-0">
          Showing {filteredSolutions.length} of {solutions.length} solutions
        </p>
      </div>

      {/* Virtualized list */}
      <div
        ref={parentRef}
        className="h-[600px] overflow-auto border border-border rounded-lg mt-2"
      >
        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: "100%",
            position: "relative",
          }}
        >
          {virtualizer.getVirtualItems().map((virtualRow) => {
            const originalIndex = getOriginalIndex(virtualRow.index);
            const solution = solutions[originalIndex];
            const indexStr = String(originalIndex).padStart(4, "0");

            return (
              <div
                key={virtualRow.key}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  transform: `translateY(${virtualRow.start}px)`,
                }}
                className="border-b border-border px-6 py-3 hover:bg-muted/50 transition-colors flex items-center gap-4"
              >
                <span className="font-mono text-muted-foreground text-sm flex-shrink-0 w-12">
                  {indexStr}
                </span>
                <div
                  className="flex-1"
                  dangerouslySetInnerHTML={{
                    __html: renderLatex(solution),
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
