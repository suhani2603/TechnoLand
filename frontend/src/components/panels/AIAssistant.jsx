import React, { useEffect, useRef, useState, useCallback } from 'react'
import useMapStore from '../../store/mapStore.js'
import { useAIChat } from '../../hooks/useAIChat.js'
import { SUGGESTED_QUESTIONS } from '../../services/mockData.js'
import './Panel.css'
import './AIAssistant.css'

/* ══════════════════════════════════════════════════════════
   TechnoLand AI Assistant
   - Structured answer rendering (sections separated by ##)
   - Evidence / "Why this insight?" collapsible
   - Contextual quick-question chips
   - Grounded in feature properties — never invents facts
══════════════════════════════════════════════════════════ */

/* ── Signal colours for evidence rows ──────────────────── */
const SIG = {
  positive: { dot: '#4ade80', bg: 'rgba(74,222,128,0.07)',  border: 'rgba(74,222,128,0.18)',  text: '#4ade80' },
  warning:  { dot: '#fbbf24', bg: 'rgba(251,191,36,0.07)',  border: 'rgba(251,191,36,0.18)',  text: '#fbbf24' },
  negative: { dot: '#f87171', bg: 'rgba(248,113,113,0.07)', border: 'rgba(248,113,113,0.18)', text: '#f87171' },
  neutral:  { dot: '#94a3b8', bg: 'rgba(148,163,184,0.05)', border: 'rgba(148,163,184,0.13)', text: '#94a3b8' },
}

/* ── Markdown-lite renderer ──────────────────────────────── */
function Markdown({ text }) {
  if (!text) return null
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g)
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**'))
          return <strong key={i}>{part.slice(2, -2)}</strong>
        if (part.startsWith('*') && part.endsWith('*'))
          return <em key={i}>{part.slice(1, -1)}</em>
        return part.split('\n').map((line, j, arr) => (
          <React.Fragment key={`${i}-${j}`}>
            {line}
            {j < arr.length - 1 && <br />}
          </React.Fragment>
        ))
      })}
    </>
  )
}

/* ── Evidence collapsible ───────────────────────────────── */
function EvidenceSection({ evidence }) {
  const [open, setOpen] = useState(false)
  if (!evidence?.length) return null
  return (
    <div className="ai-evidence">
      <button
        className="ai-evidence__toggle"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <DataIcon />
        <span>Evidence used</span>
        <span className="ai-evidence__count">{evidence.length} data points</span>
        <ChevronSmall open={open} />
      </button>
      {open && (
        <div className="ai-evidence__body animate-fadeIn">
          <p className="ai-evidence__label">
            Based on TechnoLand demo data · Dehradun, Uttarakhand
          </p>
          {evidence.map((item, i) => {
            const s = SIG[item.signal] || SIG.neutral
            return (
              <div key={i} className="ai-evidence__row"
                style={{ background: s.bg, border: `1px solid ${s.border}` }}>
                <span className="ai-evidence__dot" style={{ background: s.dot }} aria-hidden="true" />
                <span className="ai-evidence__key">{item.label}</span>
                <span className="ai-evidence__val" style={{ color: s.text }}>{item.value}</span>
              </div>
            )
          })}
          <p className="ai-evidence__disclaimer">
            Synthetic demo data · not official government data
          </p>
        </div>
      )}
    </div>
  )
}

/* ── Message bubble ─────────────────────────────────────── */
function MessageBubble({ msg }) {
  const isUser = msg.role === 'user'
  return (
    <div className={`ai-msg ai-msg--${msg.role}`}>
      <div className="ai-msg__avatar" aria-hidden="true">
        {isUser ? <UserAvatar /> : <BotAvatarSmall />}
      </div>
      <div className="ai-msg__content">
        <div className="ai-msg__bubble">
          <Markdown text={msg.content} />
        </div>
        {!isUser && msg.evidence?.length > 0 && (
          <EvidenceSection evidence={msg.evidence} />
        )}
        <time className="ai-msg__time" dateTime={msg.timestamp?.toISOString?.()}>
          {formatTime(msg.timestamp)}
        </time>
      </div>
    </div>
  )
}

