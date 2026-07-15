"use client";

import { motion } from "motion/react";

interface Tab {
  id: string;
  label: string;
  icon: React.ElementType;
}

interface ProfileTabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export default function ProfileTabs({ tabs, activeTab, onTabChange }: ProfileTabsProps) {
  return (
    <div className="relative flex gap-1 p-1.5 bg-muted/60 rounded-2xl">
      {tabs.map((tab, i) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className="relative flex-1 flex items-center justify-center gap-2 px-3 py-3 rounded-xl text-sm font-medium z-10 whitespace-nowrap transition-colors duration-200"
          >
            <motion.div
              animate={{ scale: isActive ? 1 : 0.85, opacity: isActive ? 1 : 0.5 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
            >
              <tab.icon size={18} />
            </motion.div>
            <span className="hidden sm:inline">{tab.label}</span>

            {isActive && (
              <motion.div
                layoutId="tab-indicator"
                className="absolute inset-0 bg-background rounded-xl shadow-sm -z-10"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
