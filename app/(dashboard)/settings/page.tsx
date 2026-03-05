import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UsersTab } from "@/components/settings/users-tab"
import { SystemTab } from "@/components/settings/system-tab"
import { NotificationsTab } from "@/components/settings/notifications-tab"
import {
  getUsers,
  getSystemSettings,
  getNotificationSettings,
} from "@/app/actions/settings"

export default async function SettingsPage() {
  const [users, systemSettings, notificationSettings] = await Promise.all([
    getUsers(),
    getSystemSettings(),
    getNotificationSettings(),
  ])

  return (
    <DashboardLayout title="Settings">
      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="bg-[#F5F5F5] border border-[#D4D4D4] p-1">
          <TabsTrigger
            value="users"
            className="text-[13px] font-semibold data-[state=active]:bg-white data-[state=active]:text-[#171717] data-[state=active]:shadow-sm"
          >
            Users
          </TabsTrigger>
          <TabsTrigger
            value="system"
            className="text-[13px] font-semibold data-[state=active]:bg-white data-[state=active]:text-[#171717] data-[state=active]:shadow-sm"
          >
            System
          </TabsTrigger>
          <TabsTrigger
            value="notifications"
            className="text-[13px] font-semibold data-[state=active]:bg-white data-[state=active]:text-[#171717] data-[state=active]:shadow-sm"
          >
            Notifications
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="mt-0">
          <UsersTab users={users} />
        </TabsContent>

        <TabsContent value="system" className="mt-0">
          <SystemTab settings={systemSettings} />
        </TabsContent>

        <TabsContent value="notifications" className="mt-0">
          <NotificationsTab settings={notificationSettings} />
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  )
}
