import { Suspense } from 'react'
import LoginForm from './LoginForm'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm bg-white rounded-xl shadow p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">Blog-Trip Admin</h1>
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  )
}
