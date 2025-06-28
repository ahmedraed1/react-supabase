import './App.css'
import Auth from './components/auth'
import TaskManager from './components/task-manager'
import { useEffect, useState } from 'react'
import { supabase } from './supabase-client'
import type { Session } from '@supabase/supabase-js'


function App() {
  const [session, setSession] = useState<Session | null>(null);

  const fetchSession = async () => {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.error('Error fetching session:', error);
      return;
    }
    setSession(data?.session);
  };
  useEffect(() => {
    fetchSession();


    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session);
      setSession(session);
    });
    return () => {
      authListener?.subscription.unsubscribe();
    };

  }, []);
  return (
      <div className="App">
        <h1>Task Manager</h1>
        {session ?
        <>
        <button onClick={() => supabase.auth.signOut()}>Sign Out</button>
        <p>Welcome, {session.user.email}</p>
        <p>Expires at: {session.expires_at ? new Date(session.expires_at * 1000).toLocaleString() : 'N/A'}</p>
        <TaskManager session={session} />
        </>  : <Auth />}
      </div>
  )
}

export default App
