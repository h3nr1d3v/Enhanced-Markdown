import React, { useEffect, useCallback, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeHighlight from 'rehype-highlight';
import { Moon, Sun, Smartphone, Maximize2, Layout, Eye, Book, FileText, Briefcase, Download, Upload, List, Search, Focus, Clock, Hash, AlignJustify, Palette, Feather, Leaf, Sunset } from 'lucide-react';
import { Theme, EditorState, ExportFormat } from '../types';
import { themes, viewModes } from '../styles/themes';
import { generateTOC } from '../utils/toc';
import { countWordsAndChars } from '../utils/counter';
import { markdownShortcuts } from '../utils/shortcuts';
import { documentTemplates } from '../utils/templates';

const INITIAL_CONTENT = `# 📝 Welcome to the Enhanced Markdown Editor

Start typing your markdown here...`;

const Editor: React.FC = () => {
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const [state, setState] = useState<EditorState>(() => {
    const saved = localStorage.getItem('markdownEditor');
    return saved ? JSON.parse(saved) : {
      content: INITIAL_CONTENT,
      theme: themes[0],
      isZenMode: false,
      isSplitView: true,
      isMobilePreview: false,
      viewMode: 'blog',
      isFullscreen: false,
      showTOC: false,
      showSearch: false,
      focusMode: false,
      lastSaved: new Date().toISOString()
    };
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<number[]>([]);
  const [currentSearchIndex, setCurrentSearchIndex] = useState(-1);
  const [stats, setStats] = useState({ words: 0, chars: 0 });
  const [toc, setToc] = useState([]);
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [wordCount, setWordCount] = useState({ words: 0, chars: 0, readingTime: 0 });


  // Auto-save functionality
  useEffect(() => {
    const saveInterval = setInterval(() => {
      localStorage.setItem('markdownEditor', JSON.stringify({
        ...state,
        lastSaved: new Date().toISOString()
      }));
    }, 30000);

    return () => clearInterval(saveInterval);
  }, [state]);

  // Update stats and TOC when content changes
  useEffect(() => {
    const {words, chars} = countWordsAndChars(state.content);
    setWordCount({words, chars, readingTime: Math.round(words / 200)});
    setStats({words, chars});
    setToc(generateTOC(state.content));
  }, [state.content]);

  // Real-time search functionality
  useEffect(() => {
    if (searchTerm.length > 0) {
      const results = [];
      let index = -1;
      while ((index = state.content.toLowerCase().indexOf(searchTerm.toLowerCase(), index + 1)) !== -1) {
        results.push(index);
      }
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
    setCurrentSearchIndex(-1);
  }, [searchTerm, state.content]);

  const highlightSearchResult = (index: number) => {
    const textarea = editorRef.current;
    if (!textarea) return;

    textarea.setSelectionRange(index, index + searchTerm.length);
    textarea.focus();

    // Scroll the result into view
    const lineHeight = parseInt(getComputedStyle(textarea).lineHeight);
    const lines = state.content.substr(0, index).split('\n').length - 1;
    textarea.scrollTop = lines * lineHeight;
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchResults.length > 0) {
      const nextIndex = (currentSearchIndex + 1) % searchResults.length;
      setCurrentSearchIndex(nextIndex);
      highlightSearchResult(searchResults[nextIndex]);
    }
  };

  const handleNextSearchResult = () => {
    if (searchResults.length === 0) return;
    
    const nextIndex = (currentSearchIndex + 1) % searchResults.length;
    setCurrentSearchIndex(nextIndex);
    highlightSearchResult(searchResults[nextIndex]);
  };

  const handlePrevSearchResult = () => {
    if (searchResults.length === 0) return;
    
    const prevIndex = currentSearchIndex <= 0 ? searchResults.length - 1 : currentSearchIndex - 1;
    setCurrentSearchIndex(prevIndex);
    highlightSearchResult(searchResults[prevIndex]);
  };

  // Export functionality
  const exportContent = (format: ExportFormat) => {
    let content = '';
    let mimeType = '';
    let fileExtension = '';

    switch (format) {
      case 'markdown':
        content = state.content;
        mimeType = 'text/markdown';
        fileExtension = 'md';
        break;
      case 'html':
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = document.querySelector('.prose')?.innerHTML || '';
        content = tempDiv.innerHTML;
        mimeType = 'text/html';
        fileExtension = 'html';
        break;
      case 'txt':
        content = state.content;
        mimeType = 'text/plain';
        fileExtension = 'txt';
        break;
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `markdown-export.${fileExtension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setShowExportOptions(false);
  };

  // Import functionality
  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setState(prev => ({
        ...prev,
        content
      }));
    };
    reader.readAsText(file);
  };

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));

    for (const file of imageFiles) {
      const reader = new FileReader();
      reader.onload = () => {
        const imageUrl = reader.result as string;
        const imageMarkdown = `\n![${file.name}](${imageUrl})\n`;
        setState(prev => ({
          ...prev,
          content: prev.content + imageMarkdown
        }));
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setState(prev => ({ ...prev, focusMode: !prev.focusMode }));
  };

  const themeIcons = {
    'Light Pastel': Sun,
    'Soft Lavender': Feather,
    'Mint Dream': Leaf,
    'Peach Cream': Sunset
  };

  // Add new keyboard shortcuts handler
  useEffect(() => {
    const handleKeyboard = (e: KeyboardEvent) => {
      const key = `${e.ctrlKey ? 'ctrl+' : ''}${e.key.toLowerCase()}`;
      const shortcut = markdownShortcuts[key as keyof typeof markdownShortcuts];
      
      if (shortcut && editorRef.current) {
        e.preventDefault();
        const start = editorRef.current.selectionStart;
        const end = editorRef.current.selectionEnd;
        const selection = state.content.substring(start, end);
        
        let replacement = shortcut;
        if (selection) {
          replacement = shortcut.includes('\n') 
            ? `${shortcut.split('\n')[0]}${selection}${shortcut.split('\n')[2]}`
            : `${shortcut}${selection}${shortcut}`;
        }
        
        setState(prev => ({
          ...prev,
          content: state.content.substring(0, start) + replacement + state.content.substring(end)
        }));
      }
    };

    document.addEventListener('keydown', handleKeyboard);
    return () => document.removeEventListener('keydown', handleKeyboard);
  }, [state.content]);

  const applyTemplate = (templateName: keyof typeof documentTemplates) => {
    setState(prev => ({
      ...prev,
      content: documentTemplates[templateName]
    }));
    setShowTemplates(false);
  };

  return (
    <div 
      className={`min-h-screen ${state.theme.bgColor} ${state.theme.textColor} 
        transition-colors duration-200 ${state.theme.className}
        ${state.focusMode ? 'fixed inset-0 z-50 overflow-auto' : ''}`}
    >
      <div className={`container mx-auto p-4 ${state.isZenMode ? 'zen-mode' : ''}`}>
        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between mb-4 p-2 bg-opacity-90 backdrop-blur-sm rounded-lg shadow-sm">
          <div className="flex flex-wrap gap-2">
            {/* Theme buttons */}
            <div className="flex space-x-2">
              {themes.map((theme) => {
                const ThemeIcon = themeIcons[theme.name as keyof typeof themeIcons];
                return (
                  <button
                    key={theme.name}
                    onClick={() => setState(prev => ({ ...prev, theme }))}
                    className={`toolbar-button ${
                      state.theme.name === theme.name ? `${theme.accentColor} text-white` : 'bg-gray-200'
                    }`}
                    title={theme.name}
                  >
                    <ThemeIcon size={18} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Moved buttons */}
          <div className="flex space-x-2">
            <button
              onClick={() => setState(prev => ({ ...prev, showTOC: !prev.showTOC }))}
              className={`toolbar-button ${state.showTOC ? `${state.theme.accentColor} text-white` : 'bg-gray-200'}`}
              title="Table of Contents"
            >
              <List size={18} />
            </button>
            <button
              onClick={() => setState(prev => ({ ...prev, showSearch: !prev.showSearch }))}
              className={`toolbar-button ${state.showSearch ? `${state.theme.accentColor} text-white` : 'bg-gray-200'}`}
              title="Search"
            >
              <Search size={18} />
            </button>
            <button
              onClick={toggleFullscreen}
              className={`toolbar-button ${state.focusMode ? `${state.theme.accentColor} text-white` : 'bg-gray-200'}`}
              title="Focus Mode"
            >
              <Focus size={18} />
            </button>
            <div className="relative">
              <button
                onClick={() => setShowExportOptions(!showExportOptions)}
                className={`toolbar-button ${showExportOptions ? `${state.theme.accentColor} text-white` : 'bg-gray-200'}`}
                title="Export"
              >
                <Download size={18} />
              </button>
              {showExportOptions && (
                <div className="absolute right-0 mt-2 py-2 w-48 bg-white rounded-md shadow-xl z-20">
                  {(['markdown', 'html', 'txt'] as ExportFormat[]).map((format) => (
                    <button
                      key={format}
                      onClick={() => exportContent(format)}
                      className="block px-4 py-2 text-sm capitalize text-gray-700 hover:bg-gray-100 hover:text-gray-900 w-full text-left"
                    >
                      Export as {format}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <label className="toolbar-button bg-gray-200 cursor-pointer" title="Import">
              <Upload size={18} />
              <input
                type="file"
                accept=".md,.txt"
                onChange={handleFileImport}
                className="hidden"
              />
            </label>
            <button
              onClick={() => setState(prev => ({ ...prev, isMobilePreview: !prev.isMobilePreview }))}
              className={`toolbar-button ${state.isMobilePreview ? `${state.theme.accentColor} text-white` : 'bg-gray-200'}`}
              title="Mobile Preview"
            >
              <Smartphone size={18} />
            </button>
            <button
              onClick={() => setState(prev => ({ ...prev, isSplitView: !prev.isSplitView }))}
              className={`toolbar-button ${state.isSplitView ? `${state.theme.accentColor} text-white` : 'bg-gray-200'}`}
              title="Split View"
            >
              {state.isSplitView ? <Layout size={18} /> : <Eye size={18} />}
            </button>

            {/* Add new toolbar buttons */}
            <div className="flex space-x-2">
              <button
                onClick={() => setShowTemplates(!showTemplates)}
                className={`toolbar-button ${showTemplates ? `${state.theme.accentColor} text-white` : 'bg-gray-200'}`}
                title="Templates"
              >
                <FileText size={18} />
              </button>
            </div>
          </div>

          {/* Stats display */}
          <div className="text-sm text-gray-500 flex items-center gap-4">
            <span title="Word count">
              <AlignJustify size={14} className="inline mr-1" />
              {wordCount.words}
            </span>
            <span title="Character count">
              <Hash size={14} className="inline mr-1" />
              {wordCount.chars}
            </span>
            <span title="Last saved">
              <Clock size={14} className="inline mr-1" />
              {new Date(state.lastSaved).toLocaleTimeString()}
            </span>
            <span title="Reading time">
              <Clock size={14} className="inline mr-1" />
              {wordCount.readingTime} min
            </span>
          </div>
        </div>

        {/* Enhanced Search bar */}
        {state.showSearch && (
          <form onSubmit={handleSearch} className="mb-4 flex gap-2">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search in document..."
              className="flex-1 px-3 py-2 rounded-lg border focus:outline-none focus:ring-2"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handlePrevSearchResult}
                className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                disabled={searchResults.length === 0}
              >
                ↑
              </button>
              <button
                type="submit"
                className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                disabled={searchResults.length === 0}
              >
                Find
              </button>
              <button
                type="button"
                onClick={handleNextSearchResult}
                className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                disabled={searchResults.length === 0}
              >
                ↓
              </button>
              <span className="px-3 py-2 bg-gray-100 rounded-lg">
                {searchResults.length > 0 ? `${currentSearchIndex + 1}/${searchResults.length}` : '0/0'}
              </span>
            </div>
          </form>
        )}

        {/* Templates Panel */}
        {showTemplates && (
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl z-20">
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-2">Templates</h3>
              <div className="space-y-2">
                {Object.keys(documentTemplates).map(template => (
                  <button
                    key={template}
                    onClick={() => applyTemplate(template as keyof typeof documentTemplates)}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded"
                  >
                    {template}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}


        {/* Main content area */}
        <div className={`grid ${state.isSplitView ? 'grid-cols-2' : 'grid-cols-1'} gap-4`}>
          {/* Table of Contents */}
          {state.showTOC && (
            <div className="col-span-2 mb-4 p-4 bg-white rounded-lg shadow-sm">
              <h2 className="text-lg font-bold mb-2">Table of Contents</h2>
              <ul className="list-disc list-inside">
                {toc.map((item, index) => (
                  <li
                    key={index}
                    className="ml-4 hover:text-blue-500 cursor-pointer"
                    style={{ marginLeft: `${item.level * 1}rem` }}
                    onClick={() => {
                      const element = document.getElementById(item.id);
                      element?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    {item.text}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Editor */}
          {(!state.isSplitView || state.isMobilePreview) ? null : (
            <div className="w-full">
              <textarea
                ref={editorRef}
                className={`editor-textarea w-full p-4 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-opacity-50 
                  ${state.theme.bgColor === 'bg-gray-900' ? 'bg-gray-800 text-white' : 'bg-white'}
                  ${state.focusMode ? 'focus:ring-4 focus:ring-blue-500 focus:bg-gray-50' : ''}
                  transition-all duration-200`}
                value={state.content}
                onChange={(e) => setState(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Start typing your markdown here..."
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                style={{
                  height: state.focusMode ? '100vh' : 'calc(100vh - 12rem)',
                }}
              />
            </div>
          )}
          
          {/* Preview */}
          <div className={`${state.isMobilePreview ? 'mobile-preview' : 'w-full'}`}>
            <div 
              className={`prose ${viewModes.find(v => v.name.toLowerCase() === state.viewMode)?.className} 
                p-4 rounded-lg shadow-sm overflow-auto
                ${state.theme.bgColor === 'bg-gray-900' ? 'bg-gray-800 prose-invert' : 'bg-white'}`}
              style={{ 
                height: state.focusMode ? '100vh' : 'calc(100vh - 12rem)',
                ...(state.viewMode === 'portfolio' && {
                  background: 'linear-gradient(to right, #f8f9fa, #ffffff)',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                  padding: '2rem'
                })
              }}
            >
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw, rehypeHighlight]}
              >
                {state.content}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Editor;

