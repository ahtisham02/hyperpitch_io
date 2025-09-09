import React, { useState, useRef, useMemo, useEffect, useCallback } from "react";
import { DndContext, DragOverlay, PointerSensor, KeyboardSensor, useSensor, useSensors, useDraggable, useDroppable, rectIntersection } from "@dnd-kit/core";
import { SortableContext, useSortable, arrayMove, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import img from "../../../assets/img/cards/672e98fa2d1ed0b7d1bf2adb_glass.png";
import * as LucideIcons from "lucide-react";
import apiRequest from "../../../utils/apiRequestAI";

const AI_HISTORY_STORAGE_KEY = "ai_session_histories";

const getHistoryFromStorage = (sessionId) => {
    try {
        const histories = JSON.parse(sessionStorage.getItem(AI_HISTORY_STORAGE_KEY) || "{}");
        return histories[sessionId] || [];
    } catch (e) { return []; }
};

const saveHistoryToStorage = (sessionId, history) => {
    try {
        const histories = JSON.parse(sessionStorage.getItem(AI_HISTORY_STORAGE_KEY) || "{}");
        histories[sessionId] = history;
        sessionStorage.setItem(AI_HISTORY_STORAGE_KEY, JSON.stringify(histories));
    } catch (e) { console.error("Failed to save history to session storage:", e); }
};

const StyledModalButton = ({ children, onClick, variant = "primary", className = "" }) => {
  const baseStyle = "inline-flex items-center justify-center px-5 py-2 text-xs font-semibold rounded-lg transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed";
  const variantStyles = {
    primary: "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 shadow-md hover:shadow-lg",
    secondary: "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 focus:ring-green-500 shadow-sm",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-md hover:shadow-lg"
  };
  return (
    <button onClick={onClick} className={`${baseStyle} ${variantStyles[variant]} ${className}`}>
      {children}
    </button>
  );
};
function GeneralModal({ isOpen, onClose, title, children, size = "md" }) {
  if (!isOpen) return null;
  const sizeClasses = { sm: "max-w-sm", md: "max-w-md", lg: "max-w-lg", xl: "max-w-xl", "2xl": "max-w-2xl" };
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[99999] p-4 print-hidden animate-fadeIn">
      <div className={`bg-white rounded-2xl shadow-2xl w-full ${sizeClasses[size] || sizeClasses.md} transition-all duration-300 ease-out animate-scaleIn`}>
        <div className="flex justify-between items-center p-4 bg-slate-50 rounded-t-2xl border-b border-slate-200">
          <h3 className="text-base font-bold text-slate-800">{title}</h3>
          {onClose && (
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors p-1.5 rounded-full hover:bg-slate-200">
              <LucideIcons.X className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
function ConfirmationModal({ isOpen, onClose, onConfirm, title, message, confirmText = "Confirm", cancelText = "Cancel", confirmButtonVariant = "primary" }) {
  if (!isOpen) return null;
  return (
    <GeneralModal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <p className="text-sm text-slate-600 mb-6">{message}</p>
      <div className="flex justify-end space-x-2">
        <StyledModalButton onClick={onClose} variant="secondary">{cancelText}</StyledModalButton>
        <StyledModalButton onClick={() => { onConfirm(); onClose(); }} variant={confirmButtonVariant}>{confirmText}</StyledModalButton>
      </div>
    </GeneralModal>
  );
}
function InputModal({ isOpen, onClose, onSubmit, title, message, inputLabel, initialValue = "", placeholder = "", submitText = "Submit", cancelText = "Cancel" }) {
  const [inputValue, setInputValue] = React.useState(initialValue);
  React.useEffect(() => { if (isOpen) { setInputValue(initialValue); } }, [isOpen, initialValue]);
  const handleSubmit = () => { onSubmit(inputValue); onClose(); };
  if (!isOpen) return null;
  return (
    <GeneralModal isOpen={isOpen} onClose={onClose} title={title}>
      {message && <p className="text-sm text-slate-600 mb-4">{message}</p>}
      <label htmlFor="input-modal-field" className="block text-sm font-medium text-slate-700 mb-2">{inputLabel}</label>
      <input id="input-modal-field" type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} placeholder={placeholder} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition shadow-sm" />
      <div className="flex justify-end space-x-2 mt-6">
        <StyledModalButton onClick={onClose} variant="secondary">{cancelText}</StyledModalButton>
        <StyledModalButton onClick={handleSubmit} variant="primary">{submitText}</StyledModalButton>
      </div>
    </GeneralModal>
  );
}
function NumberInput({ label, value, onChange, min = 0, max = 1000, unit = "px", placeholder = "0" }) {
  const [inputValue, setInputValue] = useState(value || 0);
  
  const handleChange = (e) => {
    const newValue = parseInt(e.target.value) || 0;
    setInputValue(newValue);
    onChange(newValue + unit);
  };
  
  return (
    <div className="space-y-1">
      {label && <label className="block text-xs font-medium text-slate-600">{label}</label>}
      <div className="relative">
        <input
          type="number"
          value={inputValue}
          onChange={handleChange}
          min={min}
          max={max}
          placeholder={placeholder}
          className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md text-sm focus:ring-1 focus:ring-green-500 focus:border-green-500 transition-all shadow-sm bg-white"
        />
        <span className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-xs text-slate-500">{unit}</span>
      </div>
    </div>
  );
}

function CustomDropdown({ options, value, onChange, placeholder = "Select an option", label, disabled = false, idSuffix = "" }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const selectedOption = options.find((opt) => opt.value === value);
  useEffect(() => { 
    const handleClickOutside = (event) => { 
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false); 
      }
    }; 
    document.addEventListener("mousedown", handleClickOutside); 
    return () => document.removeEventListener("mousedown", handleClickOutside); 
  }, []);
  const handleSelect = (optionValue) => { 
    onChange(optionValue); 
    setIsOpen(false); 
  };
  return (
    <div className="relative w-full" ref={dropdownRef}>
      {label && (<label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>)}
      <button type="button" onClick={() => !disabled && setIsOpen(!isOpen)} disabled={disabled} className={`w-full px-2.5 py-1.5 border border-slate-300 rounded-md text-sm focus:ring-1 focus:ring-green-500 focus:border-green-500 transition-all shadow-sm bg-white text-left flex justify-between items-center ${disabled ? "bg-slate-100 cursor-not-allowed" : "cursor-pointer"}`}>
        <span className={selectedOption ? "text-slate-800" : "text-slate-500"}>{selectedOption ? selectedOption.label : placeholder}</span>
        <LucideIcons.ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${isOpen ? "transform rotate-180" : ""}`} />
      </button>
      {isOpen && !disabled && (
        <ul className="absolute z-20 mt-1 w-full bg-white border border-slate-200 rounded-lg max-h-60 overflow-auto py-1 text-sm shadow-xl animate-fadeInDown">
          {options.map((opt) => (
            <li key={`${opt.value}-${idSuffix}`} onClick={() => handleSelect(opt.value)} className={`px-3 py-1.5 hover:bg-green-50 cursor-pointer ${opt.value === value ? "bg-green-100 text-green-800 font-semibold" : "text-slate-700"}`}>{opt.label}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
function generateId(prefix = "id") { return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`; }
function isObject(item) { return (item && typeof item === 'object' && !Array.isArray(item)); }
function mergeDeep(target, ...sources) {
  if (!sources.length) return target;
  
  const result = { ...target };
  const visited = new WeakSet();
  
  function deepMerge(obj, source) {
    if (!isObject(obj) || !isObject(source)) return source;
    if (visited.has(obj) || visited.has(source)) return obj;
    
    visited.add(obj);
    visited.add(source);
    
    const merged = { ...obj };
    
    for (const key in source) {
      if (isObject(source[key])) {
        merged[key] = deepMerge(merged[key] || {}, source[key]);
      } else {
        merged[key] = source[key];
      }
    }
    
    visited.delete(obj);
    visited.delete(source);
    
    return merged;
  }
  
  for (const source of sources) {
    if (isObject(source)) {
      Object.assign(result, deepMerge(result, source));
    }
  }
  
  return result;
}
function getItemByPath(obj, pathString) {
  if (!pathString) return null;
  const path = pathString.replace(/\[(\w+(?:-\w+)*)\]/g, ".$1").replace(/^\./, "").split(".");
  let current = obj;
  for (const key of path) {
    if (current && typeof current === 'object' && (key in current || (Array.isArray(current) && !isNaN(parseInt(key))))) {
      current = current[key];
    } else {
      return undefined;
    }
  }
  return current;
}
function deleteItemByPath(obj, pathString) {
  const path = pathString.replace(/\[(\w+(?:-\w+)*)\]/g, ".$1").replace(/^\./, "").split(".");
  let current = obj;
  for (let i = 0; i < path.length - 1; i++) {
    if (current && typeof current === 'object' && (path[i] in current || (Array.isArray(current) && !isNaN(parseInt(path[i]))))) {
      current = current[path[i]];
    } else {
      return false;
    }
  }
  const finalKey = path[path.length - 1];
  if (Array.isArray(current) && !isNaN(parseInt(finalKey))) {
    current.splice(parseInt(finalKey), 1);
    return true;
  }
  if (typeof current === 'object' && finalKey in current) {
    delete current[finalKey];
    return true;
  }
  return false;
}
function findItemAndPathRecursive(data, targetId, currentPathBase = "") {
  if (Array.isArray(data)) {
    for (let i = 0; i < data.length; i++) {
      const item = data[i];
      const itemPath = `${currentPathBase}[${i}]`;
      if (item.id === targetId) {
        return { item, path: itemPath };
      }
      if (item.columns) {
        const found = findItemAndPathRecursive(item.columns, targetId, `${itemPath}.columns`);
        if (found) return found;
      }
      if (item.elements) {
        const found = findItemAndPathRecursive(item.elements, targetId, `${itemPath}.elements`);
        if (found) return found;
      }
    }
  }
  return null;
}
const textSizeOptions = [ { label: "Tiny", value: "text-xs" }, { label: "Small", value: "text-sm" }, { label: "Base", value: "text-base" }, { label: "Large", value: "text-lg" }, { label: "XL", value: "text-xl" }, { label: "2XL", value: "text-2xl" }, { label: "3XL", value: "text-3xl" }, { label: "4XL", value: "text-4xl" }, { label: "5XL", value: "text-5xl" }, { label: "6XL", value: "text-6xl" }];
const fontWeightOptions = [ { label: "Light", value: "font-light" }, { label: "Normal", value: "font-normal" }, { label: "Medium", value: "font-medium" }, { label: "Semibold", value: "font-semibold" }, { label: "Bold", value: "font-bold" }, ];
const textAlignOptions = [ { label: "Left", value: "text-left", icon: <LucideIcons.AlignLeft className="w-4 h-4" /> }, { label: "Center", value: "text-center", icon: <LucideIcons.AlignCenter className="w-4 h-4" /> }, { label: "Right", value: "text-right", icon: <LucideIcons.AlignRight className="w-4 h-4" /> }, ];
const PREDEFINED_STRUCTURES = [ { name: "1 Column", id: "1col", layout: [{ width: "100%" }] }, { name: "2 Columns", id: "2col5050", layout: [{ width: "50%" }, { width: "50%" }] }, { name: "3 Columns", id: "3col33", layout: [{ width: "33.33%" }, { width: "33.33%" }, { width: "33.33%" }] }, { name: "4 Columns", id: "4col25", layout: [{ width: "25%" }, { width: "25%" }, { width: "25%" }, { width: "25%" }] }, { name: "Left Sidebar", id: "leftsidebar", layout: [{ width: "30%" }, { width: "70%" }] }, { name: "Right Sidebar", id: "rightsidebar", layout: [{ width: "70%" }, { width: "30%" }] }, ];

const PREVIEW_DEVICES = [ { name: "Mobile", width: 390, icon: LucideIcons.Smartphone }, { name: "Tablet", width: 768, icon: LucideIcons.Tablet }, { name: "Desktop", width: "100%", icon: LucideIcons.Monitor }, ];

function Heading({ text = "Default Heading Title", onUpdate, isSelected, sizeClass, fontWeight, textAlign, isPreviewMode, isEditable, style, customClassName = '' }) {
  const handleBlur = (e) => { if (onUpdate && !isPreviewMode) onUpdate({ text: e.currentTarget.innerHTML }); };
  return (
      <h1
        style={style}
        className={`${customClassName || `${sizeClass || "text-2xl"} ${fontWeight || "font-bold"} ${textAlign || "text-left"}`} ${!isPreviewMode ? "focus:outline-none focus:ring-1 focus:ring-green-500 focus:bg-white/80 p-1 -m-1 rounded-md" : ""} transition-all`}
        contentEditable={!isPreviewMode && isEditable} suppressContentEditableWarning onBlur={handleBlur} dangerouslySetInnerHTML={{ __html: text }}></h1>
  );
}
function TextBlock({ text = "Lorem ipsum dolor sit amet...", onUpdate, isSelected, sizeClass, fontWeight, textAlign, isPreviewMode, isEditable, style, customClassName = '' }) {
    const handleBlur = (e) => { if (onUpdate && !isPreviewMode) onUpdate({ text: e.currentTarget.innerHTML }); };
    return (
        <p
            style={style}
            className={`${customClassName || `${sizeClass || "text-base"} ${fontWeight || "font-normal"} ${textAlign || "text-left"}`} leading-relaxed ${!isPreviewMode ? "focus:outline-none focus:ring-1 focus:ring-green-500 focus:bg-white/80 p-1 -m-1 rounded-md whitespace-pre-wrap" : "whitespace-pre-wrap"} transition-all`}
            contentEditable={!isPreviewMode && isEditable}
            suppressContentEditableWarning
            onBlur={handleBlur}
            dangerouslySetInnerHTML={{ __html: text }}></p>
    );
}
function ButtonElement({ buttonText = "Click Me", link = "#", onUpdate, isSelected, textAlign, isPreviewMode, onNavigate, isEditable, style, customClassName = '' }) {
    const handleTextBlur = (e) => { if (onUpdate && !isPreviewMode) onUpdate({ buttonText: e.currentTarget.innerText }); };
    const handleClick = (e) => {
        if (!isPreviewMode) { e.preventDefault(); return; }
        if (link && link.startsWith("/")) { e.preventDefault(); if (onNavigate) onNavigate(link.substring(1)); }
        else if (link === "#") { e.preventDefault(); }
    };
    return (
        <div className={`${textAlign || ''} ${!isPreviewMode && isSelected ? "rounded-lg" : ""}`} style={style}>
            <a href={link} onClick={handleClick} target={ isPreviewMode && link && !link.startsWith("/") && link !== "#" ? "_blank" : "_self" } rel={ isPreviewMode && link && !link.startsWith("/") && link !== "#" ? "noopener noreferrer" : "" } className={customClassName}>
                <span contentEditable={!isPreviewMode && isEditable} suppressContentEditableWarning onBlur={handleTextBlur} dangerouslySetInnerHTML={{ __html: buttonText }} className={`${!isPreviewMode ? "focus:outline-none focus:ring-1 focus:ring-white/50 p-0.5 -m-0.5 rounded-sm" : ""}`}></span>
            </a>
        </div>
    );
}
function ImageElement({ src = img, alt = "Placeholder", isSelected, isPreviewMode, style, customClassName = '' }) {
    return (
        <img src={src} alt={alt} className={customClassName || `max-w-full h-auto block mx-auto transition-all`} style={style} />
    );
}
function IconElement({ iconName = "Star", size = "32px", color = "currentColor", isSelected, isPreviewMode, style, customClassName = '' }) {
    const IconComponent = LucideIcons[iconName] || LucideIcons.HelpCircle;
    return (
        <div className={`${customClassName} flex justify-center items-center`} style={style}>
            <IconComponent style={{ fontSize: size, color: color }} strokeWidth={2} />
        </div>
    );
}
function AccordionElement({ title = "Accordion Title", content = "Accordion content...", onUpdate, isSelected, isPreviewMode, isEditable, style }) {
    const [isOpen, setIsOpen] = useState(false);
    const handleTitleBlur = (e) => { if (onUpdate && !isPreviewMode) onUpdate({ title: e.currentTarget.innerText }); };
    const handleContentBlur = (e) => { if (onUpdate && !isPreviewMode) onUpdate({ content: e.currentTarget.innerText }); };
    const toggleOpen = () => setIsOpen(!isOpen);
    const effectiveToggle = !isPreviewMode ? () => {} : toggleOpen;

    return (
        <div className={`p-1 ${!isPreviewMode ? `rounded-md ${isSelected ? "" : "hover:ring-1 hover:ring-green-400/20"}` : ""}`} style={style}>
            <div className={`bg-white rounded-md shadow-sm border ${isSelected && !isPreviewMode ? "border-green-300" : "border-slate-200"}`}>
                <h2>
                    <button type="button" onClick={effectiveToggle} className={`flex items-center justify-between w-full p-3 font-medium text-left text-slate-800 text-sm ${isPreviewMode ? 'hover:bg-green-50/50' : 'cursor-default'} transition-colors`}>
                        <span contentEditable={!isPreviewMode && isEditable} suppressContentEditableWarning onBlur={handleTitleBlur} className={`flex-1 ${!isPreviewMode ? "focus:outline-none focus:ring-1 focus:ring-green-400 p-0.5 -m-0.5 rounded-sm" : ""}`} dangerouslySetInnerHTML={{ __html: title }}></span>
                        <LucideIcons.ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}/>
                    </button>
                </h2>
                <div className={`grid overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                    <div className="overflow-hidden">
                        <div className="p-3 border-t border-slate-200 text-slate-600 text-sm">
                             <p contentEditable={!isPreviewMode && isEditable} suppressContentEditableWarning onBlur={handleContentBlur} className={`${!isPreviewMode ? "focus:outline-none focus:ring-1 focus:ring-green-400 p-0.5 -m-0.5 rounded-sm whitespace-pre-wrap" : "whitespace-pre-wrap"}`} dangerouslySetInnerHTML={{ __html: content }}></p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
function Divider({ isSelected, isPreviewMode, style }) {
    return (
        <div className={`py-3 px-1 ${!isPreviewMode && isSelected ? "rounded-lg bg-green-500/5" : ""}`} style={style}>
            <hr className="border-t border-slate-300" />
        </div>
    );
}
function Spacer({ height = "20px", onUpdate, isSelected, isPreviewMode, style }) {
    return <div style={{ height, ...style }} className={`w-full transition-all ${!isPreviewMode && isSelected ? "bg-green-200/50" : !isPreviewMode ? "bg-transparent hover:bg-slate-200/50" : ""}`}></div>;
}
function GoogleMapsPlaceholder({ address = "1600 Amphitheatre Parkway, Mountain View, CA", zoom = 14, onUpdate, isSelected, isPreviewMode, style }) {
    return (
        <div className={`p-3 rounded-lg ${!isPreviewMode ? `${isSelected ? "bg-green-500/5 ring-1 ring-green-500" : "bg-slate-100 border border-slate-200 hover:border-green-300"}` : "bg-slate-100 border border-slate-200"} aspect-video flex flex-col items-center justify-center text-center`} style={style}>
            <LucideIcons.MapPin className="h-10 w-10 text-slate-400 mb-2" />
            <p className="text-sm font-medium text-slate-600">{address}</p>
            <p className="text-xs text-slate-500 mt-0.5">Maps Placeholder (Zoom: {zoom})</p>
        </div>
    );
}
function VideoElement({ videoType = "mp4", src, width = "100%", height = "auto", controls = true, autoplay = false, loop = false, muted = true, isSelected, isPreviewMode, style }) {
    const getYouTubeEmbedUrl = (videoId) => `https://www.youtube.com/embed/${videoId}?autoplay=${autoplay ? 1 : 0}&loop=${loop ? 1 : 0}&mute=${muted ? 1 : 0}&controls=${controls ? 1 : 0}${loop ? `&playlist=${videoId}` : ""}`;
    const getVimeoEmbedUrl = (videoId) => `https://player.vimeo.com/video/${videoId}?autoplay=${autoplay ? 1 : 0}&loop=${loop ? 1 : 0}&muted=${muted ? 1 : 0}&controls=${controls ? 1 : 0}`;
    const effectiveHeight = height === "auto" ? "auto" : parseInt(height) ? `${parseInt(height)}px` : "300px";
    const effectiveWidth = width === "auto" ? "auto" : parseInt(width) || (typeof width === "string" && width.endsWith("%")) ? width : "100%";
    const renderVideo = () => {
        if (!src) return (<div className="p-4 text-center text-slate-500 aspect-video flex items-center justify-center bg-slate-100 rounded-md border border-slate-200 text-sm">Video source not configured.</div>);
        switch (videoType) {
            case "youtube": return (<iframe src={getYouTubeEmbedUrl(src)} style={{ width: effectiveWidth, height: effectiveHeight }} frameBorder="0" allow="autoplay; fullscreen; picture-in-picture" allowFullScreen title="YouTube Video" className="block mx-auto rounded-lg shadow-lg"></iframe>);
            case "vimeo": return (<iframe src={getVimeoEmbedUrl(src)} style={{ width: effectiveWidth, height: effectiveHeight }} frameBorder="0" allow="autoplay; fullscreen; picture-in-picture" allowFullScreen title="Vimeo Video" className="block mx-auto rounded-lg shadow-lg"></iframe>);
            case "mp4": default: return (<video src={src} style={{ width: effectiveWidth, height: effectiveHeight }} controls={controls} autoPlay={autoplay} loop={loop} muted={muted} playsInline className="block mx-auto bg-black rounded-lg shadow-lg"></video>);
        }
    };
    return (
        <div className={`p-1 ${!isPreviewMode ? `rounded-lg ${isSelected ? "" : "hover:ring-1 hover:ring-green-400/20"}` : ""}`} style={style}>
            {renderVideo()}
        </div>
    );
}
function InnerSectionComponentDisplay({ sectionData, onOpenStructureModal, onSelect, isSelected, onUpdateProps, onDelete, selectedItemId, isPreviewMode, isDraggable, style }) {
  const hasColumns = sectionData.columns && sectionData.columns.length > 0;
  const ownPath = sectionData.path;
  if (!hasColumns) {
    return (
      <div onClick={(e) => { if (!isPreviewMode && isDraggable) { e.stopPropagation(); onSelect(sectionData.id, "element", ownPath); } }} className={`p-4 min-h-[60px] flex flex-col items-center justify-center ${!isPreviewMode ? `rounded-lg border-2 border-dashed ${isSelected ? "border-green-500 bg-green-50/80" : "border-slate-300 bg-slate-100/80 hover:border-green-400 hover:bg-green-50/50"} cursor-pointer transition-all` : ""}`} style={style}>
          <LucideIcons.Rows3 className="h-6 w-6 text-slate-400 mb-2" />
          {!isPreviewMode && (
            <button onClick={(e) => { e.stopPropagation(); onOpenStructureModal(ownPath, "innerSection"); }} className="px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-md hover:bg-green-700 transition-colors">Set Inner Structure</button>
          )}
      </div>
    );
  }
  return (
    <div onClick={(e) => { if (!isPreviewMode && isDraggable) { e.stopPropagation(); onSelect(sectionData.id, "element", ownPath); } }} className={`p-1 ${!isPreviewMode ? `border rounded-lg ${isSelected ? "border-green-500 bg-green-50/50" : "border-slate-200 hover:border-green-300/70"}` : ""}`} style={style}>
        <div className="flex flex-wrap -m-0.5">
            {sectionData.columns.map((col, colIdx) => (
                <ColumnComponent key={col.id} parentPath={ownPath} columnData={col} columnIndex={colIdx} onUpdateProps={onUpdateProps} onDelete={onDelete} onSelect={onSelect} selectedItemId={selectedItemId} onOpenStructureModal={onOpenStructureModal} isInner={true} isPreviewMode={isPreviewMode} isDraggable={isDraggable} />
            ))}
        </div>
    </div>
  );
}
function CardSliderElement({ slides = [], slidesPerView = 3, spaceBetween = 16, speed = 500, autoplay = false, autoplayDelay = 3000, loop = false, showNavigation = true, showPagination = true, cardBorderRadius = "12px", onUpdate, isSelected, isPreviewMode, onNavigate, isEditable, style }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const timeoutRef = useRef(null);
  const sliderWrapperRef = useRef(null);
  const totalSlides = slides.length;
  const effectiveSlidesPerView = Math.min( slidesPerView, totalSlides > 0 ? totalSlides : slidesPerView );
  const resetTimeout = () => { if (timeoutRef.current) { clearTimeout(timeoutRef.current); } };
  useEffect(() => {
      resetTimeout();
      if (autoplay && totalSlides > effectiveSlidesPerView && isPreviewMode) {
          timeoutRef.current = setTimeout(() => {
              setCurrentIndex((prevIndex) => {
                  const nextIndex = prevIndex + 1;
                  if (loop) { return nextIndex % totalSlides; }
                  return Math.min(nextIndex, totalSlides - effectiveSlidesPerView);
              });
          }, autoplayDelay);
      }
      return () => resetTimeout();
  }, [ currentIndex, autoplay, autoplayDelay, loop, totalSlides, effectiveSlidesPerView, isPreviewMode, ]);
  const goToSlide = (index) => {
      let newIndex = index;
      if (loop) {
          if (index < 0) newIndex = totalSlides - 1;
          else if (index >= totalSlides) newIndex = 0;
      } else { newIndex = Math.max( 0, Math.min(index, totalSlides - effectiveSlidesPerView) ); }
      setCurrentIndex(newIndex);
  };
  const handlePrev = () => goToSlide(currentIndex - 1);
  const handleNext = () => goToSlide(currentIndex + 1);
  const handleCardTextUpdate = (slideIndex, field, newText) => {
      if (onUpdate && !isPreviewMode) { const newSlides = slides.map((slide, idx) => idx === slideIndex ? { ...slide, [field]: newText } : slide ); onUpdate({ slides: newSlides }); }
  };
  if (totalSlides === 0 && !isPreviewMode) {
      return (
          <div className={`p-4 min-h-[120px] flex flex-col items-center justify-center text-center border-2 border-dashed rounded-lg ${isSelected ? "border-green-500 bg-green-500/10" : "border-slate-300 bg-slate-100/80"}`} style={style}>
              <LucideIcons.GalleryHorizontalEnd className="h-10 w-10 text-slate-400 mb-2" />
              <p className="text-sm font-medium text-slate-600">Card Slider</p>
              <p className="text-xs text-slate-500">Add slides in the Properties Panel.</p>
          </div>
      );
  }
  if (totalSlides === 0 && isPreviewMode) return null;
  return (
      <div className={`p-2 relative ${!isPreviewMode && isSelected ? "rounded-lg bg-green-500/5" : ""}`} style={style}>
          <div className="overflow-hidden relative">
              <div ref={sliderWrapperRef} className="flex transition-transform duration-500 ease-in-out" style={{ transform: `translateX(-${currentIndex * (100 / effectiveSlidesPerView)}%)`, transitionDuration: `${speed}ms` }}>
                  {slides.map((slide, index) => (
                      <div key={slide.id || index} className="flex-shrink-0 w-full" style={{ width: `${100 / effectiveSlidesPerView}%`, paddingLeft: `${spaceBetween / 2}px`, paddingRight: `${spaceBetween / 2}px` }}>
                          <div className="bg-white p-3 flex flex-col h-full shadow-lg" style={{ borderRadius: cardBorderRadius }}>
                              <h3 className={`text-base font-semibold mb-1 ${!isPreviewMode ? "focus:outline-none focus:ring-1 focus:ring-green-400 p-0.5 -m-0.5 rounded-md" : ""}`} contentEditable={!isPreviewMode && isEditable} suppressContentEditableWarning onBlur={(e) => handleCardTextUpdate( index, "heading", e.currentTarget.innerText )} dangerouslySetInnerHTML={{ __html: slide.heading || `Slide ${index + 1}` }} ></h3>
                              <p className={`text-xs text-slate-600 flex-grow ${!isPreviewMode ? "focus:outline-none focus:ring-1 focus:ring-green-400 p-0.5 -m-0.5 rounded-md whitespace-pre-wrap" : "whitespace-pre-wrap"}`} contentEditable={!isPreviewMode && isEditable} suppressContentEditableWarning onBlur={(e) => handleCardTextUpdate( index, "text", e.currentTarget.innerText )} dangerouslySetInnerHTML={{ __html: slide.text || "Slide content goes here." }}></p>
                              {slide.link && isPreviewMode && (
                                  <a href={slide.link} onClick={(e) => { if (slide.link.startsWith("/")) { e.preventDefault(); if (onNavigate) onNavigate(slide.link.substring(1)); } else if (slide.link === "#") { e.preventDefault(); } }} target={ !slide.link.startsWith("/") && slide.link !== "#" ? "_blank" : "_self" } rel={ !slide.link.startsWith("/") && slide.link !== "#" ? "noopener noreferrer" : "" } className="mt-auto pt-2 text-green-600 hover:text-green-700 text-xs font-medium self-start flex items-center gap-1">Learn More<LucideIcons.ArrowRight className="w-3 h-3" /></a>
                              )}
                              {!isPreviewMode && slide.link && (<span className="mt-auto pt-2 text-green-600 text-xs font-medium self-start">Link: {slide.link}</span>)}
                          </div>
                      </div>
                  ))}
              </div>
          </div>
          {showNavigation && totalSlides > effectiveSlidesPerView && (<>
              <button onClick={handlePrev} disabled={!loop && currentIndex === 0} className="absolute top-1/2 left-0 transform -translate-y-1/2 -translate-x-2 bg-white/80 hover:bg-white text-slate-700 p-1.5 rounded-full shadow-md z-10 disabled:opacity-40 disabled:cursor-not-allowed transition-all" aria-label="Previous slide"><LucideIcons.ChevronLeft className="w-5 h-5" /></button>
              <button onClick={handleNext} disabled={ !loop && currentIndex >= totalSlides - effectiveSlidesPerView } className="absolute top-1/2 right-0 transform -translate-y-1/2 translate-x-2 bg-white/80 hover:bg-white text-slate-700 p-1.5 rounded-full shadow-md z-10 disabled:opacity-40 disabled:cursor-not-allowed transition-all" aria-label="Next slide"><LucideIcons.ChevronRight className="w-5 h-5" /></button>
          </>)}
          {showPagination && totalSlides > effectiveSlidesPerView && (
              <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 flex space-x-1.5 p-2">
                  {Array.from({ length: loop ? totalSlides : Math.max(1, totalSlides - effectiveSlidesPerView + 1), }).map((_, idx) => (
                      <button key={idx} onClick={() => goToSlide(idx)} className={`w-2 h-2 rounded-full ${currentIndex === idx ? "bg-green-600 scale-125" : "bg-slate-300 hover:bg-slate-400"} transition-all`} aria-label={`Go to slide ${idx + 1}`} />
                  ))}
              </div>
          )}
      </div>
  );
}
function NavbarElement({ logoType = "text", logoText = "MySite", logoSrc = img, links = [], rightContentType = "none", isSelected, isPreviewMode, onUpdate, onNavigate, onSelect, onDelete, path, previewDevice, isDraggable, style, customClassName = '' }) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    
    const navContentContainerClasses = 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8';
    const flexContainerClasses = 'flex justify-between items-center py-6';
    const navLinksContainerClasses = 'space-x-8';
    
    const handleLinkClick = (e, linkUrl) => {
        if (isMobileMenuOpen) setIsMobileMenuOpen(false);
        if (!isPreviewMode) { e.preventDefault(); return; }
        if (linkUrl && linkUrl.startsWith("/")) { e.preventDefault(); if (onNavigate) onNavigate(linkUrl.substring(1)); }
        else if (linkUrl === "#") { e.preventDefault(); }
    };

    const handleClick = (e) => { if (!isPreviewMode && onSelect && isDraggable) { e.stopPropagation(); onSelect(); } };

    return (
        <div onClick={handleClick} className={`relative group ${!isPreviewMode && isSelected ? "selected-outline p-1" : ""}`}>
             <header className={customClassName}>
                <div className={navContentContainerClasses}>
                    <div className={flexContainerClasses}>
                        <div className="font-bold text-xl text-gray-900">{logoText}</div>
                        <nav className={navLinksContainerClasses}>
                            {links.map((link, index) => (
                                <a key={link.id || index} href={link.url} onClick={(e) => handleLinkClick(e, link.url)} className="text-gray-600 hover:text-gray-900 transition-colors">{link.text}</a>
                            ))}
                        </nav>
                    </div>
                </div>
            </header>
            {!isPreviewMode && isSelected && onDelete && (
                <button onClick={(e) => { e.stopPropagation(); onDelete(); }} title="Remove Global Navbar" className="absolute -top-2.5 -right-2.5 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 hover:scale-110 transition-all w-6 h-6 flex items-center justify-center shadow-md z-30 print-hidden">
                    <LucideIcons.X className="w-3 h-3" strokeWidth={3} />
                </button>
            )}
        </div>
    );
}
function NewsletterElement({ title = "Get Exclusive Updates", subtitle = "Subscribe for weekly tips and special offers", placeholder = "name@email.com", buttonText = "Subscribe", onUpdate, isSelected, isPreviewMode, isEditable, style, customClassName = '' }) {
    const [email, setEmail] = React.useState('');
    const handleSubmit = (e) => { e.preventDefault(); };
    return (
        <div className={customClassName} style={style}>
            <div className="max-w-4xl mx-auto px-4 text-center">
                <h2 className="text-4xl font-bold mb-4 text-gray-900">{title}</h2>
                <p className="text-xl text-gray-600 mb-8">{subtitle}</p>
                <form onSubmit={handleSubmit} className="max-w-md mx-auto">
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={placeholder} className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 mb-4" required />
                    <button type="submit" className="w-full bg-gray-900 text-white py-3 px-6 rounded-lg hover:bg-gray-800 transition-colors">{buttonText}</button>
                </form>
            </div>
        </div>
    );
}

const HtmlHeading = ({ text, tag, fontSize, fontWeight, color, textAlign, margin, padding, customClassName, onUpdate, isSelected, isPreviewMode }) => {
    const handleTextChange = (e) => {
        if (onUpdate) {
            onUpdate({ text: e.target.innerHTML });
        }
    };

    const TagComponent = tag || 'h1';
    const style = {
        fontSize,
        fontWeight,
        color,
        textAlign,
        margin,
        padding
    };

    return (
        <div className={`relative ${isSelected && !isPreviewMode ? 'ring-2 ring-blue-500' : ''}`}>
            <TagComponent
                contentEditable={!isPreviewMode}
                suppressContentEditableWarning
                onBlur={handleTextChange}
                className={customClassName}
                style={style}
                dangerouslySetInnerHTML={{ __html: text }}
            />
        </div>
    );
};

const HtmlParagraph = ({ text, fontSize, fontWeight, color, textAlign, lineHeight, margin, padding, customClassName, onUpdate, isSelected, isPreviewMode }) => {
    const handleTextChange = (e) => {
        if (onUpdate) {
            onUpdate({ text: e.target.innerHTML });
        }
    };

    const style = {
        fontSize,
        fontWeight,
        color,
        textAlign,
        lineHeight,
        margin,
        padding
    };

    return (
        <div className={`relative ${isSelected && !isPreviewMode ? 'ring-2 ring-blue-500' : ''}`}>
            <p
                contentEditable={!isPreviewMode}
                suppressContentEditableWarning
                onBlur={handleTextChange}
                className={customClassName}
                style={style}
                dangerouslySetInnerHTML={{ __html: text }}
            />
        </div>
    );
};

const HtmlImage = ({ src, alt, width, height, borderRadius, margin, padding, customClassName, onUpdate, isSelected, isPreviewMode }) => {
    const handleImageChange = (e) => {
        if (onUpdate) {
            onUpdate({ src: e.target.value });
        }
    };

    const style = {
        width,
        height,
        borderRadius,
        margin,
        padding
    };

    return (
        <div className={`relative ${isSelected && !isPreviewMode ? 'ring-2 ring-blue-500' : ''}`}>
            {!isPreviewMode && (
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <input
                        type="text"
                        value={src}
                        onChange={handleImageChange}
                        className="px-2 py-1 text-xs border border-gray-300 rounded bg-white"
                        placeholder="Image URL"
                    />
                </div>
            )}
            <img
                src={src}
                alt={alt}
                className={customClassName}
                style={style}
            />
        </div>
    );
};

const HtmlButton = ({ text, link, backgroundColor, color, fontSize, fontWeight, padding, borderRadius, border, margin, customClassName, onUpdate, isSelected, isPreviewMode }) => {
    const handleTextChange = (e) => {
        if (onUpdate) {
            onUpdate({ text: e.target.innerHTML });
        }
    };

    const style = {
        backgroundColor,
        color,
        fontSize,
        fontWeight,
        padding,
        borderRadius,
        border,
        margin
    };

    return (
        <div className={`relative ${isSelected && !isPreviewMode ? 'ring-2 ring-blue-500' : ''}`}>
            <button
                contentEditable={!isPreviewMode}
                suppressContentEditableWarning
                onBlur={handleTextChange}
                className={customClassName}
                style={style}
                dangerouslySetInnerHTML={{ __html: text }}
            />
        </div>
    );
};

const HtmlText = ({ text, fontSize, fontWeight, color, textAlign, margin, padding, customClassName, onUpdate, isSelected, isPreviewMode }) => {
    const handleTextChange = (e) => {
        if (onUpdate) {
            onUpdate({ text: e.target.innerHTML });
        }
    };

    const style = {
        fontSize,
        fontWeight,
        color,
        textAlign,
        margin,
        padding
    };

    return (
        <div className={`relative ${isSelected && !isPreviewMode ? 'ring-2 ring-blue-500' : ''}`}>
            <div
                contentEditable={!isPreviewMode}
                suppressContentEditableWarning
                onBlur={handleTextChange}
                className={customClassName}
                style={style}
                dangerouslySetInnerHTML={{ __html: text }}
            />
        </div>
    );
};

const HtmlElement = ({ originalHtml, customClassName, isEditable, onUpdate, isSelected, isPreviewMode }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editHtml, setEditHtml] = useState(originalHtml || '');

    const handleSave = () => {
        if (onUpdate) {
            onUpdate({ originalHtml: editHtml });
        }
        setIsEditing(false);
    };

    const handleCancel = () => {
        setEditHtml(originalHtml || '');
        setIsEditing(false);
    };

    if (isEditing && !isPreviewMode) {
        return (
            <div className="border-2 border-blue-300 rounded-lg p-4 bg-blue-50">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="text-sm font-semibold text-blue-800">Edit HTML</h3>
                    <div className="flex gap-2">
                        <button
                            onClick={handleSave}
                            className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                        >
                            Save
                        </button>
                        <button
                            onClick={handleCancel}
                            className="px-3 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
                <textarea
                    value={editHtml}
                    onChange={(e) => setEditHtml(e.target.value)}
                    className="w-full h-40 p-2 border border-gray-300 rounded text-sm font-mono"
                    placeholder="Enter HTML content..."
                />
            </div>
        );
    }

    return (
        <div 
            className={`relative ${customClassName || ''} ${isSelected && !isPreviewMode ? 'ring-2 ring-blue-500' : ''}`}
            onClick={() => !isPreviewMode && setIsEditing(true)}
        >
            {!isPreviewMode && (
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsEditing(true);
                        }}
                        className="p-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                        title="Edit HTML"
                    >
                        <LucideIcons.Edit className="w-3 h-3" />
                    </button>
                </div>
            )}
            <div 
                dangerouslySetInnerHTML={{ __html: originalHtml || '' }}
                className="html-content prose prose-slate max-w-none"
            />
        </div>
    );
};

