import { useState, useCallback } from 'react'
import { sendChatMessage } from '../services/api.js'

/**
 * Manages the AI chat conversation state.
 * Each message: { id, role, content, evidence, timestamp }
 * evidence is an array of { label, value, signal } — populated on assistant messages.
 */
export function useAIChat(featureContext = null) {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      content: featureContext
        ? `I can see you've selected **${featureContext?.properties?.name || featureContext?.properties?.parcel_id || 'a land parcel'}**. Ask me anything about this area — irrigation, crop suitability, water access, infrastructure gaps, or development priority.`
        : 'Welcome to **TechnoLand AI**. Select a land parcel on the map, then ask me about its agricultural potential, irrigation situation, infrastructure access, or development priority.',
      evidence: [],
      timestamp: new Date(),
    },
  ])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const sendMessage = useCallback(
    async (text) => {
      if (!text.trim() || isLoading) return

      const userMsg = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: text.trim(),
        evidence: [],
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, userMsg])
      setIsLoading(true)
      setError(null)

      try {
        // api.js returns { reply, evidence, model, featureId }
        const { reply, evidence } = await sendChatMessage({
          message: text.trim(),
          featureContext: featureContext
            ? {
                id: featureContext.id,
                ...featureContext.properties,
              }
            : null,
        })

        const assistantMsg = {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: reply,
          evidence: Array.isArray(evidence) ? evidence : [],
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, assistantMsg])
      } catch {
        setError('Failed to get a response. Please try again.')
      } finally {
        setIsLoading(false)
      }
    },
    [featureContext, isLoading]
  )

  const clearChat = useCallback(() => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: 'assistant',
        content: 'Chat cleared. Select a parcel and ask me anything.',
        evidence: [],
        timestamp: new Date(),
      },
    ])
    setError(null)
  }, [])

  return { messages, isLoading, error, sendMessage, clearChat }
}
