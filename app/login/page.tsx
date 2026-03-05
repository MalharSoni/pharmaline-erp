import { signIn } from '@/auth'
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
          <form
            action={async () => {
              'use server'
              await signIn('google', { redirectTo: '/dashboard' })
            }}
          >
            <Button
              type="submit"
              className="w-full bg-white text-[#171717] border-2 border-[#D4D4D4] hover:bg-[#F5F5F5] hover:border-[#0F4C81] font-semibold text-[14px] py-6 shadow-sm transition-all duration-150"
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </Button>
          </form>

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
