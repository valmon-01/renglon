"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";
import BottomNav from "./BottomNav";

const HIDDEN_ROUTES = ["/", "/login", "/registro", "/editor"];

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setLoggedIn(!!session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setLoggedIn(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const showNav =
    loggedIn &&
    !HIDDEN_ROUTES.includes(pathname) &&
    !pathname.startsWith("/texto/");

  return (
    <>
      <div style={showNav ? { paddingBottom: 64 } : undefined}>
        {children}
      </div>
      {showNav && <BottomNav />}
    </>
  );
}
