import { useState, useCallback } from 'react';
import { BrowserTab, BrowserState } from '../types';

const INITIAL_URL = 'https://www.google.com/search?igu=1';

export const useBrowser = () => {
  const [state, setState] = useState<BrowserState>({
    tabs: [
      {
        id: 'initial',
        title: 'New Tab',
        url: INITIAL_URL,
        isLoading: false,
        history: [INITIAL_URL],
        historyIndex: 0,
        zoom: 1,
      },
    ],
    activeTabId: 'initial',
  });

  const activeTab = state.tabs.find((t) => t.id === state.activeTabId)!;

  const addTab = useCallback(() => {
    const newId = Math.random().toString(36).substring(2, 9);
    const newTab: BrowserTab = {
      id: newId,
      title: 'New Tab',
      url: INITIAL_URL,
      isLoading: false,
      history: [INITIAL_URL],
      historyIndex: 0,
      zoom: 1,
    };
    setState((prev) => ({
      ...prev,
      tabs: [...prev.tabs, newTab],
      activeTabId: newId,
    }));
  }, []);

  const closeTab = useCallback((id: string) => {
    setState((prev) => {
      if (prev.tabs.length === 1) return prev;
      const newTabs = prev.tabs.filter((t) => t.id !== id);
      let newActiveId = prev.activeTabId;
      if (prev.activeTabId === id) {
        newActiveId = newTabs[newTabs.length - 1].id;
      }
      return {
        ...prev,
        tabs: newTabs,
        activeTabId: newActiveId,
      };
    });
  }, []);

  const setActiveTabId = useCallback((id: string) => {
    setState((prev) => ({ ...prev, activeTabId: id }));
  }, []);

  const navigateTo = useCallback((url: string) => {
    let targetUrl = url;
    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      if (targetUrl.includes('.') && !targetUrl.includes(' ')) {
        targetUrl = 'https://' + targetUrl;
      } else {
        targetUrl = `https://www.google.com/search?q=${encodeURIComponent(targetUrl)}&igu=1`;
      }
    }

    setState((prev) => ({
      ...prev,
      tabs: prev.tabs.map((t) => {
        if (t.id === prev.activeTabId) {
          const newHistory = t.history.slice(0, t.historyIndex + 1);
          newHistory.push(targetUrl);
          return {
            ...t,
            url: targetUrl,
            history: newHistory,
            historyIndex: newHistory.length - 1,
            title: targetUrl.replace(/^https?:\/\/(www\.)?/, '').split('/')[0] || 'Browser',
          };
        }
        return t;
      }),
    }));
  }, []);

  const goBack = useCallback(() => {
    setState((prev) => ({
      ...prev,
      tabs: prev.tabs.map((t) => {
        if (t.id === prev.activeTabId && t.historyIndex > 0) {
          const newIndex = t.historyIndex - 1;
          return {
            ...t,
            url: t.history[newIndex],
            historyIndex: newIndex,
          };
        }
        return t;
      }),
    }));
  }, []);

  const goForward = useCallback(() => {
    setState((prev) => ({
      ...prev,
      tabs: prev.tabs.map((t) => {
        if (t.id === prev.activeTabId && t.historyIndex < t.history.length - 1) {
          const newIndex = t.historyIndex + 1;
          return {
            ...t,
            url: t.history[newIndex],
            historyIndex: newIndex,
          };
        }
        return t;
      }),
    }));
  }, []);

  const setZoom = useCallback((zoom: number) => {
    setState((prev) => ({
      ...prev,
      tabs: prev.tabs.map((t) =>
        t.id === prev.activeTabId ? { ...t, zoom: Math.max(0.2, Math.min(5, zoom)) } : t
      ),
    }));
  }, []);

  return {
    ...state,
    activeTab,
    addTab,
    closeTab,
    setActiveTabId,
    navigateTo,
    goBack,
    goForward,
    setZoom,
  };
};
