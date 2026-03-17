"use client";

import { useRef, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Download, Share2, X } from "lucide-react";
import ShareCard from "./ShareCard";
import type { ShareCardProps } from "./ShareCard";

interface ShareModalProps extends ShareCardProps {
  open: boolean;
  onClose: () => void;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

const CARD_WIDTH = 1080;

export default function ShareModal({
  open,
  onClose,
  titulo,
  contenido,
  consigna,
  username,
  fecha,
}: ShareModalProps) {
  const hiddenRef = useRef<HTMLDivElement>(null);
  const [cardHeight, setCardHeight] = useState(1350);
  const [generating, setGenerating] = useState(false);
  const [canShare, setCanShare] = useState(false);

  // Scale so preview fits the screen: min(window.innerWidth * 0.85, 380) / 1080
  const previewDisplayWidth =
    typeof window !== "undefined"
      ? Math.min(window.innerWidth * 0.85, 380)
      : 320;
  const scale = previewDisplayWidth / CARD_WIDTH;

  useEffect(() => {
    if (!open) return;
    setCanShare(typeof navigator !== "undefined" && "share" in navigator);
    const measure = () => {
      if (hiddenRef.current) {
        const h = hiddenRef.current.scrollHeight;
        if (h > 100) setCardHeight(h);
        else requestAnimationFrame(measure);
      }
    };
    document.fonts.ready.then(() => requestAnimationFrame(measure));
  }, [open]);

  async function generateBlob(): Promise<Blob | null> {
    if (!hiddenRef.current) return null;
    setGenerating(true);
    try {
      await document.fonts.ready;
      // Dynamic import — only loads when needed
      const html2canvas = (await import("html2canvas")).default;
      const height = hiddenRef.current.scrollHeight;
      const canvas = await html2canvas(hiddenRef.current, {
        scale: 1,
        useCORS: true,
        backgroundColor: null,
        width: CARD_WIDTH,
        height,
        windowWidth: CARD_WIDTH,
        windowHeight: height,
      });
      return new Promise<Blob | null>((resolve) => {
        canvas.toBlob((blob) => resolve(blob), "image/png");
      });
    } catch (e) {
      console.error("html2canvas error:", e);
      return null;
    } finally {
      setGenerating(false);
    }
  }

  async function handleDescargar() {
    const blob = await generateBlob();
    if (!blob) return;
    const filename = `renglon-${slugify(titulo || "escrito")}.png`;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  async function handleCompartir() {
    const blob = await generateBlob();
    if (!blob) return;
    const filename = `renglon-${slugify(titulo || "escrito")}.png`;
    const file = new File([blob], filename, { type: "image/png" });
    try {
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file] });
      } else {
        // Fallback: download
        await handleDescargar();
      }
    } catch (e) {
      if ((e as DOMException).name !== "AbortError") console.error(e);
    }
  }

  const previewContainerHeight = Math.round(cardHeight * scale);

  return (
    <>
      {/* Div oculto con la tarjeta a tamaño real — solo cuando el modal está abierto */}
      {open && (
        <div
          style={{
            position: "fixed",
            left: -9999,
            top: 0,
            zIndex: -1,
            width: CARD_WIDTH,
          }}
        >
          <div ref={hiddenRef}>
            <ShareCard
              titulo={titulo}
              contenido={contenido}
              consigna={consigna}
              username={username}
              fecha={fecha}
            />
          </div>
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="share-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(28,25,23,0.60)",
              zIndex: 100,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 24,
            }}
          >
            <motion.div
              key="share-card"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              style={{
                backgroundColor: "#FDFAF5",
                borderRadius: 16,
                padding: 24,
                maxWidth: 380,
                width: "100%",
                boxShadow: "0 20px 60px rgba(28,25,23,0.25)",
              }}
            >
              {/* Header */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 20,
                }}
              >
                <span
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontStyle: "italic",
                    fontSize: 18,
                    color: "#3D3530",
                  }}
                >
                  Compartir escrito
                </span>
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#9C8B7E",
                    padding: 4,
                    display: "flex",
                  }}
                >
                  <X size={18} strokeWidth={1.5} />
                </button>
              </div>

              {/* Preview escalada */}
              <div
                style={{
                  width: previewDisplayWidth,
                  height: previewContainerHeight,
                  overflow: "hidden",
                  borderRadius: 8,
                  border: "1px solid rgba(61,53,48,0.10)",
                  position: "relative",
                  margin: "0 auto 20px",
                }}
              >
                <div
                  style={{
                    transformOrigin: "top left",
                    transform: `scale(${scale})`,
                    width: CARD_WIDTH,
                    position: "absolute",
                    top: 0,
                    left: 0,
                    pointerEvents: "none",
                  }}
                >
                  <ShareCard
                    titulo={titulo}
                    contenido={contenido}
                    consigna={consigna}
                    username={username}
                    fecha={fecha}
                  />
                </div>
              </div>

              {/* Botones */}
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  type="button"
                  onClick={handleDescargar}
                  disabled={generating}
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    padding: "12px",
                    backgroundColor: "#64313E",
                    color: "#FDFAF5",
                    border: "none",
                    borderRadius: 8,
                    fontSize: 14,
                    cursor: generating ? "not-allowed" : "pointer",
                    opacity: generating ? 0.7 : 1,
                    fontFamily: "Inter, sans-serif",
                  }}
                >
                  <Download size={16} strokeWidth={1.5} />
                  {generating ? "Generando…" : "Descargar"}
                </button>

                {canShare && (
                  <button
                    type="button"
                    onClick={handleCompartir}
                    disabled={generating}
                    style={{
                      flex: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      padding: "12px",
                      backgroundColor: "transparent",
                      color: "#64313E",
                      border: "1.5px solid #64313E",
                      borderRadius: 8,
                      fontSize: 14,
                      cursor: generating ? "not-allowed" : "pointer",
                      opacity: generating ? 0.7 : 1,
                      fontFamily: "Inter, sans-serif",
                    }}
                  >
                    <Share2 size={16} strokeWidth={1.5} />
                    Compartir
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
