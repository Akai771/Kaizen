import { useState, useEffect } from 'react';
import { Plus, List, Calendar, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import TaskCard from '@/components/task-card';
import AIChatSheet from '@/components/ai-chat-sheet';
import { toast } from 'sonner';
import {
  getTaskLists,
  createTaskList,
  updateTaskList,
  deleteTaskList,
  getAllTasks,
  createTask,
  updateTask,
  toggleTaskCompletion,
  deleteTask,
  reorderTasks,
} from '@/services';
import type { Task, TaskList } from '@/types/database.types';

const TaskManagement = () => {
  // State
  const [taskLists, setTaskLists] = useState<TaskList[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isCreateListOpen, setIsCreateListOpen] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [listsData, tasksData] = await Promise.all([
        getTaskLists(),
        getAllTasks(),
      ]);
      setTaskLists(listsData);
      setTasks(tasksData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load tasks');
    } finally {
      setIsLoading(false);
    }
  };

  // CRUD Operations
  const addTaskList = async () => {
    if (newListName.trim()) {
      try {
        const newList = await createTaskList(newListName.trim());
        setTaskLists(prev => [...prev, newList]);
        setNewListName('');
        setIsCreateListOpen(false);
        toast.success('List created successfully');
      } catch (error) {
        console.error('Error creating list:', error);
        toast.error('Failed to create list');
      }
    }
  };

  const deleteList = async (listId: string) => {
    try {
      await deleteTaskList(listId);
      setTaskLists(prev => prev.filter(list => list.id !== listId));
      setTasks(prev => prev.filter(task => task.list_id !== listId));
      toast.success('List deleted successfully');
    } catch (error) {
      console.error('Error deleting list:', error);
      toast.error('Failed to delete list');
    }
  };

  const renameList = async (listId: string, newName: string) => {
    try {
      await updateTaskList(listId, { name: newName });
      setTaskLists(prev => prev.map(list => list.id === listId ? { ...list, name: newName } : list));
      toast.success('List renamed successfully');
    } catch (error) {
      console.error('Error renaming list:', error);
      toast.error('Failed to rename list');
    }
  };

  const addTask = async (taskData: { listId: string; title: string; description?: string; dueDate?: Date }) => {
    try {
      const newTask = await createTask({
        list_id: taskData.listId,
        title: taskData.title,
        description: taskData.description || null,
        due_date: taskData.dueDate ? taskData.dueDate.toISOString() : null,
      });
      setTasks(prev => [...prev, newTask]);
      toast.success('Task created successfully');
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error('Failed to create task');
    }
  };

  const updateTaskData = async (taskId: string, taskData: { title?: string; description?: string; dueDate?: Date }) => {
    try {
      const updated = await updateTask(taskId, {
        title: taskData.title,
        description: taskData.description || null,
        due_date: taskData.dueDate ? taskData.dueDate.toISOString() : null,
      });
      setTasks(prev => prev.map(task => task.id === taskId ? updated : task));
      toast.success('Task updated successfully');
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task');
    }
  };

  const toggleTask = async (taskId: string) => {
    try {
      const updated = await toggleTaskCompletion(taskId);
      setTasks(prev => prev.map(task => task.id === taskId ? updated : task));
    } catch (error) {
      console.error('Error toggling task:', error);
      toast.error('Failed to update task');
    }
  };

  const deleteTaskData = async (taskId: string) => {
    try {
      await deleteTask(taskId);
      setTasks(prev => prev.filter(task => task.id !== taskId));
      toast.success('Task deleted successfully');
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
    }
  };

  const reorderTasksData = async (listId: string, taskIds: string[]) => {
    try {
      await reorderTasks(listId, taskIds);
      // Update local state to match new order
      const otherTasks = tasks.filter(task => task.list_id !== listId);
      const reorderedTasks = taskIds.map(id => tasks.find(task => task.id === id)).filter(Boolean) as Task[];
      setTasks([...otherTasks, ...reorderedTasks]);
    } catch (error) {
      console.error('Error reordering tasks:', error);
      toast.error('Failed to reorder tasks');
    }
  };

  // Handle AI task creation
  const handleAITasksCreated = async (listId: string) => {
    // Reload all data to show the newly created list and tasks
    await loadData();
    // Select the newly created list
    setSelectedListId(listId);
    // Close the AI chat to show the tasks
    setIsAIChatOpen(false);
  };

  return (
    <div className="w-full flex flex-col">
      {/* Header */}
      <header className="flex-shrink-0 h-16 border-b border-border/80 flex items-center justify-between px-6">
        <div>
            <h1 className="text-xl font-bold">
                <span className="text-primary">Tasks</span> Management</h1>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary">
                <List className="mr-2 h-4 w-4" />
                Lists
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onSelect={() => setSelectedListId(null)}>
                All Lists
              </DropdownMenuItem>
              {taskLists.map((list) => (
                <DropdownMenuItem
                  key={list.id}
                  onSelect={() => setSelectedListId(list.id)}
                >
                  {list.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="secondary">
            <Calendar className="mr-2 h-4 w-4" />
            Select Date
          </Button>
          <Button onClick={() => setIsCreateListOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setIsAIChatOpen(true)}>
            <Bot className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">Loading tasks...</p>
          </div>
        ) : (
          <div className="flex gap-6">
            {(selectedListId
              ? taskLists.filter((list) => list.id === selectedListId)
              : taskLists
            ).map((list) => (
              <TaskCard
                key={list.id}
                list={list}
                tasks={tasks.filter((task) => task.list_id === list.id)}
                onAddTask={addTask}
                onToggleTask={toggleTask}
                onDeleteTask={deleteTaskData}
                onDeleteList={deleteList}
                onRenameList={renameList}
                onUpdateTask={updateTaskData}
                onReorderTasks={reorderTasksData}
              />
            ))}
          </div>
        )}
      </main>

      {/* Create List Dialog */}
      <Dialog open={isCreateListOpen} onOpenChange={setIsCreateListOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Task List</DialogTitle>
          </DialogHeader>
          <Input
            placeholder="List Name"
            value={newListName}
            onChange={(e) => setNewListName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addTaskList()}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateListOpen(false)}>Cancel</Button>
            <Button onClick={addTaskList}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AI Chat Sheet */}
      <AIChatSheet 
        open={isAIChatOpen} 
        onOpenChange={setIsAIChatOpen}
        onTasksCreated={handleAITasksCreated}
      />
    </div>
  );
};

export default TaskManagement;