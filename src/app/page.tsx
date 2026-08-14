import WaitlistCapture from '@/components/WaitlistCapture'

// Pre-launch: the root URL is the waitlist capture (Charles, 2026-08-13). Ad traffic
// lands directly on the form — no click between arriving and converting. The original
// marketing homepage lives at /welcome; /onboarding still works for seed users.
export default function Home() {
  return <WaitlistCapture />
}
