import { Sidebar } from "./sidebar"
import { Topbar } from "./topbar"

interface DashboardLayoutProps {
  children: React.ReactNode
  title: string
  action?: React.ReactNode
}

export function DashboardLayout({ children, title, action }: DashboardLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />

      <main className="flex-1 flex flex-col ml-60 overflow-hidden">
        <Topbar title={title} action={action} />

        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>
      </main>
    </div>
  )
}
