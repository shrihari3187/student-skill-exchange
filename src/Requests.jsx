import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import PrivateChat from './PrivateChat'

function Requests({ user, senderName }) {
  const [incoming, setIncoming] = useState([])
  const [outgoing, setOutgoing] = useState([])
  const [message, setMessage] = useState('')
  const [activeChat, setActiveChat] = useState(null)

  useEffect(() => {
    fetchRequests()
  }, [])

  const fetchRequests = async () => {
    const { data: inc } = await supabase
      .from('requests')
      .select('*')
      .eq('to_user_id', user.id)
      .order('created_at', { ascending: false })

    const { data: out } = await supabase
      .from('requests')
      .select('*')
      .eq('from_user_id', user.id)
      .order('created_at', { ascending: false })

    setIncoming(inc || [])
    setOutgoing(out || [])
  }

  const handleResponse = async (req, status) => {
    const { error } = await supabase
      .from('requests')
      .update({ status })
      .eq('id', req.id)

    if (!error) {
      setMessage(status === 'accepted' ? '✅ Request accepted!' : '❌ Request declined.')
      fetchRequests()
    }
  }

  const openChat = (req, otherName) => {
    const ids = [req.from_user_id, req.to_user_id].sort()
    const roomId = ids[0] + '_' + ids[1]
    setActiveChat({ roomId, otherName })
  }

  const statusColor = (status) => {
    if (status === 'accepted') return '#68d391'
    if (status === 'declined') return '#fc8181'
    return '#f6ad55'
  }

  if (activeChat) {
    return (
      <div>
        <div className="page">
          <button onClick={() => setActiveChat(null)} style={{
            background: '#2d3748', color: '#a0aec0', border: 'none',
            padding: '8px 16px', borderRadius: '6px', cursor: 'pointer',
            marginBottom: '16px'
          }}>
            ← Back to Requests
          </button>
        </div>
        <PrivateChat
          user={user}
          senderName={senderName}
          roomId={activeChat.roomId}
          otherPersonName={activeChat.otherName}
        />
      </div>
    )
  }

  return (
    <div className="page" style={{ maxWidth: '700px' }}>
      <h2 style={{ marginBottom: '24px', fontSize: '1.5rem', fontWeight: '700' }}>
        Skill Exchange Requests
      </h2>
      {message && <p className="success-msg" style={{ marginBottom: '16px' }}>{message}</p>}

      <div className="card" style={{ marginBottom: '24px' }}>
        <h3 style={{ marginBottom: '16px', color: '#b794f4' }}>📥 Incoming Requests</h3>
        {incoming.length === 0 && <p style={{ color: '#718096' }}>No incoming requests yet.</p>}
        {incoming.map((req) => (
          <div key={req.id} style={{
            borderBottom: '1px solid #2d3748',
            paddingBottom: '16px', marginBottom: '16px'
          }}>
            <p style={{ fontWeight: '600', marginBottom: '4px' }}>{req.from_name}</p>
            <p style={{ color: '#a0aec0', fontSize: '0.9rem', marginBottom: '8px' }}>
              wants to exchange: <strong style={{ color: '#e2e8f0' }}>{req.skill_requested}</strong>
            </p>
            <p style={{ color: statusColor(req.status), fontSize: '0.85rem', marginBottom: '8px' }}>
              Status: {req.status}
            </p>
            {req.status === 'pending' && (
              <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                <button onClick={() => handleResponse(req, 'accepted')}
                  style={{ background: '#276749', color: 'white', border: 'none',
                    padding: '7px 16px', borderRadius: '6px', cursor: 'pointer' }}>
                  Accept
                </button>
                <button onClick={() => handleResponse(req, 'declined')}
                  style={{ background: '#742a2a', color: 'white', border: 'none',
                    padding: '7px 16px', borderRadius: '6px', cursor: 'pointer' }}>
                  Decline
                </button>
              </div>
            )}
            {req.status === 'accepted' && (
              <button onClick={() => openChat(req, req.from_name)}
                style={{ background: '#7c6af7', color: 'white', border: 'none',
                  padding: '7px 16px', borderRadius: '6px', cursor: 'pointer' }}>
                💬 Open Private Chat
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="card">
        <h3 style={{ marginBottom: '16px', color: '#68d391' }}>📤 Sent Requests</h3>
        {outgoing.length === 0 && <p style={{ color: '#718096' }}>No sent requests yet.</p>}
        {outgoing.map((req) => (
          <div key={req.id} style={{
            borderBottom: '1px solid #2d3748',
            paddingBottom: '16px', marginBottom: '16px'
          }}>
            <p style={{ fontWeight: '600', marginBottom: '4px' }}>To: {req.to_name}</p>
            <p style={{ color: '#a0aec0', fontSize: '0.9rem', marginBottom: '4px' }}>
              Skill: <strong style={{ color: '#e2e8f0' }}>{req.skill_requested}</strong>
            </p>
            <p style={{ color: statusColor(req.status), fontSize: '0.85rem', marginBottom: '8px' }}>
              Status: {req.status}
            </p>
            {req.status === 'accepted' && (
              <button onClick={() => openChat(req, req.to_name)}
                style={{ background: '#7c6af7', color: 'white', border: 'none',
                  padding: '7px 16px', borderRadius: '6px', cursor: 'pointer' }}>
                💬 Open Private Chat
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default Requests