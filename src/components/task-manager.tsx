import { useEffect, useState } from 'react'
import { supabase } from '../supabase-client';
import type { Session } from '@supabase/supabase-js';

interface Task {
  id: number;
  title: string;
  description: string;
  email: string;
  created_at: string;
}


export default function TaskManager({ session }: { session: Session}) {
    const [newTask, setNewTask] = useState<{ title: string; description: string }>({
    title: '',
    description: ''
  });

  const [tasks, setTasks] = useState<Task[]>([]);

 const [newDescription, setNewDescription] = useState<string>('');



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { error } = await supabase
        .from('tasks')
        .insert({ ...newTask, email: session.user.email })
        .select()
        .single();

      if (error) throw error;

      setNewTask({ title: '', description: '' }); // Reset the form
    //   setTasks((prevTasks) => [data, ...prevTasks]);
    } catch (error) {
      console.error('Error inserting task:', error);
    }
  };

  const fetchTasks = async () => {
    const { data, error } = await supabase.from('tasks').select('*').order('created_at', { ascending: false });
    if (error) {
      console.error('Error fetching tasks:', error);
      return [];
    }
    console.log(data);
    setTasks(data || []);
  };

 

  const deleteTask = async (id: number) => {
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (error) {
      console.error('Error deleting task:', error);
      return;
    }
    // setTasks(tasks.filter(task => task.id !== id));
  };

  const updteDescription = async (id: number) => {
    const { error } = await supabase.from('tasks').update({ description: newDescription }).eq('id', id);
    if (error) {
      console.error('Error updating task description:', error);
      return;
    }
    // setTasks(tasks.map(task => task.id === id ? { ...task, description: newDescription } : task));
    setNewDescription('');
  };


   useEffect(() => {
    fetchTasks();
  }, []);


  useEffect(() => {
    const channel = supabase.channel('tasks-channel');

    channel.on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'tasks' },
      (payload) => {
        const newTask = payload.new as Task;
        setTasks((prevTasks) => [newTask, ...prevTasks]);
        console.log('New task added:', newTask);
      }
    );

    channel.on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'tasks' },
      (payload) => {
        const updatedTask = payload.new as Task;
        setTasks((prevTasks) =>
          prevTasks.map((task) =>
            task.id === updatedTask.id ? updatedTask : task
          )
        );
        console.log('Task updated:', updatedTask);
      }
    );

    channel.on(
      'postgres_changes',
      { event: 'DELETE', schema: 'public', table: 'tasks' },
      (payload) => {
        const deletedTaskId = payload.old.id;
        setTasks((prevTasks) =>
          prevTasks.filter((task) => task.id !== deletedTaskId)
        );
        console.log('Task deleted:', deletedTaskId);
      }
    );

    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log('Channel subscribed successfully');
      }
    });

    return () => {
      channel.unsubscribe();
    };
  }, []);


  return (
   <div style={{maxWidth: '600px', margin: '0 auto', padding: '20px'}}>
      <form style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>

        <input value={newTask.title} type="text" placeholder="Title" style={{padding: '0.5rem 1rem' , width: '100%'}} onChange={(e) => setNewTask({ ...newTask, title: e.target.value })} />
        <textarea value={newTask.description} name="" id="" placeholder='Description' style={{resize: 'none' , width : '100%', height: '150px', border: '1px solid #ccc' , padding: '10px'}} onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}></textarea>
        <button  type='submit' style={{cursor: 'pointer' , padding: '0.5rem 1rem'}} onClick={handleSubmit}>Add Task</button>
      </form>


      <ul style={{listStyle: 'none', padding: 0, marginTop: '20px'}}>
        {tasks && tasks.map((task, index) => (
          <li style={{display: 'flex', justifyContent: 'space-between', padding: '10px', borderBottom: '1px solid #ccc'}} key={index}>
          <span>{task.title}</span>
          <p>{task.description}</p>
          <span>{ new Date(task.created_at).toLocaleString()}</span>
          <div>
          
         {session.user.email === task.email && <><button style={{cursor: 'pointer'}} onClick={() => deleteTask(task.id)}>Delete</button><button style={{cursor: 'pointer'}} onClick={() => updteDescription(task.id)}>Edit</button>
          <textarea value={newDescription} onChange={(e) => setNewDescription(e.target.value)} name="edit" id="edit" style={{resize: 'none' , width : '50%', height: '20px', border: '1px solid #ccc' , padding: '10px'}} placeholder='Edit Description'></textarea>
        </> }</div>
        </li>
        ))}
      </ul>
    </div>
  )
}
