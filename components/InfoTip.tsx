"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

/* Aclara cómo se calcula una métrica. El tooltip se renderiza en un portal
   al <body> con posición fija: así no queda atrapado en el contexto de
   apilamiento que crean las animaciones (transform/filter) y no lo tapan
   otros elementos. */
export default function InfoTip({ text }: { text: string }) {
  const triggerRef = useRef<HTMLSpanElement>(null);
  const [coords, setCoords] = useState<{
    left: number;
    top: number;
    width: number;
    above: boolean;
  } | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const show = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const margin = 8;
    const width = Math.min(224, window.innerWidth * 0.75);
    let left = rect.left;
    if (left + width > window.innerWidth - margin) {
      left = window.innerWidth - margin - width;
    }
    if (left < margin) left = margin;
    const above = rect.top > 72;
    const top = above ? rect.top - margin : rect.bottom + margin;
    setCoords({ left, top, width, above });
  }, []);

  const hide = useCallback(() => setCoords(null), []);

  useEffect(() => {
    if (!coords) return;
    window.addEventListener("scroll", hide, true);
    window.addEventListener("resize", hide);
    return () => {
      window.removeEventListener("scroll", hide, true);
      window.removeEventListener("resize", hide);
    };
  }, [coords, hide]);

  return (
    <>
      <span
        ref={triggerRef}
        tabIndex={0}
        role="button"
        aria-label={text}
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
        className="inline-flex items-center justify-center w-4 h-4 rounded-full border border-base-content/30 text-[10px] font-bold text-base-content/60 cursor-help select-none align-middle focus:outline-none focus:ring-1 focus:ring-primary"
      >
        ?
      </span>
      {mounted &&
        coords &&
        createPortal(
          <span
            role="tooltip"
            style={{
              position: "fixed",
              left: coords.left,
              top: coords.top,
              width: coords.width,
              transform: coords.above ? "translateY(-100%)" : "none",
            }}
            className="pointer-events-none z-[9999] rounded-lg bg-neutral text-neutral-content text-[11px] font-normal normal-case leading-snug text-left px-3 py-2 shadow-lg"
          >
            {text}
          </span>,
          document.body
        )}
    </>
  );
}
