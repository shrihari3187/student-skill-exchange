import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'

function Browse() {
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
      </div>
    ))}
  </div>
)
}

export default Browse