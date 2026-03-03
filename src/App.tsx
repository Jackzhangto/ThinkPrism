import React from 'react';
import { PopupHeader } from './components/business/PopupHeader';
import { PersistentStatusBar } from './components/business/PersistentStatusBar';
import { SceneRecommender } from './components/business/SceneRecommender';
import { ModeList } from './components/business/ModeList';
import { Toast } from './components/ui/toast';
import { useUIStore } from './store/uiStore';

/**
 * 应用根组件 (Popup)
 * 组装 Header、StatusBar、Recommender、ModeList 和 Toast。
 */
function App() {
  const { message, type, visible, duration, hideToast } = useUIStore();

  return (
    <div className="w-[360px] h-[600px] bg-bg-page text-text-primary flex flex-col font-sans antialiased transition-colors duration-200 overflow-hidden relative">
      <PopupHeader />
      <PersistentStatusBar />
      
      <main className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-bg-hover scrollbar-track-transparent hover:scrollbar-thumb-bg-active">
        <div className="py-2">
          <SceneRecommender />
        </div>
        <div className="px-1">
          <ModeList />
        </div>
      </main>
      
      <footer className="border-t border-border-light bg-bg-panel px-page py-2 text-center text-[10px] text-text-hint">
        ThinkPrism v1.0.0 • 按 <kbd className="font-sans">Alt+P</kbd> 唤醒
      </footer>

      <Toast 
        message={message} 
        type={type} 
        visible={visible} 
        duration={duration} 
        onClose={hideToast} 
      />
    </div>
  );
}

export default App;
