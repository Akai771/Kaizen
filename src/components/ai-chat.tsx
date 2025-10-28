import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Mic, CheckCircle2, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { processAIMessage, executeTaskCreation } from '@/services/aiService'
import { toast } from 'sonner'

interface Message {
  id: string
  content: string
  sender: 'user' | 'ai'
  timestamp: Date
  taskCreation?: {
    listName: string
    taskCount: number
    status: 'pending' | 'success' | 'error'
    listId?: string
  }
}

interface AIChatProps {
  onClose?: () => void
  onTasksCreated?: (listId: string) => void
}

const AIChat: React.FC<AIChatProps> = ({ onTasksCreated }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Hello! I\'m Hiro, your AI task assistant. I can help you create and organize tasks. Try asking me to "create a list for planning a birthday party" or "help me plan a vacation"!',
      sender: 'ai',
      timestamp: new Date()
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]')
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }, [messages])

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)

    try {
      // Build conversation history for context
      const conversationHistory = messages.map(msg => ({
        role: msg.sender === 'ai' ? 'assistant' as const : 'user' as const,
        content: msg.content
      }))

      // Process message with OpenAI
      const aiResponse = await processAIMessage(inputValue, conversationHistory)

      if (aiResponse.action === 'create_tasks' && aiResponse.data) {
        // Show initial AI response with pending task creation
        const taskCreationMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: aiResponse.data.message,
          sender: 'ai',
          timestamp: new Date(),
          taskCreation: {
            listName: aiResponse.data.listName,
            taskCount: aiResponse.data.tasks.length,
            status: 'pending'
          }
        }
        
        setMessages(prev => [...prev, taskCreationMessage])

        // Execute task creation
        const result = await executeTaskCreation(aiResponse.data)
        
        // Update message with creation status
        setMessages(prev => prev.map(msg => 
          msg.id === taskCreationMessage.id
            ? {
                ...msg,
                taskCreation: {
                  ...msg.taskCreation!,
                  status: result.success ? 'success' : 'error',
                  listId: result.listId
                }
              }
            : msg
        ))

        if (result.success) {
          toast.success(`Created "${aiResponse.data.listName}" with ${aiResponse.data.tasks.length} tasks!`)
          // Notify parent component about new tasks
          if (onTasksCreated && result.listId) {
            onTasksCreated(result.listId)
          }
        } else {
          toast.error('Failed to create tasks. Please try again.')
        }
      } else {
        // Regular conversation message
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: aiResponse.message,
          sender: 'ai',
          timestamp: new Date()
        }
        setMessages(prev => [...prev, aiMessage])
      }
    } catch (error) {
      console.error('Error in AI chat:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'I apologize, but I encountered an error. Please make sure your OpenAI API key is configured correctly in your environment variables (VITE_OPENAI_API or VITE_OPENAI_API_KEY).',
        sender: 'ai',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
      toast.error('Failed to process message')
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-8rem)]">
      {/* Chat Header */}
      <div className="flex items-center gap-3 pb-4 border-b flex-shrink-0">
        <div className="flex items-center justify-center w-8 h-8 bg-primary rounded-full">
          <Bot className="w-4 h-4 text-primary-foreground" />
        </div>
        <div>
          <h3 className="font-semibold">Hiro</h3>
          <p className="text-sm text-muted-foreground">Your productivity helper</p>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea ref={scrollAreaRef} className="flex-1 py-4 min-h-0">
        <div className="space-y-4 pr-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 chat-message ${
                message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              <div className={`flex items-center justify-center w-6 h-6 rounded-full flex-shrink-0 ${
                message.sender === 'user' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted text-muted-foreground'
              }`}>
                {message.sender === 'user' ? (
                  <User className="w-3 h-3" />
                ) : (
                  <Bot className="w-3 h-3" />
                )}
              </div>
              <div className={`max-w-[80%] ${
                message.sender === 'user' ? 'items-end' : 'items-start'
              } flex flex-col gap-2`}>
                <div className={`rounded-lg px-3 py-2 ${
                  message.sender === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}>
                  <p className="text-sm">{message.content}</p>
                  <p className={`text-xs mt-1 opacity-70`}>
                    {message.timestamp.toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
                
                {/* Task Creation Status Card */}
                {message.taskCreation && (
                  <div className={`rounded-lg border px-3 py-2 text-sm ${
                    message.taskCreation.status === 'success' 
                      ? 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800' 
                      : message.taskCreation.status === 'error'
                      ? 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800'
                      : 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800'
                  }`}>
                    <div className="flex items-center gap-2">
                      {message.taskCreation.status === 'success' ? (
                        <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                      ) : message.taskCreation.status === 'error' ? (
                        <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                      ) : (
                        <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                      )}
                      <div className="flex-1">
                        <p className="font-medium">
                          {message.taskCreation.status === 'success' 
                            ? '✓ Tasks Created' 
                            : message.taskCreation.status === 'error'
                            ? '✗ Creation Failed'
                            : 'Creating Tasks...'}
                        </p>
                        <p className="text-xs opacity-80">
                          {message.taskCreation.listName} • {message.taskCreation.taskCount} tasks
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3 chat-message">
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-muted text-muted-foreground flex-shrink-0">
                <Bot className="w-3 h-3" />
              </div>
              <div className="bg-muted rounded-lg px-3 py-2">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse delay-75"></div>
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse delay-150"></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* GitHub Copilot Style Input */}
      <div className="pt-4 border-t flex-shrink-0">
        <div className="relative bg-muted/30 rounded-xl border border-border/50 focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20 transition-all duration-200">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask anything"
            className="w-full bg-transparent border-none outline-none resize-none text-sm text-foreground placeholder:text-muted-foreground/70 p-4 pr-20 min-h-[52px] max-h-32"
            disabled={isLoading}
            rows={1}
            style={{
              height: 'auto',
              minHeight: '52px'
            }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement
              target.style.height = 'auto'
              target.style.height = Math.min(Math.max(target.scrollHeight, 52), 128) + 'px'
            }}
          />
          
          {/* Button Container */}
          <div className="absolute right-2 bottom-2 flex items-center gap-1">
            {/* Voice Button */}
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors"
              disabled={isLoading}
              onClick={() => {
                // TODO: Implement voice input
                console.log('Voice input clicked')
              }}
            >
              <Mic className="w-4 h-4" />
            </Button>
            
            {/* Send Button */}
            <Button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
              size="sm"
              className={`h-8 w-8 p-0 transition-all duration-200 ${
                inputValue.trim() && !isLoading
                  ? 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm'
                  : 'bg-muted/60 text-muted-foreground cursor-not-allowed'
              }`}
            >
              {isLoading ? (
                <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
        
        {/* Helper Text */}
        <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
          <span>Press Enter to send, Shift + Enter for new line</span>
          <span>{inputValue.length}/1000</span>
        </div>
      </div>
    </div>
  )
}

export default AIChat
