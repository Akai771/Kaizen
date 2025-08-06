import React, { useState } from 'react';
import { Plus, MoreVertical, Trash2, Edit2, Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Textarea } from '@/components/ui/textarea';

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

interface TaskCardProps {
  list: TaskList;
  tasks: Task[];
  onAddTask: (taskData: Omit<Task, 'id' | 'completed'>) => void;
  onUpdateTask: (taskId: string, taskData: Partial<Omit<Task, 'id'>>) => void;
  onToggleTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onDeleteList: (listId: string) => void;
  onRenameList: (listId: string, newName: string) => void;
}

const TaskItem: React.FC<{
  task: Task;
  onToggleTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onUpdateTask: (taskId: string, taskData: Partial<Omit<Task, 'id'>>) => void;
}> = ({ task, onToggleTask, onDeleteTask, onUpdateTask }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(task.title);
  const [editedDesc, setEditedDesc] = useState(task.description || '');
  const [editedDate, setEditedDate] = useState(task.dueDate);

  const handleUpdate = () => {
    onUpdateTask(task.id, { 
      title: editedTitle, 
      description: editedDesc,
      dueDate: editedDate
    });
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="p-2 border rounded-md space-y-2">
        <Input value={editedTitle} onChange={(e) => setEditedTitle(e.target.value)} />
        <Textarea placeholder="Description..." value={editedDesc} onChange={(e) => setEditedDesc(e.target.value)} />
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full justify-start text-left font-normal">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {editedDate ? format(editedDate, 'PPP') : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={editedDate}
              onSelect={setEditedDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>Cancel</Button>
          <Button size="sm" onClick={handleUpdate}>Save</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3 group">
      <Checkbox
        id={`task-${task.id}`}
        checked={task.completed}
        onCheckedChange={() => onToggleTask(task.id)}
        className="mt-1"
      />
      <div className="flex-1" onClick={() => setIsEditing(true)}>
        <label
          htmlFor={`task-${task.id}`}
          className={`text-sm cursor-pointer ${task.completed ? 'line-through text-muted-foreground' : ''}`}
        >
          {task.title}
        </label>
        {task.description && <p className="text-xs text-muted-foreground">{task.description}</p>}
        {task.dueDate && <p className="text-xs text-muted-foreground">{format(task.dueDate, 'PP')}</p>}
      </div>
      <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100" onClick={() => onDeleteTask(task.id)}>
        <Trash2 className="h-4 w-4 text-destructive/80" />
      </Button>
    </div>
  );
};


const TaskCard: React.FC<TaskCardProps> = ({ 
  list, 
  tasks, 
  onAddTask, 
  onToggleTask,
  onDeleteTask,
  onDeleteList,
  onRenameList,
  onUpdateTask
}) => {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskDate, setNewTaskDate] = useState<Date | undefined>(undefined);
  const [isAdding, setIsAdding] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [listName, setListName] = useState(list.name);

  const resetNewTaskForm = () => {
    setNewTaskTitle('');
    setNewTaskDesc('');
    setNewTaskDate(undefined);
    setIsAdding(false);
  };

  const handleAddTask = () => {
    if (newTaskTitle.trim()) {
      onAddTask({ 
        title: newTaskTitle.trim(), 
        description: newTaskDesc.trim(),
        dueDate: newTaskDate,
        listId: list.id 
      });
      resetNewTaskForm();
    }
  };

  const handleRename = () => {
    if (listName.trim() && listName !== list.name) {
      onRenameList(list.id, listName);
    }
    setIsRenaming(false);
  }

  return (
    <Card className="w-[350px] bg-card/50 border-border/40 flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between">
        {isRenaming ? (
          <Input
            value={listName}
            onChange={(e) => setListName(e.target.value)}
            onBlur={handleRename}
            onKeyPress={(e) => e.key === 'Enter' && handleRename()}
            autoFocus
            className="text-lg font-semibold"
          />
        ) : (
          <CardTitle className="text-lg font-semibold">{list.name}</CardTitle>
        )}
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsAdding(true)}>
            <Plus className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onSelect={() => setIsRenaming(true)}>
                <Edit2 className="mr-2 h-4 w-4" />
                <span>Rename</span>
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => onDeleteList(list.id)} className="text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                <span>Delete List</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto">
        <div className="space-y-2">
          {tasks.map(task => (
            <TaskItem 
              key={task.id}
              task={task}
              onToggleTask={onToggleTask}
              onDeleteTask={onDeleteTask}
              onUpdateTask={onUpdateTask}
            />
          ))}
          {isAdding && (
            <div className="p-2 border rounded-md space-y-2">
              <Input
                placeholder="Task title..."
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                autoFocus
              />
              <Textarea 
                placeholder="Description..." 
                value={newTaskDesc} 
                onChange={(e) => setNewTaskDesc(e.target.value)} 
                rows={2}
              />
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {newTaskDate ? format(newTaskDate, 'PPP') : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={newTaskDate}
                    onSelect={setNewTaskDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <div className="flex justify-end gap-2">
                <Button variant="ghost" size="sm" onClick={resetNewTaskForm}>Cancel</Button>
                <Button size="sm" onClick={handleAddTask}>Add Task</Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskCard;
