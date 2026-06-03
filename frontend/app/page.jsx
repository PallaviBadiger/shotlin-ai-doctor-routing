'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const router = useRouter()
  useEffect(() => {
    const token = localStorage.getItem('token')
    const role = localStorage.getItem('role')
    if (!token) { router.replace('/auth/login'); return }
    if (role === 'ADMIN') router.replace('/admin/dashboard')
    else if (role === 'DOCTOR') router.replace('/doctor/dashboard')
    else router.replace('/patient/dashboard')
  }, [router])
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      <div className="spinner" style={{ width: 28, height: 28 }} />
    </div>
  )
}
