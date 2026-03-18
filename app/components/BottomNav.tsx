"use client";

import { usePathname, useRouter } from "next/navigation";
import { Home, PenLine, User } from "lucide-react";

const ITEMS = [
  { label: "Inicio", href: "/home", Icon: Home },
  { label: "Escribir", href: "/editor", Icon: PenLine, center: true },
  { label: "Perfil", href: "/perfil", Icon: User },
];

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "#F5F0EA",
        borderTop: "1px solid rgba(61,53,48,0.08)",
        paddingBottom: "env(safe-area-inset-bottom)",
        zIndex: 50,
      }}
    >
      <div
        style={{
          maxWidth: 720,
          margin: "0 auto",
          height: 64,
          display: "flex",
          justifyContent: "space-around",
          alignItems: "center",
        }}
      >
        {ITEMS.map(({ label, href, Icon, center }) => {
          const active = pathname === href;
          const color = active ? "#64313E" : "#9C8B7E";

          if (center) {
            return (
              <div
                key={href}
                role="button"
                tabIndex={0}
                onClick={() => router.push(href)}
                onKeyDown={(e) => e.key === "Enter" && router.push(href)}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 4,
                  cursor: "pointer",
                  padding: "4px 16px",
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: "50%",
                    backgroundColor: "#64313E",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 2px 8px rgba(100,49,62,0.3)",
                  }}
                >
                  <Icon size={20} strokeWidth={1.5} color="#F5F0E8" />
                </div>
              </div>
            );
          }

          return (
            <div
              key={href}
              role="button"
              tabIndex={0}
              onClick={() => router.push(href)}
              onKeyDown={(e) => e.key === "Enter" && router.push(href)}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 4,
                cursor: "pointer",
                padding: "8px 16px",
              }}
            >
              <Icon size={22} strokeWidth={1.5} color={color} />
              <span
                style={{
                  fontSize: 10,
                  letterSpacing: "0.08em",
                  fontFamily: "var(--font-sans)",
                  textTransform: "uppercase",
                  color,
                }}
              >
                {label}
              </span>
              {active && (
                <div
                  style={{
                    width: 4,
                    height: 4,
                    borderRadius: "50%",
                    backgroundColor: "#64313E",
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