const HtmlSectionElement = ({ originalHtml, customClassName, isEditable, onUpdate, isSelected, isPreviewMode }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editHtml, setEditHtml] = useState(originalHtml || '');

    const handleSave = () => {
        if (onUpdate) {
            onUpdate({ originalHtml: editHtml });
        }
        setIsEditing(false);
    };

    const handleCancel = () => {
        setEditHtml(originalHtml || '');
        setIsEditing(false);
    };

    if (isEditing && !isPreviewMode) {
        return (
            <div className="border-2 border-blue-300 rounded-lg p-4 bg-blue-50">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="text-sm font-semibold text-blue-800">Edit HTML Section</h3>
                    <div className="flex gap-2">
                        <button
                            onClick={handleSave}
                            className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                        >
                            Save
                        </button>
                        <button
                            onClick={handleCancel}
                            className="px-3 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
                <textarea
                    value={editHtml}
                    onChange={(e) => setEditHtml(e.target.value)}
                    className="w-full h-60 p-2 border border-gray-300 rounded text-sm font-mono"
                    placeholder="Enter HTML section content..."
                />
            </div>
        );
    }

    return (
        <div 
            className={`relative ${customClassName || ''} ${isSelected && !isPreviewMode ? 'ring-2 ring-blue-500' : ''}`}
            onClick={() => !isPreviewMode && setIsEditing(true)}
        >
            {!isPreviewMode && (
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsEditing(true);
                        }}
                        className="p-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                        title="Edit HTML Section"
                    >
                        <LucideIcons.Edit className="w-3 h-3" />
                    </button>
                </div>
            )}
            <div 
                dangerouslySetInnerHTML={{ __html: originalHtml || '' }}
                className="html-content prose prose-slate max-w-none"
            />
        </div>
    );
};

const HtmlHeadingElement = ({ text, tag = "h1", customClassName, fontSize, fontWeight, color, textAlign, margin, padding, onUpdate, isSelected, isPreviewMode, isEditable, originalHtml }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(text);

    const handleTextBlur = (e) => {
        if (onUpdate && !isPreviewMode) {
            onUpdate({ text: e.currentTarget.innerText });
        }
        setIsEditing(false);
    };

    const handleClick = (e) => {
        if (!isPreviewMode && isEditable) {
            e.preventDefault();
            setIsEditing(true);
            setEditText(text);
        }
    };

    if (isEditing && !isPreviewMode) {
        return (
            <div className="relative">
                <div 
                    className="absolute inset-0 bg-blue-50 border-2 border-blue-300 rounded-lg p-2 z-10"
                    style={{ minHeight: '40px' }}
                >
                    <textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        onBlur={() => {
                            onUpdate({ text: editText });
                            setIsEditing(false);
                        }}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                onUpdate({ text: editText });
                                setIsEditing(false);
                            }
                            if (e.key === 'Escape') {
                                setEditText(text);
                                setIsEditing(false);
                            }
                        }}
                        className="w-full h-full resize-none border-none bg-transparent text-sm font-mono focus:outline-none"
                        autoFocus
                    />
                </div>
                <div 
                    className="opacity-30"
                    dangerouslySetInnerHTML={{ __html: originalHtml || text }}
                />
            </div>
        );
    }

    return (
        <div 
            className={`relative group ${!isPreviewMode && isSelected ? 'ring-2 ring-blue-500' : ''}`}
            onClick={handleClick}
        >
            {!isPreviewMode && (
                <div className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                    <button
                        className="p-1 bg-blue-600 text-white rounded-full text-xs hover:bg-blue-700"
                        title="Edit heading"
                    >
                        <LucideIcons.Edit className="w-3 h-3" />
                    </button>
                </div>
            )}
            <div 
                dangerouslySetInnerHTML={{ __html: originalHtml || text }}
                className="html-content"
            />
        </div>
    );
};

const HtmlParagraphElement = ({ text, customClassName, fontSize, fontWeight, color, textAlign, lineHeight, margin, padding, onUpdate, isSelected, isPreviewMode, isEditable, originalHtml }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(text);

    const handleClick = (e) => {
        if (!isPreviewMode && isEditable) {
            e.preventDefault();
            setIsEditing(true);
            setEditText(text);
        }
    };

    if (isEditing && !isPreviewMode) {
        return (
            <div className="relative">
                <div 
                    className="absolute inset-0 bg-blue-50 border-2 border-blue-300 rounded-lg p-2 z-10"
                    style={{ minHeight: '60px' }}
                >
                    <textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        onBlur={() => {
                            onUpdate({ text: editText });
                            setIsEditing(false);
                        }}
                        onKeyDown={(e) => {
                            if (e.key === 'Escape') {
                                setEditText(text);
                                setIsEditing(false);
                            }
                        }}
                        className="w-full h-full resize-none border-none bg-transparent text-sm font-mono focus:outline-none"
                        autoFocus
                    />
                </div>
                <div 
                    className="opacity-30"
                    dangerouslySetInnerHTML={{ __html: originalHtml || text }}
                />
            </div>
        );
    }

    return (
        <div 
            className={`relative group ${!isPreviewMode && isSelected ? 'ring-2 ring-blue-500' : ''}`}
            onClick={handleClick}
        >
            {!isPreviewMode && (
                <div className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                    <button
                        className="p-1 bg-blue-600 text-white rounded-full text-xs hover:bg-blue-700"
                        title="Edit paragraph"
                    >
                        <LucideIcons.Edit className="w-3 h-3" />
                    </button>
                </div>
            )}
            <div 
                dangerouslySetInnerHTML={{ __html: originalHtml || text }}
                className="html-content"
            />
        </div>
    );
};

const HtmlImageElement = ({ src, alt, customClassName, width, height, borderRadius, margin, padding, onUpdate, isSelected, isPreviewMode, originalHtml }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editSrc, setEditSrc] = useState(src);
    const [editAlt, setEditAlt] = useState(alt);

    const handleClick = (e) => {
        if (!isPreviewMode) {
            e.preventDefault();
            setIsEditing(true);
            setEditSrc(src);
            setEditAlt(alt);
        }
    };

    if (isEditing && !isPreviewMode) {
        return (
            <div className="relative">
                <div 
                    className="absolute inset-0 bg-blue-50 border-2 border-blue-300 rounded-lg p-3 z-10"
                    style={{ minHeight: '100px' }}
                >
                    <div className="space-y-2">
                        <input
                            type="text"
                            value={editSrc}
                            onChange={(e) => setEditSrc(e.target.value)}
                            placeholder="Image URL"
                            className="w-full p-2 border border-gray-300 rounded text-sm"
                        />
                        <input
                            type="text"
                            value={editAlt}
                            onChange={(e) => setEditAlt(e.target.value)}
                            placeholder="Alt text"
                            className="w-full p-2 border border-gray-300 rounded text-sm"
                        />
                        <div className="flex gap-2">
                            <button
                                onClick={() => {
                                    onUpdate({ src: editSrc, alt: editAlt });
                                    setIsEditing(false);
                                }}
                                className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                            >
                                Save
                            </button>
                            <button
                                onClick={() => {
                                    setEditSrc(src);
                                    setEditAlt(alt);
                                    setIsEditing(false);
                                }}
                                className="px-3 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
                <div 
                    className="opacity-30"
                    dangerouslySetInnerHTML={{ __html: originalHtml }}
                />
            </div>
        );
    }

    return (
        <div 
            className={`relative group ${!isPreviewMode && isSelected ? 'ring-2 ring-blue-500' : ''}`}
            onClick={handleClick}
        >
            {!isPreviewMode && (
                <div className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                    <button
                        className="p-1 bg-blue-600 text-white rounded-full text-xs hover:bg-blue-700"
                        title="Edit image"
                    >
                        <LucideIcons.Edit className="w-3 h-3" />
                    </button>
                </div>
            )}
            <div 
                dangerouslySetInnerHTML={{ __html: originalHtml }}
                className="html-content"
            />
        </div>
    );
};

const HtmlButtonElement = ({ text, link, customClassName, backgroundColor, color, fontSize, fontWeight, padding, borderRadius, margin, onUpdate, isSelected, isPreviewMode, isEditable, originalHtml }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(text);
    const [editLink, setEditLink] = useState(link);

    const handleClick = (e) => {
        if (!isPreviewMode && isEditable) {
            e.preventDefault();
            setIsEditing(true);
            setEditText(text);
            setEditLink(link);
        }
    };

    if (isEditing && !isPreviewMode) {
        return (
            <div className="relative">
                <div 
                    className="absolute inset-0 bg-blue-50 border-2 border-blue-300 rounded-lg p-3 z-10"
                    style={{ minHeight: '60px' }}
                >
                    <div className="space-y-2">
                        <input
                            type="text"
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            placeholder="Button text"
                            className="w-full p-2 border border-gray-300 rounded text-sm"
                        />
                        <input
                            type="text"
                            value={editLink}
                            onChange={(e) => setEditLink(e.target.value)}
                            placeholder="Link URL"
                            className="w-full p-2 border border-gray-300 rounded text-sm"
                        />
                        <div className="flex gap-2">
                            <button
                                onClick={() => {
                                    onUpdate({ text: editText, link: editLink });
                                    setIsEditing(false);
                                }}
                                className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                            >
                                Save
                            </button>
                            <button
                                onClick={() => {
                                    setEditText(text);
                                    setEditLink(link);
                                    setIsEditing(false);
                                }}
                                className="px-3 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
                <div 
                    className="opacity-30"
                    dangerouslySetInnerHTML={{ __html: originalHtml }}
                />
            </div>
        );
    }

    return (
        <div 
            className={`relative group ${!isPreviewMode && isSelected ? 'ring-2 ring-blue-500' : ''}`}
            onClick={handleClick}
        >
            {!isPreviewMode && (
                <div className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                    <button
                        className="p-1 bg-blue-600 text-white rounded-full text-xs hover:bg-blue-700"
                        title="Edit button"
                    >
                        <LucideIcons.Edit className="w-3 h-3" />
                    </button>
                </div>
            )}
            <div 
                dangerouslySetInnerHTML={{ __html: originalHtml }}
                className="html-content"
            />
        </div>
    );
};

const HtmlTextElement = ({ text, customClassName, fontSize, fontWeight, color, textAlign, margin, padding, onUpdate, isSelected, isPreviewMode, isEditable, originalHtml }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(text);

    const handleClick = (e) => {
        if (!isPreviewMode && isEditable) {
            e.preventDefault();
            setIsEditing(true);
            setEditText(text);
        }
    };

    if (isEditing && !isPreviewMode) {
        return (
            <div className="relative">
                <div 
                    className="absolute inset-0 bg-blue-50 border-2 border-blue-300 rounded-lg p-2 z-10"
                    style={{ minHeight: '40px' }}
                >
                    <textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        onBlur={() => {
                            onUpdate({ text: editText });
                            setIsEditing(false);
                        }}
                        onKeyDown={(e) => {
                            if (e.key === 'Escape') {
                                setEditText(text);
                                setIsEditing(false);
                            }
                        }}
                        className="w-full h-full resize-none border-none bg-transparent text-sm font-mono focus:outline-none"
                        autoFocus
                    />
                </div>
                <div 
                    className="opacity-30"
                    dangerouslySetInnerHTML={{ __html: originalHtml || text }}
                />
            </div>
        );
    }

    return (
        <div 
            className={`relative group ${!isPreviewMode && isSelected ? 'ring-2 ring-blue-500' : ''}`}
            onClick={handleClick}
        >
            {!isPreviewMode && (
                <div className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                    <button
                        className="p-1 bg-blue-600 text-white rounded-full text-xs hover:bg-blue-700"
                        title="Edit text"
                    >
                        <LucideIcons.Edit className="w-3 h-3" />
                    </button>
                </div>
            )}
            <div 
                dangerouslySetInnerHTML={{ __html: originalHtml || text }}
                className="html-content"
            />
        </div>
    );
};

