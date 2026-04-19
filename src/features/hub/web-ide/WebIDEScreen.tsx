import React, { useState } from 'react';
import { 
  FileCode, 
  FileJson, 
  FileText, 
  Folder, 
  ChevronRight, 
  ChevronDown, 
  Play, 
  Save, 
  Terminal as TerminalIcon, 
  Search, 
  Settings, 
  X,
  Plus,
  MoreVertical,
  Github,
  ArrowLeft,
  Layout,
  Maximize2,
  RefreshCw,
  Code2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';

interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  language?: string;
  content?: string;
  isOpen?: boolean;
  children?: FileNode[];
}

const initialFiles: FileNode[] = [
  {
    id: 'root',
    name: 'gx-chat-project',
    type: 'folder',
    isOpen: true,
    children: [
      {
        id: 'src',
        name: 'src',
        type: 'folder',
        isOpen: true,
        children: [
          { id: 'app-tsx', name: 'App.tsx', type: 'file', language: 'typescript', content: 'import React from "react";\n\nexport default function App() {\n  return (\n    <div className="p-4">\n      <h1>Hello GrixChat!</h1>\n    </div>\n  );\n}' },
          { id: 'index-css', name: 'index.css', type: 'file', language: 'css', content: '@tailwind base;\n@tailwind components;\n@tailwind utilities;' },
        ]
      },
      { id: 'package-json', name: 'package.json', type: 'file', language: 'json', content: '{\n  "name": "gx-chat",\n  "version": "1.0.0",\n  "dependencies": {\n    "react": "^18.2.0"\n  }\n}' },
      { id: 'readme-md', name: 'README.md', type: 'file', language: 'markdown', content: '# GrixChat Project\n\nThis is a high-performance messaging app.' },
    ]
  }
];

