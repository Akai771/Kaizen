import OpenAI from 'openai';
import { createTaskList } from './taskListService';
import { createTask } from './taskService';

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API || import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Note: In production, API calls should go through your backend
});

export interface AITaskCreationResponse {
  listName: string;
  tasks: Array<{
    title: string;
    description?: string;
    due_date?: string;
  }>;
  message: string;
}

export interface AIResponse {
  message: string;
  action?: 'create_tasks' | 'none';
  data?: AITaskCreationResponse;
}

/**
 * Process user message with OpenAI and determine if tasks should be created
 */
export const processAIMessage = async (
  userMessage: string,
  conversationHistory: Array<{ role: 'user' | 'assistant', content: string }>
): Promise<AIResponse> => {
  try {
    const systemPrompt = `You are Hiro, an intelligent AI assistant for a todo/task management app called Kaizen. Your role is to help users manage their tasks efficiently.

Key capabilities:
1. Create task lists and tasks based on user requests
2. Provide task management advice and productivity tips
3. Parse natural language commands to create organized task lists

When a user asks you to create tasks/lists (e.g., "create a list for planning a birthday", "help me plan a vacation", "make a grocery list"), you should:
1. Identify that they want to create tasks
2. Generate an appropriate list name
3. Generate relevant tasks with titles and optional descriptions
4. Respond in a structured JSON format

Response format for task creation:
{
  "action": "create_tasks",
  "data": {
    "listName": "List Name",
    "tasks": [
      {
        "title": "Task title",
        "description": "Optional description",
        "due_date": "Optional ISO date string"
      }
    ],
    "message": "A friendly confirmation message"
  }
}

For regular conversation (no task creation), respond in this format:
{
  "action": "none",
  "message": "Your helpful response"
}

Examples of task creation requests:
- "Create a list for planning a birthday party"
- "Help me plan a vacation to Japan"
- "Make a grocery shopping list"
- "I need to prepare for a job interview"
- "Create tasks for moving to a new apartment"

Be helpful, friendly, and concise. Focus on productivity and task management.`;

    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      })),
      { role: 'user', content: userMessage }
    ];

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages,
      temperature: 0.7,
      max_tokens: 1000,
      response_format: { type: "json_object" }
    });

    const responseContent = completion.choices[0].message.content;
    if (!responseContent) {
      throw new Error('No response from OpenAI');
    }

    const parsedResponse = JSON.parse(responseContent) as AIResponse;
    return parsedResponse;

  } catch (error) {
    console.error('Error processing AI message:', error);
    return {
      message: "I'm sorry, I'm having trouble processing your request right now. Please try again.",
      action: 'none'
    };
  }
};

/**
 * Create task list and tasks based on AI response
 */
export const executeTaskCreation = async (data: AITaskCreationResponse): Promise<{ success: boolean; listId?: string; error?: string }> => {
  try {
    // Create the task list
    const taskList = await createTaskList(data.listName);
    
    // Create all tasks in the list
    const taskPromises = data.tasks.map((task, index) =>
      createTask({
        list_id: taskList.id,
        title: task.title,
        description: task.description || null,
        due_date: task.due_date || null,
        position: index,
        completed: false
      })
    );

    await Promise.all(taskPromises);

    return { success: true, listId: taskList.id };
  } catch (error) {
    console.error('Error creating tasks:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to create tasks' 
    };
  }
};

/**
 * Generate a quick AI response without task creation
 */
export const getAIResponse = async (
  userMessage: string,
  conversationHistory: Array<{ role: 'user' | 'assistant', content: string }>
): Promise<string> => {
  try {
    const systemPrompt = `You are Hiro, a friendly AI assistant for a todo/task management app called Kaizen. 
Help users with task management, productivity tips, and general questions about organizing their work.
Keep responses concise and helpful.`;

    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      })),
      { role: 'user', content: userMessage }
    ];

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages,
      temperature: 0.7,
      max_tokens: 500
    });

    return completion.choices[0].message.content || "I'm not sure how to respond to that.";
  } catch (error) {
    console.error('Error getting AI response:', error);
    return "I'm sorry, I'm having trouble responding right now. Please try again.";
  }
};