const VisualHtmlEditor = ({ originalHtml, onUpdate, isSelected, isPreviewMode, elementId, onSelect }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editHtml, setEditHtml] = useState(originalHtml || '');

    // Function to add data-element-id to all editable elements
    const addElementIdsToHtml = (html) => {
        if (!html || isPreviewMode) return html;
        
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        
        // Find all editable elements and add data-element-id if they don't have one
            const editableElements = tempDiv.querySelectorAll('h1, h2, h3, h4, h5, h6, p, button, img, div, span');
        
        editableElements.forEach((element) => {
            if (!element.getAttribute('data-element-id')) {
                const elementType = element.tagName.toLowerCase();
                const elementId = generateId(elementType);
                element.setAttribute('data-element-id', elementId);
            }
        });
        
        return tempDiv.innerHTML;
    };

    // Update the originalHtml with IDs when component mounts or HTML changes
    useEffect(() => {
        if (originalHtml && !isPreviewMode) {
            const htmlWithIds = addElementIdsToHtml(originalHtml);
            if (htmlWithIds !== originalHtml) {
                // Update the stored HTML with IDs
                onUpdate({ originalHtml: htmlWithIds });
            }
        }
    }, [originalHtml, isPreviewMode]);

    const handleElementClick = (e) => {
        if (!isPreviewMode) {
            e.preventDefault();
            e.stopPropagation();
            
            // Find the clicked element
            const clickedElement = e.target;
            const elementType = clickedElement.tagName.toLowerCase();
            
            console.log('🖱️ Element clicked:', { elementType, clickedElement, text: clickedElement.textContent });
            
            // Check if this is an icon element (div or span with specific classes, dimensions, or contains ■ symbol)
            const isIconElement = (elementType === 'div' || elementType === 'span') && (
                // Check if the element itself has icon classes
                clickedElement.classList.contains('w-16') || 
                clickedElement.classList.contains('h-16') ||
                clickedElement.classList.contains('w-20') ||
                clickedElement.classList.contains('h-20') ||
                clickedElement.style.width === '64px' ||
                clickedElement.style.height === '64px' ||
                clickedElement.style.width === '80px' ||
                clickedElement.style.height === '80px' ||
                // Check if the element contains icon symbols
                clickedElement.textContent.includes('■') ||
                clickedElement.innerHTML.includes('■') ||
                clickedElement.textContent.includes('●') ||
                clickedElement.innerHTML.includes('●') ||
                clickedElement.textContent.includes('▲') ||
                clickedElement.innerHTML.includes('▲') ||
                clickedElement.textContent.includes('◆') ||
                clickedElement.innerHTML.includes('◆') ||
                clickedElement.textContent.includes('★') ||
                clickedElement.innerHTML.includes('★') ||
                clickedElement.textContent.includes('♦') ||
                clickedElement.innerHTML.includes('♦') ||
                clickedElement.textContent.includes('◼') ||
                clickedElement.innerHTML.includes('◼') ||
                clickedElement.textContent.includes('◻') ||
                clickedElement.innerHTML.includes('◻') ||
                // Check if the parent element has icon classes (for span inside div)
                (elementType === 'span' && clickedElement.parentElement && (
                    clickedElement.parentElement.classList.contains('w-16') ||
                    clickedElement.parentElement.classList.contains('h-16') ||
                    clickedElement.parentElement.classList.contains('w-20') ||
                    clickedElement.parentElement.classList.contains('h-20') ||
                    clickedElement.parentElement.classList.contains('bg-gray-600') ||
                    clickedElement.parentElement.classList.contains('rounded-lg')
                ))
            );
            
            console.log('🔍 Icon detection result:', { isIconElement, elementType, text: clickedElement.textContent });
            
            // Get the existing data-element-id (should already be set by addElementIdsToHtml)
            const elementUniqueId = clickedElement.getAttribute('data-element-id');
            
            if (!elementUniqueId) {
                console.log('❌ No data-element-id found on clicked element');
                return;
            }
            
            // Extract element properties
            // If we clicked on a span inside an icon div, use the parent div's properties
            let targetElement = clickedElement;
            if (elementType === 'span' && isIconElement && clickedElement.parentElement) {
                targetElement = clickedElement.parentElement;
            }

            const elementProps = {
                id: elementUniqueId,
                type: isIconElement ? 'icon' : elementType,
                text: targetElement.innerText || targetElement.textContent || '',
                className: targetElement.className || '',
                style: targetElement.style.cssText || '',
                tagName: targetElement.tagName.toLowerCase(),
                originalHtml: targetElement.outerHTML,
                element: targetElement,
                isIcon: isIconElement
            };
            
            console.log('🎯 Element props created:', elementProps);
            
            // Call onSelect to show properties in right panel
            if (onSelect) {
                onSelect(elementProps);
            }
        }
    };

    const handleContainerClick = (e) => {
        if (!isPreviewMode && e.target === e.currentTarget) {
            // Clicked on container, not on a child element - don't select anything
            // Let the individual element clicks handle the selection
            return;
        }
    };

    return (
        <div 
            className={`relative group ${!isPreviewMode && isSelected ? 'ring-2 ring-blue-500' : ''} ${!isPreviewMode ? 'hover:ring-2 hover:ring-green-400 hover:ring-opacity-60 transition-all duration-200' : ''}`}
            onClick={handleContainerClick}
        >
            <div 
                dangerouslySetInnerHTML={{ __html: addElementIdsToHtml(originalHtml || '') }}
                className={`html-content ${!isPreviewMode ? 'visual-editor-mode' : ''}`}
                onClick={handleElementClick}
                style={{ cursor: !isPreviewMode ? 'pointer' : 'default' }}
            />
            {!isPreviewMode && (
                <style jsx>{`
                    .visual-editor-mode h1,
                    .visual-editor-mode h2,
                    .visual-editor-mode h3,
                    .visual-editor-mode h4,
                    .visual-editor-mode h5,
                    .visual-editor-mode h6,
                    .visual-editor-mode p,
                    .visual-editor-mode button,
                    .visual-editor-mode img,
                    .visual-editor-mode div {
                        position: relative;
                        transition: all 0.2s ease;
                        cursor: pointer;
                    }
                    
                    .visual-editor-mode h1:hover,
                    .visual-editor-mode h2:hover,
                    .visual-editor-mode h3:hover,
                    .visual-editor-mode h4:hover,
                    .visual-editor-mode h5:hover,
                    .visual-editor-mode h6:hover,
                    .visual-editor-mode p:hover,
                    .visual-editor-mode button:hover,
                    .visual-editor-mode img:hover,
                    .visual-editor-mode div:hover {
                        outline: 3px solid #10b981;
                        outline-offset: 3px;
                        border-radius: 6px;
                        box-shadow: 0 0 0 1px rgba(16, 185, 129, 0.3);
                        background-color: rgba(16, 185, 129, 0.05);
                    }
                    
                `}</style>
            )}
        </div>
    );
};

const VisualElementProperties = ({ props, onUpdate, id, selectedVisualElement }) => {
    const { type, text, className, style, tagName } = props;

    const handleTextChange = (newText) => {
        // Update the text content in the HTML
        updateVisualElement({ text: newText });
    };

    const handleStyleChange = (property, value) => {
        // Update specific style property in the HTML
        const currentStyle = style || '';
        const newStyle = currentStyle + `; ${property}: ${value}`;
        updateVisualElement({ style: newStyle });
    };

    const handleClassChange = (newClass) => {
        updateVisualElement({ className: newClass });
    };

    const getCurrentIcon = (text) => {
        if (!text) return '■';
        // Return the first character if it's an icon, otherwise return ■
        const iconChars = ['■', '●', '▲', '◆', '★', '♦', '◼', '◻', '🔹', '🔸', '🔺', '🔻', '⭐', '✨', '💎', '🔴', '🟢', '🔵', '🟡', '🟠', '🟣', '⚫', '⚪'];
        return iconChars.includes(text.charAt(0)) ? text.charAt(0) : '■';
    };

    const getIconShape = (className) => {
        if (className.includes('rounded-full')) return 'circle';
        if (className.includes('rounded-lg')) return 'rounded';
        if (className.includes('rounded-md')) return 'rounded';
        if (className.includes('rounded-sm')) return 'rounded';
        return 'square';
    };

    const getIconSize = (className) => {
        if (className.includes('w-16')) return 64;
        if (className.includes('w-20')) return 80;
        if (className.includes('w-12')) return 48;
        if (className.includes('w-8')) return 32;
        return 64;
    };

    const handleIconChange = (icon) => {
        updateVisualElement({ text: icon });
    };

    const handleIconShapeChange = (shape) => {
        let newClassName = className;
        
        // Remove existing shape classes
        newClassName = newClassName.replace(/rounded-(full|lg|md|sm)/g, '');
        
        // Add new shape class
        switch (shape) {
            case 'circle':
                newClassName += ' rounded-full';
                break;
            case 'rounded':
                newClassName += ' rounded-lg';
                break;
            case 'square':
                // No additional class needed for square
                break;
            case 'none':
                // No additional class needed
                break;
        }
        
        updateVisualElement({ className: newClassName.trim() });
    };

    const handleIconSizeChange = (size) => {
        let newClassName = className;
        
        // Remove existing size classes
        newClassName = newClassName.replace(/w-(8|12|16|20|24|32)/g, '');
        newClassName = newClassName.replace(/h-(8|12|16|20|24|32)/g, '');
        
        // Add new size classes
        const sizeClass = `w-${size} h-${size}`;
        newClassName += ` ${sizeClass}`;
        
        updateVisualElement({ className: newClassName.trim() });
    };

    const updateVisualElement = (updates) => {
        console.log('🎨 VisualElementProperties updateVisualElement called:', updates);
        console.log('🎨 Current selectedVisualElement:', selectedVisualElement);
        // Simple direct update - let the parent handle the HTML parsing
        onUpdate(updates);
    };

    const renderElementSpecificProperties = () => {
        console.log('🎨 VisualElementProperties renderElementSpecificProperties:', { type, selectedVisualElement, isIcon: selectedVisualElement?.isIcon });
        switch (type) {
            case 'h1':
            case 'h2':
            case 'h3':
            case 'h4':
            case 'h5':
            case 'h6':
                return (
                    <>
                        <PropertyGroup title="Content">
                            <DebouncedTextInput 
                                label="Heading Text" 
                                type="textarea" 
                                rows={3} 
                                initialValue={text} 
                                onCommit={handleTextChange} 
                                key={id}
                            />
                        </PropertyGroup>
                        <PropertyGroup title="Typography">
                            <StyledSlider 
                                label="Font Size" 
                                value={getStyleValue(style, 'font-size') || '2rem'} 
                                onChange={val => handleStyleChange('font-size', val)} 
                                max={72} 
                                unit="px" 
                                key={`${id}-fontsize`}
                            />
                            <CustomDropdown 
                                label="Font Weight" 
                                options={[
                                    {label: 'Normal', value: 'normal'}, 
                                    {label: 'Bold', value: 'bold'}, 
                                    {label: 'Light', value: '300'}, 
                                    {label: 'Medium', value: '500'}, 
                                    {label: 'Semi Bold', value: '600'}, 
                                    {label: 'Extra Bold', value: '800'}
                                ]} 
                                value={getStyleValue(style, 'font-weight') || 'bold'} 
                                onChange={val => handleStyleChange('font-weight', val)} 
                                key={`${id}-fontweight`}
                            />
                            <ColorInput 
                                label="Text Color" 
                                value={getStyleValue(style, 'color') || '#000000'} 
                                onChange={val => handleStyleChange('color', val)} 
                                key={`${id}-color`}
                            />
                            <CustomDropdown 
                                label="Text Align" 
                                options={[
                                    {label: 'Left', value: 'left'}, 
                                    {label: 'Center', value: 'center'}, 
                                    {label: 'Right', value: 'right'}, 
                                    {label: 'Justify', value: 'justify'}
                                ]} 
                                value={getStyleValue(style, 'text-align') || 'center'} 
                                onChange={val => handleStyleChange('text-align', val)} 
                                key={`${id}-align`}
                            />
                        </PropertyGroup>
                    </>
                );

            case 'p':
                return (
                    <>
                        <PropertyGroup title="Content">
                            <DebouncedTextInput 
                                label="Paragraph Text" 
                                type="textarea" 
                                rows={4} 
                                initialValue={text} 
                                onCommit={handleTextChange} 
                                key={id}
                            />
                        </PropertyGroup>
                        <PropertyGroup title="Typography">
                            <StyledSlider 
                                label="Font Size" 
                                value={getStyleValue(style, 'font-size') || '1rem'} 
                                onChange={val => handleStyleChange('font-size', val)} 
                                max={48} 
                                unit="px" 
                                key={`${id}-fontsize`}
                            />
                            <CustomDropdown 
                                label="Font Weight" 
                                options={[
                                    {label: 'Normal', value: 'normal'}, 
                                    {label: 'Bold', value: 'bold'}, 
                                    {label: 'Light', value: '300'}, 
                                    {label: 'Medium', value: '500'}
                                ]} 
                                value={getStyleValue(style, 'font-weight') || 'normal'} 
                                onChange={val => handleStyleChange('font-weight', val)} 
                                key={`${id}-fontweight`}
                            />
                            <ColorInput 
                                label="Text Color" 
                                value={getStyleValue(style, 'color') || '#000000'} 
                                onChange={val => handleStyleChange('color', val)} 
                                key={`${id}-color`}
                            />
                            <CustomDropdown 
                                label="Text Align" 
                                options={[
                                    {label: 'Left', value: 'left'}, 
                                    {label: 'Center', value: 'center'}, 
                                    {label: 'Right', value: 'right'}, 
                                    {label: 'Justify', value: 'justify'}
                                ]} 
                                value={getStyleValue(style, 'text-align') || 'center'} 
                                onChange={val => handleStyleChange('text-align', val)} 
                                key={`${id}-align`}
                            />
                            <StyledSlider 
                                label="Line Height" 
                                value={getStyleValue(style, 'line-height') || '1.5'} 
                                onChange={val => handleStyleChange('line-height', val)} 
                                max={10} 
                                step={0.1} 
                                key={`${id}-lineheight`}
                            />
                        </PropertyGroup>
                    </>
                );

            case 'button':
                return (
                    <>
                        <PropertyGroup title="Content">
                            <DebouncedTextInput 
                                label="Button Text" 
                                initialValue={text} 
                                onCommit={handleTextChange} 
                                key={`${id}-text`}
                            />
                        </PropertyGroup>
                        <PropertyGroup title="Styling">
                            <ColorInput 
                                label="Background Color" 
                                value={getStyleValue(style, 'background-color') || '#3b82f6'} 
                                onChange={val => handleStyleChange('background-color', val)} 
                                key={`${id}-bgcolor`}
                            />
                            <ColorInput 
                                label="Text Color" 
                                value={getStyleValue(style, 'color') || '#ffffff'} 
                                onChange={val => handleStyleChange('color', val)} 
                                key={`${id}-color`}
                            />
                            <StyledSlider 
                                label="Font Size" 
                                value={getStyleValue(style, 'font-size') || '1rem'} 
                                onChange={val => handleStyleChange('font-size', val)} 
                                max={32} 
                                unit="px" 
                                key={`${id}-fontsize`}
                            />
                            <DebouncedTextInput 
                                label="Padding" 
                                initialValue={getStyleValue(style, 'padding') || '0.5rem 1rem'} 
                                onCommit={val => handleStyleChange('padding', val)} 
                                key={`${id}-padding`}
                            />
                            <DebouncedTextInput 
                                label="Border Radius" 
                                initialValue={getStyleValue(style, 'border-radius') || '0.375rem'} 
                                onCommit={val => handleStyleChange('border-radius', val)} 
                                key={`${id}-radius`}
                            />
                        </PropertyGroup>
                    </>
                );

            case 'img':
                return (
                    <>
                        <PropertyGroup title="Image">
                            <DebouncedTextInput 
                                label="Image URL" 
                                initialValue={props.src || ''} 
                                onCommit={val => onUpdate({ src: val })} 
                                key={`${id}-src`}
                            />
                            <DebouncedTextInput 
                                label="Alt Text" 
                                initialValue={props.alt || ''} 
                                onCommit={val => onUpdate({ alt: val })} 
                                key={`${id}-alt`}
                            />
                        </PropertyGroup>
                        <PropertyGroup title="Dimensions">
                            <DebouncedTextInput 
                                label="Width" 
                                initialValue={getStyleValue(style, 'width') || 'auto'} 
                                onCommit={val => handleStyleChange('width', val)} 
                                key={`${id}-width`}
                            />
                            <DebouncedTextInput 
                                label="Height" 
                                initialValue={getStyleValue(style, 'height') || 'auto'} 
                                onCommit={val => handleStyleChange('height', val)} 
                                key={`${id}-height`}
                            />
                            <DebouncedTextInput 
                                label="Border Radius" 
                                initialValue={getStyleValue(style, 'border-radius') || '0'} 
                                onCommit={val => handleStyleChange('border-radius', val)} 
                                key={`${id}-radius`}
                            />
                        </PropertyGroup>
                    </>
                );

            default:
                return (
                    <>
                        <PropertyGroup title="Content">
                            <DebouncedTextInput 
                                label="Text Content" 
                                type="textarea" 
                                rows={3} 
                                initialValue={text} 
                                onCommit={handleTextChange} 
                                key={id}
                            />
                        </PropertyGroup>
                        <PropertyGroup title="Typography">
                            <StyledSlider 
                                label="Font Size" 
                                value={getStyleValue(style, 'font-size') || '1rem'} 
                                onChange={val => handleStyleChange('font-size', val)} 
                                max={48} 
                                unit="px" 
                                key={`${id}-fontsize`}
                            />
                            <ColorInput 
                                label="Text Color" 
                                value={getStyleValue(style, 'color') || '#000000'} 
                                onChange={val => handleStyleChange('color', val)} 
                                key={`${id}-color`}
                            />
                            <CustomDropdown 
                                label="Text Align" 
                                options={[
                                    {label: 'Left', value: 'left'}, 
                                    {label: 'Center', value: 'center'}, 
                                    {label: 'Right', value: 'right'}, 
                                    {label: 'Justify', value: 'justify'}
                                ]} 
                                value={getStyleValue(style, 'text-align') || 'center'} 
                                onChange={val => handleStyleChange('text-align', val)} 
                                key={`${id}-align`}
                            />
                        </PropertyGroup>
                    </>
                );

            case 'div':
            case 'span':
                console.log('🎨 Div/Span case:', { isIcon: selectedVisualElement?.isIcon, selectedVisualElement });
                if (selectedVisualElement?.isIcon) {
                    return (
                        <>
                            <PropertyGroup title="Icon Settings">
                                <CustomDropdown 
                                    label="Icon Type" 
                                    options={[
                                        {label: '■ Square', value: '■'}, 
                                        {label: '● Circle', value: '●'}, 
                                        {label: '▲ Triangle', value: '▲'}, 
                                        {label: '◆ Diamond', value: '◆'},
                                        {label: '★ Star', value: '★'},
                                        {label: '♦ Diamond Alt', value: '♦'},
                                        {label: '◼ Filled Square', value: '◼'},
                                        {label: '◻ Empty Square', value: '◻'},
                                        {label: '🔹 Blue Diamond', value: '🔹'},
                                        {label: '🔸 Orange Diamond', value: '🔸'},
                                        {label: '🔺 Red Triangle', value: '🔺'},
                                        {label: '🔻 Red Triangle Down', value: '🔻'},
                                        {label: '⭐ Star', value: '⭐'},
                                        {label: '✨ Sparkles', value: '✨'},
                                        {label: '💎 Gem', value: '💎'},
                                        {label: '🔴 Red Circle', value: '🔴'},
                                        {label: '🟢 Green Circle', value: '🟢'},
                                        {label: '🔵 Blue Circle', value: '🔵'},
                                        {label: '🟡 Yellow Circle', value: '🟡'},
                                        {label: '🟠 Orange Circle', value: '🟠'},
                                        {label: '🟣 Purple Circle', value: '🟣'},
                                        {label: '⚫ Black Circle', value: '⚫'},
                                        {label: '⚪ White Circle', value: '⚪'}
                                    ]} 
                                    value={getCurrentIcon(text)} 
                                    onChange={val => handleIconChange(val)} 
                                    key={`${id}-icon`}
                                />
                                <CustomDropdown 
                                    label="Icon Shape" 
                                    options={[
                                        {label: 'Square', value: 'square'}, 
                                        {label: 'Circle', value: 'circle'}, 
                                        {label: 'Rounded', value: 'rounded'}, 
                                        {label: 'None', value: 'none'}
                                    ]} 
                                    value={getIconShape(className)} 
                                    onChange={val => handleIconShapeChange(val)} 
                                    key={`${id}-shape`}
                                />
                                <ColorInput 
                                    label="Background Color" 
                                    value={getStyleValue(style, 'background-color') || '#6b7280'} 
                                    onChange={val => handleStyleChange('background-color', val)} 
                                    key={`${id}-bgcolor`}
                                />
                                <ColorInput 
                                    label="Icon Color" 
                                    value={getStyleValue(style, 'color') || '#ffffff'} 
                                    onChange={val => handleStyleChange('color', val)} 
                                    key={`${id}-iconcolor`}
                                />
                                <NumberInput 
                                    label="Icon Size" 
                                    value={getIconSize(className)} 
                                    onChange={val => handleIconSizeChange(val)} 
                                    min={16}
                                    max={128}
                                />
                            </PropertyGroup>
                        </>
                    );
                } else {
                    return (
                        <>
                            <PropertyGroup title="Content">
                                <DebouncedTextInput 
                                    label="Text Content" 
                                    type="textarea" 
                                    rows={3} 
                                    initialValue={text} 
                                    onCommit={val => updateVisualElement({ text: val })} 
                                    key={id}
                                />
                            </PropertyGroup>
                            <PropertyGroup title="Styling">
                                <ColorInput 
                                    label="Background Color" 
                                    value={getStyleValue(style, 'background-color') || '#ffffff'} 
                                    onChange={val => handleStyleChange('background-color', val)} 
                                    key={`${id}-bgcolor`}
                                />
                                <CustomDropdown 
                                    label="Text Align" 
                                    options={[
                                        {label: 'Left', value: 'left'}, 
                                        {label: 'Center', value: 'center'}, 
                                        {label: 'Right', value: 'right'}, 
                                        {label: 'Justify', value: 'justify'}
                                    ]} 
                                    value={getStyleValue(style, 'text-align') || 'center'} 
                                    onChange={val => handleStyleChange('text-align', val)} 
                                    key={`${id}-align`}
                                />
                            </PropertyGroup>
                        </>
                    );
                }
        }
    };

    return (
        <>
            {renderElementSpecificProperties()}
            <PropertyGroup title="Spacing">
                <NumberInput 
                    label="Margin" 
                    value={parseInt(getStyleValue(style, 'margin')) || 0} 
                    onChange={val => handleStyleChange('margin', val)} 
                />
                <NumberInput 
                    label="Padding" 
                    value={parseInt(getStyleValue(style, 'padding')) || 0} 
                    onChange={val => handleStyleChange('padding', val)} 
                />
            </PropertyGroup>
        </>
    );
};

// Helper function to extract style values
const getStyleValue = (styleString, property) => {
    if (!styleString) return null;
    const regex = new RegExp(`${property}\\s*:\\s*([^;]+)`);
    const match = styleString.match(regex);
    return match ? match[1].trim() : null;
};

const HtmlContentElement = ({ originalHtml, customClassName, isEditable, onUpdate, isSelected, isPreviewMode, elementId, onSelect }) => {
    return (
        <VisualHtmlEditor
            originalHtml={originalHtml}
            onUpdate={onUpdate}
            isSelected={isSelected}
            isPreviewMode={isPreviewMode}
            elementId={elementId}
            onSelect={onSelect}
        />
    );
};

const ALL_ELEMENT_TYPES = { Heading, TextBlock, ImageElement, ButtonElement, Divider, Spacer, IconElement, GoogleMapsPlaceholder, VideoElement, InnerSectionComponentDisplay, NavbarElement, CardSliderElement, AccordionElement, NewsletterElement, HtmlElement, HtmlSectionElement, HtmlHeadingElement, HtmlParagraphElement, HtmlImageElement, HtmlButtonElement, HtmlTextElement, HtmlContentElement };
const getDefaultProps = (id) => ({ ...(AVAILABLE_ELEMENTS_CONFIG.find(c => c.id === id)?.defaultProps || {}), style: {} });
const AVAILABLE_ELEMENTS_CONFIG = [
    { id: "header", name: "Heading", component: "Heading", category: 'Basic', defaultProps: { text: "Powerful Headline Here", customClassName: "text-4xl font-bold text-slate-800 text-left" } },
    { id: "textBlock", name: "Paragraph", component: "TextBlock", category: 'Basic', defaultProps: { text: "This is an engaging paragraph.", customClassName: "text-base text-slate-700 text-left" } },
    { id: "button", name: "Button", component: "ButtonElement", category: 'Basic', defaultProps: { buttonText: "Get Started", link: "#", customClassName: "inline-block bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors", textAlign: 'text-center' } },
    { id: "icon", name: "Icon", component: "IconElement", category: 'Basic', defaultProps: { iconName: "Rocket", size: "48px", color: "#16a34a" } },
    { id: "image", name: "Image", component: "ImageElement", category: 'Media', defaultProps: { src: img, alt: "Placeholder Image", customClassName: 'rounded-lg shadow-md' } },
    { id: "video", name: "Video", component: "VideoElement", category: 'Media', defaultProps: { videoType: "mp4", src: "" } },
    { id: "divider", name: "Divider", component: "Divider", category: 'Layout', defaultProps: {} },
    { id: "spacer", name: "Spacer", component: "Spacer", category: 'Layout', defaultProps: { height: "40px" } },
    { id: "innerSection", name: "Inner Section", component: "InnerSectionComponentDisplay", category: 'Layout', isContainer: true, hasOwnColumns: true, defaultProps: {} },
    { id: "accordion", name: "Accordion", component: "AccordionElement", category: 'Advanced', defaultProps: { title: "Accordion Title", content: "Details of the accordion." } },
    { id: "cardSlider", name: "Card Slider", component: "CardSliderElement", category: 'Advanced', defaultProps: { slides: [{ id: generateId(), imgSrc: img, heading: "Feature One", text: "Description for feature one.", link: "#" }], slidesPerView: 3, spaceBetween: 16 } },
    { id: "newsletter", name: "Newsletter", component: "NewsletterElement", category: 'Advanced', defaultProps: { title: "Get Exclusive Updates", subtitle: "Subscribe for weekly tips and special offers", placeholder: "name@email.com", buttonText: "Subscribe", customClassName: "py-20 bg-white" } },
    { id: "navbar", name: "Navbar", component: "NavbarElement", category: 'Global', isGlobalOnly: true, defaultProps: { logoText: "SiteName", links: [{ id: generateId(), text: "Home", url: "#" }], customClassName: "bg-white border-b border-gray-200 shadow-sm" } },
    { id: "htmlSection", name: "HTML Section", component: "HtmlSectionElement", category: 'Advanced', defaultProps: { originalHtml: "", customClassName: "", isEditable: true } },
    { id: "htmlElement", name: "HTML Element", component: "HtmlElement", category: 'Advanced', defaultProps: { originalHtml: "", customClassName: "", isEditable: true } },
    { id: "htmlHeading", name: "HTML Heading", component: "HtmlHeadingElement", category: 'HTML', defaultProps: { text: "Heading", tag: "h1", customClassName: "", fontSize: "2rem", fontWeight: "bold", color: "#000000", textAlign: "left", margin: "0", padding: "0" } },
    { id: "htmlParagraph", name: "HTML Paragraph", component: "HtmlParagraphElement", category: 'HTML', defaultProps: { text: "Paragraph text", customClassName: "", fontSize: "1rem", fontWeight: "normal", color: "#000000", textAlign: "left", lineHeight: "1.5", margin: "0", padding: "0" } },
    { id: "htmlImage", name: "HTML Image", component: "HtmlImageElement", category: 'HTML', defaultProps: { src: "", alt: "", customClassName: "", width: "auto", height: "auto", borderRadius: "0", margin: "0", padding: "0" } },
    { id: "htmlButton", name: "HTML Button", component: "HtmlButtonElement", category: 'HTML', defaultProps: { text: "Button", link: "#", customClassName: "", backgroundColor: "#3b82f6", color: "#ffffff", fontSize: "1rem", fontWeight: "medium", padding: "0.5rem 1rem", borderRadius: "0.375rem", margin: "0" } },
    { id: "htmlText", name: "HTML Text", component: "HtmlTextElement", category: 'HTML', defaultProps: { text: "Text content", customClassName: "", fontSize: "1rem", fontWeight: "normal", color: "#000000", textAlign: "left", margin: "0", padding: "0" } },
    { id: "htmlContent", name: "HTML Content", component: "HtmlContentElement", category: 'HTML', defaultProps: { originalHtml: "", customClassName: "", isEditable: true } },
];
const elementIcons = { header: <LucideIcons.Heading1 />, textBlock: <LucideIcons.Baseline />, image: <LucideIcons.Image />, button: <LucideIcons.MousePointerClick />, divider: <LucideIcons.Minus />, spacer: <LucideIcons.StretchVertical />, icon: <LucideIcons.Star />, video: <LucideIcons.Youtube />, innerSection: <LucideIcons.LayoutPanelLeft />, accordion: <LucideIcons.ChevronsUpDown />, cardSlider: <LucideIcons.GalleryHorizontalEnd />, newsletter: <LucideIcons.Mail />, navbar: <LucideIcons.Navigation />, footer: <LucideIcons.PanelBottom />, htmlSection: <LucideIcons.Code />, htmlElement: <LucideIcons.Code2 />, htmlHeading: <LucideIcons.Type />, htmlParagraph: <LucideIcons.FileText />, htmlImage: <LucideIcons.Image />, htmlButton: <LucideIcons.Square />, htmlText: <LucideIcons.AlignLeft />, htmlContent: <LucideIcons.FileCode />, default: <LucideIcons.Puzzle />, section: <LucideIcons.LayoutPanelTop />, column: <LucideIcons.View /> };

