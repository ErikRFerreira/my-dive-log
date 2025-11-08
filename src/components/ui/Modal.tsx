import { createPortal } from 'react-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

type ModalProps = {
  children: React.ReactNode;
  title?: string;
  closeModal: () => void;
};

function Modal({ children, title, closeModal }: ModalProps) {
  return createPortal(
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-card border-slate-200 dark:border-slate-700">
        <CardHeader className="flex flex-row items-center justify-between border-b border-border ">
          <CardTitle className="text-foreground">{title}</CardTitle>
          <Button variant="ghost" size="icon" onClick={closeModal} className="rounded-full">
            <X className="w-5 h-5" />
          </Button>
        </CardHeader>
        <CardContent className="p-6">{children}</CardContent>
      </Card>
    </div>,
    document.body
  );
}

export default Modal;
