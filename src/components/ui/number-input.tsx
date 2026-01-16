import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Minus, Plus } from 'lucide-react';
import { forwardRef } from 'react';

interface NumberInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  onIncrement?: () => void;
  onDecrement?: () => void;
  min?: number;
  max?: number;
}

const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(
  ({ onIncrement, onDecrement, min, max, className, ...props }, ref) => {
    const handleIncrement = () => {
      if (onIncrement) {
        onIncrement();
      } else if (props.onChange) {
        const currentValue = Number(props.value) || 0;
        const newValue = max !== undefined ? Math.min(currentValue + 1, max) : currentValue + 1;
        const event = {
          target: { value: String(newValue) },
        } as React.ChangeEvent<HTMLInputElement>;
        props.onChange(event);
      }
    };

    const handleDecrement = () => {
      if (onDecrement) {
        onDecrement();
      } else if (props.onChange) {
        const currentValue = Number(props.value) || 0;
        const newValue = min !== undefined ? Math.max(currentValue - 1, min) : currentValue - 1;
        const event = {
          target: { value: String(newValue) },
        } as React.ChangeEvent<HTMLInputElement>;
        props.onChange(event);
      }
    };

    return (
      <div className="relative flex items-center">
        <Input ref={ref} type="number" className={`pr-20 ${className || ''}`} {...props} />
        <div className="absolute right-1 flex gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 hover:bg-primary/20"
            onClick={handleDecrement}
            tabIndex={-1}
          >
            <Minus className="h-3 w-3" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 hover:bg-primary/20"
            onClick={handleIncrement}
            tabIndex={-1}
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>
      </div>
    );
  }
);

NumberInput.displayName = 'NumberInput';

export { NumberInput };
