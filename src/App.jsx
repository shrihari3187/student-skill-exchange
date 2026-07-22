import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import Signup from './Signup'
import Login from './Login'
import Profile from './Profile'
import Browse from './Browse'
import Messages from './Messages'
import Requests from './Requests'

function App() {
  const [page, setPage] = useState('login')
  const [user, setUser] = useState(null)
  const [senderName, setSenderName] = useState('')

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        setPage('profile')
        fetchName(session.user.id)
      }
    })

    supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        setPage('profile')
        fetchName(session.user.id)
      }
    })
  }, [])

  const fetchName = async (userId) => {
    const { data } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', userId)
      .single()
    if (data) setSenderName(data.full_name)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setPage('login')
  }

  return (
    <div>
      <nav>
        {!user && <button onClick={() => setPage('login')}>Login</button>}
        {!user && <button onClick={() => setPage('signup')}>Sign Up</button>}
        {user && <button onClick={() => setPage('profile')}>My Profile</button>}
        {user && <button onClick={() => setPage('browse')}>Browse</button>}
        {user && <button onClick={() => setPage('requests')}>Requests</button>}
        {user && <button onClick={() => setPage('messages')}>Messages</button>}
        {user && <button onClick={handleLogout}>Logout</button>}
      </nav>

      {page === 'login' && <Login />}
      {page === 'signup' && <Signup />}
      {page === 'profile' && user && <Profile user={user} />}
      {page === 'browse' && user && <Browse currentUser={user} currentName={senderName} />}
      {page === 'requests' && user && <Requests user={user} senderName={senderName} />}
      {page === 'messages' && user && <Messages user={user} senderName={senderName} />}
    </div>
  )
}

export default App