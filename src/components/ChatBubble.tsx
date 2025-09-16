import React from 'react';
import clsx from 'clsx';

interface ChatBubbleProps {
  children: React.ReactNode;
  width?: string; // ex: 'w-64' or 'max-w-sm'
  arrowPosition?: 'left' | 'right' | 'top' | 'bottom';
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({
  children,
  width = 'max-w-fit',
  arrowPosition = 'left',
}) => {
  const bubbleClasses = clsx(
    'relative inline-block px-4 py-2 rounded-xl border',
    'bg-white text-gray-800 border-gray-300',
    'dark:bg-gray-800 dark:text-white dark:border-gray-600',
    width
  );

  // Mũi tên nhọn hơn
  const arrowStyles = {
    left: 'absolute top-1/2 -translate-y-1/2 -left-[5px] w-2.5 h-2.5 border-l border-b border-gray-300 dark:border-gray-600 rotate-45 bg-white dark:bg-gray-800',
    right: 'absolute top-1/2 -translate-y-1/2 -right-[5px] w-2.5 h-2.5 border-r border-t border-gray-300 dark:border-gray-600 rotate-45 bg-white dark:bg-gray-800',
    top: 'absolute left-1/2 -translate-x-1/2 -top-[5px] w-2.5 h-2.5 border-t border-l border-gray-300 dark:border-gray-600 rotate-45 bg-white dark:bg-gray-800',
    bottom: 'absolute left-1/2 -translate-x-1/2 -bottom-[5px] w-2.5 h-2.5 border-b border-r border-gray-300 dark:border-gray-600 rotate-45 bg-white dark:bg-gray-800',
  };

  return (
    <div className={bubbleClasses}>
      {children}
      <div className={arrowStyles[arrowPosition]}></div>
    </div>
  );
};