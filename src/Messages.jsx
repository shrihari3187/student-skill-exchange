import { useState, useEffect, useRef } from 'react'
import { supabase } from './supabaseClient'

function Messages({ user, senderName }) {
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const bottomRef = useRef(null)

  useEffect(() => {
    fetchMessages()

    const channel = supabase
      .channel('public:messages')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages'
      }, (payload) => {
        setMessages((prev) => [...prev, payload.new])
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: true })

    if (!error) setMessages(data)
  }

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    const { error } = await supabase
      .from('messages')
      .insert({
        user_id: user.id,
        sender_name: senderName || user.email,
        content: newMessage,
      })

    if (!error) setNewMessage('')
  }

  return (
  <div className="page">
    <div className="card">
      <h2>Community Chat</h2>
      <div className="chat-box">
        {messages.map((msg) => (
          <div key={msg.id} style={{
            marginBottom: '12px',
            textAlign: msg.user_id === user.id ? 'right' : 'left'
          }}>
            <div style={{ fontSize: '0.75rem', color: '#718096', marginBottom: '3px' }}>
              {msg.sender_name}
            </div>
            <span style={{
              display: 'inline-block',
              background: msg.user_id === user.id ? '#7c6af7' : '#2d3748',
              color: 'white',
              padding: '8px 14px',
              borderRadius: '12px',
              fontSize: '0.9rem',
              maxWidth: '75%'
            }}>
              {msg.content}
            </span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={sendMessage} className="chat-form">
        <input type="text" placeholder="Type a message..."
          value={newMessage} onChange={(e) => setNewMessage(e.target.value)} />
        <button type="submit">Send</button>
      </form>
    </div>
  </div>
)
}

export default Messages