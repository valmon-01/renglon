"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { X, ChevronLeft, ChevronRight, Share2, Trash2, Eye, EyeOff } from "lucide-react";
import ShareModal from "./ShareModal";
import ConfirmDeleteModal from "./ConfirmDeleteModal";

interface Texto {
  id: string;
  titulo: string | null;
  contenido: string;
  consigna: string;
  created_at: string;
  publicado: boolean;
}

interface NotebookPagesProps {
  texts: Texto[];
  username: string;
  userId: string;
  sessionUserId: string;
  onClose: () => void;
  onDelete: (id: string) => Promise<void>;
  onTogglePublicado: (id: string, current: boolean) => Promise<void>;
  readOnly?: boolean;
}

function fechaDDMMYYYY(iso: string): string {
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

export default function NotebookPages({
  texts,
  username,
  userId,
  sessionUserId,
  onClose,
  onDelete,
  onTogglePublicado,
  readOnly = false,
}: NotebookPagesProps) {
  const [page, setPage] = useState(0);
  const [showShare, setShowShare] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [toggleLoading, setToggleLoading] = useState(false);

  const isOwner = userId === sessionUserId;
  const total = texts.length;
  const text = texts[page];

  // Ajustar página cuando se elimina un texto
  useEffect(() => {
    if (texts.length === 0) {
      onClose();
      return;
    }
    if (page >= texts.length) {
      setPage(texts.length - 1);
    }
  }, [texts.length, page, onClose]);

  if (!text) return null;

  async function handleDeleteConfirm() {
    setDeleteLoading(true);
    await onDelete(text.id);
    setDeleteLoading(false);
    setShowDeleteConfirm(false);
  }

  async function handleToggle() {
    if (toggleLoading) return;
    setToggleLoading(true);
    await onTogglePublicado(text.id, text.publicado);
    setToggleLoading(false);
  }

  const iconButtonStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "#9C8B7E",
    padding: 0,
    transition: "color 0.2s",
  };

  return (
    <div
      style={{
        display: "flex",
        minHeight: 680,
        boxShadow: "4px 6px 32px rgba(28,25,23,0.16), -2px 0 0 rgba(28,25,23,0.08)",
        borderRadius: "4px 10px 10px 4px",
      }}
    >
      {text.publicado && (
        <ShareModal
          open={showShare}
          onClose={() => setShowShare(false)}
          titulo={text.titulo}
          contenido={text.contenido}
          consigna={text.consigna}
          username={username}
          fecha={text.created_at}
        />
      )}

      <ConfirmDeleteModal
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteConfirm}
        loading={deleteLoading}
      />

      {/* Lomo izquierdo */}
      <div
        style={{
          width: 18,
          background: "linear-gradient(to bottom, #4a2430, #64313E, #4a2430)",
          borderRadius: "4px 0 0 4px",
          flexShrink: 0,
        }}
      />

      {/* Página derecha */}
      <div
        style={{
          flex: 1,
          backgroundColor: "#FDFAF5",
          borderRadius: "0 10px 10px 0",
          position: "relative",
          display: "flex",
          flexDirection: "column",
          backgroundImage:
            "repeating-linear-gradient(to bottom, transparent, transparent 39px, #E8E2D8 39px, #E8E2D8 40px)",
          backgroundPositionY: "0px",
          overflow: "hidden",
        }}
      >
        {/* Línea de margen izquierda */}
        <div
          style={{
            position: "absolute",
            left: 44,
            top: 0,
            bottom: 0,
            width: 1,
            backgroundColor: "#C1DBE8",
            pointerEvents: "none",
          }}
        />

        {/* Contenido con padding */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            padding: "40px 0 40px 0",
            position: "relative",
          }}
        >
          {/* Fila 1: @username + cerrar — height 40px */}
          <div
            style={{
              height: 40,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexShrink: 0,
              paddingLeft: "60px",
              paddingRight: "40px",
            }}
          >
            <Link
              href={userId === sessionUserId ? "/perfil" : `/perfil-publico?id=${userId}`}
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: 12,
                textTransform: "lowercase",
                letterSpacing: "0.08em",
                color: "#9C8B7E",
                textDecoration: "none",
                transition: "color 0.2s",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                minWidth: 0,
                flexShrink: 1,
              }}
              className="hover:underline hover:text-[#64313E]"
            >
              @{username}
            </Link>
            <button
              type="button"
              onClick={onClose}
              title="Cerrar"
              aria-label="Cerrar"
              style={{
                display: "flex",
                alignItems: "center",
                color: "#9C8B7E",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
                flexShrink: 0,
                marginLeft: 12,
              }}
            >
              <X size={18} strokeWidth={1.5} />
            </button>
          </div>

          {/* Fila 2: botones de acción con labels */}
          {!readOnly && (text.publicado || isOwner) && (
            <div
              style={{
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "flex-end",
                gap: 16,
                flexShrink: 0,
                paddingLeft: "60px",
                paddingRight: "40px",
                paddingBottom: 8,
              }}
            >
              {text.publicado && (
                <button
                  type="button"
                  onClick={() => setShowShare(true)}
                  aria-label="Compartir como imagen"
                  title="Compartir"
                  style={{ ...iconButtonStyle, flexDirection: "column", gap: 3 }}
                  className="hover:!text-[#64313E]"
                >
                  <Share2 size={18} strokeWidth={1.5} />
                  <span style={{ fontFamily: "var(--font-sans)", fontSize: 10 }}>Compartir</span>
                </button>
              )}

              {isOwner && (
                <>
                  <button
                    type="button"
                    onClick={handleToggle}
                    disabled={toggleLoading}
                    aria-label={text.publicado ? "Cambiar a privado" : "Cambiar a público"}
                    title={text.publicado ? "Cambiar a privado" : "Cambiar a público"}
                    style={{ ...iconButtonStyle, flexDirection: "column", gap: 3, opacity: toggleLoading ? 0.5 : 1 }}
                    className="hover:!text-[#64313E]"
                  >
                    {text.publicado ? (
                      <Eye size={18} strokeWidth={1.5} />
                    ) : (
                      <EyeOff size={18} strokeWidth={1.5} />
                    )}
                    <span style={{ fontFamily: "var(--font-sans)", fontSize: 10 }}>
                      {text.publicado ? "Público" : "Privado"}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(true)}
                    aria-label="Eliminar escrito"
                    title="Eliminar escrito"
                    style={{ ...iconButtonStyle, flexDirection: "column", gap: 3 }}
                    className="hover:!text-[#64313E]"
                  >
                    <Trash2 size={18} strokeWidth={1.5} />
                    <span style={{ fontFamily: "var(--font-sans)", fontSize: 10 }}>Eliminar</span>
                  </button>
                </>
              )}
            </div>
          )}

          {/* Fecha + consigna — height 40px */}
          <div
            style={{
              height: 40,
              display: "flex",
              alignItems: "center",
              flexShrink: 0,
              paddingLeft: "60px",
              paddingRight: "40px",
              overflow: "hidden",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: 12,
                color: "rgba(61,53,48,0.45)",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {fechaDDMMYYYY(text.created_at)}
              {text.consigna
                ? ` — ${text.consigna.length > 50 ? text.consigna.slice(0, 50) + "…" : text.consigna}`
                : ""}
            </span>
          </div>

          {/* Título — height 40px, una línea */}
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontStyle: "italic",
              fontSize: 21,
              color: "#1C1917",
              lineHeight: "40px",
              height: "40px",
              margin: 0,
              padding: 0,
              paddingLeft: "60px",
              paddingRight: "40px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            {text.titulo || "Sin título"}
          </h2>

          {/* Cuerpo */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            } as React.CSSProperties}
          >
            <p
              style={{
                fontFamily: "inherit",
                fontSize: "15px",
                lineHeight: "40px",
                color: "#3D3530",
                margin: 0,
                padding: 0,
                paddingLeft: "52px",
                paddingRight: "24px",
                wordBreak: "break-word",
                whiteSpace: "pre-wrap",
                display: "block",
              }}
            >
              {text.contenido}
            </p>
          </div>

          {/* Navegación */}
          <div
            style={{
              borderTop: "1px solid #D6CFBF",
              paddingTop: 12,
              paddingLeft: "60px",
              paddingRight: "40px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexShrink: 0,
            }}
          >
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                fontFamily: "var(--font-sans)",
                fontSize: 13,
                color: page === 0 ? "#D6CFBF" : "#64313E",
                background: "none",
                border: "none",
                cursor: page === 0 ? "default" : "pointer",
                padding: 0,
              }}
            >
              <ChevronLeft size={14} strokeWidth={1.5} />
              Anterior
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              {texts.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setPage(i)}
                  style={{
                    height: 6,
                    width: i === page ? 18 : 6,
                    borderRadius: 3,
                    backgroundColor: i === page ? "#64313E" : "#D6CFBF",
                    border: "none",
                    padding: 0,
                    cursor: "pointer",
                    transition: "width 0.2s ease, background-color 0.2s ease",
                  }}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={() => setPage((p) => Math.min(total - 1, p + 1))}
              disabled={page === total - 1}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                fontFamily: "var(--font-sans)",
                fontSize: 13,
                color: page === total - 1 ? "#D6CFBF" : "#64313E",
                background: "none",
                border: "none",
                cursor: page === total - 1 ? "default" : "pointer",
                padding: 0,
              }}
            >
              Siguiente
              <ChevronRight size={14} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
