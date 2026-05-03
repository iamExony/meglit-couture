"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Wraps children in a div that fades + slides in once it enters the viewport.
 * Uses IntersectionObserver so the animation only fires once per session.
 *
 * Props:
 *  - delay: ms to wait after entering before starting the animation (default 0)
 *  - as:    HTML tag (default "div")
 *  - className: extra classes
 *  - threshold: visibility ratio (default 0.15)
 */
export default function Reveal({
  children,
  delay = 0,
  as: Tag = "div",
  className = "",
  threshold = 0.15,
  ...rest
}) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || visible) return;
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const obs = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            if (delay > 0) {
              const t = setTimeout(() => setVisible(true), delay);
              return () => clearTimeout(t);
            }
            setVisible(true);
            obs.disconnect();
            break;
          }
        }
      },
      { threshold, rootMargin: "0px 0px -40px 0px" }
    );
    obs.observe(node);
    return () => obs.disconnect();
  }, [delay, threshold, visible]);

  return (
    <Tag
      ref={ref}
      className={`reveal ${visible ? "is-visible" : ""} ${className}`}
      {...rest}
    >
      {children}
    </Tag>
  );
}
