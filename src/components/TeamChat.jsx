// // src/components/TeamChat.jsx

import React, { useEffect, useRef, useState } from 'react'
import {
  Box,
  Typography,
  TextField,
  IconButton,
  Paper,
  Divider,
} from '@mui/material'
import SendIcon from '@mui/icons-material/Send'
import { supabase } from '../supabase'

export default function TeamChat({ teamId, userId }) {
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState([])
  const chatEndRef = useRef(null)

  // Fetch messages
  useEffect(() => {
    const fetchMessages = async () => {
      const { data } = await supabase
        .from('team_messages')
        .select('*')
        .eq('team_id', teamId)
        .order('created_at', { ascending: true })

      setMessages(data || [])
    }

    fetchMessages()

    // Subscribe to new messages
    const channel = supabase
      .channel('team_chat')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'team_messages',
          filter: `team_id=eq.${teamId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [teamId])

  const handleSend = async () => {
    if (!message.trim()) return

    await supabase.from('team_messages').insert([
      {
        team_id: teamId,
        sender_id: userId,
        content: message.trim(),
      },
    ])
    setMessage('')
  }

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <Box>
      <Typography variant="h6" mb={1}>
        Team Chat
      </Typography>

      <Paper
        elevation={2}
        sx={{
          height: 300,
          overflowY: 'auto',
          padding: 2,
          mb: 2,
          background: '#f8f9fa',
          borderRadius: 2,
        }}
      >
        {messages.map((msg, index) => (
          <Box
            key={msg.id || index}
            display="flex"
            flexDirection="column"
            alignItems={msg.sender_id === userId ? 'flex-end' : 'flex-start'}
            mb={1.5}
          >
            <Box
              sx={{
                px: 2,
                py: 1,
                borderRadius: 2,
                bgcolor: msg.sender_id === userId ? '#1976d2' : '#e0e0e0',
                color: msg.sender_id === userId ? '#fff' : '#000',
                maxWidth: '80%',
              }}
            >
              <Typography variant="body2">{msg.content}</Typography>
              <Typography variant="caption" sx={{ opacity: 0.7 }}>
                {new Date(msg.created_at).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Typography>
            </Box>
          </Box>
        ))}
        <div ref={chatEndRef} />
      </Paper>

      <Divider sx={{ mb: 1 }} />

      <Box display="flex">
        <TextField
          fullWidth
          placeholder="Type a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        />
        <IconButton color="primary" onClick={handleSend}>
          <SendIcon />
        </IconButton>
      </Box>
    </Box>
  )
}
