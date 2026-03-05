import { auth } from '@/auth'

export default auth((req) => {
  // Authentication temporarily bypassed - allow all users access
  // TODO: Re-enable authentication when Google OAuth is configured
  return
})

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)'],
}
