import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'

function Browse({ currentUser, currentName }) {
  const [profiles, setProfiles] = useState([])
  const [search, setSearch] = useState('')
  const [message, setMessage] = useState('Loading...')

  useEffect(() => {
    fetchProfiles()
  }, [])

  const fetchProfiles = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')

    if (error) {
      setMessage('Error loading profiles: ' + error.message)
    } else if (data.length === 0) {
      setMessage('No profiles found yet.')
    } else {
      setProfiles(data)
      setMessage('')
    }
  }

  const handleRequest = async (profile) => {
    const { error } = await supabase
      .from('requests')
      .insert({
        from_user_id: currentUser.id,
        to_user_id: profile.id,
        from_name: currentName || currentUser.email,
        to_name: profile.full_name,
        skill_requested: profile.skills_offered,
        status: 'pending'
      })

    if (error) {
      alert('Error: ' + error.message)
    } else {
      alert(`Request sent to ${profile.full_name}!`)
    }
  }

  const filtered = profiles.filter(p =>
    p.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    p.skills_offered?.toLowerCase().includes(search.toLowerCase()) ||
    p.skills_wanted?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="page" style={{ maxWidth: '700px' }}>
      <h2 style={{ marginBottom: '20px', fontSize: '1.5rem', fontWeight: '700' }}>
        Browse Students
      </h2>
      <input type="text" placeholder="Search by name or skill..."
        value={search} onChange={(e) => setSearch(e.target.value)} />
      <p className="error-msg">{message}</p>
      {filtered.map((profile) => (
        <div key={profile.id} className="profile-card">
          <h3>{profile.full_name}</h3>
          <p>{profile.bio}</p>
          <div>
            {profile.skills_offered?.split(',').map((s, i) => (
              <span key={i} className="skill-tag offer">✦ {s.trim()}</span>
            ))}
          </div>
          <div style={{ marginTop: '6px' }}>
            {profile.skills_wanted?.split(',').map((s, i) => (
              <span key={i} className="skill-tag want">→ {s.trim()}</span>
            ))}
          </div>
          {profile.id !== currentUser?.id && (
            <button
              onClick={() => handleRequest(profile)}
              style={{
                marginTop: '12px', background: '#7c6af7', color: 'white',
                border: 'none', padding: '7px 16px', borderRadius: '6px',
                cursor: 'pointer', fontSize: '0.85rem'
              }}>
              Request Exchange
            </button>
          )}
        </div>
      ))}
    </div>
  )
}

export default Browse