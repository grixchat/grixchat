export interface BrowserTab {
  id: string;
  title: string;
  url: string;
  favIcon?: string;
  isLoading: boolean;
  history: string[];
  historyIndex: number;
  zoom: number;
}

export interface BrowserState {
  tabs: BrowserTab[];
  activeTabId: string;
}
