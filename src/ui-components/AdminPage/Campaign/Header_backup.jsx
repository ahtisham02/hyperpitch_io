import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { DndContext, DragOverlay, useDraggable, useDroppable, rectIntersection } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSensors, useSensor, PointerSensor, KeyboardSensor } from '@dnd-kit/core';

// API imports
import apiRequest from '../../../utils/apiRequestAI';

// Corrected LucideIcons imports: Import specific icons by name
import {
  Monitor, Laptop, Tablet, Smartphone, // For DEVICE_FRAMES_CONFIG
  Type, FileText, Square, Image, Minus, Menu, Box, // For elementIcons (used in palette)
  PlusSquare, Layers, Sparkles, Plus, Edit, Trash, ChevronDown, Search, ArrowLeft, Undo, Redo, X, CornerDownLeft, Layout, Check, Maximize2, Pointer, Hand, MessageSquare // For other UI elements
} from 'lucide-react';

// Define missing configurations and functions directly in the file
const generateId = (prefix = "id") => `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

const DEVICE_FRAMES_CONFIG = [
  { name: "Desktop", width: 1440, icon: Monitor },
  { name: "Laptop", width: 1024, icon: Laptop },
  { name: "Tablet", width: 820, icon: Tablet },
  { name: "Mobile", width: 375, icon: Smartphone }
];

const AVAILABLE_ELEMENTS_CONFIG = [
  { id: "header", name: "Header", component: "HeaderElement", category: 'Content', defaultProps: { text: "New Header", sizeClass: "text-2xl", fontWeight: "font-bold", textAlign: "text-left", textColor: "#0f172a" } },
  { id: "textBlock", name: "Text Block", component: "TextBlockElement", category: 'Content', defaultProps: { text: "New text block", sizeClass: "text-base", fontWeight: "font-normal", textAlign: "text-left", textColor: "#334155" } },
  { id: "button", name: "Button", component: "ButtonElement", category: 'Interactive', defaultProps: { buttonText: "Click me", link: "#", backgroundColor: "#16a34a", textColor: "#ffffff", borderRadius: "6px", textAlign: "text-center", variant: "solid", fullWidth: false } },
  { id: "image", name: "Image", component: "ImageElement", category: 'Media', defaultProps: { src: "https://placehold.co/600x400/e2e8f0/64748b?text=Image", alt: "Image description", borderRadius: "8px" } },
  { id: "divider", name: "Divider", component: "DividerElement", category: 'Layout', defaultProps: { height: "1px", backgroundColor: "#e2e8f0" } },
  { id: "spacer", name: "Spacer", component: "SpacerElement", category: 'Layout', defaultProps: { height: "20px" } },
  { id: "navbar", name: "Navigation", component: "NavbarElement", category: 'Global', isGlobalOnly: true, defaultProps: { logoText: "SiteName", links: [{ id: "link-1", text: "Home", url: "#" }, { id: "link-2", text: "About", url: "#" }], backgroundColor: "#FFFFFF", linkColor: "#16a34a" } },
  { id: "footer", name: "Footer", component: "FooterElement", category: 'Global', isGlobalOnly: true, defaultProps: { text: `© ${new Date().getFullYear()} Your Company.`, links: [{ id: "link-3", text: "Privacy", url: "#" }], backgroundColor: "#0f172a", textColor: "#94a3b8", linkColor: "#ffffff" } }
];

const elementIcons = {
  header: Type,
  textBlock: FileText,
  button: Square,
  image: Image,
  divider: Minus,
  spacer: Square,
  navbar: Menu,
  footer: FileText,
  default: Box
};

const getDefaultProps = (id) => ({ ...(AVAILABLE_ELEMENTS_CONFIG.find(c => c.id === id)?.defaultProps || {}), style: {} });

// Predefined structure layouts
const PREDEFINED_STRUCTURES = [
  { id: 'single', name: 'Single Column', layout: [{ width: '100%' }] },
  { id: 'two-col', name: 'Two Columns', layout: [{ width: '50%' }, { width: '50%' }] },
  { id: 'three-col', name: 'Three Columns', layout: [{ width: '33.33%' }, { width: '33.33%' }, { width: '33.33%' }] },
  { id: 'sidebar', name: 'Sidebar', layout: [{ width: '25%' }, { width: '75%' }] },
  { id: 'hero', name: 'Hero Section', layout: [{ width: '100%' }] },
  { id: 'footer', name: 'Footer', layout: [{ width: '100%' }] }
];

// PagePreviewRenderer component
const PagePreviewRenderer = ({ pageLayout, globalNavbar, globalFooter, onNavigate, activePageId }) => (
  <div className="p-4">
    <div className="text-sm font-medium text-slate-700 mb-4">Page Preview</div>
    {/* This component needs to actually render the layout based on pageLayout */}
    {/* For now, just a placeholder */}
    <div className="border border-dashed border-slate-300 p-8 text-center text-slate-500 mb-4">
      <p>Page preview content will appear here.</p>
    </div>
    {globalNavbar && (
      <div className="mb-4 p-3 bg-slate-50 border border-slate-200 rounded-lg">
        <div className="text-sm font-medium text-slate-700">Navigation Bar</div>
        <div className="text-xs text-slate-500">{globalNavbar.props?.logoText || 'SiteName'}</div>
      </div>
    )}
    {pageLayout && pageLayout.length > 0 ? (
      <div className="space-y-4">
        {pageLayout.map((section, index) => (
          <div key={section.id || index} className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <div className="text-sm font-medium text-slate-700">Section {index + 1}</div>
            <div className="text-xs text-slate-500">Section content would render here</div>
          </div>
        ))}
      </div>
    ) : (
      <div className="text-center text-slate-500 py-8">
        <p>No sections added yet</p>
      </div>
    )}
    {globalFooter && (
      <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-lg">
        <div className="text-sm font-medium text-slate-700">Footer</div>
        <div className="text-xs text-slate-500">{globalFooter.props?.text || '© Company'}</div>
      </div>
    )}
  </div>
);

// Export PagePreviewRenderer for use in other components
export { PagePreviewRenderer };

// TopBar component
const TopBar = ({ onTogglePreview, isPreviewMode, onToggleLeftPanel, onToggleRightPanel, isLeftPanelOpen, isRightPanelOpen, onToggleFullscreen, isFullscreen }) => (
  <header className="flex items-center justify-between p-4 bg-white border-b border-slate-200 print-hidden">
    <div className="flex items-center gap-4">
      <button onClick={onToggleLeftPanel} className={`p-2 rounded-lg transition-colors ${isLeftPanelOpen ? 'bg-green-100 text-green-600' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'}`}>
        <Menu className="w-5 h-5" />
      </button>
      <h1 className="text-lg font-bold text-slate-800">Template Editor</h1>
    </div>
    <div className="flex items-center gap-4">
      <button onClick={onToggleRightPanel} className={`p-2 rounded-lg transition-colors ${isRightPanelOpen ? 'bg-green-100 text-green-600' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'}`}>
        <Layers className="w-5 h-5" />
      </button>
      <button onClick={onTogglePreview} className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors">
        {isPreviewMode ? "Exit Preview" : "Preview"}
      </button>
      <button onClick={onToggleFullscreen} className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors">
        {isFullscreen ? <X className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
      </button>
    </div>
  </header>
);




// CanvasToolbar component
const CanvasToolbar = ({ selectedItem, zoom, onZoomChange, onSelect, pages, activeTool, onToolChange }) => (
  <div className="p-3 bg-white flex items-center justify-between print-hidden">
    <div className="flex items-center gap-4">
      <h2 className="text-sm font-medium text-slate-700">Canvas</h2>
      <div className="flex items-center gap-2">
        <button 
          onClick={() => onToolChange('select')} 
          className={`p-2 rounded-lg ${activeTool === 'select' ? 'bg-green-100 text-green-600' : 'text-slate-500 hover:bg-slate-100'}`}
          title="Select (V)"
        >
          <Pointer className="w-4 h-4" />
        </button>
        <button 
          onClick={() => onToolChange('hand')} 
          className={`p-2 rounded-lg ${activeTool === 'hand' ? 'bg-green-100 text-green-600' : 'text-slate-500 hover:bg-slate-100'}`}
          title="Hand (H)"
        >
          <Hand className="w-4 h-4" />
        </button>
        <button 
          onClick={() => onToolChange('comment')} 
          className={`p-2 rounded-lg ${activeTool === 'comment' ? 'bg-green-100 text-green-600' : 'text-slate-500 hover:bg-slate-100'}`}
          title="Comment (C)"
        >
          <MessageSquare className="w-4 h-4" />
        </button>
      </div>
    </div>
    <div className="flex items-center gap-3">
      <span className="text-sm text-slate-600">Zoom: {Math.round(zoom * 100)}%</span>
      <input
        type="range"
        min="0.1"
        max="2"
        step="0.05"
        value={zoom}
        onChange={(e) => onZoomChange(parseFloat(e.target.value))}
        className="custom-slider w-32"
      />
      <button onClick={() => onZoomChange(1)} className="px-3 py-1 bg-slate-100 text-slate-700 text-sm rounded-md hover:bg-slate-200 transition-colors">Reset</button>
    </div>
  </div>
);




// RightSidebar component
const RightSidebar = ({ selectedItemData, onUpdateSelectedProps, pages, activePageId, onRenamePage, onAddGlobalElement, comments, onUpdateComment, onDeleteComment, isOpen, onClose }) => (
  <aside className={`absolute top-0 right-0 h-full w-80 bg-white border-l border-slate-200 shadow-xl flex-shrink-0 flex flex-col print-hidden transition-transform duration-300 ease-in-out z-40 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
    <div className="flex justify-between items-center p-4 border-b border-slate-200 h-[56px] bg-gradient-to-r from-slate-50 to-white">
      <h2 className="text-lg font-bold text-slate-800">Properties</h2>
      <button onClick={onClose} className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors">
        <X className="w-4 h-4"/>
      </button>
    </div>
    <div className="flex-1 overflow-y-auto p-4 pb-20">
    {/* Placeholder for actual property controls based on selectedItemData */}
    {selectedItemData ? (
      <div className="mt-4">
        <h3 className="font-semibold text-slate-800">{selectedItemData.type === 'page' ? 'Page Settings' : `Properties: ${selectedItemData.type}`}</h3>
        {/* Render property editor based on selectedItemData */}
        {selectedItemData.type === 'page' && (
          <div className="mt-3">
            <label className="block text-xs font-medium text-slate-600 mb-1">Page Name</label>
            <input 
              type="text" 
              value={pages[activePageId]?.name || ''} 
              onChange={(e) => onRenamePage(activePageId, e.target.value, true)} // Add a flag to indicate immediate update
              className="w-full p-2 border border-slate-300 rounded-md text-sm"
            />
          </div>
        )}
        {/* Placeholder for element-specific properties */}
        {selectedItemData.type !== 'page' && (
          <div className="mt-3">
            <p className="text-sm text-slate-500">No editable properties for this element type yet.</p>
          </div>
        )}

        {/* Global element additions */}
        {selectedItemData.type === 'page' && !selectedItemData.id && ( // When nothing specific is selected on page
          <div className="mt-4 border-t pt-4 border-slate-200">
            <h4 className="font-semibold text-slate-700 mb-2">Global Elements</h4>
            <div className="flex flex-col gap-2">
              <button onClick={() => onAddGlobalElement('navbar')} className="px-3 py-2 bg-green-500 text-white rounded-md text-sm hover:bg-green-600 transition-colors">Add Navbar</button>
              <button onClick={() => onAddGlobalElement('footer')} className="px-3 py-2 bg-green-500 text-white rounded-md text-sm hover:bg-green-600 transition-colors">Add Footer</button>
            </div>
          </div>
        )}
        
        {/* Navbar Background Color Control */}
        {selectedItemData.type === 'globalElement' && selectedItemData.path === 'globalNavbar' && (
          <div className="mt-4 border-t pt-4 border-slate-200">
            <h4 className="font-semibold text-slate-700 mb-2">Navbar Background Color</h4>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => onUpdateSelectedProps('globalNavbar', { backgroundColor: '#ffffff' })} className="w-8 h-8 bg-white border-2 border-slate-300 rounded-md hover:scale-110 transition-transform" title="White"></button>
              <button onClick={() => onUpdateSelectedProps('globalNavbar', { backgroundColor: '#f8fafc' })} className="w-8 h-8 bg-slate-50 border-2 border-slate-300 rounded-md hover:scale-110 transition-transform" title="Light Gray"></button>
              <button onClick={() => onUpdateSelectedProps('globalNavbar', { backgroundColor: '#1e293b' })} className="w-8 h-8 bg-slate-800 border-2 border-slate-300 rounded-md hover:scale-110 transition-transform" title="Dark Gray"></button>
              <button onClick={() => onUpdateSelectedProps('globalNavbar', { backgroundColor: '#16a34a' })} className="w-8 h-8 bg-green-600 border-2 border-slate-300 rounded-md hover:scale-110 transition-transform" title="Green"></button>
              <button onClick={() => onUpdateSelectedProps('globalNavbar', { backgroundColor: '#3b82f6' })} className="w-8 h-8 bg-blue-500 border-2 border-slate-300 rounded-md hover:scale-110 transition-transform" title="Blue"></button>
            </div>
          </div>
        )}
        
        {/* Footer Background Color Control */}
        {selectedItemData.type === 'globalElement' && selectedItemData.path === 'globalFooter' && (
          <div className="mt-4 border-t pt-4 border-slate-200">
            <h4 className="font-semibold text-slate-700 mb-2">Footer Background Color</h4>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => onUpdateSelectedProps('globalFooter', { backgroundColor: '#ffffff' })} className="w-8 h-8 bg-white border-2 border-slate-300 rounded-md hover:scale-110 transition-transform" title="White"></button>
              <button onClick={() => onUpdateSelectedProps('globalFooter', { backgroundColor: '#f8fafc' })} className="w-8 h-8 bg-slate-50 border-2 border-slate-300 rounded-md hover:scale-110 transition-transform" title="Light Gray"></button>
              <button onClick={() => onUpdateSelectedProps('globalFooter', { backgroundColor: '#1e293b' })} className="w-8 h-8 bg-slate-800 border-2 border-slate-300 rounded-md hover:scale-110 transition-transform" title="Dark Gray"></button>
              <button onClick={() => onUpdateSelectedProps('globalFooter', { backgroundColor: '#16a34a' })} className="w-8 h-8 bg-green-600 border-2 border-slate-300 rounded-md hover:scale-110 transition-transform" title="Green"></button>
              <button onClick={() => onUpdateSelectedProps('globalFooter', { backgroundColor: '#3b82f6' })} className="w-8 h-8 bg-blue-500 border-2 border-slate-300 rounded-md hover:scale-110 transition-transform" title="Blue"></button>
            </div>
          </div>
        )}
      </div>
    ) : (
      <p className="mt-4 text-sm text-slate-500">Select an element on the canvas to edit its properties.</p>
    )}

    {/* Comments section */}
    <div className="mt-6 border-t pt-4 border-slate-200">
      <h3 className="font-semibold text-slate-800 mb-3">Comments ({comments.length})</h3>
      {comments.length === 0 && <p className="text-sm text-slate-500">No comments for this page/device yet.</p>}
      <div className="space-y-3">
        {comments.map((comment, index) => (
          <div key={comment.id} className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-semibold text-slate-700">Comment {index + 1}</span>
              <button onClick={() => onDeleteComment(activePageId, comment.id)} className="p-1 rounded-full hover:bg-slate-200 text-slate-400 hover:text-red-500 transition-colors">
                <X className="w-3 h-3" />
              </button>
            </div>
            <textarea 
              value={comment.text} 
              onChange={(e) => onUpdateComment(activePageId, comment.id, e.target.value)} 
              className="w-full text-sm p-2 border border-slate-300 rounded-md resize-y min-h-[60px]"
            />
          </div>
        ))}
      </div>
    </div>
    </div>
  </aside>
);

// ElementPaletteItem component
const ElementPaletteItem = ({ config }) => {
  const { attributes, listeners, setNodeRef, isDragging, transform } = useDraggable({
    id: `palette-${config.id}`,
    data: { type: "paletteItem", config }
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: 9999,
    opacity: isDragging ? 0.95 : 1
  } : {};

  // Direct use of icon component from the map
  const IconComponent = elementIcons[config.id] || elementIcons.default;

  if (isDragging) {
    return (
      <div ref={setNodeRef} style={style} className="flex items-center gap-2.5 p-2.5 text-left bg-green-100 rounded-lg shadow-xl ring-2 ring-green-400 opacity-95">
        <div className="flex items-center justify-center text-green-600"><IconComponent className="w-6 h-6" /></div>
        <span className="text-xs font-semibold text-green-800">{config.name}</span>
      </div>
    );
  }

  return (
    <div ref={setNodeRef} {...listeners} {...attributes} style={style} className="flex items-center gap-3 p-3 text-left bg-white border border-slate-200 rounded-lg cursor-grab hover:bg-slate-50 hover:border-slate-300 hover:shadow-md transition-all duration-200 group focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-green-500">
      <div className="text-slate-500 group-hover:text-green-600 transition-colors"><IconComponent className="w-5 h-5" /></div>
      <span className="text-sm font-medium text-slate-700 group-hover:text-slate-800">{config.name}</span>
    </div>
  );
};

// PaletteItemDragOverlay component
const PaletteItemDragOverlay = ({ config }) => {
  const IconComponent = elementIcons[config.id] || elementIcons.default;
  return (
    <div className="flex items-center p-2.5 text-left bg-green-100 rounded-lg shadow-2xl ring-2 ring-green-500 opacity-95 cursor-grabbing">
      <div className="w-6 h-6 flex items-center justify-center text-green-600 mr-2"><IconComponent className="w-5 h-5" /></div>
      <span className="text-xs font-semibold text-green-800">{config.name}</span>
    </div>
  );
};

// Modal components
const GeneralModal = ({ isOpen, onClose, title, size, children }) => isOpen ? (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div className={`bg-white p-6 rounded-lg ${size === 'xl' ? 'max-w-4xl' : 'max-w-2xl'} w-full mx-auto`}>
      <div className="flex justify-between items-center mb-4 border-b pb-3 -mx-6 px-6">
        <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
        <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="modal-content">
        {children}
      </div>
    </div>
  </div>
) : null;

const InputModal = ({ isOpen, onClose, onSubmit, title, inputLabel, initialValue }) => {
  const [value, setValue] = useState(initialValue || '');

  useEffect(() => {
    setValue(initialValue || '');
  }, [initialValue]);

  const handleSubmit = () => {
    onSubmit(value);
    setValue('');
  };

  return isOpen ? (
    <GeneralModal isOpen={isOpen} onClose={onClose} title={title}>
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-full p-2.5 border border-slate-300 rounded-md mb-4 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
        placeholder={inputLabel}
      />
      <div className="flex gap-2 justify-end">
        <button onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-700 rounded-md hover:bg-slate-300 transition-colors">Cancel</button>
        <button onClick={handleSubmit} className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors">Submit</button>
      </div>
    </GeneralModal>
  ) : null;
};

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, confirmText, confirmButtonVariant }) => isOpen ? (
  <GeneralModal isOpen={isOpen} onClose={onClose} title={title}>
    <p className="mb-4 text-sm text-slate-700">{message}</p>
    <div className="flex gap-2 justify-end">
      <button onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-700 rounded-md hover:bg-slate-300 transition-colors">Cancel</button>
      <button
        onClick={onConfirm}
        className={`px-4 py-2 ${confirmButtonVariant === 'danger' ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'} text-white rounded-md transition-colors`}
      >
        {confirmText || 'Confirm'}
      </button>
    </div>
  </GeneralModal>
) : null;

// StructureSelectorModal component
const StructureSelectorModal = ({ isOpen, onClose, onSelectStructure, context }) => {
  if (!isOpen) return null;
  return (
    <GeneralModal isOpen={isOpen} onClose={onClose} title="Select a Structure" size="xl">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-5 pt-2">
        {PREDEFINED_STRUCTURES.map((s) => (
          <button 
            key={s.id} 
            onClick={() => { 
              onSelectStructure(s.layout, context); 
              onClose(); 
            }} 
            className="p-3 bg-slate-50 rounded-xl hover:bg-white hover:ring-2 hover:ring-green-500 hover:shadow-lg hover:scale-[1.03] transition-all duration-200 flex flex-col items-center justify-start group focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
          >
            <div className="flex w-full h-24 mb-3 space-x-2 items-stretch p-2 bg-white ring-1 ring-slate-200 rounded-lg shadow-inner">
              {s.layout.map((col, idx) => (
                <div key={idx} className="bg-slate-200 border border-slate-300 group-hover:bg-green-200/60 group-hover:border-green-300 rounded-md transition-colors" style={{ flexBasis: col.width }}></div>
              ))}
            </div>
            <span className="text-sm text-slate-700 group-hover:text-green-800 text-center font-semibold">{s.name}</span>
          </button>
        ))}
      </div>
    </GeneralModal>
  );
};

// SectionComponent placeholder (simplified)
const SectionComponent = ({ pageId, sectionData, sectionIndex, onUpdateProps, onDelete, onSelect, selectedItemId, onOpenStructureModal, isPreviewMode, onNavigate, isDraggable }) => {
  // A section could contain other elements. For simplicity, we'll just show its ID and a placeholder
  const isSelected = selectedItemId === sectionData.id;

  return (
    <div
      onClick={() => onSelect(sectionData.id, 'section', `layout[${sectionIndex}]`)}
      className={`relative p-4 bg-white border border-slate-200 rounded-lg mb-4 cursor-pointer ${isSelected ? 'selected-outline' : 'hover:border-green-400'}`}
    >
      <div className="text-sm font-medium text-slate-700 mb-2">Section {sectionIndex + 1} (ID: {sectionData.id})</div>
      <div className="text-xs text-slate-500">
        This is a placeholder for section content.
        {sectionData.type === 'section' && sectionData.layout && sectionData.layout.map((col, colIndex) => (
            <div key={colIndex} className="bg-slate-100 border border-slate-200 p-2 my-1 rounded">
                Column {colIndex + 1} ({col.width})
            </div>
        ))}
        {/* Render elements within this section if sectionData had nested elements */}
      </div>
      {!isPreviewMode && isSelected && (
        <div className="absolute top-2 right-2 flex gap-1">
          <button onClick={(e) => { e.stopPropagation(); onOpenStructureModal(`layout[${sectionIndex}]`, "section", pageId); }} className="p-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600">
            <Layout className="w-4 h-4" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); onDelete(`layout[${sectionIndex}]`); }} className="p-1 rounded-full bg-red-100 hover:bg-red-200 text-red-600">
            <Trash className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};


// NavbarElement and FooterElement placeholders
const NavbarElement = (props) => (
  <div className={`p-3 border-b border-slate-200 bg-white ${props.isSelected ? 'selected-outline' : ''}`}
    onClick={props.onSelect ? props.onSelect : undefined}
  >
    <div className="flex justify-between items-center text-sm font-medium text-slate-700">
      <span>Navigation Bar (Logo: {props.logoText || 'SiteName'})</span>
      {props.onDelete && !props.isPreviewMode && (
        <button onClick={(e) => { e.stopPropagation(); props.onDelete(); }} className="p-1 rounded-full bg-red-100 hover:bg-red-200 text-red-600">
          <X className="w-3 h-3" />
        </button>
      )}
    </div>
  </div>
);

const FooterElement = (props) => (
  <div className={`p-3 border-t border-slate-200 bg-white ${props.isSelected ? 'selected-outline' : ''}`}
    onClick={props.onSelect ? props.onSelect : undefined}
  >
    <div className="flex justify-between items-center text-sm font-medium text-slate-700">
      <span>Footer ({props.text || '© Company'})</span>
      {props.onDelete && !props.isPreviewMode && (
        <button onClick={(e) => { e.stopPropagation(); props.onDelete(); }} className="p-1 rounded-full bg-red-100 hover:bg-red-200 text-red-600">
          <X className="w-3 h-3" />
        </button>
      )}
    </div>
  </div>
);

// DeviceFrame component for rendering device previews
const DeviceFrame = ({ device, page, globalNavbar, globalFooter, onUpdateProps, onDelete, onSelect, selectedItemId, onOpenStructureModal, isPreviewMode, onNavigate, onDeleteGlobalElement, isDraggable, comments, onAddComment, activeTool }) => {
  const { setNodeRef: setPageDroppableRef, isOver } = useDroppable({
    id: `page-droppable-${page.id}-${device.name}`,
    data: { type: "page", accepts: ["paletteItem", "section"], pageId: page.id },
    disabled: isPreviewMode || !isDraggable
  });

  const sectionIds = useMemo(() => page.layout.map((sec) => sec.id), [page.layout]);
  const handleCommentOverlayClick = (e) => {
    e.stopPropagation();
    onAddComment(page.id, device.name, { x: e.clientX, y: e.clientY });
  };

  const containerStyle = {
    width: device.width,
    // Using containerType 'inline-size' requires specific CSS support which might not be broadly applied here
    // For visual sizing, setting width is usually enough in this context.
  };

  // Get the icon component directly
  const DeviceIcon = device.icon;

  return (
    <div className="flex flex-col gap-6 items-center flex-shrink-0">
      <h3 className="text-white/90 font-medium px-4 py-2 bg-black/10 backdrop-blur-sm rounded-full flex items-center gap-2 text-sm border border-white/20">
        <DeviceIcon className="w-4 h-4" /> {/* Use DeviceIcon as a component */}
        {device.name}
      </h3>
      <div className="relative group">
        <div style={containerStyle} className="bg-white shadow-2xl border border-slate-200/60 flex flex-col cursor-pointer transition-all duration-200 hover:shadow-3xl hover:scale-[1.02]">
          <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300">
            {globalNavbar && (
              <header className="p-3 border-b border-slate-200/60 shadow-sm z-10 flex-shrink-0 relative bg-white/95 backdrop-blur-sm">
                <NavbarElement
                  {...globalNavbar.props}
                  path="globalNavbar"
                  isSelected={selectedItemId === globalNavbar.id}
                  onSelect={() => onSelect(globalNavbar.id, 'globalElement', 'globalNavbar')}
                  onUpdate={(p) => onUpdateProps("globalNavbar", p)}
                  onDelete={() => onDeleteGlobalElement("navbar")}
                  isDraggable={isDraggable}
                  isPreviewMode={isPreviewMode}
                  previewDevice={device.name.toLowerCase()}
                />
              </header>
            )}
            <div className="p-6 bg-slate-50/30 min-h-full">
              <SortableContext items={sectionIds} strategy={verticalListSortingStrategy} disabled={isPreviewMode || !isDraggable}>
                <div ref={setPageDroppableRef} className={`transition-all duration-200 ${isOver && isDraggable ? "bg-green-100/60 ring-2 ring-green-400/60 ring-dashed rounded-lg" : ""} ${page.layout.length === 0 && !isOver && isDraggable ? "border-2 border-dashed border-slate-300/60 min-h-[50vh] rounded-lg" : "border-transparent"}`}>
                  {page.layout.map((sec, idx) => (
                    <SectionComponent
                      key={sec.id}
                      pageId={page.id}
                      sectionData={sec}
                      sectionIndex={idx}
                      onUpdateProps={onUpdateProps}
                      onDelete={onDelete}
                      onSelect={onSelect}
                      selectedItemId={selectedItemId}
                      onOpenStructureModal={onOpenStructureModal}
                      isPreviewMode={isPreviewMode}
                      onNavigate={onNavigate}
                      isDraggable={isDraggable}
                    />
                  ))}
                  {!isPreviewMode && page.layout.length === 0 && !isOver && isDraggable && (
                    <div className="flex flex-col items-center justify-center h-full text-center py-24 select-none pointer-events-none">
                      <Layout className="h-20 w-20 text-slate-300/70 mb-4" strokeWidth={1} />
                      <p className="text-slate-500 text-lg font-medium">Your canvas is empty</p>
                      <p className="text-slate-400 text-sm">Drag elements or add a new section to get started.</p>
                    </div>
                  )}
                </div>
              </SortableContext>
            </div>
            {globalFooter && (
              <footer className="p-3 border-t border-slate-200/60 shadow-sm z-10 flex-shrink-0 relative bg-white/95 backdrop-blur-sm">
                <FooterElement
                  {...globalFooter.props}
                  path="globalFooter"
                  isSelected={selectedItemId === globalFooter.id}
                  onSelect={() => onSelect(globalFooter.id, 'globalElement', 'globalFooter')}
                  onUpdate={(p) => onUpdateProps("globalFooter", p)}
                  onDelete={() => onDeleteGlobalElement("footer")}
                  isDraggable={isDraggable}
                  isPreviewMode={isPreviewMode}
                  previewDevice={device.name.toLowerCase()}
                />
              </footer>
            )}
          </div>
        </div>
        {activeTool === 'comment' && (
          <div className="absolute inset-0 z-30 cursor-crosshair" onClick={handleCommentOverlayClick} />
        )}
        {comments.map((comment, index) => (
          <div key={comment.id} style={{ top: `${comment.position.y}px`, left: `${comment.position.x}px` }} className="absolute w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-black font-bold text-sm border-2 border-white cursor-pointer z-50 transform -translate-x-1/2 -translate-y-1/2 shadow-lg" title={comment.text}> {index + 1} </div>
        ))}
      </div>
    </div>
  );
};


// LeftPanel component
const LeftPanel = ({ isOpen, onClose, onAddTopLevelSection, pages, activePageId, onAddPage, onSelectPage, onRenamePage, onDeletePage, onAiSubmit, isAiLoading, aiChatHistory, onSwitchToAiMode, onSelect, selectedItem, aiSuggestions, handleUndo, handleRedo }) => {
  const [activeTab, setActiveTab] = useState("insert");
  const [searchTerm, setSearchTerm] = useState("");
  const [isAiMode, setIsAiMode] = useState(false);

  const categorizedElements = useMemo(() => {
    const filtered = AVAILABLE_ELEMENTS_CONFIG.filter(el => !el.isGlobalOnly && el.name.toLowerCase().includes(searchTerm.toLowerCase()));
    return filtered.reduce((acc, element) => {
      const category = element.category || 'Other';
      if (!acc[category]) acc[category] = [];
      acc[category].push(element);
      return acc;
    }, {});
  }, [searchTerm]);

  const globalElements = useMemo(() => {
    return AVAILABLE_ELEMENTS_CONFIG.filter(el => el.isGlobalOnly && el.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [searchTerm]);

  const TabButton = ({ tabName, icon, label }) => (
    <button onClick={() => setActiveTab(tabName)} className={`w-full flex-1 flex flex-col items-center justify-center gap-1.5 py-3 text-xs font-medium transition-all duration-200 border-b-2 ${activeTab === tabName ? 'border-green-500 text-green-600 bg-white shadow-sm' : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-white/80'}`}>
      {icon}
      <span>{label}</span>
    </button>
  );

  const ElementAccordion = ({ title, children, defaultOpen = true }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    return (
      <div className="border-b border-slate-200/80 last:border-b-0 pb-4 mb-4">
        <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center py-2 rounded-lg hover:bg-slate-50 transition-all duration-200 -mx-2 px-2 group">
                <h3 className="text-sm font-semibold text-slate-700 tracking-wide group-hover:text-slate-800">{title}</h3>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 group-hover:text-slate-600 ${isOpen ? 'rotate-180' : ''}`}/>
            </button>
            <div className={`grid overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100 pt-3' : 'grid-rows-[0fr] opacity-0'}`}>
                <div className="overflow-hidden">
                {children}
                </div>
            </div>
        </div>
    );
  };

  const AiModeView = ({ onBack, onAiSubmit, isAiLoading, aiChatHistory, aiSuggestions, handleUndo, handleRedo }) => {
    const handleKeyDown = (e) => {
        if(e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            onAiSubmit(e.target.value);
            e.target.value = '';
        }
    };
    return (
        <div className="p-3 flex flex-col h-full bg-white">
            <div className="flex items-center justify-between mb-3">
                <button onClick={onBack} className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-green-700 p-1 rounded-md -ml-1">
                    <ArrowLeft className="w-3.5 h-3.5" /> Back to Elements
                </button>
                <div className="flex items-center gap-1.5">
                    <button onClick={handleUndo} title="Undo" className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors">
                                                    <Undo className="w-4 h-4"/>
                    </button>
                                                      <button onClick={handleRedo} title="Redo" className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors">
                                    <Redo className="w-4 h-4"/>
                                </button>
                </div>
            </div>

            {aiSuggestions && aiSuggestions.length > 0 && (
                <div className="mb-3">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Suggestions</p>
                    <div className="flex flex-wrap gap-1.5">
                        {aiSuggestions.map((s, i) => (
                            <button key={i} onClick={() => onAiSubmit(s.prompt)} className="px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-medium rounded-md hover:bg-slate-200 transition-colors border border-slate-200">
                                {s.shortText}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {isAiLoading && <div className="py-3 text-center text-sm text-slate-500">AI is working...</div>}

            <div className="flex-1 overflow-y-auto space-y-2 min-h-0 mb-3">
                {aiChatHistory.map(entry => (
                    <div key={entry.id} className="text-xs p-2.5 rounded-lg bg-white border border-slate-200 shadow-sm">
                        <p className="font-medium text-slate-700 mb-1">{entry.prompt}</p>
                        {entry.status === 'success' && <p className="text-xs text-green-600 flex items-center gap-1"><Check className="w-3 h-3"/>✓ Success</p>}
                        {entry.status === 'error' && <p className="text-xs text-red-600">✗ Error</p>}
                    </div>
                ))}
            </div>

            <div className="relative mt-auto">
                <textarea 
                    onKeyDown={handleKeyDown} 
                    placeholder="Describe what you want to create..." 
                    className="w-full p-2.5 pr-8 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-slate-400 focus:border-slate-400 resize-none bg-white shadow-sm" 
                    rows="2" 
                />
                <CornerDownLeft className="absolute right-2.5 top-2.5 w-4 h-4 text-slate-400" />
            </div>
        </div>
    );
  };

  return (
    <aside className={`absolute top-0 left-0 h-full w-80 bg-white border-r border-slate-200 shadow-xl flex-shrink-0 flex flex-col print-hidden transition-transform duration-300 ease-in-out z-40 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex justify-between items-center p-4 border-b border-slate-200 h-[56px] bg-gradient-to-r from-slate-50 to-white">
            <h2 className="text-lg font-bold text-slate-800">Add Content</h2>
            <button onClick={onClose} className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors">
                <X className="w-4 h-4"/>
            </button>
        </div>
        <div className="flex border-b border-slate-200 bg-slate-50/50">
            <TabButton tabName="insert" icon={<PlusSquare className="w-4 h-4" />} label="Insert" />
                                    <TabButton tabName="layers" icon={<Layers className="w-4 h-4" />} label="Layers" />
                        <TabButton tabName="pages" icon={<FileText className="w-4 h-4" />} label="Pages" />
        </div>
        <div className="flex-1 overflow-y-auto bg-white pb-20 sidebar-scroll">
            {activeTab === 'insert' && isAiMode && <AiModeView onBack={() => setIsAiMode(false)} onAiSubmit={onAiSubmit} isAiLoading={isAiLoading} aiChatHistory={aiChatHistory} aiSuggestions={aiSuggestions} handleUndo={handleUndo} handleRedo={handleRedo} />}
            {activeTab === 'insert' && !isAiMode && (
                <div className="p-4 space-y-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Search elements..." 
                            value={searchTerm} 
                            onChange={e => setSearchTerm(e.target.value)} 
                            className="w-full pl-10 pr-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all shadow-sm" 
                        />
                    </div>
                    <button onClick={() => setIsAiMode(true)} className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
                        <Sparkles className="w-5 h-5 text-green-100"/>
                        <span className="text-sm">Build with AI</span>
                    </button>
                    <ElementAccordion title="Structure">
                        <div className="grid grid-cols-1 gap-3">
                            <button onClick={onAddTopLevelSection} className="w-full flex items-center justify-center gap-3 p-3 text-left bg-white border border-slate-200 rounded-lg cursor-pointer hover:bg-green-50 hover:border-green-300 hover:shadow-md transition-all group focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500">
                                <PlusSquare className="w-5 h-5 text-slate-500 group-hover:text-green-600 transition-colors" />
                                <span className="text-sm font-medium text-slate-700 group-hover:text-green-800">Add Section</span>
                            </button>
                        </div>
                    </ElementAccordion>
                    {Object.entries(categorizedElements).map(([category, elements]) => (
                        elements.length > 0 && <ElementAccordion key={category} title={category}>
                            <div className="grid grid-cols-1 gap-2">{elements.map((elConf) => (<ElementPaletteItem key={elConf.id} config={elConf} />))}</div>
                        </ElementAccordion>
                    ))}
                    {globalElements.length > 0 && (
                        <ElementAccordion title="Global">
                            <div className="grid grid-cols-1 gap-2">{globalElements.map((elConf) => (<ElementPaletteItem key={elConf.id} config={elConf} />))}</div>
                        </ElementAccordion>
                    )}
                </div>
            )}
            {activeTab === 'layers' && (
                <div className="p-4">
                    <div className="text-sm font-medium text-slate-700">Layers view</div>
                </div>
            )}
            {activeTab === 'pages' && (
                <div className="p-4">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-sm font-semibold text-slate-800">Your Pages</h3>
                        <button onClick={onAddPage} title="Add New Page" className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 transition-colors rounded-lg"><Plus className="w-4 h-4" /></button>
                    </div>
                    <ul className="space-y-2 pb-6">
                        {Object.values(pages).map((page) => (
                            <li key={page.id} className="group">
                                <button onClick={() => onSelectPage(page.id)} className={`w-full text-left px-3 py-3 text-sm transition-all duration-150 flex items-center justify-between ${activePageId === page.id ? "bg-green-600 text-white font-semibold shadow-md" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 bg-white border border-slate-200"}`}>
                                    <span className="truncate">{page.name}</span>
                                    <div className={`flex items-center transition-opacity ${activePageId === page.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                                        <button onClick={(e) => { e.stopPropagation(); onRenamePage(page.id, page.name); }} className="p-1 hover:bg-white/20 rounded transition-colors"><Edit className="w-3.5 h-3.5" /></button>
                                        <button onClick={(e) => { e.stopPropagation(); onDeletePage(page.id, page.name); }} className="p-1 hover:bg-white/20 rounded transition-colors"><Trash className="w-3.5 h-3.5" /></button>
                                    </div>
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    </aside>
  );
};

// --- MAIN PAGE COMPONENT ---
export default function ElementBuilderPage({ onExternalSave, initialBuilderState, initialData, onDataChange, isFullScreen }) {
  const [newlyAddedElementId, setNewlyAddedElementId] = useState(null);
  const initialPageId = useMemo(() => generateId("page-home"), []);
  
  // Use initialData if provided, otherwise fall back to initialBuilderState
  const effectiveInitialData = initialData || initialBuilderState;
  
  const [pages, setPages] = useState(effectiveInitialData?.pages && Object.keys(effectiveInitialData.pages).length > 0 ? effectiveInitialData.pages : { [initialPageId]: { id: initialPageId, name: "Home", layout: [] } });
  const [activePageId, setActivePageId] = useState(effectiveInitialData?.activePageId && pages[effectiveInitialData.activePageId] ? effectiveInitialData.activePageId : initialPageId);
  const [globalNavbar, setGlobalNavbar] = useState(effectiveInitialData?.globalNavbar || null);
  const [globalFooter, setGlobalFooter] = useState(effectiveInitialData?.globalFooter || null);
  
  // Wrapper functions that call onExternalSave when global elements change
  const updateGlobalNavbar = (newNavbar) => {
    setGlobalNavbar(newNavbar);
    if (onExternalSave) {
      onExternalSave({ globalNavbar: newNavbar });
    }
  };
  
  const updateGlobalFooter = (newFooter) => {
    setGlobalFooter(newFooter);
    if (onExternalSave) {
      onExternalSave({ globalFooter: newFooter });
    }
  };
  
  // State for UI
  const [selectedItem, setSelectedItem] = useState(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [activeTool, setActiveTool] = useState('select');
  const [zoom, setZoom] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
  const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(true);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isStructureModalOpen, setIsStructureModalOpen] = useState(false);
  const [structureModalContext, setStructureModalContext] = useState({ path: null, elementType: null, pageId: null });
  const [activeDragItem, setActiveDragItem] = useState(null);
  const [comments, setComments] = useState({});
  const aiSessionId = useRef(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiChatHistory, setAiChatHistory] = useState([]);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [modalStates, setModalStates] = useState({
    addPage: { isOpen: false },
    renamePage: { isOpen: false, pageId: null, currentName: '' },
    deletePage: { isOpen: false, pageId: null, pageName: '' },
    alert: { isOpen: false, title: '', message: '' }
  });
  
  // Define sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor)
  );
  
  const updateLayoutForPage = (pageId, callback) => {
    setPages(prev => {
      const newPages = { ...prev };
      if (newPages[pageId]) {
        newPages[pageId] = {
          ...newPages[pageId],
          layout: callback(newPages[pageId].layout)
        };
      }
      return newPages;
    });
  };
  
  const syncPageWithAI = useCallback(async () => {
    if (!aiSessionId.current) return;
    try {
      const pageResponse = await fetch(`http://104.219.251.122:8000/get-page?session_id=${aiSessionId.current}`, { method: 'GET' });
      if (!pageResponse.ok) throw new Error(`Page API error: ${pageResponse.statusText}`);
      const pageData = await pageResponse.json();
      if (pageData.html || (pageData.sections && pageData.section_order)) {
        // Update the page layout based on AI response
        // This is a simplified implementation
        console.log("AI page data received:", pageData);
      }
    } catch (error) {
      console.error("AI Sync Error:", error);
      setModalStates(p => ({ ...p, alert: { isOpen: true, title: "AI Sync Error", message: error.message || `Failed to sync with AI.` } }));
    } finally {
      setIsAiLoading(false);
    }
  }, [activePageId, updateLayoutForPage]);
  
  const handleAiSubmit = async (prompt) => {
    if (!aiSessionId.current) { 
      setModalStates(p => ({...p, alert: {isOpen: true, title: "AI Error", message: "AI session not started. Please try again."}})); 
      return; 
    }
    setIsAiLoading(true);
    const historyId = generateId('history');
    setAiChatHistory(prev => [{ id: historyId, prompt, status: 'loading' }, ...prev]);
    try {
      const pageResponse = await fetch('http://104.219.251.122:8000/generate-page', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: aiSessionId.current, prompt: prompt, as_file: false })
      });
      if (!pageResponse.ok) throw new Error(`AI API error: ${pageResponse.statusText}`);
      const apiResult = await pageResponse.json();
      if (apiResult.html || (apiResult.sections && apiResult.section_order)) { 
        await syncPageWithAI();
        setAiChatHistory(prev => prev.map(entry => entry.id === historyId ? {...entry, status: 'success'} : entry));
      } else { 
        throw new Error("Invalid response from AI. No 'html' or 'sections' data found."); 
      }
    } catch (error) {
      setAiChatHistory(prev => prev.map(entry => entry.id === historyId ? {...entry, status: 'error'} : entry));
      setModalStates(p => ({...p, alert: {isOpen: true, title: "AI Error", message: `Failed to generate content: ${error.message}`}}));
    } finally { 
      setIsAiLoading(false); 
    }
  };
  
  const handleAiAction = useCallback(async (action) => {
    if (!aiSessionId.current) {
      setModalStates(p => ({ ...p, alert: { isOpen: true, title: "AI Error", message: "AI session not started. Please try again." } }));
      return;
    }
    setIsAiLoading(true);
    try {
      const actionResponse = await fetch(`http://104.219.251.122:8000/${action}`, { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: aiSessionId.current })
      });
      if (!actionResponse.ok) throw new Error(`AI API error: ${actionResponse.statusText}`);
      const result = await actionResponse.json();
      if (!result.success) {
        throw new Error(`Nothing to ${action}. No action available to ${action}.`);
      }
      await syncPageWithAI();
    } catch (error) {
      setModalStates(p => ({ ...p, alert: { isOpen: true, title: "AI Sync Error", message: error.message || `Failed to perform ${action} operation.` } }));
    } finally {
      setIsAiLoading(false);
    }
  }, [syncPageWithAI]);
  
  const handleUndo = () => handleAiAction('undo');
  const handleRedo = () => handleAiAction('redo');
  
  const handleCanvasMouseDown = (e) => { 
    if (activeTool === 'hand') { 
      setIsPanning(true); 
      setLastMousePos({ x: e.clientX, y: e.clientY }); 
      e.currentTarget.style.cursor = 'grabbing'; 
      e.preventDefault();
    } 
  };
  
  const handleCanvasMouseMove = (e) => { 
    if (activeTool === 'hand' && isPanning) { 
      const dx = e.clientX - lastMousePos.x; 
      const dy = e.clientY - lastMousePos.y; 
      setLastMousePos({ x: e.clientX, y: e.clientY }); 
      setPanOffset(prev => ({ x: prev.x + dx, y: prev.y + dy })); 
      e.preventDefault();
    } 
  };
  
  const handleCanvasMouseUpOrLeave = (e) => { 
    if (activeTool === 'hand' && isPanning) { 
      setIsPanning(false); 
      e.currentTarget.style.cursor = 'grab'; 
    } 
  };
  
  // Add wheel zoom support for better UX
  const handleWheel = (e) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      const newZoom = Math.max(0.1, Math.min(2, zoom * delta));
      setZoom(newZoom);
    } else if (e.shiftKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 50 : -50;
      setPanOffset(prev => ({ x: prev.x + delta, y: prev.y }));
    } else {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 50 : -50;
      setPanOffset(prev => ({ x: prev.x, y: prev.y + delta }));
    }
  };
  
  const handleAddComment = (pageId, frameName, clickPosition) => {
    if (!canvasRef.current) return;
    const canvasRect = canvasRef.current.getBoundingClientRect(); 
    const viewX = clickPosition.x - canvasRect.left; 
    const viewY = clickPosition.y - canvasRect.top; 
    const transformedX = (viewX - panOffset.x) / zoom; 
    const transformedY = (viewY - panOffset.y) / zoom;
    let frameLeftEdge = 0; 
    const paddingLeft = 80; 
    const gap = 80; 
    let currentLeft = paddingLeft;
    for (const device of DEVICE_FRAMES_CONFIG) { 
      if (frameName === device.name) { 
        frameLeftEdge = currentLeft; 
        break; 
      } 
      currentLeft += device.width + gap; 
    }
    const paddingTop = 80; 
    const finalX = transformedX - frameLeftEdge; 
    const finalY = transformedY - paddingTop;
    const newComment = { 
      id: generateId('comment'), 
      text: 'New comment...', 
      position: { x: finalX, y: finalY }, 
      frame: frameName, 
      author: 'User', 
      createdAt: new Date().toISOString() 
    };
    setComments(prev => ({...prev, [pageId]: [...(prev[pageId] || []), newComment]}));
  };
  
  const handleUpdateComment = (pageId, commentId, newText) => setComments(prev => ({ ...prev, [pageId]: prev[pageId].map(c => c.id === commentId ? { ...c, text: newText } : c) }));
  const handleDeleteComment = (pageId, commentId) => setComments(prev => ({ ...prev, [pageId]: prev[pageId].filter(c => c.id !== commentId) }));
  
  const activePage = pages[activePageId];
  const getCanvasCursor = () => { 
    switch(activeTool) { 
      case 'hand': return 'grab'; 
      case 'comment': return 'crosshair'; 
      default: return 'default'; 
    } 
  }
  
  // Missing functions that are referenced
  const handleOpenStructureModal = (path, type, pageId) => { 
    setStructureModalContext({ path, elementType: type, pageId: pageId }); 
    setIsStructureModalOpen(true); 
  };
  
  const handleSetStructure = (structure, context) => {
    if (context.elementType === 'section') {
      updateLayoutForPage(context.pageId, () => structure);
    }
  };
  
  const handleAddPage = () => {
    setModalStates(p => ({ ...p, addPage: { isOpen: true } }));
  };
  
  const handleSelectPage = (pageId) => {
    setActivePageId(pageId);
  };
  
  const handleRenamePage = (pageId, currentName) => {
    setModalStates(p => ({ ...p, renamePage: { isOpen: true, pageId, currentName } }));
  };
  
  const handleDeletePage = (pageId, pageName) => {
    setModalStates(p => ({ ...p, deletePage: { isOpen: true, pageId, pageName } }));
  };
  
  const handleRenameActivePage = (newName) => {
    setPages(prev => ({
      ...prev,
      [activePageId]: { ...prev[activePageId], name: newName }
    }));
  };
  
  const handleAddGlobalElement = (type) => {
    if (type === 'navbar') {
      setGlobalNavbar({ id: generateId('navbar'), type: 'navbar', props: getDefaultProps('navbar') });
    } else if (type === 'footer') {
      setGlobalFooter({ id: generateId('footer'), type: 'footer', props: getDefaultProps('footer') });
    }
  };
  
  const handleDeleteGlobalElement = (type) => {
    if (type === 'navbar') {
      setGlobalNavbar(null);
    } else if (type === 'footer') {
      setGlobalFooter(null);
    }
  };
  
  const handleNavigate = (pageId) => {
    setActivePageId(pageId);
  };
  
  const closeModal = (modalName) => {
    setModalStates(p => ({ ...p, [modalName]: { ...p[modalName], isOpen: false } }));
  };
  
  const submitAddPage = (pageName) => {
    const newPageId = generateId('page');
    setPages(prev => ({
      ...prev,
      [newPageId]: { id: newPageId, name: pageName, layout: [] }
    }));
    setActivePageId(newPageId);
    closeModal('addPage');
  };
  
  const submitRenamePage = (newName) => {
    handleRenameActivePage(newName);
    closeModal('renamePage');
  };
  
  const confirmDeletePage = () => {
    const pageId = modalStates.deletePage.pageId;
    setPages(prev => {
      const newPages = { ...prev };
      delete newPages[pageId];
      return newPages;
    });
    if (activePageId === pageId) {
      const remainingPageIds = Object.keys(pages).filter(id => id !== pageId);
      if (remainingPageIds.length > 0) {
        setActivePageId(remainingPageIds[0]);
      }
    }
    closeModal('deletePage');
  };
  
  // Drag and drop handlers
  const handleDragStart = (event) => {
    setActiveDragItem(event.active);
  };
  
  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveDragItem(null);
  
    if (!over) return;
  
    if (active.data.current?.type === "paletteItem") {
      const config = active.data.current.config;
      const overId = over.id;
      
      if (overId.toString().startsWith('page-droppable-')) {
        const pageId = overId.toString().split('-')[2];
        const newElement = {
          id: generateId(config.id),
          type: config.id,
          name: config.name,
          props: getDefaultProps(config.id)
        };
        
        updateLayoutForPage(pageId, (layout) => [...layout, newElement]);
      }
    }
  };
  
  const handleUpdateProps = (path, newProps) => {
    if (path === 'globalNavbar') {
      setGlobalNavbar(prev => prev ? { ...prev, props: { ...prev.props, ...newProps } } : null);
    } else if (path === 'globalFooter') {
      setGlobalFooter(prev => prev ? { ...prev, props: { ...prev.props, ...newProps } } : null);
    } else {
      updateLayoutForPage(activePageId, (layout) => {
        const pathParts = path.split('.');
        const newLayout = [...layout];
        let current = newLayout;
        
        for (let i = 0; i < pathParts.length - 1; i++) {
          const part = pathParts[i];
          if (part.includes('[')) {
            const [arrayName, index] = part.split(/[\[\]]/);
            current = current[arrayName][parseInt(index)];
          } else {
            current = current[part];
          }
        }
        
        const lastPart = pathParts[pathParts.length - 1];
        if (lastPart.includes('[')) {
          const [arrayName, index] = lastPart.split(/[\[\]]/);
          current[arrayName][parseInt(index)].props = { ...current[arrayName][parseInt(index)].props, ...newProps };
        } else {
          current[lastPart] = { ...current[lastPart], ...newProps };
        }
        
        return newLayout;
      });
    }
  };
  
  const handleDelete = (path) => {
    updateLayoutForPage(activePageId, (layout) => {
      const pathParts = path.split('.');
      const newLayout = [...layout];
      let current = newLayout;
      
      for (let i = 0; i < pathParts.length - 1; i++) {
        const part = pathParts[i];
        if (part.includes('[')) {
          const [arrayName, index] = part.split(/[\[\]]/);
          current = current[arrayName][parseInt(index)];
        } else {
          current = current[part];
        }
      }
      
      const lastPart = pathParts[pathParts.length - 1];
      if (lastPart.includes('[')) {
        const [arrayName, index] = lastPart.split(/[\[\]]/);
        current[arrayName].splice(parseInt(index), 1);
      } else {
        delete current[lastPart];
      }
      
      return newLayout;
    });
  };
  
  const handleSelect = (id, type, path, data) => {
    setSelectedItem({ id, type, path, data });
  };
  
  const togglePreviewMode = () => { 
    setSelectedItem(null); 
    setIsPreviewMode((prev) => !prev); 
  };
  
  const handleToggleFullscreen = () => {
    setIsFullscreen(prev => !prev);
  };
  
  const handleSave = () => {
    setIsAiLoading(false);
    if (onExternalSave) {
      onExternalSave({
        pages,
        activePageId,
        globalNavbar,
        globalFooter
      });
    }
  };

  // Additional API functions for template management
  const handleLoadTemplate = async (templateId) => {
    try {
      const response = await apiRequest('get', `/templates/${templateId}`);
      if (response.data) {
        setPages(response.data.pages || {});
        setActivePageId(response.data.activePageId || Object.keys(response.data.pages)[0]);
        setGlobalNavbar(response.data.globalNavbar || null);
        setGlobalFooter(response.data.globalFooter || null);
      }
    } catch (error) {
      console.error('Failed to load template:', error);
      setModalStates(p => ({ ...p, alert: { isOpen: true, title: "Load Error", message: "Failed to load template." } }));
    }
  };

  const handleSaveTemplate = async (templateName) => {
    try {
      const templateData = {
        name: templateName,
        pages,
        activePageId,
        globalNavbar,
        globalFooter,
        createdAt: new Date().toISOString()
      };
      const response = await apiRequest('post', '/templates', templateData);
      if (response.data) {
        setModalStates(p => ({ ...p, alert: { isOpen: true, title: "Success", message: "Template saved successfully!" } }));
      }
    } catch (error) {
      console.error('Failed to save template:', error);
      setModalStates(p => ({ ...p, alert: { isOpen: true, title: "Save Error", message: "Failed to save template." } }));
    }
  };

  const handleExportTemplate = async () => {
    try {
      const exportData = {
        pages,
        activePageId,
        globalNavbar,
        globalFooter,
        exportDate: new Date().toISOString()
      };
      const response = await apiRequest('post', '/export', exportData);
      if (response.data) {
        // Create download link
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `template-${Date.now()}.json`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Failed to export template:', error);
      setModalStates(p => ({ ...p, alert: { isOpen: true, title: "Export Error", message: "Failed to export template." } }));
    }
  };

  const handleImportTemplate = async (file) => {
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const templateData = JSON.parse(e.target.result);
          if (templateData.pages) {
            setPages(templateData.pages);
            setActivePageId(templateData.activePageId || Object.keys(templateData.pages)[0]);
            setGlobalNavbar(templateData.globalNavbar || null);
            setGlobalFooter(templateData.globalFooter || null);
            setModalStates(p => ({ ...p, alert: { isOpen: true, title: "Success", message: "Template imported successfully!" } }));
          }
        } catch (parseError) {
          setModalStates(p => ({ ...p, alert: { isOpen: true, title: "Import Error", message: "Invalid template file format." } }));
        }
      };
      reader.readAsText(file);
    } catch (error) {
      console.error('Failed to import template:', error);
      setModalStates(p => ({ ...p, alert: { isOpen: true, title: "Import Error", message: "Failed to import template." } }));
    }
  };

  const handlePublishTemplate = async () => {
    try {
      const publishData = {
        pages,
        globalNavbar,
        globalFooter,
        publishedAt: new Date().toISOString(),
        version: '1.0.0'
      };
      const response = await apiRequest('post', '/publish', publishData);
      if (response.data) {
        setModalStates(p => ({ ...p, alert: { isOpen: true, title: "Success", message: "Template published successfully!" } }));
      }
    } catch (error) {
      console.error('Failed to publish template:', error);
      setModalStates(p => ({ ...p, alert: { isOpen: true, title: "Publish Error", message: "Failed to publish template." } }));
    }
  };

  const handleGetTemplates = async () => {
    try {
      const response = await apiRequest('get', '/templates');
      return response.data || [];
    } catch (error) {
      console.error('Failed to get templates:', error);
      return [];
    }
  };

  const handleDeleteTemplate = async (templateId) => {
    try {
      await apiRequest('delete', `/templates/${templateId}`);
      setModalStates(p => ({ ...p, alert: { isOpen: true, title: "Success", message: "Template deleted successfully!" } }));
    } catch (error) {
      console.error('Failed to delete template:', error);
      setModalStates(p => ({ ...p, alert: { isOpen: true, title: "Delete Error", message: "Failed to delete template." } }));
    }
  };

  const handleDuplicateTemplate = async (templateId) => {
    try {
      const response = await apiRequest('post', `/templates/${templateId}/duplicate`);
      if (response.data) {
        setModalStates(p => ({ ...p, alert: { isOpen: true, title: "Success", message: "Template duplicated successfully!" } }));
      }
    } catch (error) {
      console.error('Failed to duplicate template:', error);
      setModalStates(p => ({ ...p, alert: { isOpen: true, title: "Duplicate Error", message: "Failed to duplicate template." } }));
    }
  };

  const handleShareTemplate = async (templateId, shareData) => {
    try {
      const response = await apiRequest('post', `/templates/${templateId}/share`, shareData);
      if (response.data) {
        setModalStates(p => ({ ...p, alert: { isOpen: true, title: "Success", message: "Template shared successfully!" } }));
      }
    } catch (error) {
      console.error('Failed to share template:', error);
      setModalStates(p => ({ ...p, alert: { isOpen: true, title: "Share Error", message: "Failed to share template." } }));
    }
  };

  // AI session management
  const startAiSession = async () => {
    if(aiSessionId.current) return;
    try {
      const sessionResponse = await fetch('http://104.219.251.122:8000/start-session', { method: 'POST', headers: { 'accept': 'application/json' } });
      if (!sessionResponse.ok) throw new Error(`Session API error: ${sessionResponse.statusText}`);
      const sessionData = await sessionResponse.json();
      if (sessionData.session_id) { aiSessionId.current = sessionData.session_id; }
      else { throw new Error("Received an empty session ID from the API."); }
    } catch (error) { 
      setModalStates(p => ({...p, alert: {isOpen: true, title: "AI Connection Info", message: `Could not connect to the AI service. The demo will proceed without a live session ID.`}})); 
    }
  };

  // Start AI session when component mounts
  useEffect(() => {
    startAiSession();
  }, []);
  
  if (isPreviewMode) {
    return (
      <div className="h-screen bg-white">
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <h1 className="text-lg font-semibold text-slate-800">Preview Mode</h1>
          <button onClick={togglePreviewMode} className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors">
            Exit Preview
          </button>
        </div>
        <div className="p-4">
          <PagePreviewRenderer 
            pageLayout={activePage?.layout || []} 
            globalNavbar={globalNavbar} 
            globalFooter={globalFooter} 
            onNavigate={handleNavigate} 
            activePageId={activePageId} 
          />
        </div>
      </div>
    );
  }
  
  const canvasRef = useRef(null);
  
  return (
    <DndContext sensors={sensors} collisionDetection={rectIntersection} onDragStart={handleDragStart} onDragEnd={handleDragEnd} disabled={isPreviewMode || activeTool !== 'select'}>
        <div ref={canvasRef} className="h-screen bg-white antialiased flex flex-col relative">
            <style>{`.selected-outline { box-shadow: 0 0 0 2px #ffffff, 0 0 0 4px #22c55e; border-radius: 1.25rem; } .custom-slider { -webkit-appearance: none; appearance: none; width: 100%; height: 6px; background: #e2e8f0; border-radius: 9999px; outline: none; opacity: 0.9; transition: opacity .2s; } .custom-slider:hover { opacity: 1; } .custom-slider::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 18px; height: 18px; background: #16a34a; border-radius: 50%; cursor: pointer; border: 3px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.2); } .custom-slider::-moz-range-thumb { width: 18px; height: 18px; background: #16a34a; border-radius: 50%; cursor: pointer; border: 3px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.2); } .sidebar-scroll { scrollbar-width: thin; scrollbar-color: #cbd5e0 #f7fafc; } .sidebar-scroll::-webkit-scrollbar { width: 6px; } .sidebar-scroll::-webkit-scrollbar-track { background: #f7fafc; border-radius: 3px; } .sidebar-scroll::-webkit-scrollbar-thumb { background: #cbd5e0; border-radius: 3px; } .sidebar-scroll::-webkit-scrollbar-thumb:hover { background: #a0aec0; }`}</style>
            <TopBar onTogglePreview={togglePreviewMode} isPreviewMode={false} onToggleLeftPanel={() => setIsLeftPanelOpen(p => !p)} onToggleRightPanel={() => setIsRightPanelOpen(p => !p)} isLeftPanelOpen={isLeftPanelOpen} isRightPanelOpen={isRightPanelOpen} onToggleFullscreen={handleToggleFullscreen} isFullscreen={isFullscreen} />
            <div className="flex-1 flex flex-row relative overflow-hidden z-0">
                <LeftPanel isOpen={isLeftPanelOpen} onClose={() => setIsLeftPanelOpen(false)} onAddTopLevelSection={() => handleOpenStructureModal(null, "section", activePageId)} pages={pages} activePageId={activePageId} onAddPage={handleAddPage} onSelectPage={handleSelectPage} onRenamePage={handleRenamePage} onDeletePage={handleDeletePage} onAiSubmit={handleAiSubmit} isAiLoading={isAiLoading} aiChatHistory={aiChatHistory} onSwitchToAiMode={() => {}} onSelect={handleSelect} selectedItem={selectedItem} aiSuggestions={aiSuggestions} handleUndo={handleUndo} handleRedo={handleRedo} />
                <main ref={canvasRef} className={`flex-1 flex flex-col relative bg-dots overflow-hidden`} onMouseDown={handleCanvasMouseDown} onMouseMove={handleCanvasMouseMove} onMouseUp={handleCanvasMouseUpOrLeave} onMouseLeave={handleCanvasMouseUpOrLeave} onWheel={handleWheel} style={{ cursor: getCanvasCursor(), backgroundSize: '20px 20px', backgroundImage: 'radial-gradient(circle, #e5e7eb 1px, rgba(0, 0, 0, 0) 1px)' }}>
                {isAiLoading ? ( <AiCanvasLoader /> ) : (
                    <>
                    <div 
                        style={{ 
                            transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoom})`, 
                            transformOrigin: "0 0", 
                            transition: isPanning ? 'none' : "transform 0.15s cubic-bezier(0.4, 0, 0.2, 1)",
                            minHeight: '100vh',
                            minWidth: '100vw'
                        }} 
                        className="flex gap-20 items-start p-20 pb-32" 
                        onClick={(e) => { 
                            if (e.target === e.currentTarget && activeTool === 'select') { 
                                setSelectedItem({ pageId: activePageId, path: null, type: 'page', id: null }); 
                            } 
                        }}
                    >
                        {activePage && DEVICE_FRAMES_CONFIG.map((device) => (
                            <DeviceFrame key={device.name} device={device} page={activePage} globalNavbar={globalNavbar} globalFooter={globalFooter} onUpdateProps={handleUpdateProps} onDelete={handleDelete} onSelect={handleSelect} selectedItemId={selectedItem?.id} onOpenStructureModal={(path, type) => handleOpenStructureModal(path, type, activePage.id)} isPreviewMode={isPreviewMode} onNavigate={handleNavigate} onDeleteGlobalElement={handleDeleteGlobalElement} isDraggable={activeTool === 'select'} comments={(comments[activePageId] || []).filter(c => c.frame === device.name)} onAddComment={handleAddComment} activeTool={activeTool} />
                        ))}
                    </div>
                    </>
                )}
                </main>
                <RightSidebar selectedItemData={selectedItem} onUpdateSelectedProps={handleUpdateProps} pages={pages} activePageId={activePageId} onRenamePage={handleRenamePage} onAddGlobalElement={handleAddGlobalElement} comments={comments[activePageId] || []} onUpdateComment={handleUpdateComment} onDeleteComment={handleDeleteComment} isOpen={isRightPanelOpen} onClose={() => setIsRightPanelOpen(false)} />
            </div>
            {/* Canvas Toolbar at bottom like Figma */}
            <div className="absolute bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 shadow-lg">
                <CanvasToolbar selectedItem={selectedItem} zoom={zoom} onZoomChange={setZoom} onSelect={handleSelect} pages={pages} activeTool={activeTool} onToolChange={setActiveTool}/>
            </div>
            <DragOverlay dropAnimation={null} zIndex={9999} modifiers={[]}>
                {activeDragItem && activeDragItem.data.current?.type === "paletteItem" ? (
                    <PaletteItemDragOverlay config={activeDragItem.data.current.config} />
                ) : null}
            </DragOverlay>
            <StructureSelectorModal isOpen={isStructureModalOpen} onClose={() => setIsStructureModalOpen(false)} onSelectStructure={handleSetStructure} context={structureModalContext} />
            <InputModal isOpen={modalStates.addPage.isOpen} onClose={() => closeModal("addPage")} onSubmit={submitAddPage} title="Add New Page" inputLabel="Page Name" initialValue={`Page ${Object.keys(pages).length + 1}`} />
            <InputModal isOpen={modalStates.renamePage.isOpen} onClose={() => closeModal("renamePage")} onSubmit={submitRenamePage} title="Rename Page" inputLabel="New Page Name" initialValue={modalStates.renamePage.currentName} />
            <ConfirmationModal isOpen={modalStates.deletePage.isOpen} onClose={() => closeModal("deletePage")} onConfirm={confirmDeletePage} title="Delete Page" message={`Are you sure you want to delete "${modalStates.deletePage.pageName}"? This action cannot be undone.`} confirmText="Delete Page" confirmButtonVariant="danger" />
            <GeneralModal isOpen={modalStates.alert.isOpen} onClose={() => closeModal("alert")} title={modalStates.alert.title}>
                <p className="mb-4">{modalStates.alert.message}</p>
                <button onClick={() => closeModal("alert")} className="px-4 py-2 bg-slate-200 rounded">OK</button>
            </GeneralModal>
        </div>
    </DndContext>
  );
}
