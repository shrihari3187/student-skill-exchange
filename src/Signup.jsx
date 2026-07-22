import { useState } from 'react'
import { supabase } from './supabaseClient'

function Signup() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')

  const handleSignup = async (e) => {
    e.preventDefault()
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
    })

    if (error) {
      setMessage('Error: ' + error.message)
    } else {
      setMessage('Signup successful! Check your email to confirm.')
    }
  }

  return (
  <div className="page">
    <div className="card">
      <h2>Create Account</h2>
      <form onSubmit={handleSignup}>
        <input type="email" placeholder="Email" value={email}
          onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" value={password}
          onChange={(e) => setPassword(e.target.value)} required />
        <button type="submit">Sign Up</button>
      </form>
      <p className={message.includes('Error') ? 'error-msg' : 'success-msg'}>{message}</p>
    </div>
  </div>
)
}

export default Signup