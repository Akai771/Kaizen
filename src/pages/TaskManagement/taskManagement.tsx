import { useState } from 'react';
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

// Data Interfaces
interface Task {
  id: string;
  title: string;
  completed: boolean;
  listId: string;
  description?: string;
  dueDate?: Date;
}

interface TaskList {
  id: string;
  name: string;
}

const TaskManagement = () => {
  // State
  const [taskLists, setTaskLists] = useState<TaskList[]>([
    { id: '1', name: 'Birthday' },
    { id: '2', name: 'Movie Booking' },
  ]);

  const [tasks, setTasks] = useState<Task[]>([
    { id: 't1', title: 'Order food', completed: false, listId: '1' },
    { id: 't2', title: 'Book a cake', completed: false, listId: '1' },
    { id: 't3', title: 'Order Burgers', completed: false, listId: '1' },
    { id: 't4', title: 'Order Wafers', completed: true, listId: '1' },
    { id: 't5', title: 'Decorations', completed: true, listId: '1' },
    { id: 't6', title: 'Invite Friends & Family', completed: true, listId: '1' },
    { id: 't7', title: 'Book movie tickets', completed: false, listId: '2' },
  ]);

  const [isCreateListOpen, setIsCreateListOpen] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [selectedListId, setSelectedListId] = useState<string | null>(null);

  // CRUD Operations
  const addTaskList = () => {
    if (newListName.trim()) {
      const newList = {
        id: `l${Date.now()}`,
        name: newListName.trim(),
      };
      setTaskLists(prev => [...prev, newList]);
      setNewListName('');
      setIsCreateListOpen(false);
    }
  };

  const deleteList = (listId: string) => {
    setTaskLists(prev => prev.filter(list => list.id !== listId));
    setTasks(prev => prev.filter(task => task.listId !== listId));
  };

  const renameList = (listId: string, newName: string) => {
    setTaskLists(prev => prev.map(list => list.id === listId ? { ...list, name: newName } : list));
  };

  const addTask = (taskData: Omit<Task, 'id' | 'completed'>) => {
    const newTask = {
      ...taskData,
      id: `t${Date.now()}`,
      completed: false,
    };
    setTasks(prev => [...prev, newTask]);
  };

  const updateTask = (taskId: string, taskData: Partial<Omit<Task, 'id'>>) => {
    setTasks(prev => prev.map(task => task.id === taskId ? { ...task, ...taskData } : task));
  };

  const toggleTask = (taskId: string) => {
    setTasks(prev =>
      prev.map(task =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const deleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
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
        <div className="flex gap-6">
          {(selectedListId
            ? taskLists.filter((list) => list.id === selectedListId)
            : taskLists
          ).map((list) => (
            <TaskCard
              key={list.id}
              list={list}
              tasks={tasks.filter((task) => task.listId === list.id)}
              onAddTask={addTask}
              onToggleTask={toggleTask}
              onDeleteTask={deleteTask}
              onDeleteList={deleteList}
              onRenameList={renameList}
              onUpdateTask={updateTask}
            />
          ))}
        </div>
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
      <AIChatSheet open={isAIChatOpen} onOpenChange={setIsAIChatOpen} />
    </div>
  );
};

export default TaskManagement;