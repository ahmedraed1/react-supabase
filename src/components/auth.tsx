import { useState } from "react"
import type { ChangeEvent, FormEvent } from "react"
import { supabase } from "../supabase-client";



export default function Auth() {
    const [isSignUp, setIsSignUp] = useState<boolean>(true);
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (isSignUp) {
          const { error } =  await supabase.auth.signUp({ email, password });
            if (error) {
                console.error('Error signing up:', error);
                return;
            }
            console.log('User signed up successfully!');
            return;
        } else {
          const { error } =  await supabase.auth.signInWithPassword({ email, password });
          if (error) {
                console.error('Error signing in:', error);
                return;
            }
            console.log('User signed in successfully!');
            return;
        }
    }
  return (
    <div style={{ maxWidth: '400px', margin: '0 auto', padding: '20px' }}>
        <h2>{isSignUp ? 'Sign Up' : 'Sign In'}</h2>
        <form onSubmit={handleSubmit}>
            <div>
                <label>Email</label>
                <input type="email" value={email} onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)} placeholder="Email" />
            </div>
            <div>
                <label>Password</label>
                <input type="password" value={password} onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)} placeholder="Password" />
            </div>
            <button type="submit">{isSignUp ? 'Sign Up' : 'Sign In'}</button>
        </form>
        <button onClick={() => setIsSignUp(!isSignUp)}>{isSignUp ? 'Sign In' : 'Sign Up'}</button>

    </div>
  )
}
