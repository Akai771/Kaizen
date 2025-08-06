import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from '@/components/ui/sheet';
import AIChat from '@/components/ai-chat';

interface AIChatSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AIChatSheet: React.FC<AIChatSheetProps> = ({ open, onOpenChange }) => {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" size="lg" className="flex flex-col h-full">
        <SheetClose />
        <SheetHeader className="mb-6 flex-shrink-0">
          <SheetTitle>Hiro</SheetTitle>
        </SheetHeader>
        <div className="flex-1 min-h-0">
          <AIChat />
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default AIChatSheet;
