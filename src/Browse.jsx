import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'

function Browse({ currentUser, currentName }) {
  const [profiles, setProfiles] = useState([])
  const [ratings, setRatings] = useState({})
  const [search, setSearch] = useState('')
  const [message, setMessage] = useState('Loading...')

  useEffect(() => {
    fetchProfiles()
    fetchRatings()
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

  const fetchRatings = async () => {
    const { data } = await supabase
      .from('ratings')
      .select('*')

    if (data) {
      const ratingMap = {}
      data.forEach((r) => {
        if (!ratingMap[r.rated_user_id]) {
          ratingMap[r.rated_user_id] = { total: 0, count: 0, comments: [] }
        }
        ratingMap[r.rated_user_id].total += r.stars
        ratingMap[r.rated_user_id].count += 1
        if (r.comment) ratingMap[r.rated_user_id].comments.push({ name: r.rater_name, comment: r.comment, stars: r.stars })
      })
      setRatings(ratingMap)
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

  const getAvgRating = (userId) => {
    const r = ratings[userId]
    if (!r) return null
    return (r.total / r.count).toFixed(1)
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <h3>{profile.full_name}</h3>
            {getAvgRating(profile.id) && (
              <div style={{ textAlign: 'right' }}>
                <span style={{ color: '#f6ad55', fontSize: '1rem' }}>
                  {'⭐'.repeat(Math.round(getAvgRating(profile.id)))}
                </span>
                <p style={{ color: '#a0aec0', fontSize: '0.8rem' }}>
                  {getAvgRating(profile.id)}/5 ({ratings[profile.id].count} reviews)
                </p>
              </div>
            )}
          </div>
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

          {ratings[profile.id]?.comments.length > 0 && (
            <div style={{ marginTop: '10px', borderTop: '1px solid #2d3748', paddingTop: '10px' }}>
              <p style={{ color: '#a0aec0', fontSize: '0.8rem', marginBottom: '6px' }}>Recent reviews:</p>
              {ratings[profile.id].comments.slice(0, 2).map((c, i) => (
                <div key={i} style={{ marginBottom: '6px' }}>
                  <p style={{ color: '#e2e8f0', fontSize: '0.85rem' }}>
                    <strong>{c.name}</strong>: {c.comment}
                  </p>
                </div>
              ))}
            </div>
          )}

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