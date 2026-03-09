"use client";

import { AnimatePresence, motion } from "framer-motion";

interface ConfirmDeleteModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
}

export default function ConfirmDeleteModal({
  open,
  onClose,
  onConfirm,
  loading = false,
}: ConfirmDeleteModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="delete-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={onClose}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(28,25,23,0.55)",
            backdropFilter: "blur(4px)",
            WebkitBackdropFilter: "blur(4px)",
            zIndex: 300,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
          }}
        >
          <motion.div
            key="delete-card"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: "#FDFAF5",
              borderRadius: 12,
              padding: "28px 24px",
              maxWidth: 340,
              width: "100%",
              boxShadow: "0 16px 48px rgba(28,25,23,0.22)",
            }}
          >
            <p
              style={{
                fontFamily: "'Playfair Display', serif",
                fontStyle: "italic",
                fontSize: 18,
                color: "#1C1917",
                margin: "0 0 8px",
                lineHeight: 1.35,
              }}
            >
              ¿Seguro que querés eliminar este escrito?
            </p>
            <p
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: 13,
                color: "#5C5147",
                margin: "0 0 24px",
                lineHeight: 1.5,
              }}
            >
              Esta acción no se puede deshacer.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                style={{
                  flex: 1,
                  padding: "11px 0",
                  background: "none",
                  border: "1.5px solid #D6CFBF",
                  borderRadius: 8,
                  fontFamily: "Inter, sans-serif",
                  fontSize: 14,
                  color: "#5C5147",
                  cursor: loading ? "not-allowed" : "pointer",
                  opacity: loading ? 0.6 : 1,
                }}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={loading}
                style={{
                  flex: 1,
                  padding: "11px 0",
                  backgroundColor: "#64313E",
                  border: "none",
                  borderRadius: 8,
                  fontFamily: "Inter, sans-serif",
                  fontSize: 14,
                  color: "#FDFAF5",
                  cursor: loading ? "not-allowed" : "pointer",
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? "Eliminando…" : "Eliminar"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
