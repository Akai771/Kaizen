import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Bot, Plus } from 'lucide-react';
import AIChatSheet from '@/components/ai-chat-sheet';

const Expense: React.FC = () => {
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);

  return (
        <div className="w-full flex flex-col">
      {/* Header */}
      <header className="flex-shrink-0 h-16 border-b border-border/80 flex items-center justify-between px-6">
        <div>
            <h1 className="text-xl font-bold">
            <span className="text-primary">Expense</span> Management</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button >
            <Plus className="mr-2 h-4 w-4" />
            Add Expense
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setIsAIChatOpen(true)}>
            <Bot className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* AI Chat Sheet */}
      <AIChatSheet open={isAIChatOpen} onOpenChange={setIsAIChatOpen} />
    </div>
  );
};

export default Expense;
