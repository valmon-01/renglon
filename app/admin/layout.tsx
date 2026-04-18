import { redirect } from "next/navigation"
import { requireAdmin } from "@/lib/server/auth"

/**
 * Layout server-side que protege TODAS las rutas bajo /admin/*.
 *
 * Antes: la verificación se hacía solo en el cliente (useEffect en page.tsx),
 * lo que permitía que alguien abriera /admin, viera el HTML y los handlers, y
 * llamara directamente a las API routes. Ahora el gate corre en el server
 * antes de que cualquier código de cliente se envíe.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const admin = await requireAdmin()
  if (!admin) {
    redirect("/home")
  }
  return <>{children}</>
}
