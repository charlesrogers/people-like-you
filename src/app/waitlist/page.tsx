import WaitlistCapture from '@/components/WaitlistCapture'

// Kept as a live URL because existing Meta ads point here. Same capture as the root,
// so it canonicalises to / — otherwise Google sees two identical pages and picks one.
export const metadata = {
  alternates: { canonical: '/' },
}

export default function WaitlistPage() {
  return <WaitlistCapture />
}