function htmlToBuilderJsonWithPreservation(htmlString) {
    if (!htmlString) return { sections: [], globalNavbar: null, globalFooter: null };

    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');

    const parseHtmlElement = (node) => {
        const tagName = node.tagName.toLowerCase();
        const elementId = generateId(tagName);
        
        let element = null;
        
        if (tagName.match(/^h[1-6]$/)) {
            element = {
                id: elementId,
                type: 'htmlHeading',
                props: {
                    text: node.innerHTML,
                    tag: tagName,
                    customClassName: node.className || '',
                    fontSize: getComputedStyle(node).fontSize || '2rem',
                    fontWeight: getComputedStyle(node).fontWeight || 'bold',
                    color: getComputedStyle(node).color || '#000000',
                    textAlign: getComputedStyle(node).textAlign || 'left',
                    margin: getComputedStyle(node).margin || '0',
                    padding: getComputedStyle(node).padding || '0',
                    originalHtml: node.outerHTML
                }
            };
        } else if (tagName === 'p') {
            element = {
                id: elementId,
                type: 'htmlParagraph',
                props: {
                    text: node.innerHTML,
                    customClassName: node.className || '',
                    fontSize: getComputedStyle(node).fontSize || '1rem',
                    fontWeight: getComputedStyle(node).fontWeight || 'normal',
                    color: getComputedStyle(node).color || '#000000',
                    textAlign: getComputedStyle(node).textAlign || 'left',
                    lineHeight: getComputedStyle(node).lineHeight || '1.5',
                    margin: getComputedStyle(node).margin || '0',
                    padding: getComputedStyle(node).padding || '0',
                    originalHtml: node.outerHTML
                }
            };
        } else if (tagName === 'img') {
            element = {
                id: elementId,
                type: 'htmlImage',
                props: {
                    src: node.src || '',
                    alt: node.alt || '',
                    customClassName: node.className || '',
                    width: node.width || 'auto',
                    height: node.height || 'auto',
                    borderRadius: getComputedStyle(node).borderRadius || '0',
                    margin: getComputedStyle(node).margin || '0',
                    padding: getComputedStyle(node).padding || '0',
                    originalHtml: node.outerHTML
                }
            };
        } else if (tagName === 'button' || (tagName === 'a' && !node.closest('nav, ul'))) {
            element = {
                id: elementId,
                type: 'htmlButton',
                props: {
                    text: node.innerText || node.innerHTML,
                    link: node.href || '#',
                    customClassName: node.className || '',
                    backgroundColor: getComputedStyle(node).backgroundColor || '#007bff',
                    color: getComputedStyle(node).color || '#ffffff',
                    fontSize: getComputedStyle(node).fontSize || '1rem',
                    fontWeight: getComputedStyle(node).fontWeight || 'normal',
                    padding: getComputedStyle(node).padding || '8px 16px',
                    borderRadius: getComputedStyle(node).borderRadius || '4px',
                    border: getComputedStyle(node).border || 'none',
                    margin: getComputedStyle(node).margin || '0',
                    originalHtml: node.outerHTML
                }
            };
        } else if (tagName === 'div' && node.children.length === 0 && node.innerText.trim()) {
            element = {
                id: elementId,
                type: 'htmlText',
                props: {
                    text: node.innerHTML,
                    customClassName: node.className || '',
                    fontSize: getComputedStyle(node).fontSize || '1rem',
                    fontWeight: getComputedStyle(node).fontWeight || 'normal',
                    color: getComputedStyle(node).color || '#000000',
                    textAlign: getComputedStyle(node).textAlign || 'left',
                    margin: getComputedStyle(node).margin || '0',
                    padding: getComputedStyle(node).padding || '0',
                    originalHtml: node.outerHTML
                }
            };
        }
        
        return element;
    };

    const createHtmlSection = (node, isFooter = false) => {
        const sectionId = isFooter ? 'global-footer' : generateId('section');
        const elements = [];
        
        // Parse all child elements
        const walker = document.createTreeWalker(
            node,
            NodeFilter.SHOW_ELEMENT,
            {
                acceptNode: (node) => {
                    const tagName = node.tagName.toLowerCase();
                    if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'img', 'button', 'a', 'div'].includes(tagName)) {
                        return NodeFilter.FILTER_ACCEPT;
                    }
                    return NodeFilter.FILTER_SKIP;
                }
            }
        );
        
        let currentNode;
        while (currentNode = walker.nextNode()) {
            const element = parseHtmlElement(currentNode);
            if (element) {
                elements.push(element);
            }
        }
        
        return {
            id: sectionId,
            type: 'htmlSection',
            props: {
                ...getDefaultProps('section'),
                customClassName: node.className || '',
                backgroundColor: getComputedStyle(node).backgroundColor || 'transparent',
                padding: getComputedStyle(node).padding || '0',
                margin: getComputedStyle(node).margin || '0',
                originalHtml: node.outerHTML
            },
            columns: [{
                id: generateId('col'),
                type: 'column',
                props: { customClassName: '' },
                elements: elements
            }]
        };
    };

    function parseNavbar(headerEl) {
        const newNav = { id: 'global-navbar', type: 'navbar', props: getDefaultProps('navbar') };
        newNav.props.customClassName = headerEl.className;
        const logo = headerEl.querySelector('.font-bold');
        if (logo) newNav.props.logoText = logo.innerText.trim();
        
        const navLinks = headerEl.querySelectorAll('nav a');
        if (navLinks.length > 0) {
            newNav.props.links = Array.from(navLinks).map(a => ({ id: generateId('link'), text: a.innerText.trim(), url: a.getAttribute('href') || '#' }));
        }
        return newNav;
    }

    let sections = [];
    let globalNavbar = null;
    let globalFooter = null;

    for (const node of Array.from(doc.body.children)) {
        if (node.tagName === 'HEADER') {
            globalNavbar = parseNavbar(node);
        } else if (node.tagName === 'FOOTER') {
            globalFooter = createHtmlSection(node, true);
        } else {
            const isSection = node.tagName === 'SECTION' || 
                             (node.tagName === 'DIV' && (
                                 node.children.length > 0 || 
                                 node.innerText.trim().length > 50 ||
                                 node.querySelector('h1, h2, h3, h4, h5, h6, p, img, button, input')
                             ));
            
            if (isSection) {
                const htmlSection = createHtmlSection(node);
                if (htmlSection) {
                    sections.push(htmlSection);
                }
            }
        }
    }

    return { sections, globalNavbar, globalFooter };
}

function htmlToBuilderJsonSimple(htmlString) {
    if (!htmlString) return { sections: [], globalNavbar: null, globalFooter: null };

    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');

    const createSimpleHtmlSection = (node, isFooter = false) => {
        const sectionId = isFooter ? 'global-footer' : generateId('section');
        
        return {
            id: sectionId,
            type: 'section',
            props: {
                ...getDefaultProps('section'),
                customClassName: node.className || ''
            },
            columns: [{
                id: generateId('col'),
                type: 'column',
                props: { customClassName: '' },
                elements: [{
                    id: generateId('htmlContent'),
                    type: 'htmlContent',
                    props: {
                        originalHtml: node.outerHTML,
                        customClassName: '',
                        isEditable: true
                    }
                }]
            }]
        };
    };

    function parseNavbar(headerEl) {
        const newNav = { id: 'global-navbar', type: 'navbar', props: getDefaultProps('navbar') };
        newNav.props.customClassName = headerEl.className;
        const logo = headerEl.querySelector('.font-bold');
        if (logo) newNav.props.logoText = logo.innerText.trim();
        
        const navLinks = headerEl.querySelectorAll('nav a');
        if (navLinks.length > 0) {
            newNav.props.links = Array.from(navLinks).map(a => ({ id: generateId('link'), text: a.innerText.trim(), url: a.getAttribute('href') || '#' }));
        }
        return newNav;
    }

    let sections = [];
    let globalNavbar = null;
    let globalFooter = null;

    for (const node of Array.from(doc.body.children)) {
        if (node.tagName === 'HEADER') {
            globalNavbar = parseNavbar(node);
        } else if (node.tagName === 'FOOTER') {
            globalFooter = createSimpleHtmlSection(node, true);
        } else {
            const isSection = node.tagName === 'SECTION' || 
                             (node.tagName === 'DIV' && (
                                 node.children.length > 0 || 
                                 node.innerText.trim().length > 50 ||
                                 node.querySelector('h1, h2, h3, h4, h5, h6, p, img, button, input')
                             ));
            
            if (isSection) {
                const htmlSection = createSimpleHtmlSection(node);
                if (htmlSection) {
                    sections.push(htmlSection);
                }
            }
        }
    }

    return { sections, globalNavbar, globalFooter };
}

function htmlToBuilderJson(htmlString) {
    if (!htmlString) return { sections: [], globalNavbar: null, globalFooter: null };

    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');

    const parseNode = (node) => {
        if (node.nodeType !== Node.ELEMENT_NODE) return null;

        let element = null;
        const tagName = node.tagName.toLowerCase();
        
        if (tagName.match(/^h[1-6]$/)) {
            element = { type: 'header', props: { text: node.innerHTML.trim(), customClassName: node.className } };
        } else if (tagName === 'p' || (tagName === 'a' && node.closest('nav, ul'))) {
             element = { type: 'textBlock', props: { text: node.innerHTML.trim(), customClassName: node.className } };
        } else if (tagName === 'li') {
            const link = node.querySelector('a');
            if (link) {
                 element = { type: 'textBlock', props: { text: link.outerHTML, customClassName: '' } };
            } else {
                 element = { type: 'textBlock', props: { text: node.innerHTML.trim(), customClassName: node.className } };
            }
        } else if (tagName === 'button' || (tagName === 'a' && !node.closest('nav, ul'))) {
            element = { type: 'button', props: { buttonText: node.innerText.trim(), link: node.getAttribute('href') || '#', customClassName: node.className } };
        } else if (tagName === 'img') {
            element = { type: 'image', props: { src: node.src, alt: node.alt, customClassName: node.className } };
        } else if (tagName === 'input' && node.type === 'email') {
            const formContainer = node.closest('section, div');
            if (formContainer) {
                element = { type: 'newsletter', props: {
                    title: formContainer.querySelector('h2, h3, h4')?.innerText.trim() || "",
                    subtitle: formContainer.querySelector('p')?.innerText.trim() || "",
                    placeholder: node.placeholder || 'name@email.com',
                    buttonText: formContainer.querySelector('button')?.innerText.trim() || 'Subscribe',
                    customClassName: formContainer.className
                }};
                return element;
            }
        } else if (node.innerText.trim() === '■' || node.innerText.trim() === '▲' || node.innerText.trim() === '●') {
             element = { type: 'icon', props: { iconName: "CheckSquare" }};
        } else if (tagName === 'div' && node.innerText.trim().length > 0 && !node.querySelector('h1, h2, h3, h4, h5, h6, p, img, button, input')) {
            element = { type: 'textBlock', props: { text: node.innerHTML.trim(), customClassName: node.className } };
        } else if (tagName === 'span' && node.innerText.trim().length > 0) {
            element = { type: 'textBlock', props: { text: node.innerHTML.trim(), customClassName: node.className } };
        }

        if (element) {
            element.id = generateId(element.type);
            element.props = { 
                ...getDefaultProps(element.type), 
                ...element.props,
            };
            return element;
        }
        return null;
    };
    
    const parseContainer = (containerEl) => {
        let elements = [];
        for (const childNode of Array.from(containerEl.childNodes)) {
            if (childNode.nodeType !== Node.ELEMENT_NODE || ['STYLE', 'SCRIPT'].includes(childNode.tagName)) continue;
            
            if (childNode.tagName.toLowerCase() === 'ul') {
                for(const li of Array.from(childNode.children)) {
                    const parsedLi = parseNode(li);
                    if (parsedLi) elements.push(parsedLi);
                }
                continue;
            }
            
            let parsedEl = parseNode(childNode);
            if (parsedEl) {
                if (parsedEl.type === 'newsletter') return [parsedEl];
                elements.push(parsedEl);
            } else if (childNode.hasChildNodes()) {
                elements.push(...parseContainer(childNode));
            }
        }
        return elements.filter(Boolean);
    };
    
    const parseSection = (sectionEl, isFooter = false) => {
        const newSection = {
            id: isFooter ? 'global-footer' : generateId('section'),
            type: 'section',
            props: {
                ...getDefaultProps('section'),
            },
            columns: []
        };
        
        if (isFooter) {
            newSection.props.customClassName = 'bg-slate-50 text-slate-800 py-20'; 
        } else {
            newSection.props.customClassName = sectionEl.className;
        }

        const mainContentContainer = sectionEl.children[0] || sectionEl;
        let layoutContainer = mainContentContainer?.querySelector('.grid, .flex:not([class*="items-center"]), [class*="grid"], [class*="flex"]');

        if (isFooter) {
            newSection.layoutContainerClassName = "grid grid-cols-1 md:grid-cols-5 gap-8";
        } else if(layoutContainer) {
            newSection.layoutContainerClassName = layoutContainer.className;
        }
        
        let colNodes = [];
        if (layoutContainer && layoutContainer.children.length > 0) {
            colNodes = Array.from(layoutContainer.children);
        } else if (mainContentContainer && mainContentContainer !== sectionEl) {
             colNodes = [mainContentContainer];
        } else {
            colNodes = [sectionEl];
        }

        colNodes.forEach(colEl => {
            if (isFooter && colEl.classList.contains('border-t')) {
                return;
            }

            const elements = parseContainer(colEl);
            if (elements.length > 0) {
                newSection.columns.push({
                    id: generateId('col'),
                    type: 'column',
                    props: { customClassName: isFooter ? '' : colEl.className }, 
                    elements
                });
            }
        });
        
        if (newSection.columns.length === 0) {
            const elements = parseContainer(sectionEl);
            if (elements.length > 0) {
                newSection.columns.push({
                    id: generateId('col'),
                    type: 'column',
                    props: { customClassName: '' }, 
                    elements
                });
            }
        }
        
        if (isFooter) {
            const copyrightNode = mainContentContainer?.querySelector('.border-t p, .text-center p');
            if (copyrightNode) {
                newSection.props.copyrightText = copyrightNode.innerHTML;
            } else {
                const lastP = Array.from(sectionEl.querySelectorAll('p')).pop();
                if (lastP && lastP.innerText.includes('©')) {
                    newSection.props.copyrightText = lastP.innerHTML;
                }
            }
        }
        
        return newSection.columns.length > 0 ? newSection : null;
    };
    
    function parseNavbar(headerEl) {
        const newNav = { id: 'global-navbar', type: 'navbar', props: getDefaultProps('navbar') };
        newNav.props.customClassName = headerEl.className;
        const logo = headerEl.querySelector('.font-bold');
        if (logo) newNav.props.logoText = logo.innerText.trim();
        
        const navLinks = headerEl.querySelectorAll('nav a');
        if (navLinks.length > 0) {
            newNav.props.links = Array.from(navLinks).map(a => ({ id: generateId('link'), text: a.innerText.trim(), url: a.getAttribute('href') || '#' }));
        }
        return newNav;
    }

    let sections = [];
    let globalNavbar = null;
    let globalFooter = null;

    for (const node of Array.from(doc.body.children)) {
        if (node.tagName === 'HEADER') {
            globalNavbar = parseNavbar(node);
        } else if (node.tagName === 'FOOTER') {
            globalFooter = parseSection(node, true);
        } else {
            const isSection = node.tagName === 'SECTION' || 
                             (node.tagName === 'DIV' && (
                                 node.children.length > 0 || 
                                 node.innerText.trim().length > 50 ||
                                 node.querySelector('h1, h2, h3, h4, h5, h6, p, img, button, input')
                             ));
            
            if (isSection) {
            const parsedSection = parseSection(node);
                if (parsedSection) {
                    sections.push(parsedSection);
                    // Found section
        }
    }
        }
    }
    
    // Final result
    
    return { sections, globalNavbar, globalFooter };
}

