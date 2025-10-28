import { supabase } from '@/hooks/supabaseClient';
import { TaskList, TaskListInsert, TaskListUpdate } from '@/types/database.types';

// Get all task lists for current user
export const getTaskLists = async (): Promise<TaskList[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('task_lists')
    .select('*')
    .eq('user_id', user.id)
    .order('position', { ascending: true });

  if (error) {
    console.error('Error fetching task lists:', error);
    throw error;
  }

  return data || [];
};

// Create a new task list
export const createTaskList = async (name: string): Promise<TaskList> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  // Get the highest position to add new list at the end
  const { data: existingLists } = await supabase
    .from('task_lists')
    .select('position')
    .eq('user_id', user.id)
    .order('position', { ascending: false })
    .limit(1);

  const nextPosition = existingLists && existingLists.length > 0 
    ? ((existingLists[0] as any).position + 1)
    : 0;

  const taskListData: TaskListInsert = {
    user_id: user.id,
    name,
    position: nextPosition,
  };

  const query: any = supabase.from('task_lists');
  const { data, error } = await query
    .insert(taskListData)
    .select()
    .single();

  if (error) {
    console.error('Error creating task list:', error);
    throw error;
  }

  return data;
};

// Update a task list
export const updateTaskList = async (
  id: string,
  updates: TaskListUpdate
): Promise<TaskList> => {
  const query: any = supabase.from('task_lists');
  const { data, error } = await query
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating task list:', error);
    throw error;
  }

  return data;
};

// Delete a task list
export const deleteTaskList = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('task_lists')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting task list:', error);
    throw error;
  }
};

// Reorder task lists
export const reorderTaskLists = async (
  listIds: string[]
): Promise<void> => {
  // Update positions in bulk
  const updates = listIds.map((id, index) => ({
    id,
    position: index,
    updated_at: new Date().toISOString(),
  }));

  for (const update of updates) {
    const query: any = supabase.from('task_lists');
    await query.update({ position: update.position, updated_at: update.updated_at }).eq('id', update.id);
  }
};
