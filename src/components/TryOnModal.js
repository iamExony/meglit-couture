"use client";
import { useState, useRef } from "react";
import Link from "next/link";
import { useCustomerAuth } from "@/context/CustomerAuthContext";

export default function TryOnModal({ product, isOpen, onClose }) {
  const { customer } = useCustomerAuth();
  const [modelImage, setModelImage] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const fileRef = useRef(null);

  if (!isOpen) return null;

  const garmentUrl = product.images?.[0];

  function handleFileChange(file) {
    if (!file || !file.type.startsWith("image/")) {
      setError("Please upload a valid image file (JPG, PNG, etc.).");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("Photo must be under 10 MB.");
      return;
    }
    setError("");
    const reader = new FileReader();
    reader.onload = (e) => {
      setModelImage({ base64: e.target.result, preview: e.target.result });
      setResult(null);
    };
    reader.readAsDataURL(file);
  }

  async function handleTryOn() {
    if (!modelImage) return;
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/try-on", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          garmentImageUrl: garmentUrl,
          modelImageBase64: modelImage.base64,
          category: product.category,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
      } else {
        setResult(data.imageUrl);
      }
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setModelImage(null);
    setResult(null);
    setError("");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-brand-950/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal panel */}
      <div className="relative bg-white w-full max-w-3xl max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col">
        {/* Header */}
        <div className="bg-brand-950 px-6 py-5 flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="font-heading text-xl font-bold text-white tracking-wide">
              Virtual Try&#8209;On
            </h2>
            <p className="text-brand-300 text-xs mt-0.5">
              See how this looks on you before you buy
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-white/50 hover:text-white transition-colors p-1 ml-4"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 flex-1">
          {!customer ? (
            /* ── Login gate ── */
            <div className="text-center py-14">
              <div className="w-16 h-16 bg-brand-50 border border-brand-100 rounded-full flex items-center justify-center mx-auto mb-5">
                <svg className="w-7 h-7 text-brand-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              </div>
              <h3 className="font-heading text-2xl font-bold text-brand-950 mb-2">
                Sign In to Try On
              </h3>
              <p className="text-ink-500 text-sm mb-8 max-w-xs mx-auto">
                Create a free account or sign in to access the Meglit Couture virtual fitting room.
              </p>
              <Link
                href={`/signin?next=${encodeURIComponent(typeof window !== "undefined" ? window.location.pathname : "/shop")}`}
                onClick={onClose}
                className="inline-block bg-brand-950 text-white text-sm font-semibold uppercase tracking-wider px-10 py-3.5 hover:bg-brand-800 transition-colors"
              >
                Sign In
              </Link>
            </div>
          ) : (
            /* ── Main try-on UI ── */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left — garment preview (hidden when result is shown, replaced by before/after) */}
              {!result && (
                <div>
                  <p className="text-[11px] font-semibold text-ink-500 uppercase tracking-[0.12em] mb-3">
                    Garment
                  </p>
                  <div className="aspect-[3/4] bg-brand-50 border border-brand-100 overflow-hidden">
                    {garmentUrl ? (
                      <img
                        src={garmentUrl}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-ink-300 text-xs">
                        No image
                      </div>
                    )}
                  </div>
                  <p className="text-[11px] text-ink-400 mt-2 text-center truncate px-1">
                    {product.name}
                  </p>
                </div>
              )}

              {/* Right — photo upload + result */}
              <div className={result ? "md:col-span-2" : ""}>
                <p className="text-[11px] font-semibold text-ink-500 uppercase tracking-[0.12em] mb-3">
                  {result ? "Try-On Result" : "Your Photo"}
                </p>

                {result ? (
                  /* Result state — before / after side by side */
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-[10px] text-ink-400 uppercase tracking-wider mb-1.5 text-center">Before</p>
                        <div className="aspect-[3/4] bg-brand-50 border border-brand-100 overflow-hidden">
                          <img
                            src={modelImage?.preview}
                            alt="Your original photo"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                      <div>
                        <p className="text-[10px] text-accent-600 uppercase tracking-wider mb-1.5 text-center font-semibold">After</p>
                        <div className="aspect-[3/4] bg-brand-50 border-2 border-accent-400 overflow-hidden">
                          <img
                            src={result}
                            alt="Virtual try-on result"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <a
                        href={result}
                        download="meglit-couture-tryon.jpg"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 text-center bg-accent-500 text-white text-xs font-semibold uppercase tracking-wider py-3.5 hover:bg-accent-600 transition-colors"
                      >
                        Save Photo
                      </a>
                      <button
                        onClick={handleReset}
                        className="flex-1 border border-brand-950 text-brand-950 text-xs font-semibold uppercase tracking-wider py-3.5 hover:bg-brand-50 transition-colors"
                      >
                        Try Another Photo
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Upload state */
                  <div className="space-y-4">
                    <div
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => e.key === "Enter" && fileRef.current?.click()}
                      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDragging(false);
                        handleFileChange(e.dataTransfer.files[0]);
                      }}
                      onClick={() => fileRef.current?.click()}
                      className={`aspect-[3/4] border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-colors overflow-hidden ${
                        isDragging
                          ? "border-accent-500 bg-accent-50"
                          : modelImage
                          ? "border-brand-950 bg-brand-50"
                          : "border-brand-200 bg-brand-50 hover:border-brand-400"
                      }`}
                    >
                      {modelImage ? (
                        <img
                          src={modelImage.preview}
                          alt="Your uploaded photo"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <>
                          <svg className="w-10 h-10 text-brand-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                          </svg>
                          <p className="text-xs font-medium text-ink-600 text-center px-6">
                            Drop your photo here or{" "}
                            <span className="text-accent-600 underline underline-offset-2">browse</span>
                          </p>
                          <p className="text-[11px] text-ink-400 mt-1.5 text-center px-4">
                            Full-body, front-facing photo works best
                          </p>
                          <p className="text-[10px] text-ink-300 mt-1">JPG / PNG · Max 10 MB</p>
                        </>
                      )}
                    </div>

                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileChange(e.target.files?.[0])}
                    />

                    {modelImage && !loading && (
                      <button
                        onClick={handleReset}
                        className="text-[11px] text-ink-400 hover:text-ink-700 underline underline-offset-2 transition-colors"
                      >
                        Remove photo
                      </button>
                    )}

                    {error && (
                      <p className="text-xs text-red-700 bg-red-50 border border-red-200 px-3 py-2.5">
                        {error}
                      </p>
                    )}

                    <button
                      onClick={handleTryOn}
                      disabled={!modelImage || loading}
                      className="w-full py-4 bg-accent-500 text-white font-semibold text-sm uppercase tracking-wider hover:bg-accent-600 active:bg-accent-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2.5"
                    >
                      {loading ? (
                        <>
                          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Processing…
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                          </svg>
                          Try It On
                        </>
                      )}
                    </button>

                    {loading && (
                      <p className="text-[11px] text-ink-400 text-center leading-relaxed">
                        AI is fitting the garment onto your photo.
                        <br />
                        This usually takes 15–30 seconds.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer tip */}
        {customer && (
          <div className="px-6 pb-5 flex-shrink-0">
            <p className="text-[11px] text-ink-400 text-center border-t border-brand-100 pt-4">
              For best results, use a well-lit front-facing full-body photo with a plain background.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