/* ── Quick questions — context-aware ────────────────────── */
function QuickQuestions({ feature, onAsk, disabled }) {
  const questions = feature
    ? SUGGESTED_QUESTIONS
    : ['What does TechnoLand analyse?', 'How does the evidence system work?', 'What data sources are used?']

  return (
    <div className="ai-quick" aria-label="Quick questions">
      <p className="ai-quick__label">Quick questions</p>
      <div className="ai-quick__chips">
        {questions.slice(0, 4).map((q) => (
          <button
            key={q}
            className="ai-quick__chip"
            onClick={() => !disabled && onAsk(q)}
            disabled={disabled}
            aria-label={`Ask: ${q}`}
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  )
}

/* ── Time helper ────────────────────────────────────────── */
function formatTime(date) {
  if (!date) return ''
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

/* ════════════════════════════════════════════════════════
   Main component
═════════════════════════════════════════════════════════ */
export default function AIAssistant() {
  const { setRightPanel, selectedFeature } = useMapStore()
  const { messages, isLoading, error, sendMessage, clearChat } = useAIChat(selectedFeature)
  const [input, setInput] = useState('')
  const messagesEndRef = useRef(null)
  const textareaRef = useRef(null)

  /* Auto-scroll */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  const handleSend = useCallback(() => {
    const text = input.trim()
    if (!text || isLoading) return
    sendMessage(text)
    setInput('')
    textareaRef.current?.focus()
  }, [input, isLoading, sendMessage])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const parcelName =
    selectedFeature?.properties?.name ||
    selectedFeature?.properties?.parcel_id ||
    null

  const showQuickQuestions = messages.length < 3 && !isLoading

  return (
    <div className="ai-panel" aria-label="TechnoLand AI Assistant">

      {/* ── Header ── */}
      <div className="ai-panel__header">
        <div className="ai-panel__header-left">
          <BotAvatar />
          <div>
            <p className="ai-panel__title">TechnoLand AI</p>
            <p className="ai-panel__meta">
              Mock mode · Amazon Bedrock in Phase 3
            </p>
          </div>
        </div>
        <div className="ai-panel__header-actions">
          <button
            className="ai-panel__icon-btn"
            onClick={clearChat}
            title="Clear conversation"
            aria-label="Clear conversation"
          >
            <ClearIcon />
          </button>
          <button
            className="ai-panel__icon-btn"
            onClick={() => setRightPanel(null)}
            aria-label="Close AI assistant"
          >
            <CloseIcon />
          </button>
        </div>
      </div>

      {/* ── Context strip — shows selected parcel ── */}
      {parcelName && (
        <div className="ai-panel__context" aria-label="Active context">
          <PinIcon />
          <span className="ai-panel__context-name">{parcelName}</span>
          <span className="ai-panel__context-tag">Active context</span>
        </div>
      )}
      {!parcelName && (
        <div className="ai-panel__context ai-panel__context--empty">
          <PinIcon />
          <span>Select a map feature to enable parcel-specific answers</span>
        </div>
      )}

      {/* ── Messages ── */}
      <div className="ai-panel__messages" role="log" aria-live="polite" aria-label="Conversation">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} msg={msg} />
        ))}

        {/* Typing indicator */}
        {isLoading && (
          <div className="ai-msg ai-msg--assistant" aria-label="Thinking">
            <div className="ai-msg__avatar"><BotAvatarSmall /></div>
            <div className="ai-msg__content">
              <div className="ai-msg__bubble ai-msg__bubble--typing">
                <span className="typing-dot" />
                <span className="typing-dot" />
                <span className="typing-dot" />
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="ai-panel__error" role="alert">{error}</div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ── Quick questions ── */}
      {showQuickQuestions && (
        <QuickQuestions
          feature={selectedFeature}
          onAsk={sendMessage}
          disabled={isLoading}
        />
      )}

      {/* ── Input area ── */}
      <div className="ai-panel__input-area">
        <div className="ai-panel__input-row">
          <textarea
            ref={textareaRef}
            className="ai-panel__textarea"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={parcelName ? `Ask about ${parcelName}…` : 'Select a parcel, then ask…'}
            rows={1}
            aria-label="Message"
            disabled={isLoading}
          />
          <button
            className="ai-panel__send"
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            aria-label="Send"
          >
            {isLoading
              ? <span className="animate-spin"><SpinIcon /></span>
              : <SendIcon />}
          </button>
        </div>
        <p className="ai-panel__footer-note">
          Grounded in demo data · Bedrock integration in Phase 3
        </p>
      </div>
    </div>
  )
}

/* ── Icons ───────────────────────────────────────────────── */
function BotAvatar() {
  return (
    <div className="ai-bot-avatar" aria-hidden="true">
      <svg viewBox="0 0 32 32" fill="none" width="28" height="28">
        <rect width="32" height="32" rx="8" fill="#16a34a"/>
        <path d="M8 22 L16 10 L24 22 Z" fill="white" opacity="0.9"/>
        <circle cx="16" cy="16" r="3" fill="#86efac"/>
      </svg>
    </div>
  )
}
function BotAvatarSmall() {
  return (
    <div className="ai-bot-avatar ai-bot-avatar--sm" aria-hidden="true">
      <svg viewBox="0 0 32 32" fill="none" width="20" height="20">
        <rect width="32" height="32" rx="8" fill="#16a34a"/>
        <path d="M8 22 L16 10 L24 22 Z" fill="white" opacity="0.9"/>
        <circle cx="16" cy="16" r="3" fill="#86efac"/>
      </svg>
    </div>
  )
}
function UserAvatar() {
  return (
    <div className="ai-user-avatar" aria-hidden="true">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    </div>
  )
}
function CloseIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  )
}
function ClearIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
      <path d="M10 11v6"/><path d="M14 11v6"/>
    </svg>
  )
}
function SendIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
    </svg>
  )
}
function SpinIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
    </svg>
  )
}
function PinIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
    </svg>
  )
}
function DataIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <ellipse cx="12" cy="5" rx="9" ry="3"/>
      <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
    </svg>
  )
}
function ChevronSmall({ open }) {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"
      style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 140ms ease', marginLeft: 'auto', flexShrink: 0 }}>
      <polyline points="6 9 12 15 18 9"/>
    </svg>
  )
}
