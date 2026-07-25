import { useState } from 'react'
import { supabase } from './supabaseClient'

function Rating({ user, senderName, ratedUserId, ratedUserName, onClose }) {
  const [stars, setStars] = useState(0)
  const [comment, setComment] = useState('')
  const [message, setMessage] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (stars === 0) {
      setMessage('Please select a star rating!')
      return
    }

    const { error } = await supabase.from('ratings').insert({
      rated_user_id: ratedUserId,
      rated_by: user.id,
      rater_name: senderName || user.email,
      stars: stars,
      comment: comment
    })

    if (error) {
      setMessage('Error: ' + error.message)
    } else {
      setSubmitted(true)
      setMessage('Rating submitted! Thank you.')
    }
  }

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.7)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', zIndex: 1000
    }}>
      <div style={{
        background: '#1a1d2e', border: '1px solid #2d3748',
        borderRadius: '12px', padding: '32px', maxWidth: '400px', width: '90%'
      }}>
        <h3 style={{ marginBottom: '8px', color: '#f7fafc' }}>
          Rate {ratedUserName}
        </h3>
        <p style={{ color: '#a0aec0', fontSize: '0.9rem', marginBottom: '20px' }}>
          How was your skill exchange session?
        </p>

        {!submitted ? (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '16px' }}>
              <p style={{ color: '#a0aec0', marginBottom: '8px', fontSize: '0.9rem' }}>
                Select rating:
              </p>
              <div style={{ display: 'flex', gap: '8px' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setStars(star)}
                    style={{
                      background: 'none', border: 'none',
                      fontSize: '2rem', cursor: 'pointer',
                      opacity: star <= stars ? 1 : 0.3,
                      transition: 'opacity 0.2s'
                    }}>
                    ⭐
                  </button>
                ))}
              </div>
              <p style={{ color: '#7c6af7', fontSize: '0.85rem', marginTop: '4px' }}>
                {stars === 1 && 'Poor'}
                {stars === 2 && 'Fair'}
                {stars === 3 && 'Good'}
                {stars === 4 && 'Very Good'}
                {stars === 5 && 'Excellent!'}
              </p>
            </div>

            <textarea
              placeholder="Write a comment (optional)..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              style={{ marginBottom: '12px' }}
            />

            {message && <p style={{ color: '#fc8181', marginBottom: '8px', fontSize: '0.85rem' }}>{message}</p>}

            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="submit" style={{ flex: 1 }}>
                Submit Rating
              </button>
              <button
                type="button"
                onClick={onClose}
                style={{
                  flex: 1, background: '#2d3748', color: '#a0aec0',
                  border: 'none', padding: '11px', borderRadius: '8px',
                  cursor: 'pointer', fontSize: '1rem'
                }}>
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '3rem', marginBottom: '12px' }}>🎉</p>
            <p style={{ color: '#68d391', marginBottom: '16px' }}>{message}</p>
            <button onClick={onClose}>Close</button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Rating