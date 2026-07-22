import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'

function Requests({ user, senderName }) {
  const [incoming, setIncoming] = useState([])
  const [outgoing, setOutgoing] = useState([])
  const [message, setMessage] = useState('')

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

  const handleResponse = async (requestId, status) => {
    const { error } = await supabase
      .from('requests')
      .update({ status })
      .eq('id', requestId)

    if (!error) {
      setMessage(status === 'accepted' ? '✅ Request accepted!' : '❌ Request declined.')
      fetchRequests()
    }
  }

  const statusColor = (status) => {
    if (status === 'accepted') return '#68d391'
    if (status === 'declined') return '#fc8181'
    return '#f6ad55'
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
            paddingBottom: '16px',
            marginBottom: '16px'
          }}>
            <p style={{ fontWeight: '600', marginBottom: '4px' }}>{req.from_name}</p>
            <p style={{ color: '#a0aec0', fontSize: '0.9rem', marginBottom: '8px' }}>
              wants to exchange: <strong style={{ color: '#e2e8f0' }}>{req.skill_requested}</strong>
            </p>
            <p style={{ color: statusColor(req.status), fontSize: '0.85rem', marginBottom: '8px' }}>
              Status: {req.status}
            </p>
            {req.status === 'pending' && (
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => handleResponse(req.id, 'accepted')}
                  style={{
                    background: '#276749', color: 'white', border: 'none',
                    padding: '7px 16px', borderRadius: '6px', cursor: 'pointer'
                  }}>
                  Accept
                </button>
                <button
                  onClick={() => handleResponse(req.id, 'declined')}
                  style={{
                    background: '#742a2a', color: 'white', border: 'none',
                    padding: '7px 16px', borderRadius: '6px', cursor: 'pointer'
                  }}>
                  Decline
                </button>
              </div>
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
            paddingBottom: '16px',
            marginBottom: '16px'
          }}>
            <p style={{ fontWeight: '600', marginBottom: '4px' }}>To: {req.to_name}</p>
            <p style={{ color: '#a0aec0', fontSize: '0.9rem', marginBottom: '4px' }}>
              Skill: <strong style={{ color: '#e2e8f0' }}>{req.skill_requested}</strong>
            </p>
            <p style={{ color: statusColor(req.status), fontSize: '0.85rem' }}>
              Status: {req.status}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Requests