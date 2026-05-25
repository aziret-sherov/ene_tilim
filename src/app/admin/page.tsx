import { getSession } from './actions'
import { LoginForm } from './login-form'
import { AdminDashboard } from './admin-dashboard'

export default async function AdminPage() {
  const session = await getSession()
  if (!session) return <LoginForm />
  return <AdminDashboard session={session} />
}
