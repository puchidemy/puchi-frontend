// Rive configuration for performance optimization
export const riveConfig = {
  // Performance settings
  useOffscreenRenderer: false,
  shouldResizeCanvasToContainer: true,
  automaticallyHandleEvents: true,
  
  // Loading settings
  shouldDisableRiveListeners: false,
  
  // Default styles
  defaultStyles: {
    maxWidth: "100%",
    maxHeight: "100%",
    objectFit: "contain" as const,
  },
  
  // File paths
  files: {
    welcome: "/river/welcome.riv", // 3.4MB - large file
    catButton: "/river/cat_button.riv", // 36KB - small file
  },
  
  // State machines
  stateMachines: {
    welcome: "State Machine 1",
    catButton: "State Machine 1",
  },
};

// Helper function to get optimized Rive props
export const getOptimizedRiveProps = (fileType: keyof typeof riveConfig.files) => ({
  src: riveConfig.files[fileType],
  stateMachines: riveConfig.stateMachines[fileType],
  useOffscreenRenderer: riveConfig.useOffscreenRenderer,
  shouldResizeCanvasToContainer: riveConfig.shouldResizeCanvasToContainer,
  automaticallyHandleEvents: riveConfig.automaticallyHandleEvents,
  style: riveConfig.defaultStyles,
}); 