export default function WebIDEScreen() {
  const navigate = useNavigate();
  const [files, setFiles] = useState<FileNode[]>(initialFiles);
  const [activeFileId, setActiveFileId] = useState<string>('app-tsx');
  const [openFiles, setOpenFiles] = useState<string[]>(['app-tsx', 'readme-md']);
  const [terminalOutput, setTerminalOutput] = useState<string[]>([
    'Welcome to GrixChat Web IDE v1.0.0',
    'Type "help" for a list of commands.',
    '$ npm run dev'
  ]);
  const [isTerminalOpen, setIsTerminalOpen] = useState(true);

  const findFile = (nodes: FileNode[], id: string): FileNode | undefined => {
    for (const node of nodes) {
      if (node.id === id) return node;
      if (node.children) {
        const found = findFile(node.children, id);
        if (found) return found;
      }
    }
    return undefined;
  };

  const activeFile = findFile(files, activeFileId);

  const toggleFolder = (id: string) => {
    const updateNodes = (nodes: FileNode[]): FileNode[] => {
      return nodes.map(node => {
        if (node.id === id) return { ...node, isOpen: !node.isOpen };
        if (node.children) return { ...node, children: updateNodes(node.children) };
        return node;
      });
    };
    setFiles(updateNodes(files));
  };

  const openFile = (id: string) => {
    const file = findFile(files, id);
    if (file && file.type === 'file') {
      setActiveFileId(id);
      if (!openFiles.includes(id)) {
        setOpenFiles([...openFiles, id]);
      }
    }
  };

  const closeFile = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const newOpenFiles = openFiles.filter(fid => fid !== id);
    setOpenFiles(newOpenFiles);
    if (activeFileId === id && newOpenFiles.length > 0) {
      setActiveFileId(newOpenFiles[newOpenFiles.length - 1]);
    }
  };

  const renderTree = (nodes: FileNode[], depth = 0) => {
    return nodes.map(node => (
      <div key={node.id}>
        <div 
          onClick={() => node.type === 'folder' ? toggleFolder(node.id) : openFile(node.id)}
          className={`
            flex items-center gap-2 px-4 py-1.5 cursor-pointer hover:bg-white/5 transition-colors
            ${activeFileId === node.id ? 'bg-emerald-500/20 text-emerald-400 border-r-2 border-emerald-500' : 'text-zinc-400'}
          `}
          style={{ paddingLeft: `${depth * 16 + 16}px` }}
        >
          {node.type === 'folder' ? (
            <>
              {node.isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              <Folder size={16} className="text-amber-400" />
            </>
          ) : (
            <>
              <div className="w-3.5" />
              {node.name.endsWith('.tsx') ? <FileCode size={16} className="text-sky-400" /> :
               node.name.endsWith('.json') ? <FileJson size={16} className="text-amber-300" /> :
               <FileText size={16} className="text-zinc-300" />}
            </>
          )}
          <span className="text-[13px] font-medium truncate">{node.name}</span>
        </div>
        {node.type === 'folder' && node.isOpen && node.children && (
          <div>{renderTree(node.children, depth + 1)}</div>
        )}
      </div>
    ));
  };

  return (
    <div className="h-full flex flex-col bg-[#1e1e1e] text-zinc-300 font-sans overflow-hidden">
      {/* IDE Header */}
      <div className="h-12 shrink-0 bg-[#252526] flex items-center justify-between px-4 border-b border-white/5">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-emerald-600 rounded flex items-center justify-center text-white">
              <Code2 size={14} />
            </div>
            <span className="text-sm font-bold tracking-tight">GxIDE <span className="text-zinc-500 font-normal">v1.0</span></span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button className="flex items-center gap-2 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-colors shadow-lg shadow-emerald-900/20">
            <Play size={14} />
            <span>RUN</span>
          </button>
          <button className="p-2 hover:bg-white/5 rounded-lg transition-colors text-zinc-400">
            <Save size={18} />
          </button>
          <button className="p-2 hover:bg-white/5 rounded-lg transition-colors text-zinc-400">
            <Github size={18} />
          </button>
          <div className="w-[1px] h-4 bg-white/10 mx-1" />
          <button className="p-2 hover:bg-white/5 rounded-lg transition-colors text-zinc-400">
            <Settings size={18} />
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 shrink-0 bg-[#252526] border-r border-white/5 flex flex-col">
          <div className="p-4 flex items-center justify-between">
            <span className="text-[11px] font-black text-zinc-500 uppercase tracking-widest">Explorer</span>
            <div className="flex items-center gap-1">
              <button className="p-1 hover:bg-white/5 rounded transition-colors"><Plus size={14} /></button>
              <button className="p-1 hover:bg-white/5 rounded transition-colors"><Folder size={14} /></button>
              <button className="p-1 hover:bg-white/5 rounded transition-colors"><RefreshCw size={14} /></button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto no-scrollbar">
            {renderTree(files)}
          </div>
        </div>

        {/* Editor Area */}
        <div className="flex-1 flex flex-col overflow-hidden bg-[#1e1e1e]">
          {/* Tabs */}
          <div className="h-10 shrink-0 bg-[#252526] flex items-center overflow-x-auto no-scrollbar">
            {openFiles.map(fid => {
              const f = findFile(files, fid);
              return (
                <div 
                  key={fid}
                  onClick={() => setActiveFileId(fid)}
                  className={`
                    h-full flex items-center gap-2 px-4 border-r border-white/5 cursor-pointer transition-colors min-w-[120px]
                    ${activeFileId === fid ? 'bg-[#1e1e1e] text-emerald-400 border-t-2 border-t-emerald-500' : 'text-zinc-500 hover:bg-white/5'}
                  `}
                >
                  <FileCode size={14} />
                  <span className="text-xs font-medium truncate">{f?.name}</span>
                  <button 
                    onClick={(e) => closeFile(e, fid)}
                    className="p-0.5 hover:bg-white/10 rounded transition-colors ml-auto opacity-0 group-hover:opacity-100"
                  >
                    <X size={12} />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Code Editor */}
          <div className="flex-1 relative overflow-hidden flex">
            {/* Line Numbers */}
            <div className="w-12 bg-[#1e1e1e] border-r border-white/5 flex flex-col items-end px-3 py-4 text-[12px] font-mono text-zinc-600 select-none">
              {Array.from({ length: 20 }).map((_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>
            {/* Content */}
            <div className="flex-1 p-4 font-mono text-[13px] overflow-auto no-scrollbar">
              <pre className="text-zinc-300">
                {activeFile?.content?.split('\n').map((line, i) => (
                  <div key={i} className="hover:bg-white/5 px-2 -mx-2 rounded transition-colors">
                    <span className="text-emerald-400">{line.includes('import') ? 'import' : ''}</span>
                    <span className="text-sky-400">{line.includes('export') ? ' export default' : ''}</span>
                    <span className="text-amber-300">{line.includes('function') ? ' function' : ''}</span>
                    {line.replace('import', '').replace('export default', '').replace('function', '')}
                  </div>
                ))}
              </pre>
            </div>
          </div>

          {/* Terminal */}
          <AnimatePresence>
            {isTerminalOpen && (
              <motion.div 
                initial={{ height: 0 }}
                animate={{ height: 180 }}
                exit={{ height: 0 }}
                className="shrink-0 bg-[#1e1e1e] border-t border-white/10 flex flex-col overflow-hidden"
              >
                <div className="h-8 bg-[#252526] flex items-center justify-between px-4 border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <TerminalIcon size={14} className="text-emerald-400" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Terminal</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-1 hover:bg-white/5 rounded transition-colors"><Maximize2 size={12} /></button>
                    <button onClick={() => setIsTerminalOpen(false)} className="p-1 hover:bg-white/5 rounded transition-colors"><X size={12} /></button>
                  </div>
                </div>
                <div className="flex-1 p-4 font-mono text-[12px] overflow-y-auto no-scrollbar space-y-1">
                  {terminalOutput.map((line, i) => (
                    <div key={i} className={line.startsWith('$') ? 'text-emerald-400' : 'text-zinc-400'}>
                      {line}
                    </div>
                  ))}
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400">$</span>
                    <input 
                      type="text" 
                      className="flex-1 bg-transparent border-none outline-none text-zinc-300"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const val = e.currentTarget.value;
                          setTerminalOutput([...terminalOutput, `$ ${val}`, `Command "${val}" not found.`]);
                          e.currentTarget.value = '';
                        }
                      }}
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Status Bar */}
      <div className="h-6 shrink-0 bg-emerald-600 text-white flex items-center justify-between px-4 text-[10px] font-bold uppercase tracking-wider">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <Layout size={12} />
            <span>Main</span>
          </div>
          <div className="flex items-center gap-1">
            <RefreshCw size={12} />
            <span>Syncing...</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span>UTF-8</span>
          <span>TypeScript JSX</span>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            <span>Live</span>
          </div>
        </div>
      </div>
    </div>
  );
}
