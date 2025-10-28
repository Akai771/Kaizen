import { supabase } from '@/hooks/supabaseClient';
import { Task, TaskInsert, TaskUpdate } from '@/types/database.types';

// Get all tasks for a specific list
export const getTasksByList = async (listId: string): Promise<Task[]> => {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('list_id', listId)
    .order('position', { ascending: true });

  if (error) {
    console.error('Error fetching tasks:', error);
    throw error;
  }

  return data || [];
};

// Get all tasks for current user
export const getAllTasks = async (): Promise<Task[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', user.id)
    .order('position', { ascending: true });

  if (error) {
    console.error('Error fetching tasks:', error);
    throw error;
  }

  return data || [];
};

// Create a new task
export const createTask = async (taskData: Omit<TaskInsert, 'user_id'>): Promise<Task> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  // Get the highest position in the list to add new task at the end
  const { data: existingTasks } = await supabase
    .from('tasks')
    .select('position')
    .eq('list_id', taskData.list_id)
    .eq('completed', false)
    .order('position', { ascending: false })
    .limit(1);

  const nextPosition = existingTasks && existingTasks.length > 0 
    ? ((existingTasks[0] as any).position + 1)
    : 0;

  const fullTaskData: TaskInsert = {
    ...taskData,
    user_id: user.id,
    position: taskData.position ?? nextPosition,
  };

  const query: any = supabase.from('tasks');
  const { data, error } = await query
    .insert(fullTaskData)
    .select()
    .single();

  if (error) {
    console.error('Error creating task:', error);
    throw error;
  }

  return data;
};

// Update a task
export const updateTask = async (
  id: string,
  updates: TaskUpdate
): Promise<Task> => {
  const query: any = supabase.from('tasks');
  const { data, error } = await query
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating task:', error);
    throw error;
  }

  return data;
};

// Toggle task completion
export const toggleTaskCompletion = async (id: string): Promise<Task> => {
  // First get the current task
  const { data: currentTask, error: fetchError } = await supabase
    .from('tasks')
    .select('completed')
    .eq('id', id)
    .single();

  if (fetchError) {
    console.error('Error fetching task:', fetchError);
    throw fetchError;
  }

  // Update with opposite value
  const query: any = supabase.from('tasks');
  const { data, error } = await query
    .update({ 
      completed: !(currentTask as any).completed,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error toggling task:', error);
    throw error;
  }

  return data;
};

// Delete a task
export const deleteTask = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting task:', error);
    throw error;
  }
};

// Reorder tasks within a list
export const reorderTasks = async (
  listId: string,
  taskIds: string[]
): Promise<void> => {
  // Update positions in bulk
  const updates = taskIds.map((id, index) => ({
    id,
    position: index,
    updated_at: new Date().toISOString(),
  }));

  for (const update of updates) {
    const query: any = supabase.from('tasks');
    await query
      .update({ position: update.position, updated_at: update.updated_at })
      .eq('id', update.id)
      .eq('list_id', listId);
  }
};
