export interface Theme {
  name: string;
  className: string;
  bgColor: string;
  textColor: string;
  accentColor: string;
}

export interface EditorState {
  content: string;
  theme: Theme;
  isZenMode: boolean;
  isSplitView: boolean;
  isMobilePreview: boolean;
  viewMode: 'blog' | 'wiki' | 'portfolio';
  isFullscreen: boolean;
  showTOC: boolean;
  showSearch: boolean;
  focusMode: boolean;
  lastSaved: string;
}

export type ExportFormat = 'markdown' | 'html' | 'txt';

