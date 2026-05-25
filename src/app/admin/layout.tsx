export const metadata = { title: 'Admin — Эне тилим' }

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#fafafa]">
      {children}
    </div>
  )
}
