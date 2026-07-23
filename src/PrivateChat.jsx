import { useState, useEffect, useRef } from 'react'
import { supabase } from './supabaseClient'

function PrivateChat({ user, senderName, roomId, otherPersonName }) {
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [uploading, setUploading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    fetchMessages()

    const channel = supabase
      .channel('private:' + roomId)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'private_messages',
        filter: `room_id=eq.${roomId}`
      }, (payload) => {
        setMessages((prev) => [...prev, payload.new])
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [roomId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const fetchMessages = async () => {
    const { data } = await supabase
      .from('private_messages')
      .select('*')
      .eq('room_id', roomId)
      .order('created_at', { ascending: true })
    if (data) setMessages(data)
  }

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    await supabase.from('private_messages').insert({
      room_id: roomId,
      sender_id: user.id,
      sender_name: senderName || user.email,
      content: newMessage,
      file_url: null
    })
    setNewMessage('')
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)

    const fileName = `${roomId}/${Date.now()}_${file.name}`
    const { data, error } = await supabase.storage
      .from('chat-files')
      .upload(fileName, file)

    if (error) {
      alert('Upload failed: ' + error.message)
      setUploading(false)
      return
    }

    const { data: urlData } = supabase.storage
      .from('chat-files')
      .getPublicUrl(fileName)

    await supabase.from('private_messages').insert({
      room_id: roomId,
      sender_id: user.id,
      sender_name: senderName || user.email,
      content: '📎 ' + file.name,
      file_url: urlData.publicUrl
    })

    setUploading(false)
  }

  return (
    <div className="page">
      <div className="card">
        <h2 style={{ marginBottom: '4px' }}>Private Chat</h2>
        <p style={{ color: '#a0aec0', fontSize: '0.85rem', marginBottom: '16px' }}>
          🔒 Only you and {otherPersonName} can see this conversation
        </p>
        <div className="chat-box">
          {messages.map((msg) => (
            <div key={msg.id} style={{
              marginBottom: '12px',
              textAlign: msg.sender_id === user.id ? 'right' : 'left'
            }}>
              <div style={{ fontSize: '0.75rem', color: '#718096', marginBottom: '3px' }}>
                {msg.sender_name}
              </div>
              {msg.file_url ? (
                <a href={msg.file_url} target="_blank" rel="noreferrer"
                  style={{
                    display: 'inline-block',
                    background: msg.sender_id === user.id ? '#7c6af7' : '#2d3748',
                    color: 'white', padding: '8px 14px', borderRadius: '12px',
                    fontSize: '0.9rem', textDecoration: 'none'
                  }}>
                  {msg.content}
                </a>
              ) : (
                <span style={{
                  display: 'inline-block',
                  background: msg.sender_id === user.id ? '#7c6af7' : '#2d3748',
                  color: 'white', padding: '8px 14px', borderRadius: '12px',
                  fontSize: '0.9rem', maxWidth: '75%'
                }}>
                  {msg.content}
                </span>
              )}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        <form onSubmit={sendMessage} className="chat-form" style={{ marginTop: '8px' }}>
          <input
            type="text"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <button type="submit">Send</button>
        </form>

        <div style={{ marginTop: '10px' }}>
          <label style={{
            display: 'inline-block', background: '#2d3748', color: '#a0aec0',
            padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem'
          }}>
            {uploading ? 'Uploading...' : '📎 Share File'}
            <input type="file" style={{ display: 'none' }} onChange={handleFileUpload} />
          </label>
        </div>
      </div>
    </div>
  )
}

export default PrivateChat