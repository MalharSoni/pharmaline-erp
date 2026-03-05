import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Package } from 'lucide-react'

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center p-4">
      <Card className="w-full max-w-md border border-[#D4D4D4] shadow-lg">
        <CardHeader className="text-center space-y-4 pb-8 pt-10">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-[#0F4C81] rounded-2xl flex items-center justify-center">
              <Package className="w-9 h-9 text-white" />
            </div>
          </div>
          <div>
            <CardTitle className="text-[28px] font-black text-[#171717]">
              Pharmaline ERP
            </CardTitle>
            <CardDescription className="text-[13px] text-[#737373] mt-2">
              Sign in to access your pharmaceutical manufacturing dashboard
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="pb-10">
          <Link href="/dashboard">
            <Button
              type="button"
              className="w-full bg-[#0F4C81] text-white hover:bg-[#0A3A61] font-semibold text-[14px] py-6 shadow-sm transition-all duration-150"
            >
              Continue to Dashboard
            </Button>
          </Link>

          <div className="mt-8 text-center">
            <p className="text-[11px] text-[#A3A3A3] leading-relaxed">
              By signing in, you agree to Pharmaline's Terms of Service and Privacy Policy.
              <br />
              For support, contact your system administrator.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
