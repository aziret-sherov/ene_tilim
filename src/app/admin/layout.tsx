export const metadata = {
  title: 'Admin — Эне тилим',
  robots: { index: false, follow: false },
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#fafafa]">
      {children}
    </div>
  )
}
