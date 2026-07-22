import { useState } from 'react'
import { supabase } from './supabaseClient'

function Profile({ user }) {
  const [fullName, setFullName] = useState('')
  const [bio, setBio] = useState('')
  const [skillsOffered, setSkillsOffered] = useState('')
  const [skillsWanted, setSkillsWanted] = useState('')
  const [message, setMessage] = useState('')

  const handleSave = async (e) => {
    e.preventDefault()
    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        full_name: fullName,
        bio: bio,
        skills_offered: skillsOffered,
        skills_wanted: skillsWanted,
      })

    if (error) {
      setMessage('Error: ' + error.message)
    } else {
      setMessage('Profile saved successfully!')
    }
  }

  return (
  <div className="page">
    <div className="card">
      <h2>My Profile</h2>
      <p style={{ color: '#a0aec0', marginBottom: '20px', fontSize: '0.9rem' }}>
        Logged in as: {user.email}
      </p>
      <form onSubmit={handleSave}>
        <input type="text" placeholder="Full Name" value={fullName}
          onChange={(e) => setFullName(e.target.value)} />
        <textarea placeholder="Bio — tell others about yourself" value={bio}
          onChange={(e) => setBio(e.target.value)} />
        <input type="text" placeholder="Skills you can teach (e.g. Python, Guitar)"
          value={skillsOffered} onChange={(e) => setSkillsOffered(e.target.value)} />
        <input type="text" placeholder="Skills you want to learn (e.g. Drawing, Spanish)"
          value={skillsWanted} onChange={(e) => setSkillsWanted(e.target.value)} />
        <button type="submit">Save Profile</button>
      </form>
      <p className={message.includes('Error') ? 'error-msg' : 'success-msg'}>{message}</p>
    </div>
  </div>
)
}

export default Profile