function DraggableCanvasElement({ elementData, onUpdateProps, onDelete, onSelect, isSelected, onOpenStructureModal, parentColumnId, isPreviewMode, onNavigate, isDraggable, }) {
  const config = AVAILABLE_ELEMENTS_CONFIG.find((c) => c.id === elementData.type);
  if (!config) return <div className="text-red-500 text-xs">Unknown element type: {elementData.type}</div>;
  const ComponentToRender = ALL_ELEMENT_TYPES[config.component];
  if (!ComponentToRender) return null;
  
  // DraggableCanvasElement render
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: elementData.id,
    data: { type: "canvasElement", elementId: elementData.id, parentColumnId, elementType: elementData.type, elementData, path: elementData.path },
    disabled: isPreviewMode || !isDraggable,
  });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging && !isPreviewMode ? 0.5 : 1, zIndex: isDragging && !isPreviewMode ? 100 : "auto" };
  const handleUpdate = (newProps) => { if (!isPreviewMode) onUpdateProps(elementData.path, newProps); };
  const handleClick = (e) => { e.stopPropagation(); if (!isPreviewMode && isDraggable) onSelect(elementData.id, "element", elementData.path, elementData); };
  
  const wrapperClasses = `relative group my-1.5 transition-all duration-150 ease-in-out ${!isPreviewMode && isSelected ? 'selected-outline' : ''} ${!isPreviewMode && isDragging ? "bg-green-50/80 shadow-2xl ring-2 ring-green-400 scale-[1.01] rounded-lg" : ""}`;

  return (
    <div ref={setNodeRef} style={style} onClick={handleClick} className={wrapperClasses}>
        {isDraggable && !isPreviewMode && (
          <div {...attributes} {...listeners} title="Drag element" className="absolute top-1/2 -left-3 transform -translate-y-1/2 p-1.5 cursor-grab bg-white hover:bg-green-600 text-slate-500 hover:text-white rounded-full border border-slate-300 hover:border-green-500 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 focus:opacity-100 z-20 print-hidden transition-all shadow-md">
            <LucideIcons.GripVertical className="w-4 h-4" />
          </div>
        )}
        <div className={isPreviewMode || (!isPreviewMode && isSelected) ? "" : "pointer-events-none"}>
            <ComponentToRender
                {...elementData.props}
                sectionData={elementData}
                onUpdate={handleUpdate}
                elementId={elementData.id}
                isSelected={!isPreviewMode && isSelected}
                onOpenStructureModal={onOpenStructureModal}
                selectedItemId={!isPreviewMode && isSelected ? elementData.id : null}
                isPreviewMode={isPreviewMode}
                onNavigate={onNavigate}
                isEditable={isDraggable && isSelected}
                isDraggable={isDraggable}
                onSelect={(elementProps) => {
                    // Handle visual element selection
                    const visualElementData = {
                        ...elementProps,
                        path: elementData.path,
                        parentElementId: elementData.id,
                        isIcon: elementProps.isIcon
                    };
                    onSelect(elementData.id, 'visualElement', elementData.path, visualElementData);
                }}
            />
        </div>
        {!isPreviewMode && isSelected && (
          <button onClick={(e) => { e.stopPropagation(); onDelete(elementData.path); }} title="Delete element" className="absolute -top-2.5 -right-2.5 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 hover:scale-110 transition-all w-6 h-6 flex items-center justify-center shadow-md z-20 print-hidden">
              <LucideIcons.X className="w-3 h-3" strokeWidth={3} />
          </button>
        )}
    </div>
  );
};
function ColumnComponent({ parentPath, columnData, columnIndex, onUpdateProps, onDelete, onSelect, selectedItemId, onOpenStructureModal, isInner = false, isPreviewMode, onNavigate, isDraggable, }) {
  const columnPath = `${parentPath}.columns[${columnIndex}]`;
  const isSelected = selectedItemId === columnData.id;
  const handleClick = (e) => { e.stopPropagation(); if (!isPreviewMode && isDraggable) { onSelect(columnData.id, "column", columnPath, columnData); } };
  const { setNodeRef: setDroppableRef, isOver } = useDroppable({ id: `col-${columnData.id}`, data: { type: "column", columnId: columnData.id, path: columnPath, accepts: ["paletteItem", "canvasElement"] }, disabled: isPreviewMode || !isDraggable });
  const elementIds = useMemo(() => columnData.elements.map((el) => el.id), [columnData.elements]);
  
  // ColumnComponent render
  
  const columnProps = columnData.props || {};
  const columnClassName = columnProps.customClassName || 'p-1.5 flex-shrink-0';
  
  return (
    <div onClick={handleClick} className={`${columnClassName} transition-all ${!isPreviewMode && isDraggable ? 'cursor-pointer' : ''} ${!isPreviewMode && isSelected ? "selected-outline" : !isPreviewMode ? "hover:outline hover:outline-1 hover:outline-offset-1 hover:outline-green-300/70 rounded-xl" : ""}`}>
        <SortableContext items={elementIds} strategy={verticalListSortingStrategy} disabled={isPreviewMode || !isDraggable}>
            <div ref={setDroppableRef} className={`min-h-[80px] rounded-lg transition-all ${!isPreviewMode ? `border ${isOver && isDraggable ? "bg-green-100/90 border-green-400 border-solid ring-1 ring-green-400" : "bg-transparent border-transparent"} ${columnData.elements.length === 0 && !isOver ? "border-dashed flex items-center justify-center text-slate-400/80 text-xs font-medium border-slate-300" : ""}` : ""}`}>
                {!isPreviewMode && columnData.elements.length === 0 && !isOver && isDraggable ? "Drop Element Here" : null}
                {columnData.elements.map((el, elIdx) => (
                    <DraggableCanvasElement
                        key={el.id}
                        elementData={{ ...el, path: `${columnPath}.elements[${elIdx}]` }}
                        onUpdateProps={onUpdateProps}
                        onDelete={onDelete}
                        onSelect={onSelect}
                        isSelected={selectedItemId === el.id}
                        onOpenStructureModal={onOpenStructureModal}
                        parentColumnId={columnData.id}
                        isPreviewMode={isPreviewMode}
                        onNavigate={onNavigate}
                        isDraggable={isDraggable}
                    />
                ))}
            </div>
        </SortableContext>
    </div>
  );
};
function SectionComponent({ sectionData, sectionIndex, onUpdateProps, onDelete, onSelect, selectedItemId, onOpenStructureModal, isPreviewMode, onNavigate, pageId, isDraggable, }) {
    const sectionPath = sectionIndex === -1 ? 'globalFooter' : `pages[${pageId}].layout[${sectionIndex}]`;
    const isSelected = selectedItemId === sectionData.id;
    const handleClick = (e) => { e.stopPropagation(); if (!isPreviewMode && isDraggable) { onSelect(sectionData.id, "section", sectionPath, sectionData); } };
    
    // SectionComponent render

    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: sectionData.id,
        data: { type: "section", sectionId: sectionData.id, path: sectionPath, sectionData, pageId },
        disabled: isPreviewMode || !isDraggable || sectionIndex === -1
    });
    const sortableStyle = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging && !isPreviewMode ? 0.75 : 1, zIndex: isDragging && !isPreviewMode ? 200 : "auto" };
    
    const sectionProps = sectionData.props || {};
    const { copyrightText, ...otherProps } = sectionProps;
    const sectionClassName = otherProps.customClassName || 'py-16 bg-white';
    const sectionRootClasses = `relative group transition-all duration-200 ease-in-out ${sectionClassName} ${!isPreviewMode && isSelected ? "selected-outline" : ""} ${!isPreviewMode && !isSelected ? "hover:ring-1 hover:ring-green-300/80 cursor-pointer" : ""}`.trim();

    const mainContentContainerClass = sectionIndex === -1 ? 'max-w-6xl mx-auto px-4' : '';

    return (
        <div ref={setNodeRef} style={sortableStyle} className={sectionRootClasses} onClick={handleClick}>
            {!isPreviewMode && isDraggable && sectionIndex !== -1 && (
                <div {...attributes} {...listeners} title="Drag section" className="absolute top-4 -left-3.5 transform p-2 cursor-grab bg-white hover:bg-green-600 text-slate-500 hover:text-white rounded-full border border-slate-300 hover:border-green-500 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 focus:opacity-100 z-30 print-hidden transition-opacity shadow-md">
                    <LucideIcons.Move className="w-4 h-4" />
                </div>
            )}
            {!isPreviewMode && isSelected && isDraggable && (
                <button onClick={(e) => { e.stopPropagation(); onDelete(sectionPath); }} title="Delete section" className="absolute -top-2.5 -right-2.5 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 hover:scale-110 transition-all w-6 h-6 flex items-center justify-center shadow-md z-30 print-hidden">
                    <LucideIcons.Trash2 className="w-3.5 h-3.5" strokeWidth={2.5} />
                </button>
            )}
            
            <div className={mainContentContainerClass}>
                <div className={sectionData.layoutContainerClassName || ''}>
                    {sectionData.columns && sectionData.columns.map((col, colIdx) => (
                        <ColumnComponent
                            key={col.id}
                            parentPath={sectionPath}
                            columnData={col}
                            columnIndex={colIdx}
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
                </div>

                {copyrightText && sectionIndex === -1 && (
                    <div className="border-t border-slate-300 mt-12 pt-8 text-center">
                        <p className="text-sm text-slate-600" dangerouslySetInnerHTML={{ __html: copyrightText }}></p>
                    </div>
                )}
            </div>
        </div>
    );
}

const DEVICE_FRAMES_CONFIG = [ { name: "Mobile", width: 390, icon: LucideIcons.Smartphone }, { name: "Tablet", width: 768, icon: LucideIcons.Tablet }, { name: "Desktop", width: 1440, icon: LucideIcons.Monitor }, ];

function DeviceFrame({ device, page, globalNavbar, globalFooter, onUpdateProps, onDelete, onSelect, selectedItemId, onOpenStructureModal, isPreviewMode, onNavigate, onDeleteGlobalElement, isDraggable, comments, onAddComment, activeTool, }) {
    const { setNodeRef: setPageDroppableRef, isOver } = useDroppable({ id: `page-droppable-${page.id}-${device.name}`, data: { type: "page", accepts: ["paletteItem", "section"], pageId: page.id }, disabled: isPreviewMode || !isDraggable, });
    const sectionIds = useMemo(() => page.layout.map((sec) => sec.id), [page.layout]);
    
    // DeviceFrame render
    const handleCommentOverlayClick = (e) => { e.stopPropagation(); onAddComment(page.id, device.name, { x: e.clientX, y: e.clientY }); };

    const containerStyle = {
      width: device.width,
      containerType: 'inline-size',
    };
    
    const DeviceIcon = device.icon;

    return (
        <div className="flex flex-col gap-3 items-center flex-shrink-0">
            <h3 className="text-white/90 font-semibold px-3 py-1 bg-black/20 rounded-md flex items-center gap-1.5 text-xs">
                <DeviceIcon className="w-3.5 h-3.5" /> {device.name}
            </h3>
            <div className="relative">
                <div style={containerStyle} className="bg-white shadow-xl rounded-2xl border border-slate-200 flex flex-col">
                    <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300">
                        {globalNavbar && (
                            <header className="z-10 flex-shrink-0 relative">
                                <NavbarElement {...globalNavbar.props} path="globalNavbar" isSelected={selectedItemId === globalNavbar.id} onSelect={() => onSelect(globalNavbar.id, 'globalElement', 'globalNavbar')} onUpdate={(p) => onUpdateProps("globalNavbar", p)} onDelete={() => onDeleteGlobalElement("navbar")} isDraggable={isDraggable} previewDevice={device.name.toLowerCase()} isPreviewMode={isPreviewMode}/>
                            </header>
                        )}
                        <div className="bg-slate-50/50 min-h-full">
                        <SortableContext items={sectionIds} strategy={verticalListSortingStrategy} disabled={isPreviewMode || !isDraggable}>
                            <div ref={setPageDroppableRef} className={`rounded-xl transition-all ${isOver && isDraggable ? "bg-green-100/80 ring-2 ring-green-400 ring-dashed" : ""} ${page.layout.length === 0 && !isOver ? "border-2 border-dashed border-slate-300/80 min-h-[50vh]" : "border-transparent"}`}>
                                {page.layout.map((sec, idx) => ( <SectionComponent key={sec.id} pageId={page.id} sectionData={sec} sectionIndex={idx} onUpdateProps={onUpdateProps} onDelete={onDelete} onSelect={onSelect} selectedItemId={selectedItemId} onOpenStructureModal={onOpenStructureModal} isPreviewMode={isPreviewMode} onNavigate={onNavigate} isDraggable={isDraggable}/> ))}
                                {!isPreviewMode && page.layout.length === 0 && !isOver && isDraggable && (
                                    <div className="flex flex-col items-center justify-center h-full text-center py-20 select-none pointer-events-none">
                                        <LucideIcons.LayoutTemplate className="h-20 w-20 text-slate-300/90 mb-4" strokeWidth={1} />
                                        <p className="text-slate-500 text-lg font-medium">Your canvas is empty</p>
                                        <p className="text-slate-400/90 text-sm">Drag elements or add a new section.</p>
                                    </div>
                                )}
                            </div>
                        </SortableContext>
                        </div>
                        {globalFooter && (
                            <footer className="z-10 flex-shrink-0 relative">
                                <SectionComponent
                                    sectionData={globalFooter}
                                    sectionIndex={-1}
                                    pageId={page.id}
                                    onUpdateProps={(path, props) => onUpdateProps('globalFooter.props', props)}
                                    onDelete={() => onDeleteGlobalElement('footer')}
                                    onSelect={() => onSelect(globalFooter.id, 'globalElement', 'globalFooter', globalFooter)}
                                    selectedItemId={selectedItemId}
                                    isDraggable={isDraggable}
                                    isPreviewMode={isPreviewMode}
                                    onNavigate={onNavigate}
                                />
                            </footer>
                        )}
                    </div>
                </div>
                {activeTool === 'comment' && ( <div className="absolute inset-0 z-30 cursor-crosshair" onClick={handleCommentOverlayClick} /> )}
                {comments.map((comment, index) => (
                    <div key={comment.id} style={{ top: `${comment.position.y}px`, left: `${comment.position.x}px`}} className="absolute w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center text-black font-bold text-xs border-2 border-white cursor-pointer z-50 transform -translate-x-1/2 -translate-y-1/2 shadow-lg" title={comment.text}> {index + 1} </div>
                ))}
            </div>
        </div>
    );
}
function StructureSelectorModal({ isOpen, onClose, onSelectStructure, context }) {
    if (!isOpen) return null;
    return (
        <GeneralModal isOpen={isOpen} onClose={onClose} title="Select a Structure" size="xl">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2">
                {PREDEFINED_STRUCTURES.map((s) => (
                    <button key={s.id} onClick={() => { onSelectStructure(s.layout, context); onClose(); }} className="p-2.5 bg-slate-50 rounded-lg hover:bg-white hover:ring-2 hover:ring-green-500 hover:shadow-lg hover:scale-[1.03] transition-all duration-200 flex flex-col items-center justify-start group focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500">
                        <div className="flex w-full h-20 mb-2 space-x-1.5 items-stretch p-1.5 bg-white ring-1 ring-slate-200 rounded-md shadow-inner">
                            {s.layout.map((col, idx) => (
                                <div key={idx} className="bg-slate-200 border border-slate-300 group-hover:bg-green-200/60 group-hover:border-green-300 rounded-sm transition-colors" style={{ flexBasis: col.width }}></div>
                            ))}
                        </div>
                        <span className="text-xs text-slate-700 group-hover:text-green-800 text-center font-semibold">{s.name}</span>
                    </button>
                ))}
            </div>
        </GeneralModal>
    );
}
function ElementPaletteItem({ config }) {
    const { attributes, listeners, setNodeRef, isDragging, transform } = useDraggable({ id: `palette-${config.id}`, data: { type: "paletteItem", config } });
    const style = transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`, zIndex: 9999, opacity: isDragging ? 0.95 : 1 } : {};
    let IconToShow = React.cloneElement(elementIcons[config.id] || elementIcons.default, { className: "w-5 h-5" });

    if (isDragging) {
        return (
            <div ref={setNodeRef} style={style} className="flex items-center gap-2.5 p-2 text-left bg-green-100 rounded-lg shadow-xl ring-2 ring-green-400 opacity-95">
                <div className="flex items-center justify-center text-green-600">{IconToShow}</div>
                <span className="text-xs font-semibold text-green-800">{config.name}</span>
            </div>
        );
    }

    return (
        <div ref={setNodeRef} {...listeners} {...attributes} style={style} className="flex items-center gap-2.5 p-2 text-left bg-white border border-slate-200 rounded-lg cursor-grab hover:bg-green-50 hover:border-green-300 hover:shadow-md transition-all group focus:outline-none focus-visible:ring-1 focus-visible:ring-green-500">
            <div className="text-slate-500 group-hover:text-green-600 transition-colors">{IconToShow}</div>
            <span className="text-xs font-semibold text-slate-700 group-hover:text-green-800">{config.name}</span>
        </div>
    );
}
function PaletteItemDragOverlay({ config }) {
    let IconToShow = React.cloneElement(elementIcons[config.id] || elementIcons.default, { className: "w-5 h-5" });
    return (
        <div className="flex items-center p-2.5 text-left bg-green-100 rounded-lg shadow-2xl ring-2 ring-green-500 opacity-95 cursor-grabbing">
            <div className="w-7 h-7 flex items-center justify-center text-green-600 mr-2">{IconToShow}</div>
            <span className="text-xs font-semibold text-green-800">{config.name}</span>
        </div>
    );
}
function AiLoader() {
    return (
        <div className="flex space-x-1.5 justify-center items-center">
            <span className="sr-only">Loading...</span>
            <div className="h-1.5 w-1.5 bg-green-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="h-1.5 w-1.5 bg-green-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="h-1.5 w-1.5 bg-green-500 rounded-full animate-bounce"></div>
        </div>
    );
}
function AiModeView({ onBack, onAiSubmit, isAiLoading, aiChatHistory, aiSuggestions, handleUndo, handleRedo, canUndo, canRedo, originalApiHtml }) {
    const handleKeyDown = (e) => {
        if(e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            const prompt = e.target.value.trim();
            if (prompt) {
                onAiSubmit(prompt);
                e.target.value = '';
            }
        }
    };
    return (
        <div className="p-3 flex flex-col h-full bg-white">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <button onClick={onBack} className="flex items-center gap-1 text-xs text-slate-600 hover:text-green-700 p-1 rounded-md -ml-1">
                    <LucideIcons.ArrowLeft className="w-3.5 h-3.5" /> Back
                </button>
                <div className="flex items-center gap-1">
                    <button onClick={handleUndo} disabled={!canUndo} title="Undo" className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                        <LucideIcons.Undo2 className="w-4 h-4"/>
                    </button>
                     <button onClick={handleRedo} disabled={!canRedo} title="Redo" className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                        <LucideIcons.Redo2 className="w-4 h-4"/>
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 py-3">
                 {aiChatHistory.map(entry => (
                    <div key={entry.id} className="text-xs p-2.5 rounded-lg bg-slate-50 border border-slate-200/60">
                        <p className="font-medium text-slate-800">{entry.prompt}</p>
                        {entry.summary && <p className="text-xs text-green-700 mt-2 pl-2 border-l-2 border-green-200 italic">{entry.summary}</p>}
                        {!entry.summary && entry.status === 'success' && <p className="text-xs text-green-600 flex items-center gap-1 mt-1.5"><LucideIcons.Check className="w-3 h-3"/>Success</p>}
                        {entry.status === 'error' && <p className="text-xs text-red-600 flex items-center gap-1 mt-1.5"><LucideIcons.AlertTriangle className="w-3 h-3"/>Error</p>}
                    </div>
                ))}
            </div>

            {isAiLoading && <div className="py-2"><AiLoader /></div>}

            <div className="pt-3 -mb-14 border-t border-slate-200">
                 {aiSuggestions && aiSuggestions.length > 0 && (
                     <div className="pb-3">
                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Suggestions</p>
                        <div className="flex flex-wrap gap-1.5">
                            {aiSuggestions.map((s, i) => (
                                 <button key={i} onClick={() => onAiSubmit(s.prompt)} className="px-2 py-1 bg-green-100 text-green-800 text-[11px] font-medium rounded-full hover:bg-green-200 transition-colors">
                                    {s.label}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
                {originalApiHtml && (
                    <div className="pb-3">
                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Original HTML</p>
                        <button 
                            onClick={() => {
                                const newWindow = window.open('', '_blank');
                                newWindow.document.write(originalApiHtml);
                                newWindow.document.close();
                            }}
                            className="px-2 py-1 bg-blue-100 text-blue-800 text-[11px] font-medium rounded-full hover:bg-blue-200 transition-colors flex items-center gap-1"
                        >
                            <LucideIcons.ExternalLink className="w-3 h-3" />
                            View Original
                        </button>
                    </div>
                )}
                <div className="relative">
                    <textarea onKeyDown={handleKeyDown} placeholder="e.g., add a team section..." className="w-full p-2 pr-8 border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-green-400 focus:border-green-400" rows="2" />
                    <LucideIcons.CornerDownLeft className="absolute right-2.5 top-2.5 w-4 h-4 text-slate-400" />
                </div>
            </div>
        </div>
    );
}
function LayerNode({ node, type, path, depth, onSelect, selectedItemId }) {
    const [isOpen, setIsOpen] = useState(depth < 2);
    const isSelected = selectedItemId === node.id;
    const hasChildren = (node.columns && node.columns.length > 0) || (node.elements && node.elements.length > 0);
    const config = AVAILABLE_ELEMENTS_CONFIG.find(c => c.id === node.type);
    const Icon = elementIcons[type] || elementIcons.default;

    const handleSelect = (e) => {
        e.stopPropagation();
        onSelect(node.id, type, path, node);
    };

    const handleToggle = (e) => {
        e.stopPropagation();
        setIsOpen(!isOpen);
    };

    return (
        <div>
            <div onClick={handleSelect} className={`flex items-center p-1 my-0.5 rounded-md cursor-pointer transition-colors ${isSelected ? 'bg-green-100 text-green-800' : 'hover:bg-slate-100'}`}>
                <div style={{ paddingLeft: `${depth * 14}px` }} className="flex items-center flex-grow truncate">
                    {hasChildren ? (
                        <button onClick={handleToggle} className="p-0.5 mr-1 rounded-sm hover:bg-slate-200">
                            <LucideIcons.ChevronRight className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
                        </button>
                    ) : (
                        <span className="w-4 h-4 mr-1"></span>
                    )}
                    <div className="w-3.5 h-3.5 mr-2 text-slate-500">{React.cloneElement(Icon, { className: 'w-full h-full' })}</div>
                    <span className="text-xs truncate font-medium">{node.name || config?.name || node.type}</span>
                </div>
            </div>
            {isOpen && hasChildren && (
                <div>
                    {node.columns && node.columns.map((col, idx) => <LayerNode key={col.id} node={col} type="column" path={`${path}.columns[${idx}]`} depth={depth + 1} onSelect={onSelect} selectedItemId={selectedItemId} />)}
                    {node.elements && node.elements.map((el, idx) => <LayerNode key={el.id} node={el} type="element" path={`${path}.elements[${idx}]`} depth={depth + 1} onSelect={onSelect} selectedItemId={selectedItemId} />)}
                </div>
            )}
        </div>
    );
}
function LayersTreeView({ page, pagePath, onSelect, selectedItemId }) {
    if (!page) return <div className="p-4 text-sm text-slate-500">No page selected.</div>;
    return (
        <div className="p-2 pb-8 space-y-0.5">
            {page.layout.map((section, idx) => (
                <LayerNode key={section.id} node={section} type="section" path={`${pagePath}.layout[${idx}]`} depth={0} onSelect={onSelect} selectedItemId={selectedItemId} />
            ))}
        </div>
    );
}
const ElementAccordion = ({ title, children, defaultOpen = true }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    return (
        <div className="border-b border-slate-200/80 last:border-b-0 pb-3 mb-3">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center py-1 rounded-md hover:bg-slate-100/50 transition-colors -mx-1 px-1">
                <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider">{title}</h3>
                <LucideIcons.ChevronDown className={`w-4 h-4 text-slate-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}/>
            </button>
            <div className={`grid overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100 pt-2' : 'grid-rows-[0fr] opacity-0'}`}>
                <div className="overflow-hidden">
                    {children}
                </div>
            </div>
        </div>
    );
};
function LeftPanel({ isOpen, onClose, onAddTopLevelSection, onEnterAiMode, pages, activePageId, onAddPage, onSelectPage, onRenamePage, onDeletePage, onAiSubmit, isAiLoading, aiChatHistory, onSelect, selectedItem, aiSuggestions, handleUndo, handleRedo, isAiMode, setIsAiMode, canUndo, canRedo, originalApiHtml }) {
  const [activeTab, setActiveTab] = useState("insert");
  const [searchTerm, setSearchTerm] = useState("");

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
    <button onClick={() => setActiveTab(tabName)} className={`w-full flex-1 flex flex-col items-center justify-center gap-1 py-2.5 text-xs font-medium transition-colors border-b-2 ${activeTab === tabName ? 'border-green-500 text-green-600 bg-green-50/70' : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100'}`}>
        {icon}
        <span>{label}</span>
    </button>
  );

  useEffect(() => {
    if (activeTab !== 'insert') {
        setIsAiMode(false);
    }
  }, [activeTab, setIsAiMode]);

  const handleSwitchToAi = () => {
    onEnterAiMode();
    setActiveTab('insert');
  }

  return (
    <aside className={`absolute top-0 left-0 h-full w-72 bg-gray-50 border-r border-slate-200 shadow-xl flex-shrink-0 flex flex-col print-hidden transition-transform duration-300 ease-in-out z-40 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex justify-between items-center p-3 border-b border-slate-200 h-[56px] bg-white">
            <h2 className="text-base font-bold text-slate-800">Add Content</h2>
            <button onClick={onClose} className="p-2 rounded-full text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors">
                <LucideIcons.PanelLeftClose className="w-5 h-5"/>
            </button>
        </div>
        <div className="flex border-b border-slate-200 bg-white">
            <TabButton tabName="insert" icon={<LucideIcons.PlusSquare className="w-4 h-4" />} label="Insert" />
            <TabButton tabName="layers" icon={<LucideIcons.Layers3 className="w-4 h-4" />} label="Layers" />
            <TabButton tabName="pages" icon={<LucideIcons.FileText className="w-4 h-4" />} label="Pages" />
        </div>
        <div className="flex-1 overflow-y-auto bg-white pb-12">
            {activeTab === 'insert' && isAiMode && <AiModeView onBack={() => setIsAiMode(false)} onAiSubmit={onAiSubmit} isAiLoading={isAiLoading} aiChatHistory={aiChatHistory} aiSuggestions={aiSuggestions} handleUndo={handleUndo} handleRedo={handleRedo} canUndo={canUndo} canRedo={canRedo} originalApiHtml={originalApiHtml} />}
            {activeTab === 'insert' && !isAiMode && (
                <div className="p-3 space-y-4">
                    <div className="relative"><LucideIcons.Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><input type="text" placeholder="Search elements..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-md text-sm focus:ring-1 focus:ring-green-500" /></div>
                    <button onClick={handleSwitchToAi} className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-green-50 text-green-700 font-semibold rounded-lg hover:bg-green-100 transition-colors border border-green-200 hover:border-green-300 relative group">
                        <span className="absolute inset-0 bg-green-400/20 rounded-lg blur-lg opacity-0 group-hover:opacity-100 group-hover:animate-pulse transition-opacity duration-300"></span>
                        <LucideIcons.Sparkles className="w-4 h-4 relative text-green-500"/>
                        <span className="relative text-sm">Build with AI</span>
                    </button>
                    <ElementAccordion title="Structure" defaultOpen={true}>
                        <div className="grid grid-cols-1 gap-2">
                            <button onClick={onAddTopLevelSection} className="w-full flex items-center justify-center gap-2.5 p-2 text-left bg-white border border-slate-200 rounded-lg cursor-pointer hover:bg-green-50 hover:border-green-300 hover:shadow-md transition-all group focus:outline-none focus-visible:ring-1 focus-visible:ring-green-500">
                                <LucideIcons.PlusSquare className="w-5 h-5 text-slate-500 group-hover:text-green-600 transition-colors" />
                                <span className="text-xs font-semibold text-slate-700 group-hover:text-green-800">Add Section</span>
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
            {activeTab === 'layers' && <LayersTreeView page={pages[activePageId]} pagePath={`pages[${activePageId}]`} onSelect={onSelect} selectedItemId={selectedItem?.id} />}
            {activeTab === 'pages' && (
                <div className="p-3">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="text-sm font-semibold text-slate-800">Your Pages</h3>
                        <button onClick={onAddPage} title="Add New Page" className="p-1.5 text-green-600 hover:text-green-700 rounded-md hover:bg-green-100 transition-colors"><LucideIcons.Plus className="w-4 h-4" /></button>
                    </div>
                    <ul className="space-y-1.5">
                        {Object.values(pages).map((page) => (
                            <li key={page.id} className="group">
                                <button onClick={() => onSelectPage(page.id)} className={`w-full text-left px-3 py-2 text-sm rounded-md transition-all duration-150 flex items-center justify-between ${activePageId === page.id ? "bg-green-600 text-white font-semibold shadow-sm" : "text-slate-600 hover:bg-white hover:text-slate-900 bg-white border border-slate-200"}`}>
                                    <span className="truncate">{page.name}</span>
                                    <div className={`flex items-center transition-opacity ${activePageId === page.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                                        <button onClick={(e) => { e.stopPropagation(); onRenamePage(page.id, page.name); }} className="p-1 hover:bg-white/20 rounded-md"><LucideIcons.Edit3 className="w-3.5 h-3.5" /></button>
                                        <button onClick={(e) => { e.stopPropagation(); onDeletePage(page.id, page.name); }} className="p-1 hover:bg-white/20 rounded-md"><LucideIcons.Trash2 className="w-3.5 h-3.5" /></button>
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
}
function DebouncedTextInput({ label, type, initialValue, onCommit, ...props }) {
  const [value, setValue] = useState(initialValue);
  useEffect(() => { setValue(initialValue); }, [initialValue]);
  const handleBlur = () => { if(value !== initialValue) { onCommit(value); } };
  const InputComponent = type === 'textarea' ? 'textarea' : 'input';
  return (
    <div>
        {label && <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>}
        <InputComponent type={type} value={value || ''} onChange={e => setValue(e.target.value)} onBlur={handleBlur} className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md text-sm focus:ring-1 focus:ring-green-500 focus:border-green-500 shadow-sm" {...props} />
    </div>
  );
}
const PropertyGroup = ({ title, children, defaultOpen = true }) => {
    const [isOpen, setIsOpen] = React.useState(defaultOpen);
    return (
      <div className="border-b border-slate-200/80 last:border-b-0 py-3">
          <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center">
              <h3 className="text-[11px] font-bold uppercase text-slate-400 tracking-widest">{title}</h3>
              <LucideIcons.ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>
          {isOpen && <div className="space-y-3 pt-3">{children}</div>}
      </div>
    );
};
const ColorInput = ({ label, value, onChange }) => {
    const [localValue, setLocalValue] = React.useState(value);

    React.useEffect(() => {
        setLocalValue(value);
    }, [value]);

    const handleTextChange = (e) => {
        setLocalValue(e.target.value);
    };
    const handleTextBlur = () => {
        if (localValue !== value) {
            onChange(localValue);
        }
    };
    const handleColorChange = (e) => {
        const newValue = e.target.value;
        setLocalValue(newValue);
        if (newValue !== value) {
            onChange(newValue);
        }
    };
    return (
      <div className="flex justify-between items-center">
          <label className="text-sm font-medium text-slate-700">{label}</label>
          <div className="flex items-center gap-1.5">
              <input type="text" value={localValue || ''} onChange={handleTextChange} onBlur={handleTextBlur} className="w-20 text-xs border-slate-300 rounded-md px-2 py-1 focus:ring-1 focus:ring-green-500 shadow-sm" />
              <div className="relative w-7 h-7 rounded-md overflow-hidden border border-slate-300 shadow-sm">
                  <div className="absolute inset-0" style={{backgroundColor: localValue || '#000000'}}></div>
                  <input type="color" value={localValue || '#000000'} onChange={handleColorChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
              </div>
          </div>
      </div>
    );
};
const StyledSlider = ({ label, value, onChange, min = 0, max = 200, step = 1, unit = "px" }) => {
    const [localValue, setLocalValue] = React.useState(value);

    React.useEffect(() => {
        setLocalValue(value);
    }, [value]);

    const displayValue = parseInt(localValue, 10) || 0;

    const handleInput = (e) => {
        setLocalValue(`${e.target.value}${unit}`);
    };

    const handleCommit = (e) => {
        const finalValue = `${e.target.value}${unit}`;
        if (finalValue !== value) {
            onChange(finalValue);
        }
    };

    return (
      <div>
          <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-medium text-slate-600">{label}</label>
              <span className="text-xs text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-sm">{`${displayValue}${unit}`}</span>
          </div>
          <input type="range" min={min} max={max} step={step} value={displayValue} onInput={handleInput} onMouseUp={handleCommit} onTouchEnd={handleCommit} className="w-full custom-slider" />
      </div>
    );
};
const ToggleSwitch = ({ label, checked, onChange }) => (
    <div className="flex justify-between items-center">
        <label className="text-sm font-medium text-slate-700">{label}</label>
        <button onClick={() => onChange(!checked)} className={`relative inline-flex items-center h-5 rounded-full w-9 transition-colors ${checked ? 'bg-green-600' : 'bg-slate-300'}`}>
            <span className={`inline-block w-3.5 h-3.5 transform bg-white rounded-full transition-transform ${checked ? 'translate-x-5' : 'translate-x-1'}`} />
        </button>
    </div>
);
const AlignmentButtons = ({ value, onChange }) => (
    <div>
        <label className="block text-xs font-medium text-slate-600 mb-1.5">Alignment</label>
        <div className="flex items-center bg-slate-100 rounded-md p-0.5">{textAlignOptions.map(opt => (
            <button key={opt.value} onClick={() => onChange(opt.value)} title={opt.label} className={`flex-1 p-1.5 rounded-sm transition-all text-slate-600 ${value === opt.value ? 'bg-white text-green-700 shadow-sm' : 'hover:bg-slate-200/50'}`}>
                {opt.icon}
            </button>
        ))}</div>
    </div>
);
const SidebarTabButton = ({ tabName, icon, label, activeTab, onClick }) => (
    <button onClick={() => onClick(tabName)} className={`w-full flex-1 flex flex-col items-center justify-center gap-1 py-2.5 text-xs font-medium transition-colors border-b-2 ${activeTab === tabName ? 'border-green-500 text-green-600 bg-white' : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/70'}`}>
        {icon}
        <span>{label}</span>
    </button>
);

function LinkManager({ links = [], onUpdateLinks, elementId, pages }) {
    const handleLinkChange = (index, field, value) => {
        const newLinks = [...links];
        newLinks[index] = { ...newLinks[index], [field]: value };
        onUpdateLinks(newLinks);
    };

    const handleAddLink = () => {
        const newLink = { id: generateId('link'), text: 'New Link', url: '#' };
        onUpdateLinks([...links, newLink]);
    };

    const handleDeleteLink = (index) => {
        const newLinks = links.filter((_, i) => i !== index);
        onUpdateLinks(newLinks);
    };

    return (
        <div className="space-y-3">
            {links.map((link, index) => (
                <div key={link.id || index} className="p-2.5 bg-white border border-slate-200 rounded-lg space-y-2">
                    <div className="flex justify-between items-center">
                        <p className="text-xs font-semibold text-slate-600">Link #{index + 1}</p>
                        <button onClick={() => handleDeleteLink(index)} className="p-1 text-red-500 hover:bg-red-100 rounded-full">
                            <LucideIcons.Trash2 className="w-3.5 h-3.5"/>
                        </button>
                    </div>
                    <DebouncedTextInput
                        label="Text"
                        initialValue={link.text}
                        onCommit={val => handleLinkChange(index, 'text', val)}
                        key={`${elementId}-link-${index}-text`}
                    />
                    <DebouncedTextInput
                        label="URL"
                        initialValue={link.url}
                        onCommit={val => handleLinkChange(index, 'url', val)}
                        key={`${elementId}-link-${index}-url`}
                    />
                </div>
            ))}
            <button onClick={handleAddLink} className="w-full mt-2 px-3 py-1.5 text-xs font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200 transition-colors flex items-center justify-center gap-1.5">
                <LucideIcons.Plus className="w-3.5 h-3.5"/>
                Add Link
            </button>
        </div>
    );
}

function SlideManager({ slides = [], onUpdateSlides, elementId }) {
    const handleSlideChange = (index, field, value) => {
        const newSlides = [...slides];
        newSlides[index] = { ...newSlides[index], [field]: value };
        onUpdateSlides(newSlides);
    };

    const handleAddSlide = () => {
        const newSlide = { id: generateId('slide'), heading: 'New Slide', text: 'Slide content goes here.', link: '#' };
        onUpdateSlides([...slides, newSlide]);
    };

    const handleDeleteSlide = (index) => {
        const newSlides = slides.filter((_, i) => i !== index);
        onUpdateSlides(newSlides);
    };

    return (
        <div className="space-y-3">
            {slides.map((slide, index) => (
                <div key={slide.id || index} className="p-2.5 bg-white border border-slate-200 rounded-lg space-y-2">
                    <div className="flex justify-between items-center">
                        <p className="text-xs font-semibold text-slate-600">Slide #{index + 1}</p>
                        <button onClick={() => handleDeleteSlide(index)} className="p-1 text-red-500 hover:bg-red-100 rounded-full">
                            <LucideIcons.Trash2 className="w-3.5 h-3.5"/>
                        </button>
                    </div>
                    <DebouncedTextInput
                        label="Heading"
                        initialValue={slide.heading}
                        onCommit={val => handleSlideChange(index, 'heading', val)}
                        key={`${elementId}-slide-${index}-heading`}
                    />
                     <DebouncedTextInput
                        label="Text"
                        type="textarea"
                        rows={3}
                        initialValue={slide.text}
                        onCommit={val => handleSlideChange(index, 'text', val)}
                        key={`${elementId}-slide-${index}-text`}
                    />
                    <DebouncedTextInput
                        label="Link URL"
                        initialValue={slide.link}
                        onCommit={val => handleSlideChange(index, 'link', val)}
                        key={`${elementId}-slide-${index}-link`}
                    />
                </div>
            ))}
            <button onClick={handleAddSlide} className="w-full mt-2 px-3 py-1.5 text-xs font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200 transition-colors flex items-center justify-center gap-1.5">
                <LucideIcons.Plus className="w-3.5 h-3.5"/>
                Add Slide
            </button>
        </div>
    );
}

function RightSidebar({ selectedItemData, onUpdateSelectedProps, pages, activePageId, onRenamePage, onAddGlobalElement, comments, onUpdateComment, onDeleteComment, onClose, selectedVisualElement }) {
  const [activeTab, setActiveTab] = React.useState('properties');

  const renderPropertiesPanel = () => {
    if (!selectedItemData || !selectedItemData.itemType) {
        return ( <div className="flex flex-col items-center justify-center h-full text-center p-4 bg-white"><LucideIcons.Pointer className="w-12 h-12 text-slate-300 mb-3"/><h3 className="font-semibold text-slate-700">Nothing Selected</h3><p className="text-sm text-slate-500 mt-1">Click an element to edit.</p></div> );
    }
    if (selectedItemData.itemType === 'page') {
      const currentPage = pages[activePageId];
      return ( <> <div className="flex justify-between items-center px-3 border-b border-slate-200 h-[56px] bg-white"><h2 className="text-base font-bold text-slate-800">Page Settings</h2><button onClick={onClose} className="p-2 rounded-full text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors -mr-1"><LucideIcons.PanelRightClose className="w-5 h-5"/></button></div><div className="p-3 space-y-4 flex-grow bg-slate-50/50"><DebouncedTextInput label="Page Name" initialValue={currentPage?.name || ""} onCommit={onRenamePage} key={activePageId}/></div> </> );
    }
    const { id, path, props, itemType } = selectedItemData;
    const config = AVAILABLE_ELEMENTS_CONFIG.find(c => c.id === itemType) || {};
    const onUpdate = (newProps) => onUpdateSelectedProps(path, newProps);

    const GeneralStyling = () => (
        <>
        </>
    );
    return (<> <div className="flex justify-between items-center px-3 border-b border-slate-200/80 h-[56px] bg-white"><h2 className="text-base font-bold text-slate-800 capitalize truncate">{config?.name || itemType || 'Properties'}</h2><button onClick={onClose} className="p-2 rounded-full text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors -mr-1"><LucideIcons.PanelRightClose className="w-5 h-5"/></button></div><div className="overflow-y-auto flex-grow text-sm p-3 bg-slate-50/50"> {(() => {
        switch(itemType) {
            case 'header': case 'textBlock': return <><PropertyGroup title="Content"><DebouncedTextInput label="Text" type="textarea" rows={4} initialValue={props.text} onCommit={val => onUpdate({ text: val })} key={id}/></PropertyGroup><GeneralStyling/></>;
            case 'button': return <><PropertyGroup title="Content"><DebouncedTextInput label="Button Text" initialValue={props.buttonText} onCommit={val => onUpdate({ buttonText: val })} key={`${id}-text`} /><DebouncedTextInput label="Link URL" initialValue={props.link} onCommit={val => onUpdate({ link: val })} key={`${id}-link`} /></PropertyGroup><GeneralStyling/></>;
            case 'htmlHeading': return <><PropertyGroup title="Content"><DebouncedTextInput label="Heading Text" type="textarea" rows={3} initialValue={props.text} onCommit={val => onUpdate({ text: val })} key={id}/><CustomDropdown label="Tag" options={[{label: 'H1', value: 'h1'}, {label: 'H2', value: 'h2'}, {label: 'H3', value: 'h3'}, {label: 'H4', value: 'h4'}, {label: 'H5', value: 'h5'}, {label: 'H6', value: 'h6'}]} value={props.tag} onChange={val => onUpdate({ tag: val })} key={`${id}-tag`}/></PropertyGroup><PropertyGroup title="Typography"><StyledSlider label="Font Size" value={props.fontSize} onChange={val => onUpdate({ fontSize: val })} max={72} unit="px" key={`${id}-fontsize`}/><CustomDropdown label="Font Weight" options={[{label: 'Normal', value: 'normal'}, {label: 'Bold', value: 'bold'}, {label: 'Light', value: '300'}, {label: 'Medium', value: '500'}, {label: 'Semi Bold', value: '600'}, {label: 'Extra Bold', value: '800'}]} value={props.fontWeight} onChange={val => onUpdate({ fontWeight: val })} key={`${id}-fontweight`}/><ColorInput label="Text Color" value={props.color} onChange={val => onUpdate({ color: val })} key={`${id}-color`}/><CustomDropdown label="Text Align" options={[{label: 'Left', value: 'left'}, {label: 'Center', value: 'center'}, {label: 'Right', value: 'right'}, {label: 'Justify', value: 'justify'}]} value={props.textAlign} onChange={val => onUpdate({ textAlign: val })} key={`${id}-align`}/></PropertyGroup><PropertyGroup title="Spacing"><DebouncedTextInput label="Margin" initialValue={props.margin} onCommit={val => onUpdate({ margin: val })} key={`${id}-margin`}/><DebouncedTextInput label="Padding" initialValue={props.padding} onCommit={val => onUpdate({ padding: val })} key={`${id}-padding`}/></PropertyGroup><GeneralStyling/></>;
            case 'htmlParagraph': return <><PropertyGroup title="Content"><DebouncedTextInput label="Paragraph Text" type="textarea" rows={4} initialValue={props.text} onCommit={val => onUpdate({ text: val })} key={id}/></PropertyGroup><PropertyGroup title="Typography"><StyledSlider label="Font Size" value={props.fontSize} onChange={val => onUpdate({ fontSize: val })} max={48} unit="px" key={`${id}-fontsize`}/><CustomDropdown label="Font Weight" options={[{label: 'Normal', value: 'normal'}, {label: 'Bold', value: 'bold'}, {label: 'Light', value: '300'}, {label: 'Medium', value: '500'}]} value={props.fontWeight} onChange={val => onUpdate({ fontWeight: val })} key={`${id}-fontweight`}/><ColorInput label="Text Color" value={props.color} onChange={val => onUpdate({ color: val })} key={`${id}-color`}/><CustomDropdown label="Text Align" options={[{label: 'Left', value: 'left'}, {label: 'Center', value: 'center'}, {label: 'Right', value: 'right'}, {label: 'Justify', value: 'justify'}]} value={props.textAlign} onChange={val => onUpdate({ textAlign: val })} key={`${id}-align`}/><StyledSlider label="Line Height" value={props.lineHeight} onChange={val => onUpdate({ lineHeight: val })} max={3} step={0.1} key={`${id}-lineheight`}/></PropertyGroup><PropertyGroup title="Spacing"><DebouncedTextInput label="Margin" initialValue={props.margin} onCommit={val => onUpdate({ margin: val })} key={`${id}-margin`}/><DebouncedTextInput label="Padding" initialValue={props.padding} onCommit={val => onUpdate({ padding: val })} key={`${id}-padding`}/></PropertyGroup><GeneralStyling/></>;
            case 'htmlImage': return <><PropertyGroup title="Content"><DebouncedTextInput label="Image URL" initialValue={props.src} onCommit={val => onUpdate({ src: val })} key={`${id}-src`}/><DebouncedTextInput label="Alt Text" initialValue={props.alt} onCommit={val => onUpdate({ alt: val })} key={`${id}-alt`}/></PropertyGroup><PropertyGroup title="Dimensions"><DebouncedTextInput label="Width" initialValue={props.width} onCommit={val => onUpdate({ width: val })} key={`${id}-width`}/><DebouncedTextInput label="Height" initialValue={props.height} onCommit={val => onUpdate({ height: val })} key={`${id}-height`}/><DebouncedTextInput label="Border Radius" initialValue={props.borderRadius} onCommit={val => onUpdate({ borderRadius: val })} key={`${id}-radius`}/></PropertyGroup><PropertyGroup title="Spacing"><DebouncedTextInput label="Margin" initialValue={props.margin} onCommit={val => onUpdate({ margin: val })} key={`${id}-margin`}/><DebouncedTextInput label="Padding" initialValue={props.padding} onCommit={val => onUpdate({ padding: val })} key={`${id}-padding`}/></PropertyGroup><GeneralStyling/></>;
            case 'htmlButton': return <><PropertyGroup title="Content"><DebouncedTextInput label="Button Text" initialValue={props.text} onCommit={val => onUpdate({ text: val })} key={`${id}-text`}/><DebouncedTextInput label="Link URL" initialValue={props.link} onCommit={val => onUpdate({ link: val })} key={`${id}-link`}/></PropertyGroup><PropertyGroup title="Styling"><ColorInput label="Background Color" value={props.backgroundColor} onChange={val => onUpdate({ backgroundColor: val })} key={`${id}-bgcolor`}/><ColorInput label="Text Color" value={props.color} onChange={val => onUpdate({ color: val })} key={`${id}-color`}/><StyledSlider label="Font Size" value={props.fontSize} onChange={val => onUpdate({ fontSize: val })} max={32} unit="px" key={`${id}-fontsize`}/><CustomDropdown label="Font Weight" options={[{label: 'Normal', value: 'normal'}, {label: 'Bold', value: 'bold'}, {label: 'Medium', value: '500'}, {label: 'Semi Bold', value: '600'}]} value={props.fontWeight} onChange={val => onUpdate({ fontWeight: val })} key={`${id}-fontweight`}/><DebouncedTextInput label="Padding" initialValue={props.padding} onCommit={val => onUpdate({ padding: val })} key={`${id}-padding`}/><DebouncedTextInput label="Border Radius" initialValue={props.borderRadius} onCommit={val => onUpdate({ borderRadius: val })} key={`${id}-radius`}/></PropertyGroup><PropertyGroup title="Spacing"><DebouncedTextInput label="Margin" initialValue={props.margin} onCommit={val => onUpdate({ margin: val })} key={`${id}-margin`}/></PropertyGroup><GeneralStyling/></>;
            case 'htmlText': return <><PropertyGroup title="Content"><DebouncedTextInput label="Text Content" type="textarea" rows={3} initialValue={props.text} onCommit={val => onUpdate({ text: val })} key={id}/></PropertyGroup><PropertyGroup title="Typography"><StyledSlider label="Font Size" value={props.fontSize} onChange={val => onUpdate({ fontSize: val })} max={48} unit="px" key={`${id}-fontsize`}/><CustomDropdown label="Font Weight" options={[{label: 'Normal', value: 'normal'}, {label: 'Bold', value: 'bold'}, {label: 'Light', value: '300'}, {label: 'Medium', value: '500'}]} value={props.fontWeight} onChange={val => onUpdate({ fontWeight: val })} key={`${id}-fontweight`}/><ColorInput label="Text Color" value={props.color} onChange={val => onUpdate({ color: val })} key={`${id}-color`}/><CustomDropdown label="Text Align" options={[{label: 'Left', value: 'left'}, {label: 'Center', value: 'center'}, {label: 'Right', value: 'right'}, {label: 'Justify', value: 'justify'}]} value={props.textAlign} onChange={val => onUpdate({ textAlign: val })} key={`${id}-align`}/></PropertyGroup><PropertyGroup title="Spacing"><DebouncedTextInput label="Margin" initialValue={props.margin} onCommit={val => onUpdate({ margin: val })} key={`${id}-margin`}/><DebouncedTextInput label="Padding" initialValue={props.padding} onCommit={val => onUpdate({ padding: val })} key={`${id}-padding`}/></PropertyGroup><GeneralStyling/></>;
            case 'htmlContent': return <><PropertyGroup title="Section Settings"><div className="text-sm text-gray-600 p-3 bg-blue-50 rounded-lg border border-blue-200"><p className="font-medium text-blue-800 mb-1">Visual Editor Active</p><p>Click on any element within this section to edit it visually.</p></div></PropertyGroup><GeneralStyling/></>;
            case 'visualElement': return <VisualElementProperties props={props} onUpdate={onUpdate} id={id} selectedVisualElement={selectedVisualElement} />;
            case 'icon':
                return (
                    <>
                        <PropertyGroup title="Icon Settings">
                            <CustomDropdown
                                label="Icon"
                                options={Object.keys(LucideIcons).map(iconName => ({ label: iconName, value: iconName }))}
                                value={props.iconName}
                                onChange={val => onUpdate({ iconName: val })}
                                key={`${id}-icon-name`}
                            />
                            <StyledSlider 
                                label="Size" 
                                value={props.size} 
                                onChange={val => onUpdate({ size: val })} 
                                max={128} 
                                unit="px" 
                            />
                            <ColorInput 
                                label="Color" 
                                value={props.color} 
                                onChange={val => onUpdate({ color: val })} 
                            />
                        </PropertyGroup>
                        <GeneralStyling/>
                    </>
                );
            case 'image': return <><PropertyGroup title="Content"><DebouncedTextInput label="Image Source (URL)" initialValue={props.src} onCommit={val => onUpdate({ src: val })} key={`${id}-src`} /><DebouncedTextInput label="Alt Text" initialValue={props.alt} onCommit={val => onUpdate({ alt: val })} key={`${id}-alt`} /></PropertyGroup><GeneralStyling/></>;
            case 'spacer': return <><PropertyGroup title="Layout"><StyledSlider label="Height" value={props.height} onChange={val => onUpdate({ height: val })} max={300} /></PropertyGroup></>;
            case 'section': return <><GeneralStyling/></>;
            case 'column': return <><GeneralStyling/></>;
            case 'navbar': return <><PropertyGroup title="Logo"><DebouncedTextInput label="Logo Text" initialValue={props.logoText} onCommit={val => onUpdate({ logoText: val })} key={`${id}-logo`}/></PropertyGroup><PropertyGroup title="Links"><LinkManager links={props.links} onUpdateLinks={links => onUpdate({links})} elementId={id} pages={pages} /></PropertyGroup><GeneralStyling/></>;
            case 'cardSlider': return <><PropertyGroup title="Slides"><SlideManager slides={props.slides} onUpdateSlides={slides => onUpdate({slides})} elementId={id} /></PropertyGroup><PropertyGroup title="Settings"><StyledSlider label="Slides Per View" value={String(props.slidesPerView)} onChange={val => onUpdate({ slidesPerView: parseInt(val) })} min={1} max={6} unit=""/><StyledSlider label="Space Between" value={String(props.spaceBetween)} onChange={val => onUpdate({ spaceBetween: parseInt(val) })} max={100} unit="px"/></PropertyGroup><PropertyGroup title="Behavior"><ToggleSwitch label="Autoplay" checked={props.autoplay} onChange={val => onUpdate({ autoplay: val })} /><ToggleSwitch label="Loop" checked={props.loop} onChange={val => onUpdate({ loop: val })} /><ToggleSwitch label="Navigation Arrows" checked={props.showNavigation} onChange={val => onUpdate({ showNavigation: val })} /><ToggleSwitch label="Pagination Dots" checked={props.showPagination} onChange={val => onUpdate({ showPagination: val })} /></PropertyGroup><GeneralStyling/></>;
            case 'accordion': return <><PropertyGroup title="Content"><DebouncedTextInput label="Title" initialValue={props.title} onCommit={val => onUpdate({ title: val })} key={`${id}-title`} /><DebouncedTextInput label="Content" type="textarea" rows={3} initialValue={props.content} onCommit={val => onUpdate({ content: val })} key={`${id}-content`} /></PropertyGroup><GeneralStyling/></>;
            default: return <p className="text-sm text-slate-500 text-center py-8">No properties to edit for '{itemType}'.</p>;
        }
    })()}</div></>);
  };
  const renderCommentsPanel = () => {
    const pageComments = comments[activePageId] || [];
    const IconForFrame = ({frame}) => { const DeviceIcon = DEVICE_FRAMES_CONFIG.find(d => d.name === frame)?.icon || LucideIcons.HelpCircle; return <DeviceIcon className="w-3.5 h-3.5 text-slate-500"/> };
    return ( <> <div className="flex justify-between items-center px-3 border-b border-slate-200 h-[56px] bg-white"><h2 className="text-base font-bold text-slate-800">Comments</h2><button onClick={onClose} className="p-2 rounded-full text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors -mr-1"><LucideIcons.PanelRightClose className="w-5 h-5"/></button></div> <div className="overflow-y-auto flex-grow text-sm p-3 space-y-2 bg-slate-50/50"> {pageComments.length === 0 ? ( <div className="text-center py-10 text-slate-500"><LucideIcons.MessageSquarePlus className="mx-auto w-10 h-10 text-slate-300 mb-2"/><p className="text-sm">No comments on this page.</p><p className="text-xs">Use the Comment tool to add notes.</p></div> ) : ( pageComments.map(comment => ( <div key={comment.id} className="p-2.5 bg-white border border-slate-200 rounded-lg"><div className="flex justify-between items-start"><textarea value={comment.text} onChange={(e) => onUpdateComment(activePageId, comment.id, e.target.value)} className="w-full bg-transparent border-0 focus:ring-0 p-0 text-xs text-slate-800 resize-none" rows={2}/> <button onClick={() => onDeleteComment(activePageId, comment.id)} className="ml-2 p-1 text-red-500 hover:bg-red-100 rounded-full"><LucideIcons.Trash2 className="w-3.5 h-3.5"/></button> </div> <div className="text-xs text-slate-500 mt-2 flex items-center gap-1.5"> <IconForFrame frame={comment.frame} /> <span>on {comment.frame} view</span> </div></div> )) )} </div> </> )
  }
  return (
    <aside className="h-full w-72 bg-white border-l border-slate-200 shadow-xl flex flex-col print-hidden">
        <div className="flex border-b border-slate-200 bg-gray-50/50">
            <SidebarTabButton tabName="properties" icon={<LucideIcons.SlidersHorizontal className="w-4 h-4"/>} label="Properties" activeTab={activeTab} onClick={setActiveTab}/>
            <SidebarTabButton tabName="comments" icon={<LucideIcons.MessageSquareText className="w-4 h-4"/>} label="Comments" activeTab={activeTab} onClick={setActiveTab} />
        </div>
        <div className="flex-1 flex flex-col overflow-hidden">
            {activeTab === 'properties' ? renderPropertiesPanel() : renderCommentsPanel()}
        </div>
    </aside>
  );
}
function AiCanvasLoader() {
    return (
        <div className="absolute inset-0 bg-gradient-to-br from-green-50/70 via-white to-green-100/80 flex flex-col items-center justify-center z-[1000] overflow-hidden">
            <style>{` @keyframes rotate-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } } @keyframes rotate-fast { from { transform: rotate(0deg); } to { transform: rotate(-360deg); } } @keyframes pulse-grow { 0%, 100% { transform: scale(1); opacity: 1; box-shadow: 0 0 20px 10px rgba(52, 211, 153, 0.4); } 50% { transform: scale(1.1); opacity: 0.8; box-shadow: 0 0 30px 15px rgba(52, 211, 153, 0.6); } } `}</style>
            <div className="relative w-40 h-40 flex items-center justify-center">
                <div className="absolute w-16 h-16 bg-green-300 rounded-full flex items-center justify-center" style={{ animation: 'pulse-grow 2.5s ease-in-out infinite' }}>
                    <LucideIcons.BrainCircuit className="w-10 h-10 text-green-700/90" />
                </div>
                <div className="absolute w-full h-full" style={{ animation: 'rotate-slow 10s linear infinite' }}>
                    <div className="absolute top-0 left-1/2 -ml-2 w-3.5 h-3.5 bg-teal-400 rounded-full"></div>
                </div>
                <div className="absolute w-32 h-32" style={{ animation: 'rotate-fast 8s linear infinite' }}>
                    <div className="absolute bottom-0 left-1/2 -ml-3 w-5 h-5 border-2 border-green-400 rounded-full"></div>
                </div>
                <div className="absolute w-28 h-28" style={{ animation: 'rotate-slow 12s linear infinite' }}>
                    <div className="absolute top-1/2 -mt-2 right-0 w-2.5 h-2.5 bg-green-600/80 rounded-full"></div>
                </div>
            </div>
            <p className="text-slate-800 text-base font-semibold mt-6 tracking-wider animate-pulse">Building with AI...</p>
            <p className="text-green-700 text-xs mt-1">Crafting something amazing for you!</p>
        </div>
    );
}

function AiPreview({ html, onAccept, onCancel }) {
    return (
        <div className="absolute inset-0 bg-slate-800/50 backdrop-blur-sm z-[1000] flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-5xl h-[80%] bg-white rounded-lg shadow-2xl flex flex-col overflow-hidden">
                <div className="flex-1">
                    <iframe srcDoc={html} title="AI Preview" className="w-full h-full border-0" />
                </div>
                <div className="flex-shrink-0 p-3 bg-slate-50 border-t border-slate-200 flex justify-end items-center gap-3">
                    <p className="text-sm font-medium text-slate-600 mr-auto">Here's what the AI generated. Do you want to use it?</p>
                    <button onClick={onCancel} className="px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors">
                        Cancel
                    </button>
                    <button onClick={onAccept} className="px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2">
                        <LucideIcons.Check className="w-4 h-4"/>
                        Accept Changes
                    </button>
                </div>
            </div>
        </div>
    );
}

export function PagePreviewRenderer({ pageLayout, globalNavbar, globalFooter, onNavigate, activePageId }) {
    const [device, setDevice] = useState(PREVIEW_DEVICES[2]);
    const containerStyle = device.width === '100%' ? { width: '100%', height: '100%' } : { maxWidth: device.width, width: '100%', height: '100%', containerType: 'inline-size' };
    return (
        <div className="flex-1 overflow-hidden bg-slate-100 flex flex-col items-center p-3 gap-3">
            <div className="bg-white rounded-full p-1 flex items-center justify-center gap-1 text-sm font-medium text-slate-600 shadow-md">
                {PREVIEW_DEVICES.map(d => {
                    const DeviceIcon = d.icon;
                    return (
                        <button key={d.name} onClick={() => setDevice(d)} className={`px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-colors text-xs ${device.name === d.name ? 'bg-green-600 text-white' : 'hover:bg-slate-100'}`}>
                            <DeviceIcon className="w-4 h-4" /> {d.name}
                        </button>
                    )
                })}
            </div>
            <div className="flex-1 w-full flex items-center justify-center overflow-hidden">
                <div style={containerStyle} className="bg-white shadow-xl mx-auto transition-all duration-300 rounded-xl">
                    <div className="w-full h-full overflow-y-auto scrollbar-thin scrollbar-thumb-slate-400 scrollbar-track-slate-100">
                        {globalNavbar && (<NavbarElement {...globalNavbar.props} isPreviewMode={true} onNavigate={onNavigate} previewDevice={device.name.toLowerCase()} />)}
                        {pageLayout && pageLayout.map((sec, idx) => ( 
                            <SectionComponent 
                                key={`${activePageId}-${sec.id}-${idx}`} 
                                pageId={activePageId}
                                sectionData={sec} 
                                sectionIndex={idx} 
                                onUpdateProps={() => {}} 
                                onDelete={() => {}} 
                                onSelect={() => {}} 
                                selectedItemId={null} 
                                onOpenStructureModal={() => {}} 
                                isPreviewMode={true} 
                                onNavigate={onNavigate} 
                                isDraggable={false}
                            />
                        ))}
                        {globalFooter && (<SectionComponent sectionData={globalFooter} sectionIndex={-1} isPreviewMode={true} onNavigate={onNavigate} />)}
                    </div>
                </div>
            </div>
        </div>
    );
}
function CanvasToolbar({ selectedItem, zoom, onZoomChange, onSelect, pages, activeTool, onToolChange }) {
    const getBreadcrumb = () => {
        if (!selectedItem || !pages || !selectedItem.path) { const pageName = pages[selectedItem?.pageId]?.name || "Page"; return [{ name: pageName, path: null, id: selectedItem?.pageId, type: 'page' }]; }
        const path = selectedItem.path;
        if (selectedItem.type === 'globalElement') { return [ { name: pages[selectedItem.pageId]?.name || "Page", path: null, id: selectedItem.pageId, type: 'page' }, { name: selectedItem.itemType === 'navbar' ? 'Navbar' : 'Footer', path: path, id: selectedItem.id, type: selectedItem.type } ]; }
        let breadcrumb = [];
        try { let currentPath = path; let currentObj = getItemByPath({pages}, path); while (currentObj && currentPath) { let name = "Unknown"; let type = "unknown"; const currentSegments = currentPath.split('.'); const lastSegment = currentSegments[currentSegments.length - 1]; const key = lastSegment.replace(/\[.*?\]/, ''); if (key === 'layout') { const pageIdMatch = currentPath.match(/pages\[([\w-]+)\]/); if (pageIdMatch && pages[pageIdMatch[1]]) { name = pages[pageIdMatch[1]].name; type = 'page'; } } else if (key === 'columns') { const indexMatch = lastSegment.match(/\[(\d+)\]/); const index = indexMatch ? parseInt(indexMatch[1]) : 0; name = `Column ${index + 1}`; type = 'column'; } else if (key === 'elements') { const config = AVAILABLE_ELEMENTS_CONFIG.find(c => c.id === currentObj.type); name = config ? config.name : currentObj.type; type = 'element'; } else if (currentObj.type === 'section') { name = 'Section'; type = 'section'; } if (name !== "Unknown") { breadcrumb.unshift({ name, path: currentPath, id: currentObj.id, type }); } const parentPath = currentSegments.slice(0, -1).join('.'); if (!parentPath || parentPath === 'pages') break; currentPath = parentPath; currentObj = getItemByPath({pages}, parentPath); } } catch (e) { return [{ name: "Page", path: null, id: null, type: 'page' }]; }
        return breadcrumb.length > 0 ? breadcrumb : [{ name: pages[selectedItem.pageId]?.name || "Page", path: null, id: selectedItem.pageId, type: 'page' }];
    }
    const breadcrumbs = getBreadcrumb();

    return (
        <div className="absolute top-4 left-[21%] -translate-x-[21%] bg-white/70 backdrop-blur-xl h-10 p-1 rounded-full border border-slate-200/80 flex items-center justify-between text-sm z-30 shadow-md shadow-black/5">
            <div className="flex items-center gap-0.5 pl-1">
                <button onClick={() => onToolChange('select')} title="Select Tool (V)" className={`p-1.5 rounded-full transition-all ${activeTool === 'select' ? 'bg-green-100 text-green-700 shadow-sm' : 'hover:bg-slate-200/80 text-slate-600'}`}><LucideIcons.MousePointer2 className="w-4 h-4"/></button>
                <button onClick={() => onToolChange('hand')} title="Hand Tool (H)" className={`p-1.5 rounded-full transition-all ${activeTool === 'hand' ? 'bg-green-100 text-green-700 shadow-sm' : 'hover:bg-slate-200/80 text-slate-600'}`}><LucideIcons.Hand className="w-4 h-4"/></button>
                <button onClick={() => onToolChange('comment')} title="Comment (C)" className={`p-1.5 rounded-full transition-all ${activeTool === 'comment' ? 'bg-green-100 text-green-700 shadow-sm' : 'hover:bg-slate-200/80 text-slate-600'}`}><LucideIcons.MessageSquarePlus className="w-4 h-4"/></button>
            </div>
            <div className="h-5 w-px bg-slate-300 mx-2"></div>
            <div className="flex items-center gap-1 text-slate-500 px-1.5 max-w-sm overflow-x-auto text-xs">
                {breadcrumbs.map((crumb, index) => (
                    <React.Fragment key={index}>
                        <button onClick={() => onSelect(crumb.id, crumb.type, crumb.path)} className={`px-2 py-0.5 rounded-md transition-colors whitespace-nowrap ${index === breadcrumbs.length - 1 ? 'text-slate-800 font-semibold bg-slate-200/60' : 'hover:bg-slate-200/50'}`}>{crumb.name}</button>
                        {index < breadcrumbs.length - 1 && <LucideIcons.ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />}
                    </React.Fragment>
                ))}
            </div>
            <div className="h-5 w-px bg-slate-300 mx-2"></div>
            <div className="flex items-center gap-1 px-1">
                <button onClick={() => onZoomChange(Math.max(0.1, zoom - 0.1))} className="p-1 hover:bg-slate-200 rounded-md text-slate-600"><LucideIcons.Minus className="w-3 h-3" /></button>
                <span className="w-10 text-center text-xs font-medium text-slate-700">{Math.round(zoom * 100)}%</span>
                <button onClick={() => onZoomChange(zoom + 0.1)} className="p-1 hover:bg-slate-200 rounded-md text-slate-600"><LucideIcons.Plus className="w-3 h-3" /></button>
            </div>
        </div>
    );
}
function TopBar({ onSaveAndClose, onCancel, onTogglePreview, isPreviewMode, onToggleLeftPanel }) {
    return (
        <header className="bg-white h-[56px] border-b border-slate-200/80 shadow-sm print-hidden flex justify-between items-center px-4 z-[50] relative">
            <div className="flex items-center gap-2">
                {!isPreviewMode && (
                    <button onClick={onToggleLeftPanel} className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors" title="Toggle Content Panel">
                        <LucideIcons.PanelLeft className="w-5 h-5" />
                    </button>
                )}
                <div className="flex items-center gap-2 text-slate-800">
                    <div className="w-7 h-7 bg-green-500 rounded-md flex items-center justify-center">
                       <LucideIcons.Feather className="w-4 h-4 text-white" />
                    </div>
                    <input 
                        type="text" 
                        defaultValue="Template Editor" 
                        className="hidden sm:inline font-bold bg-transparent border-none outline-none focus:ring-1 focus:ring-green-500/50 rounded px-1 text-base"
                        placeholder="Enter title..."
                    />
                </div>
            </div>
            {!isPreviewMode && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <div className="relative flex items-center p-1 bg-slate-200/70 rounded-full border border-slate-300/50 shadow-inner">
                         <span className={`absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-full bg-white shadow-sm transition-transform duration-300 ease-in-out`} style={{ transform: isPreviewMode ? 'translateX(calc(100% + 4px))' : 'translateX(0)' }}></span>
                         <button onClick={() => isPreviewMode && onTogglePreview()} className={`relative z-10 px-3 py-1 rounded-full flex items-center gap-1.5 transition-colors duration-300 text-xs font-medium ${!isPreviewMode ? "text-green-700" : "text-slate-500"}`}>
                            <LucideIcons.Edit3 className="w-3.5 h-3.5" />
                            Editor
                        </button>
                        <button onClick={() => !isPreviewMode && onTogglePreview()} className={`relative z-10 px-3 py-1 rounded-full flex items-center gap-1.5 transition-colors duration-300 text-xs font-medium ${isPreviewMode ? "text-green-700 " : "text-slate-500"}`}>
                            <LucideIcons.Eye className="w-3.5 h-3.5" />
                            Preview
                        </button>
                    </div>
                </div>
            )}
             <div className="flex items-center gap-2">
                <button onClick={onCancel} className="px-3 py-1.5 text-sm font-medium rounded-lg text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition-colors flex items-center gap-1.5">
                    <LucideIcons.X className="w-4 h-4"/>
                    Cancel
                </button>
                <button onClick={onSaveAndClose} className="px-3 py-1.5 text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 transition-colors flex items-center gap-1.5">
                    <LucideIcons.Save className="w-4 h-4"/>
                    Save & Close Editor
                </button>
            </div>
        </header>
    );
}
let globalAiSessionId = sessionStorage.getItem('ai_session_id') || null;


export default function ElementBuilderPage({ onExternalSave, initialBuilderState, onDataChange, onSaveAndClose, onCancel }) {
    const [newlyAddedElementId, setNewlyAddedElementId] = useState(null);
    const initialPageId = useMemo(() => generateId("page-home"), []);
    const [pages, setPages] = useState(initialBuilderState?.pages && Object.keys(initialBuilderState.pages).length > 0 ? initialBuilderState.pages : { [initialPageId]: { id: initialPageId, name: "Home", layout: [], version: 1 } });
    const [activePageId, setActivePageId] = useState(initialBuilderState?.activePageId && pages[initialBuilderState.activePageId] ? initialBuilderState.activePageId : initialPageId);
    const [globalNavbar, setGlobalNavbar] = useState(initialBuilderState?.globalNavbar || null);
    const [globalFooter, setGlobalFooter] = useState(initialBuilderState?.globalFooter || null);
    const [comments, setComments] = useState(initialBuilderState?.comments || {});
    const [selectedItem, setSelectedItem] = useState(null);
    const [activeDragItem, setActiveDragItem] = useState(null);
    const [isPreviewMode, setIsPreviewMode] = useState(false);
    const [selectedVisualElement, setSelectedVisualElement] = useState(null);
    const [originalApiHtml, setOriginalApiHtml] = useState(null);
    const [activeTool, setActiveTool] = useState('select');
    const [zoom, setZoom] = useState(0.75);
    const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
    const canvasRef = useRef(null);
    const builderRef = useRef(null);
    const isPanning = useRef(false);
    const lastMousePos = useRef({ x: 0, y: 0 });
    const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(true);
    const [isStructureModalOpen, setIsStructureModalOpen] = useState(false);
    const [structureModalContext, setStructureModalContext] = useState({ path: null, elementType: null, pageId: null });
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [aiPreviewHtml, setAiPreviewHtml] = useState(null); // State for previewing AI changes
    const [canUndo, setCanUndo] = useState(false);
    const [canRedo, setCanRedo] = useState(false);
    const [undoRedoHistory, setUndoRedoHistory] = useState([]);
    const [currentHistoryIndex, setCurrentHistoryIndex] = useState(-1);
    const aiSessionId = useRef(globalAiSessionId);
    const [aiChatHistory, setAiChatHistory] = useState([]);
    const [aiSuggestions, setAiSuggestions] = useState([]);
    const [modalStates, setModalStates] = useState({ addPage: { isOpen: false }, renamePage: { isOpen: false, pageId: null, currentName: "" }, deletePage: { isOpen: false, pageId: null, pageName: "" }, alert: { isOpen: false, title: "", message: "" }, saveConfirm: { isOpen: false, title: "", message: "" } });
    const [isInitialPrompt, setIsInitialPrompt] = useState(false);
    const [isAiMode, setIsAiMode] = useState(false);
    const onDataChangeRef = useRef(onDataChange);

    useEffect(() => {
        onDataChangeRef.current = onDataChange;
    });

    useEffect(() => {
        const currentData = { pages, activePageId, globalNavbar, globalFooter, comments, pageTitle: pages[activePageId]?.name || "Untitled" };
        if (onDataChangeRef.current) {
            onDataChangeRef.current(currentData);
        }
    }, [pages, activePageId, globalNavbar, globalFooter, comments]);

  // Handle clicks outside to close visual element selection
  useEffect(() => {
    const handleDocumentClick = (e) => {
      if (selectedItem?.type === 'visualElement') {
        // Check if click is outside the right panel
        const rightPanel = document.querySelector('[data-right-panel]');
        if (rightPanel && !rightPanel.contains(e.target)) {
          setSelectedItem(null);
          setSelectedVisualElement(null);
        }
      }
    };

    document.addEventListener('click', handleDocumentClick);
    return () => document.removeEventListener('click', handleDocumentClick);
  }, [selectedItem]);
    

    // Function to merge user changes with AI-generated content
    const mergeUserChangesWithAI = useCallback((currentLayout, aiSections) => {
        console.log('🔄 Merging user changes with AI content:', { currentLayout, aiSections });
        
        // If no current layout, use AI sections as-is
        if (!currentLayout || currentLayout.length === 0) {
            return aiSections;
        }
        
        // If no AI sections, keep current layout
        if (!aiSections || aiSections.length === 0) {
            return currentLayout;
        }
        
        // Create a map of current sections by their type/content for comparison
        const currentSectionsMap = new Map();
        currentLayout.forEach((section, index) => {
            // Use section type and first element content as key
            const key = `${section.type}-${section.columns?.[0]?.elements?.[0]?.type || 'unknown'}`;
            currentSectionsMap.set(key, { section, index });
        });
        
        // Merge AI sections with preserved user changes
        const mergedLayout = aiSections.map((aiSection, aiIndex) => {
            const aiKey = `${aiSection.type}-${aiSection.columns?.[0]?.elements?.[0]?.type || 'unknown'}`;
            const currentSectionData = currentSectionsMap.get(aiKey);
            
            if (currentSectionData) {
                // Found matching section - preserve user changes
                const currentSection = currentSectionData.section;
                
                // Check if user has made changes to this section
                const hasUserChanges = currentSection.version && currentSection.version > 1;
                
                if (hasUserChanges) {
                    console.log('✅ Preserving user changes for section:', aiKey);
                    // Keep the user-modified section
                    return {
                        ...currentSection,
                        // Update with any new AI content but preserve user modifications
                        columns: currentSection.columns.map((currentColumn, colIndex) => {
                            const aiColumn = aiSection.columns?.[colIndex];
                            if (!aiColumn) return currentColumn;
                            
                            return {
                                ...currentColumn,
                                elements: currentColumn.elements.map((currentElement, elemIndex) => {
                                    const aiElement = aiColumn.elements?.[elemIndex];
                                    if (!aiElement) return currentElement;
                                    
                                    // For HTML content elements, preserve user's originalHtml if it has been modified
                                    if (currentElement.type === 'htmlContent' && 
                                        currentElement.props?.originalHtml && 
                                        currentElement.props?.originalHtml !== aiElement.props?.originalHtml) {
                                        console.log('✅ Preserving user HTML changes');
                                        return currentElement; // Keep user's version
                                    }
                                    
                                    // For other elements, merge AI content with user changes
                                    return {
                                        ...aiElement,
                                        props: {
                                            ...aiElement.props,
                                            ...currentElement.props // User changes override AI defaults
                                        }
                                    };
                                })
                            };
                        })
                    };
                } else {
                    // No user changes, use AI section
                    console.log('🔄 Using AI section (no user changes):', aiKey);
                    return aiSection;
                }
            } else {
                // New section from AI, use as-is
                console.log('🆕 Using new AI section:', aiKey);
                return aiSection;
            }
        });
        
        console.log('✅ Merged layout:', mergedLayout);
        return mergedLayout;
    }, []);

    const syncPageWithAI = useCallback((responseData) => {
        // Always auto-apply changes - no modal needed
        setIsInitialPrompt(false);

        if (responseData.html) {
            // Store the original HTML for reference
            setOriginalApiHtml(responseData.html);
            
            // Use the simple HTML preservation approach to maintain exact styling
            const { sections, globalNavbar: parsedNav, globalFooter: parsedFooter } = htmlToBuilderJsonSimple(responseData.html);
            // Parsed sections from new response
        
        setPages(currentPages => {
            const pageToUpdate = currentPages[activePageId];
            if (!pageToUpdate) return currentPages;
                
            const newVersion = (pageToUpdate.version || 1) + 1;
            const currentLayout = pageToUpdate.layout || [];
            
            // Preserve user changes by merging with AI-generated content
            const mergedLayout = mergeUserChangesWithAI(currentLayout, sections);
            
            const updatedPage = {
                ...pageToUpdate,
                layout: mergedLayout,
                version: newVersion
            };
                        
            return {
                ...currentPages,
                [activePageId]: updatedPage
            };
        });

        if (parsedNav) setGlobalNavbar(parsedNav);
        if (parsedFooter) setGlobalFooter(parsedFooter);
        }
        
        // Always use follow_up_suggestions since we're not showing modal
        const suggestionsSource = responseData.follow_up_suggestions;
        if (Array.isArray(suggestionsSource)) {
            setAiSuggestions(suggestionsSource.map(s => ({
                prompt: s.prompt || '',
                label: s.label || s.shortText || 'Suggestion',
                shortText: s.shortText || s.label || 'Suggestion'
            })));
        }

        // Update undo/redo availability from API response
        // Undo/Redo state update
        
        // Store the current HTML state in history for undo/redo
        if (responseData.html) {
            const newHistoryEntry = {
                id: generateId('history'),
                timestamp: Date.now(),
                html: responseData.html,
                sections: responseData.sections,
                sectionOrder: responseData.section_order
            };
            
            console.log('Storing new history entry:', newHistoryEntry);
            console.log('Current state before storing:', { currentHistoryIndex, historyLength: undoRedoHistory.length });
            
            setUndoRedoHistory(prev => {
                // Remove any history after current index (when user made new changes)
                const newHistory = [...prev];
                newHistory.push(newHistoryEntry);
                console.log('Updated history:', newHistory);
                return newHistory;
            });
            
            setCurrentHistoryIndex(prev => {
                const newIndex = prev + 1;
                console.log('New history index:', newIndex);
                return newIndex;
            });
            setCanUndo(true);
            setCanRedo(false);
        }
    }, [activePageId]);

    const startAiSession = useCallback(async (forceNew = false) => {
        if (aiSessionId.current && !forceNew) {
            try {
                const res = await apiRequest('get', '/get-page', { session_id: aiSessionId.current });
                syncPageWithAI(res.data);
                return;
            } catch (error) {
                console.warn("Stale AI session, starting a new one.");
            }
        }
        try {
            setIsAiLoading(true);
            const sessionResponse = await apiRequest('post', '/start-session');
            if (sessionResponse.data.session_id) {
                const newSessionId = sessionResponse.data.session_id;
                aiSessionId.current = newSessionId;
                globalAiSessionId = newSessionId;
                sessionStorage.setItem('ai_session_id', newSessionId);
                setAiChatHistory([]);
                saveHistoryToStorage(newSessionId, []);
                // Initialize undo/redo states for new session
                setCanUndo(false);
                setCanRedo(false);
                setUndoRedoHistory([]);
                setCurrentHistoryIndex(-1);
                const res = await apiRequest('get', '/get-page', { session_id: newSessionId });
                syncPageWithAI(res.data);
            } else { throw new Error("Received an empty session ID from the API."); }
        } catch (error) { setModalStates(p => ({ ...p, alert: { isOpen: true, title: "AI Error", message: "Could not connect to the AI service." } }));
        } finally { setIsAiLoading(false); }
    }, [syncPageWithAI]);

    useEffect(() => {
        const initializeSession = async () => {
            const urlParams = new URLSearchParams(window.location.search);
            const step = urlParams.get('step');
            if (step === '3') {
                await startAiSession(true);
                setIsAiMode(true);
                urlParams.delete('step');
                const newSearch = urlParams.toString();
                const newUrl = newSearch ? `${window.location.pathname}?${newSearch}` : window.location.pathname;
                window.history.replaceState({}, '', newUrl);
            } else if (globalAiSessionId) {
                setAiChatHistory(getHistoryFromStorage(globalAiSessionId));
            }
        }
        initializeSession();
    }, [startAiSession]);
    
    const handleEnterAiMode = async () => {
        setIsAiMode(true);
        if (!aiSessionId.current) { await startAiSession(true); } 
        else {
             const res = await apiRequest('get', '/get-page', { session_id: aiSessionId.current });
             syncPageWithAI(res.data);
        }
    };
  
    const handleAiSubmit = useCallback(async (prompt) => {
        if (!aiSessionId.current) { 
            setModalStates(p => ({...p, alert: {isOpen: true, title: "AI Error", message: "AI session not started. Please try again."}})); 
            await startAiSession(true); 
            return; 
        }
        
        setIsAiLoading(true);
        setAiPreviewHtml(null);
        const historyId = generateId('history');
        setAiChatHistory(prev => [{ id: historyId, prompt, status: 'loading' }, ...prev]);
        saveHistoryToStorage(aiSessionId.current, [{ id: historyId, prompt, status: 'loading' }, ...aiChatHistory]);

        try {
            const response = await apiRequest('post', '/generate-page', { session_id: aiSessionId.current, prompt: prompt, as_file: false });
            syncPageWithAI(response.data);
            const summary = response.data.summary;
            setAiChatHistory(prev => {
                const finalHistory = prev.map(entry => entry.id === historyId ? {...entry, status: 'success', summary: summary || "Content updated successfully."} : entry);
                saveHistoryToStorage(aiSessionId.current, finalHistory);
                return finalHistory;
            });
            
            // Ensure undo is available after successful generation
            setCanUndo(true);
            setCanRedo(false);
        } catch (error) {
            setAiChatHistory(prev => {
                const finalHistory = prev.map(entry => entry.id === historyId ? {...entry, status: 'error'} : entry);
                saveHistoryToStorage(aiSessionId.current, finalHistory);
                return finalHistory;
            });
            setModalStates(p => ({...p, alert: {isOpen: true, title: "AI Error", message: `Failed to generate content: ${error.message}`}}));
        } finally { setIsAiLoading(false); }
    }, [aiChatHistory, startAiSession, syncPageWithAI]);

    const handleAiAction = useCallback(async (action) => {
        // AI Action called
        
        if (!aiSessionId.current) { 
            setModalStates(p => ({ ...p, alert: { isOpen: true, title: "AI Error", message: "AI session not started. Please try again." } })); 
            return; 
        }
        setIsAiLoading(true);
        setAiPreviewHtml(null);
        try {
            const response = await apiRequest('post', `/${action}`, { session_id: aiSessionId.current });
            // Action response
            
            // For undo/redo, we need to get the updated page state
            if (response.data.success) {
                // Get the updated page after undo/redo
                const pageResponse = await apiRequest('get', '/get-page', { session_id: aiSessionId.current });
                syncPageWithAI(pageResponse.data);
                
                // Update undo/redo states based on API response
                // The API should return can_undo and can_redo in the response
                if (typeof response.data.can_undo !== 'undefined') {
                    setCanUndo(response.data.can_undo);
                }
                if (typeof response.data.can_redo !== 'undefined') {
                    setCanRedo(response.data.can_redo);
                }
            } else {
                // Action failed
            }
        } catch (error) {
            // Action error
            setModalStates(p => ({ ...p, alert: { isOpen: true, title: "AI Sync Error", message: error.message || `Failed to perform ${action} operation.` } }));
        } finally {
            setIsAiLoading(false);
        }
    }, [syncPageWithAI, canUndo, canRedo]);

  const handleUndo = () => {
    // Undo clicked
    console.log('Undo clicked:', { canUndo, currentHistoryIndex, historyLength: undoRedoHistory.length });
    
    if (canUndo && currentHistoryIndex > 0) {
      // Move to previous history entry
      const newIndex = currentHistoryIndex - 1;
      const previousState = undoRedoHistory[newIndex];
      
      console.log('Undoing to state:', { newIndex, previousState });
      
      if (previousState) {
        // Update the page with previous HTML state
        const { sections } = htmlToBuilderJsonSimple(previousState.html);
        console.log('Parsed sections for undo:', sections);
        
        setPages(prev => {
          const updatedPages = {
            ...prev,
            [activePageId]: {
              ...prev[activePageId],
              layout: sections
            }
          };
          console.log('Updated pages state:', updatedPages[activePageId]);
          return updatedPages;
        });
        
        setCurrentHistoryIndex(newIndex);
        setCanUndo(newIndex > 0);
        setCanRedo(true);
        
        // Call API for backend record keeping
        handleAiAction('undo');
      }
    }
  };
  
  const handleRedo = () => {
    // Redo clicked
    console.log('Redo clicked:', { canRedo, currentHistoryIndex, historyLength: undoRedoHistory.length });
    
    if (canRedo && currentHistoryIndex < undoRedoHistory.length - 1) {
      // Move to next history entry
      const newIndex = currentHistoryIndex + 1;
      const nextState = undoRedoHistory[newIndex];
      
      console.log('Redoing to state:', { newIndex, nextState });
      
      if (nextState) {
        // Update the page with next HTML state
        const { sections } = htmlToBuilderJsonSimple(nextState.html);
        console.log('Parsed sections for redo:', sections);
        
        setPages(prev => {
          const updatedPages = {
            ...prev,
            [activePageId]: {
              ...prev[activePageId],
              layout: sections
            }
          };
          console.log('Updated pages state:', updatedPages[activePageId]);
          return updatedPages;
        });
        
        setCurrentHistoryIndex(newIndex);
        setCanUndo(true);
        setCanRedo(newIndex < undoRedoHistory.length - 1);
        
        // Call API for backend record keeping
        handleAiAction('redo');
      }
    }
  };

  // Debug effect to track undo/redo state changes
  useEffect(() => {
    console.log('Undo/Redo state changed:', { 
      canUndo, 
      canRedo, 
      historyLength: undoRedoHistory.length, 
      currentIndex: currentHistoryIndex,
      history: undoRedoHistory.map(h => ({ id: h.id, timestamp: h.timestamp }))
    });
  }, [canUndo, canRedo, undoRedoHistory, currentHistoryIndex]);

  useEffect(() => {
    if (newlyAddedElementId && pages) {
      let foundItem = null, foundPath = null;
      for (const pageId in pages) {
        const result = findItemAndPathRecursive(pages[pageId].layout, newlyAddedElementId, `pages[${pageId}].layout`);
        if (result) { foundItem = result.item; foundPath = result.path; break; }
      }
      if (foundItem && foundPath) handleSelect(foundItem.id, 'element', foundPath, foundItem);
      setNewlyAddedElementId(null);
    }
  }, [newlyAddedElementId, pages]);

  useEffect(() => {
    if (!pages[activePageId] && Object.keys(pages).length > 0) {
      const firstPageId = Object.keys(pages)[0];
      setActivePageId(firstPageId);
      setSelectedItem({ pageId: firstPageId, path: null, type: 'page', id: null });
    }
  }, [pages, activePageId]);

  const closeModal = (modalName) => setModalStates((prev) => ({ ...prev, [modalName]: { ...prev[modalName], isOpen: false } }));
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }), useSensor(KeyboardSensor));

  const handleAddPage = () => { setModalStates((prev) => ({ ...prev, addPage: { isOpen: true } })); };
  const submitAddPage = (newPageName) => {
    if (newPageName?.trim()) { const newId = generateId(newPageName.trim().toLowerCase().replace(/\s+/g, "-")); setPages((p) => ({ ...p, [newId]: { id: newId, name: newPageName.trim(), layout: [], version: 1 } })); setActivePageId(newId); setSelectedItem({ pageId: newId, path: null, type: 'page', id: null }); }
  };
  const handleSelectPage = (pageId) => { if (pages[pageId] && pageId !== activePageId) { setActivePageId(pageId); setSelectedItem({ pageId: pageId, path: null, type: 'page', id: null }); } };
  const handleRenamePage = (pageId, currentName) => { setModalStates(prev => ({ ...prev, renamePage: { isOpen: true, pageId, currentName } })); };
  const submitRenamePage = (newName) => { const { pageId } = modalStates.renamePage; if (newName?.trim() && pageId) { setPages(p => ({ ...p, [pageId]: { ...p[pageId], name: newName.trim() } })); } };
  const handleRenameActivePage = (newName) => { if (activePageId) { setPages(p => ({ ...p, [activePageId]: { ...p[activePageId], name: newName } })); } };
  const handleDeletePage = (pageId, pageName) => { if (Object.keys(pages).length <= 1) { setModalStates(p => ({...p, alert: {isOpen: true, title: "Action Not Allowed", message: "Cannot delete the last page."}})); return; } setModalStates(prev => ({ ...prev, deletePage: { isOpen: true, pageId, pageName } })); };
  const confirmDeletePage = () => {
    const { pageId } = modalStates.deletePage;
    setSelectedItem({ pageId: activePageId, path: null, type: 'page', id: null });
    setPages(p => { const newPages = {...p}; delete newPages[pageId]; const remainingIds = Object.keys(newPages); if (activePageId === pageId) { setActivePageId(remainingIds[0] || null); } return newPages; });
  };
  const handleNavigate = (pageSlugOrId) => { const targetPageId = pageSlugOrId.startsWith("/") ? pageSlugOrId.substring(1) : pageSlugOrId; if (pages[targetPageId]) { setActivePageId(targetPageId); if (!isPreviewMode) { setIsPreviewMode(true); setSelectedItem(null); } } };

  const handleOpenStructureModal = (path, type, pageId) => { setStructureModalContext({ path, elementType: type, pageId: pageId }); setIsStructureModalOpen(true); };

  const handleSetStructure = (columnLayouts, context) => {
    const newColumns = columnLayouts.map(layout => ({ id: generateId("col"), type: "column", props: { width: layout.width, style: {} }, elements: [] }));
    const targetPageId = context.pageId || activePageId;
    
    setPages(currentPages => {
        const pageToUpdate = currentPages[targetPageId];
        if (!pageToUpdate) return currentPages;
        const newLayout = JSON.parse(JSON.stringify(pageToUpdate.layout || []));
        if (context.path === null) {
            const newSection = { id: generateId("section"), type: "section", props: { paddingTop: "48px", paddingBottom: "48px", style: {} }, columns: newColumns };
            newLayout.push(newSection);
        } else {
            const item = getItemByPath({ layout: newLayout }, context.path.replace(`pages[${targetPageId}].`, ''));
            if (item) item.columns = newColumns;
        }
        return { ...currentPages, [targetPageId]: { ...pageToUpdate, layout: newLayout } };
    });
    setIsLeftPanelOpen(false);
  };
  
  const handleSelect = (id, type, path, itemData) => {
    if (activeTool !== 'select') return;
    if (type === 'page') { setSelectedItem({ pageId: activePageId, id: null, type: 'page', itemType: 'page', path: null, props: {} }); return; }
    if (type === 'globalElement') {
        const isFooter = path === 'globalFooter';
        const globalItem = isFooter ? globalFooter : globalNavbar;
        if (globalItem) {
            const itemTypeForPanel = isFooter ? 'section' : 'navbar';
            setSelectedItem({ pageId: activePageId, id: globalItem.id, type: 'globalElement', itemType: itemTypeForPanel, path: path, props: globalItem.props });
        }
        return;
    }
    
    // Handle visual element selection
    if (type === 'visualElement') {
        console.log('🎯 Setting selectedVisualElement:', itemData);
        setSelectedVisualElement(itemData);
        setSelectedItem({ 
            pageId: activePageId, 
            id: itemData.id, 
            type: 'visualElement', 
            itemType: 'visualElement', 
            path: path, 
            props: itemData 
        });
        return;
    }
    if (itemData) {
        const pageIdMatch = path.match(/pages\[([\w-]+)\]/);
        const pageId = pageIdMatch ? pageIdMatch[1] : activePageId;
        setSelectedItem({ pageId, id: itemData.id, type: type, itemType: itemData.type || type, path, props: itemData.props || {} });
    }
  };

  const handleUpdateProps = (path, newProps) => {
    const isGlobal = path.startsWith('global');
    if (isGlobal) {
        const updater = path.includes('Navbar') ? setGlobalNavbar : setGlobalFooter;
        updater(prev => ({...prev, props: mergeDeep({}, prev.props || {}, newProps)}));
    } else {
        setPages(currentPages => {
            const stateWrapper = { pages: JSON.parse(JSON.stringify(currentPages)) };
            const itemToUpdate = getItemByPath(stateWrapper, path);
            if (itemToUpdate) itemToUpdate.props = mergeDeep({}, itemToUpdate.props || {}, newProps);
            return stateWrapper.pages;
        });
    }
    if (selectedItem?.path === path) {
        setSelectedItem(prev => prev ? ({ ...prev, props: mergeDeep({}, prev.props || {}, newProps) }) : null);
    }
  };

  const handleVisualElementUpdate = (path, updates) => {
    console.log('🔧 Visual Element Update:', { path, updates, selectedVisualElement });
    
    // Handle visual element updates by updating the originalHtml
    setPages(currentPages => {
      const updatedPages = { ...currentPages };
      
      // Parse the path correctly: pages[pageId].layout[sectionIndex].columns[columnIndex].elements[elementIndex]
      const pageMatch = path.match(/pages\[([^\]]+)\]/);
      const pageId = pageMatch ? pageMatch[1] : null;
      
      if (!pageId || !updatedPages[pageId]) {
        console.log('❌ Invalid pageId or page not found:', pageId, 'Available pages:', Object.keys(updatedPages));
        return updatedPages;
      }
      
      const page = updatedPages[pageId];
      const newLayout = [...(page.layout || [])];
      
      // Parse section, column, and element indices
      const sectionMatch = path.match(/layout\[(\d+)\]/);
      const columnMatch = path.match(/columns\[(\d+)\]/);
      const elementMatch = path.match(/elements\[(\d+)\]/);
      
      const sectionIndex = sectionMatch ? parseInt(sectionMatch[1]) : -1;
      const columnIndex = columnMatch ? parseInt(columnMatch[1]) : -1;
      const elementIndex = elementMatch ? parseInt(elementMatch[1]) : -1;
      
      console.log('📍 Parsed indices:', { sectionIndex, columnIndex, elementIndex });
      
      if (sectionIndex >= 0 && sectionIndex < newLayout.length) {
        if (columnIndex >= 0 && columnIndex < newLayout[sectionIndex].columns.length) {
          if (elementIndex >= 0 && elementIndex < newLayout[sectionIndex].columns[columnIndex].elements.length) {
            const element = newLayout[sectionIndex].columns[columnIndex].elements[elementIndex];
            
            console.log('🎯 Found element to update:', element);
            
            // For HTML content elements, update the originalHtml
            if (element.type === 'htmlContent' && element.props?.originalHtml) {
              let updatedHtml = element.props.originalHtml;
              
              console.log('📝 Original HTML:', updatedHtml);
              
              // Simple approach: Update the entire HTML with new styles
              if (updates.style || updates.text !== undefined || updates.className) {
                // Create a temporary DOM to parse and update
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = updatedHtml;
                
                // Find the element by matching tag name and text content
                const targetTagName = selectedVisualElement?.tagName?.toLowerCase();
                const originalText = selectedVisualElement?.text;
                
                let targetElement = null;
                
                if (targetTagName && originalText) {
                  // Try to find by tag name and text content
                  const elements = tempDiv.querySelectorAll(targetTagName);
                  for (const element of elements) {
                    if (element.textContent.trim() === originalText.trim()) {
                      targetElement = element;
                      break;
                    }
                  }
                }
                
                if (targetElement) {
                  console.log('🎯 Found target element by content:', targetElement);
                  
                  // Update the element
                  if (updates.text !== undefined) {
                    targetElement.textContent = updates.text;
                  }
                  if (updates.style) {
                    targetElement.style.cssText = updates.style;
                  }
                  if (updates.className) {
                    targetElement.className = updates.className;
                  }
                  
                  // Ensure all elements have data-element-id attributes
                  const allElements = tempDiv.querySelectorAll('h1, h2, h3, h4, h5, h6, p, button, img, div');
                  allElements.forEach((element) => {
                    if (!element.getAttribute('data-element-id')) {
                      const elementType = element.tagName.toLowerCase();
                      const elementId = generateId(elementType);
                      element.setAttribute('data-element-id', elementId);
                    }
                  });
                  
                  updatedHtml = tempDiv.innerHTML;
                  console.log('✅ Updated HTML:', updatedHtml);
                } else {
                  console.log('❌ Target element not found by content:', { targetTagName, originalText });
                  console.log('🔍 Available elements:', Array.from(tempDiv.querySelectorAll('h1, h2, h3, h4, h5, h6, p, button, img, div')).map(el => ({
                    tag: el.tagName.toLowerCase(),
                    text: el.textContent.trim().substring(0, 50)
                  })));
                }
              }
              
              newLayout[sectionIndex].columns[columnIndex].elements[elementIndex] = {
                ...element,
                props: { ...element.props, originalHtml: updatedHtml }
              };
            } else {
              // For other elements, update props normally
              newLayout[sectionIndex].columns[columnIndex].elements[elementIndex] = {
                ...element,
                props: { ...element.props, ...updates }
              };
            }
          } else {
            console.log('❌ Invalid element index:', elementIndex);
          }
        } else {
          console.log('❌ Invalid column index:', columnIndex);
        }
      } else {
        console.log('❌ Invalid section index:', sectionIndex);
      }
      
      updatedPages[pageId] = {
        ...page,
        layout: newLayout,
        version: (page.version || 1) + 1
      };
      
      console.log('🔄 Updated pages:', updatedPages[pageId]);
      return updatedPages;
    });
  };

  const handleDelete = (path) => {
    setPages(currentPages => {
        const stateWrapper = { pages: JSON.parse(JSON.stringify(currentPages)) };
        if (deleteItemByPath(stateWrapper, path)) {
            if (selectedItem?.path?.startsWith(path)) {
                setSelectedItem({ pageId: activePageId, path: null, type: 'page', id: null });
            }
            return stateWrapper.pages;
        }
        return currentPages;
    });
  };

  const handleAddGlobalElement = (type) => { const config = AVAILABLE_ELEMENTS_CONFIG.find(c => c.id === type && c.isGlobalOnly); if(!config) return; const newGlobalElement = { id: `global-${config.id}`, type: config.id, props: getDefaultProps(type) }; if (type === 'navbar') setGlobalNavbar(newGlobalElement); if (type === 'footer') setGlobalFooter({ id: 'global-footer', type: 'section', columns: [], props: { ...getDefaultProps('section'), ...config.defaultProps } }); };
  const handleDeleteGlobalElement = (elementType) => { const updater = elementType === "navbar" ? setGlobalNavbar : setGlobalFooter; updater(null); if (selectedItem?.itemType === elementType || (elementType === 'footer' && selectedItem?.path === 'globalFooter')) setSelectedItem({ pageId: activePageId, path: null, type: 'page', id: null }); };

  const findContainerById = (items, id, pathPrefix = '') => {
      for (let i = 0; i < items.length; i++) {
          const item = items[i];
          const currentPath = `${pathPrefix}[${i}]`;
          if (item.id === id) return { container: items, index: i, item: item, path: currentPath };
          if (item.type === 'column' && `col-${item.id}` === id) {
              if (!item.elements) item.elements = [];
              return { container: item.elements, index: item.elements.length, item: item, path: `${currentPath}.elements` };
          }
          if (item.columns) {
              const found = findContainerById(item.columns, id, `${currentPath}.columns`);
              if (found) return found;
          }
          if (item.elements) {
              const found = findContainerById(item.elements, id, `${currentPath}.elements`);
              if (found) return found;
          }
      }
      return null;
  };

  const handleDragStart = (e) => {
    setActiveDragItem(e.active);
    const { active } = e; const itemData = active.data.current;
    const elementOrSectionData = itemData?.elementData || itemData?.sectionData;
    if (itemData?.path && elementOrSectionData) {
        let type = itemData.type === 'section' ? 'section' : itemData.type === 'canvasElement' ? 'element' : null;
        if (type) handleSelect(active.id, type, itemData.path, elementOrSectionData);
    }
  };

  const handleDragEnd = (e) => {
    setActiveDragItem(null);
    const { active, over } = e;
    if (!over || active.id === over.id) return;

    const activeType = active.data.current?.type;
    const overId = over.id;
    const overData = over.data.current;
    
    setPages(currentPages => {
        const pageToUpdate = currentPages[activePageId];
        if (!pageToUpdate) return currentPages;
        const newLayout = JSON.parse(JSON.stringify(pageToUpdate.layout || []));

        if (activeType === 'paletteItem') {
            const config = active.data.current.config;
            if (config.isGlobalOnly) {
                handleAddGlobalElement(config.id);
                return currentPages;
            }
            const newElement = {
                id: generateId(config.id), type: config.id, props: getDefaultProps(config.id),
                ...(config.hasOwnColumns && { columns: [] })
            };
            setNewlyAddedElementId(newElement.id);

            let dropTarget = findContainerById(newLayout, overId);
            if (dropTarget?.container) {
                dropTarget.container.splice(dropTarget.index, 0, newElement);
            } else if (overData?.type === 'section' && dropTarget === null) {
                const sectionContainer = findContainerById(newLayout, overId);
                if (sectionContainer?.item.columns[0]) {
                     sectionContainer.item.columns[0].elements.push(newElement);
                }
            } else {
                const newSection = {
                    id: generateId("section"), type: "section", props: { ...getDefaultProps('section'), paddingTop: "48px", paddingBottom: "48px" },
                    columns: [{ id: generateId("col"), type: "column", props: { ...getDefaultProps('column'), width: "100%" }, elements: [newElement] }]
                };
                const overSectionIndex = overData.type === 'section' ? newLayout.findIndex(s => s.id === overId) : -1;
                newLayout.splice(overSectionIndex !== -1 ? overSectionIndex + 1 : newLayout.length, 0, newSection);
            }
        } else if (activeType === 'canvasElement') {
            const sourceInfo = findContainerById(newLayout, active.id);
            if (!sourceInfo) return currentPages;
            const [movedElement] = sourceInfo.container.splice(sourceInfo.index, 1);
            const destInfo = findContainerById(newLayout, over.id);
            if (destInfo?.container) {
                 destInfo.container.splice(destInfo.index, 0, movedElement);
            } else {
                 sourceInfo.container.splice(sourceInfo.index, 0, movedElement);
            }
        } else if (activeType === 'section') {
            const activeIndex = newLayout.findIndex(s => s.id === active.id);
            const overIndex = newLayout.findIndex(s => s.id === overId);
            if (activeIndex !== -1 && overIndex !== -1) {
                const movedLayout = arrayMove(newLayout, activeIndex, overIndex);
                return { ...currentPages, [activePageId]: { ...pageToUpdate, layout: movedLayout } };
            }
        }
        return { ...currentPages, [activePageId]: { ...pageToUpdate, layout: newLayout } };
    });
  };

  const togglePreviewMode = () => { setSelectedItem(null); setIsPreviewMode((prev) => !prev); };

  const handleCanvasMouseDown = (e) => { if (activeTool === 'hand') { isPanning.current = true; lastMousePos.current = { x: e.clientX, y: e.clientY }; e.currentTarget.style.cursor = 'grabbing'; } };
  const handleCanvasMouseMove = (e) => { if (activeTool === 'hand' && isPanning.current) { const dx = e.clientX - lastMousePos.current.x; const dy = e.clientY - lastMousePos.current.y; lastMousePos.current = { x: e.clientX, y: e.clientY }; setPanOffset(prev => ({ x: prev.x + dx, y: prev.y + dy })); } };
  const handleCanvasMouseUpOrLeave = (e) => { if (activeTool === 'hand' && isPanning.current) { isPanning.current = false; e.currentTarget.style.cursor = 'grab'; } };

  const handleClickOutside = (e) => {
    // Close visual element selection when clicking outside the right panel
    if (selectedItem?.type === 'visualElement' && !e.target.closest('[data-right-panel]')) {
      setSelectedItem(null);
      setSelectedVisualElement(null);
    }
  };

  const handleAddComment = (pageId, frameName, clickPosition) => {
    if (!canvasRef.current) return;
    const canvasRect = canvasRef.current.getBoundingClientRect(); const viewX = clickPosition.x - canvasRect.left; const viewY = clickPosition.y - canvasRect.top; const transformedX = (viewX - panOffset.x) / zoom; const transformedY = (viewY - panOffset.y) / zoom;
    let frameLeftEdge = 0; const paddingLeft = 64; const gap = 64; let currentLeft = paddingLeft;
    for (const device of DEVICE_FRAMES_CONFIG) { if (frameName === device.name) { frameLeftEdge = currentLeft; break; } currentLeft += device.width + gap; }
    const paddingTop = 64; const finalX = transformedX - frameLeftEdge; const finalY = transformedY - paddingTop;
    const newComment = { id: generateId('comment'), text: 'New comment...', position: { x: finalX, y: finalY }, frame: frameName, author: 'User', createdAt: new Date().toISOString() };
    setComments(prev => ({...prev, [pageId]: [...(prev[pageId] || []), newComment]}));
  };
  const handleUpdateComment = (pageId, commentId, newText) => setComments(prev => ({ ...prev, [pageId]: prev[pageId].map(c => c.id === commentId ? { ...c, text: newText } : c) }));
  const handleDeleteComment = (pageId, commentId) => setComments(prev => ({ ...prev, [pageId]: prev[pageId].filter(c => c.id !== commentId) }));

  const activePage = pages[activePageId];
  // ActivePage render
  const getCanvasCursor = () => { switch(activeTool) { case 'hand': return 'grab'; case 'comment': return 'crosshair'; default: return 'default'; } }
  const isRightPanelOpen = !!selectedItem;

  if (isPreviewMode) {
    return (
        <div className="flex flex-col h-screen bg-white antialiased">
            <TopBar onSaveAndClose={onSaveAndClose} onCancel={onCancel} onTogglePreview={togglePreviewMode} isPreviewMode={true} onToggleLeftPanel={() => setIsLeftPanelOpen(p => !p)} />
            <PagePreviewRenderer pageLayout={pages[activePageId]?.layout || []} globalNavbar={globalNavbar} globalFooter={globalFooter} onNavigate={handleNavigate} activePageId={activePageId} />
        </div>
    );
  }

  return (
    <DndContext sensors={sensors} collisionDetection={rectIntersection} onDragStart={handleDragStart} onDragEnd={handleDragEnd} disabled={isPreviewMode || activeTool !== 'select'}>
        <div ref={builderRef} className="h-screen bg-white antialiased flex flex-col relative">
            <style>{`.selected-outline { box-shadow: 0 0 0 1.5px #ffffff, 0 0 0 3px #22c55e; border-radius: 0.5rem; } .custom-slider { -webkit-appearance: none; appearance: none; width: 100%; height: 4px; background: #e2e8f0; border-radius: 9999px; outline: none; opacity: 0.9; transition: opacity .2s; } .custom-slider:hover { opacity: 1; } .custom-slider::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 14px; height: 14px; background: #16a34a; border-radius: 50%; cursor: pointer; border: 2.5px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.2); } .custom-slider::-moz-range-thumb { width: 14px; height: 14px; background: #16a34a; border-radius: 50%; cursor: pointer; border: 2.5px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.2); }`}</style>
            <TopBar onSaveAndClose={onSaveAndClose} onCancel={onCancel} onTogglePreview={togglePreviewMode} isPreviewMode={false} onToggleLeftPanel={() => setIsLeftPanelOpen(p => !p)} />
            <div className="flex-1 flex flex-row relative overflow-hidden z-0">
                <LeftPanel
                    isOpen={isLeftPanelOpen}
                    onClose={() => setIsLeftPanelOpen(false)}
                    onAddTopLevelSection={() => handleSetStructure([], { path: null, pageId: activePageId })}
                    onEnterAiMode={handleEnterAiMode}
                    pages={pages}
                    activePageId={activePageId}
                    onAddPage={handleAddPage}
                    onSelectPage={handleSelectPage}
                    onRenamePage={handleRenamePage}
                    onDeletePage={handleDeletePage}
                    onAiSubmit={handleAiSubmit}
                    isAiLoading={isAiLoading}
                    aiChatHistory={aiChatHistory}
                    onSelect={handleSelect}
                    selectedItem={selectedItem}
                    aiSuggestions={aiSuggestions}
                    handleUndo={handleUndo}
                    handleRedo={handleRedo}
                    isAiMode={isAiMode}
                    setIsAiMode={setIsAiMode}
                    canUndo={canUndo}
                    canRedo={canRedo}
                    originalApiHtml={originalApiHtml}
                />
                <div className="flex-1 flex flex-col relative">
                    <CanvasToolbar selectedItem={selectedItem} zoom={zoom} onZoomChange={setZoom} onSelect={handleSelect} pages={pages} activeTool={activeTool} onToolChange={setActiveTool}/>
                    <main ref={canvasRef} className="flex-1 flex flex-col relative bg-dots overflow-auto" onMouseDown={handleCanvasMouseDown} onMouseMove={handleCanvasMouseMove} onMouseUp={handleCanvasMouseUpOrLeave} onMouseLeave={handleCanvasMouseUpOrLeave} style={{ cursor: getCanvasCursor(), backgroundSize: '30px 30px', backgroundImage: 'radial-gradient(circle, #e2e8f0 1px, rgba(0, 0, 0, 0) 1px)' }}>
                    {isAiLoading && <AiCanvasLoader />}

                    {!isAiLoading && !aiPreviewHtml && (
                        <div key={`${activePageId}-${activePage?.version || 1}`} style={{ transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoom})`, transformOrigin: "0 0", transition: isPanning.current ? 'none' : "transform 0.2s" }} className="flex-1 flex gap-16 items-start p-16" onClick={(e) => { if (e.target === e.currentTarget && activeTool === 'select') { setSelectedItem({ pageId: activePageId, path: null, type: 'page', id: null }); } handleClickOutside(e); }}>
                            {activePage && DEVICE_FRAMES_CONFIG.map((device) => (
                                <DeviceFrame key={device.name} device={device} page={activePage} globalNavbar={globalNavbar} globalFooter={globalFooter} onUpdateProps={handleUpdateProps} onDelete={handleDelete} onSelect={handleSelect} selectedItemId={selectedItem?.id} onOpenStructureModal={(path, type) => handleOpenStructureModal(path, type, activePage.id)} isPreviewMode={isPreviewMode} onNavigate={handleNavigate} onDeleteGlobalElement={handleDeleteGlobalElement} isDraggable={activeTool === 'select'} comments={(comments[activePageId] || []).filter(c => c.frame === device.name)} onAddComment={handleAddComment} activeTool={activeTool} />
                            ))}
                        </div>
                    )}
                    </main>
                </div>
                <div className={`absolute top-0 right-0 h-full transition-transform duration-300 ease-in-out z-40 transform ${isRightPanelOpen ? 'translate-x-0' : 'translate-x-full'}`} data-right-panel>
                  <RightSidebar selectedItemData={selectedItem} onUpdateSelectedProps={selectedItem?.type === 'visualElement' ? handleVisualElementUpdate : handleUpdateProps} pages={pages} activePageId={activePageId} onRenamePage={handleRenameActivePage} onAddGlobalElement={handleAddGlobalElement} comments={comments} onUpdateComment={handleUpdateComment} onDeleteComment={handleDeleteComment} onClose={() => setSelectedItem(null)} selectedVisualElement={selectedVisualElement} />
                </div>
            </div>
            <DragOverlay dropAnimation={null} zIndex={9999}>{activeDragItem && activeDragItem.data.current?.type === "paletteItem" ? (<PaletteItemDragOverlay config={activeDragItem.data.current.config} />) : null}</DragOverlay>
            <StructureSelectorModal isOpen={isStructureModalOpen} onClose={() => setIsStructureModalOpen(false)} onSelectStructure={handleSetStructure} context={structureModalContext} />
            <InputModal isOpen={modalStates.addPage.isOpen} onClose={() => closeModal("addPage")} onSubmit={submitAddPage} title="Add New Page" inputLabel="Page Name" initialValue={`Page ${Object.keys(pages).length + 1}`} />
            <InputModal isOpen={modalStates.renamePage.isOpen} onClose={() => closeModal("renamePage")} onSubmit={submitRenamePage} title="Rename Page" inputLabel="New Page Name" initialValue={modalStates.renamePage.currentName} />
            <ConfirmationModal isOpen={modalStates.deletePage.isOpen} onClose={() => closeModal("deletePage")} onConfirm={confirmDeletePage} title="Delete Page" message={`Are you sure you want to delete "${modalStates.deletePage.pageName}"?`} confirmButtonVariant="danger" />
            <ConfirmationModal isOpen={modalStates.saveConfirm.isOpen} onClose={() => closeModal("saveConfirm")} onConfirm={() => closeModal("saveConfirm")} title={modalStates.saveConfirm.title} message={modalStates.saveConfirm.message} confirmText="OK" />
            <ConfirmationModal isOpen={modalStates.alert.isOpen} onClose={() => closeModal("alert")} onConfirm={() => closeModal("alert")} title={modalStates.alert.title} message={modalStates.alert.message} confirmText="OK" />
        </div>
    </DndContext>
  );
}