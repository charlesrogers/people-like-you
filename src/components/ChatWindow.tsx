'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import type { ChatMessage } from '@/lib/types'

interface Props {
  mutualMatchId: string
  userId: string
  isUserA: boolean
  partnerName: string
  onPhaseChange: (status: string) => void
}

export default function ChatWindow({
  mutualMatchId,
  userId,
  isUserA,
  partnerName,
  onPhaseChange,
}: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [myCount, setMyCount] = useState(0)
  const [partnerCount, setPartnerCount] = useState(0)
  const [maxMessages] = useState(10)
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [recording, setRecording] = useState(false)
  const [status, setStatus] = useState('chatting')
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null)
  const [chatExpiresAt, setChatExpiresAt] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const pollingRef = useRef<NodeJS.Timeout | null>(null)

  const remaining = maxMessages - myCount

  const fetchMessages = useCallback(async () => {
    try {
      const res = await fetch(`/api/chat?mutualMatchId=${mutualMatchId}&userId=${userId}`)
      if (!res.ok) return
      const data = await res.json()
      setMessages(data.messages)
      setMyCount(data.myCount)
      setPartnerCount(data.partnerCount)
      setStatus(data.status)
      setChatExpiresAt(data.chatExpiresAt)
      if (data.status !== 'chatting') {
        onPhaseChange(data.status)
      }
    } catch {
      // silently retry on next poll
    }
  }, [mutualMatchId, userId, onPhaseChange])

  // Initial fetch + polling
  useEffect(() => {
    fetchMessages()
    pollingRef.current = setInterval(fetchMessages, 3000)
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current)
    }
  }, [fetchMessages])

  // Countdown timer
  useEffect(() => {
    if (!chatExpiresAt) return
    const update = () => {
      const ms = Math.max(0, new Date(chatExpiresAt).getTime() - Date.now())
      setTimeRemaining(ms)
    }
    update()
    const interval = setInterval(update, 60000)
    return () => clearInterval(interval)
  }, [chatExpiresAt])

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendTextMessage() {
    if (!input.trim() || sending || remaining <= 0) return
    setSending(true)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mutualMatchId, userId, content: input.trim() }),
      })
      if (res.ok) {
        const data = await res.json()
        setMessages(data.messages)
        setMyCount(data.myCount)
        setPartnerCount(data.partnerCount)
        setInput('')
        if (data.status !== 'chatting') {
          setStatus(data.status)
          onPhaseChange(data.status)
        }
      }
    } finally {
      setSending(false)
    }
  }

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      chunksRef.current = []
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }
      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach(t => t.stop())
        const blob = new Blob(chunksRef.current, { type: mediaRecorder.mimeType })
        await sendVoiceMessage(blob)
      }
      mediaRecorderRef.current = mediaRecorder
      mediaRecorder.start()
      setRecording(true)
    } catch {
      // mic permission denied
    }
  }

  function stopRecording() {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop()
    }
    setRecording(false)
  }

  async function sendVoiceMessage(blob: Blob) {
    if (sending || remaining <= 0) return
    setSending(true)
    try {
      const formData = new FormData()
      formData.append('mutualMatchId', mutualMatchId)
      formData.append('userId', userId)
      formData.append('audio', blob, 'voice.webm')

      const res = await fetch('/api/chat', {
        method: 'POST',
        body: formData,
      })
      if (res.ok) {
        const data = await res.json()
        setMessages(data.messages)
        setMyCount(data.myCount)
        setPartnerCount(data.partnerCount)
        if (data.status !== 'chatting') {
          setStatus(data.status)
          onPhaseChange(data.status)
        }
      }
    } finally {
      setSending(false)
    }
  }

  function formatTimeRemaining(ms: number | null): string {
    if (ms === null) return ''
    const hours = Math.floor(ms / (1000 * 60 * 60))
    if (hours > 24) return `${Math.floor(hours / 24)}d ${hours % 24}h left`
    if (hours > 0) return `${hours}h left`
    const mins = Math.floor(ms / (1000 * 60))
    return `${mins}m left`
  }

  const counterColor = remaining <= 1 ? 'text-red-500 bg-red-500/10' :
    remaining <= 3 ? 'text-amber-500 bg-amber-500/10' :
    'text-muted-foreground bg-secondary'

  const counterText = remaining <= 1 ? 'Last message' :
    remaining <= 3 ? `${remaining} left - make them count` :
    `${remaining} left`

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="text-center">
        <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
          You matched
        </p>
        <h2 className="text-[15px] font-semibold mt-1">
          Chat with {partnerName}
        </h2>
        <div className="flex items-center justify-center gap-3 mt-1">
          {timeRemaining !== null && (
            <span className="text-[11px] text-muted-foreground">
              {formatTimeRemaining(timeRemaining)}
            </span>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="rounded-xl border bg-card shadow-sm shadow-black/[0.04] overflow-hidden">
        <div className="h-[400px] overflow-y-auto p-4 space-y-3">
          {messages.length === 0 && (
            <p className="text-[12px] text-muted-foreground text-center py-8">
              Say hi! You have {maxMessages} messages each to get to know each other.
            </p>
          )}

          {messages.map((msg) => {
            const isMine = msg.sender_id === userId
            return (
              <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                  isMine
                    ? 'bg-primary text-primary-foreground rounded-br-md'
                    : 'bg-secondary text-foreground rounded-bl-md'
                }`}>
                  {msg.voice_url && (
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[11px] opacity-70">Voice message</span>
                    </div>
                  )}
                  <p className="text-[13px]">{msg.transcript || msg.content}</p>
                  <p className={`text-[10px] mt-1 ${isMine ? 'text-primary-foreground/60' : 'text-muted-foreground'}`}>
                    #{msg.message_number}
                  </p>
                </div>
              </div>
            )
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        {remaining > 0 && status === 'chatting' ? (
          <div className="border-t p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${counterColor}`}>
                {counterText}
              </span>
              {partnerCount >= maxMessages && myCount < maxMessages && (
                <span className="text-[11px] text-muted-foreground">
                  {partnerName} used all their messages
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendTextMessage() } }}
                placeholder="Type a message..."
                className="flex-1 rounded-lg border bg-background px-3 py-2 text-[13px] focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none"
                disabled={sending}
              />
              <button
                onClick={recording ? stopRecording : startRecording}
                disabled={sending}
                className={`rounded-lg px-3 py-2 text-[13px] font-medium transition-all active:translate-y-px ${
                  recording
                    ? 'bg-red-500 text-white animate-pulse'
                    : 'bg-secondary text-foreground hover:bg-accent'
                }`}
                title={recording ? 'Stop recording' : 'Send voice message'}
              >
                {recording ? 'Stop' : 'Mic'}
              </button>
              <button
                onClick={sendTextMessage}
                disabled={!input.trim() || sending}
                className="rounded-lg bg-primary text-primary-foreground px-4 py-2 text-[13px] font-medium disabled:opacity-50 disabled:pointer-events-none active:translate-y-px transition-all"
              >
                Send
              </button>
            </div>
          </div>
        ) : (
          <div className="border-t p-4 text-center">
            {remaining <= 0 && partnerCount < maxMessages ? (
              <p className="text-[12px] text-muted-foreground">
                You&apos;ve used all your messages. Waiting for {partnerName} to finish...
              </p>
            ) : status !== 'chatting' ? (
              <p className="text-[12px] text-muted-foreground">
                Chat complete. Time to decide.
              </p>
            ) : null}
          </div>
        )}
      </div>
    </div>
  )
}
