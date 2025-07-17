import React, { useState, useRef, useMemo, useEffect, useCallback } from "react";
import { DndContext, DragOverlay, PointerSensor, KeyboardSensor, useSensor, useSensors, useDraggable, useDroppable, rectIntersection } from "@dnd-kit/core";
import { SortableContext, useSortable, arrayMove, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import img from "../../../assets/img/cards/672e98fa2d1ed0b7d1bf2adb_glass.png";
import * as LucideIcons from "lucide-react";
import apiRequest from "../../../utils/apiRequest";

// --- MODAL & UI COMPONENTS (UNCHANGED) ---
const StyledModalButton = ({ children, onClick, variant = "primary", className = "" }) => {
  const baseStyle = "inline-flex items-center justify-center px-6 py-2.5 text-sm font-semibold rounded-full transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed";
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
        <div className="flex justify-between items-center p-5 bg-slate-50 rounded-t-2xl border-b border-slate-200">
          <h3 className="text-lg font-bold text-slate-800">{title}</h3>
          {onClose && (
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors p-1.5 rounded-full hover:bg-slate-200">
              <LucideIcons.X className="w-5 h-5" />
            </button>
          )}
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
function ConfirmationModal({ isOpen, onClose, onConfirm, title, message, confirmText = "Confirm", cancelText = "Cancel", confirmButtonVariant = "primary" }) {
  if (!isOpen) return null;
  return (
    <GeneralModal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <p className="text-sm text-slate-600 mb-8">{message}</p>
      <div className="flex justify-end space-x-3">
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
      <input id="input-modal-field" type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} placeholder={placeholder} className="w-full px-4 py-2 border border-slate-300 rounded-lg text-base focus:ring-2 focus:ring-green-500 focus:border-green-500 transition shadow-sm" />
      <div className="flex justify-end space-x-3 mt-6">
        <StyledModalButton onClick={onClose} variant="secondary">{cancelText}</StyledModalButton>
        <StyledModalButton onClick={handleSubmit} variant="primary">{submitText}</StyledModalButton>
      </div>
    </GeneralModal>
  );
}
function CustomDropdown({ options, value, onChange, placeholder = "Select an option", label, disabled = false, idSuffix = "" }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const selectedOption = options.find((opt) => opt.value === value);
  useEffect(() => { const handleClickOutside = (event) => { if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setIsOpen(false); }; document.addEventListener("mousedown", handleClickOutside); return () => document.removeEventListener("mousedown", handleClickOutside); }, []);
  const handleSelect = (optionValue) => { onChange(optionValue); setIsOpen(false); };
  return (
    <div className="relative w-full" ref={dropdownRef}>
      {label && (<label className="block text-xs font-medium text-slate-600 mb-1.5">{label}</label>)}
      <button type="button" onClick={() => !disabled && setIsOpen(!isOpen)} disabled={disabled} className={`w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all shadow-sm bg-white text-left flex justify-between items-center ${disabled ? "bg-slate-100 cursor-not-allowed" : "cursor-pointer"}`}>
        <span className={selectedOption ? "text-slate-800" : "text-slate-500"}>{selectedOption ? selectedOption.label : placeholder}</span>
        <LucideIcons.ChevronDown className={`w-5 h-5 text-slate-500 transition-transform ${isOpen ? "transform rotate-180" : ""}`} />
      </button>
      {isOpen && !disabled && (
        <ul className="absolute z-20 mt-1 w-full bg-white border border-slate-200 rounded-lg max-h-60 overflow-auto py-1.5 text-sm shadow-xl animate-fadeInDown">
          {options.map((opt) => (
            <li key={`${opt.value}-${idSuffix}`} onClick={() => handleSelect(opt.value)} className={`px-4 py-2 hover:bg-green-50 cursor-pointer ${opt.value === value ? "bg-green-100 text-green-800 font-semibold" : "text-slate-700"}`}>{opt.label}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
// --- HELPER FUNCTIONS (UNCHANGED) ---
function generateId(prefix = "id") { return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`; }
function isObject(item) { return (item && typeof item === 'object' && !Array.isArray(item)); }
function mergeDeep(target, ...sources) {
  if (!sources.length) return target;
  const source = sources.shift();
  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} });
        mergeDeep(target[key], source[key]);
      } else {
        Object.assign(target, { [key]: source[key] });
      }
    }
  }
  return mergeDeep(target, ...sources);
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
// --- CONFIGS & ELEMENT COMPONENTS (UNCHANGED) ---
const textSizeOptions = [ { label: "Tiny", value: "text-xs" }, { label: "Small", value: "text-sm" }, { label: "Base", value: "text-base" }, { label: "Large", value: "text-lg" }, { label: "XL", value: "text-xl" }, { label: "2XL", value: "text-2xl" }, ];
const fontWeightOptions = [ { label: "Light", value: "font-light" }, { label: "Normal", value: "font-normal" }, { label: "Medium", value: "font-medium" }, { label: "Semibold", value: "font-semibold" }, { label: "Bold", value: "font-bold" }, ];
const textAlignOptions = [ { label: "Left", value: "text-left", icon: <LucideIcons.AlignLeft className="w-5 h-5" /> }, { label: "Center", value: "text-center", icon: <LucideIcons.AlignCenter className="w-5 h-5" /> }, { label: "Right", value: "text-right", icon: <LucideIcons.AlignRight className="w-5 h-5" /> }, ];
const PREDEFINED_STRUCTURES = [ { name: "1 Column", id: "1col", layout: [{ width: "100%" }] }, { name: "2 Columns", id: "2col5050", layout: [{ width: "50%" }, { width: "50%" }] }, { name: "3 Columns", id: "3col33", layout: [{ width: "33.33%" }, { width: "33.33%" }, { width: "33.33%" }] }, { name: "4 Columns", id: "4col25", layout: [{ width: "25%" }, { width: "25%" }, { width: "25%" }, { width: "25%" }] }, { name: "Left Sidebar", id: "leftsidebar", layout: [{ width: "30%" }, { width: "70%" }] }, { name: "Right Sidebar", id: "rightsidebar", layout: [{ width: "70%" }, { width: "30%" }] }, ];
const PREVIEW_DEVICES = [ { name: "Mobile", width: 390, icon: LucideIcons.Smartphone }, { name: "Tablet", width: 768, icon: LucideIcons.Tablet }, { name: "Desktop", width: "100%", icon: LucideIcons.Monitor }, ];
function Heading({ text = "Default Heading Title", onUpdate, isSelected, sizeClass, fontWeight, textAlign, textColor, isPreviewMode, isEditable, style }) {
  const handleBlur = (e) => { if (onUpdate && !isPreviewMode) onUpdate({ text: e.currentTarget.innerText }); };
  return (
    <div className={`p-2 ${!isPreviewMode ? `rounded-lg ${isSelected ? "" : "hover:ring-2 hover:ring-green-400/20"}`: ""}`} style={style}>
      <h1
        style={{ color: textColor || undefined }}
        className={`${sizeClass || "text-2xl"} ${fontWeight || "font-bold"} ${textAlign || "text-left"} ${!textColor ? "text-slate-800" : ""} ${!isPreviewMode ? "focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white/80 p-1 -m-1 rounded-lg" : ""} transition-all`}
        contentEditable={!isPreviewMode && isEditable} suppressContentEditableWarning onBlur={handleBlur} dangerouslySetInnerHTML={{ __html: text }}></h1>
    </div>
  );
}
function TextBlock({ text = "Lorem ipsum dolor sit amet...", onUpdate, isSelected, sizeClass, fontWeight, textAlign, textColor, isPreviewMode, isEditable, style }) {
    const handleBlur = (e) => { if (onUpdate && !isPreviewMode) onUpdate({ text: e.currentTarget.innerText }); };
    return (
        <div className={`p-2 ${!isPreviewMode ? `rounded-lg ${isSelected ? "" : "hover:ring-2 hover:ring-green-400/20"}` : ""}`} style={style}>
            <p
                style={{ color: textColor || undefined }}
                className={`${sizeClass || "text-base"} ${fontWeight || "font-normal"} ${textAlign || "text-left"} ${!textColor ? "text-slate-700" : ""} leading-relaxed ${!isPreviewMode ? "focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white/80 p-1 -m-1 rounded-lg whitespace-pre-wrap" : "whitespace-pre-wrap"} transition-all`}
                contentEditable={!isPreviewMode && isEditable}
                suppressContentEditableWarning
                onBlur={handleBlur}
                dangerouslySetInnerHTML={{ __html: text }}></p>
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
        <div className={`p-2 ${!isPreviewMode ? `rounded-lg ${isSelected ? "" : "hover:ring-2 hover:ring-green-400/20"}` : ""}`} style={style}>
            <div className={`bg-white rounded-lg shadow-sm border ${isSelected && !isPreviewMode ? "border-green-300" : "border-slate-200"}`}>
                <h2>
                    <button type="button" onClick={effectiveToggle} className={`flex items-center justify-between w-full p-4 font-medium text-left text-slate-800 ${isPreviewMode ? 'hover:bg-green-50/50' : 'cursor-default'} transition-colors`}>
                        <span contentEditable={!isPreviewMode && isEditable} suppressContentEditableWarning onBlur={handleTitleBlur} className={`flex-1 ${!isPreviewMode ? "focus:outline-none focus:ring-1 focus:ring-green-400 p-0.5 -m-0.5 rounded-sm" : ""}`} dangerouslySetInnerHTML={{ __html: title }}></span>
                        <LucideIcons.ChevronDown className={`w-5 h-5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}/>
                    </button>
                </h2>
                <div className={`grid overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                    <div className="overflow-hidden">
                        <div className="p-4 border-t border-slate-200 text-slate-600">
                             <p contentEditable={!isPreviewMode && isEditable} suppressContentEditableWarning onBlur={handleContentBlur} className={`${!isPreviewMode ? "focus:outline-none focus:ring-1 focus:ring-green-400 p-0.5 -m-0.5 rounded-sm whitespace-pre-wrap" : "whitespace-pre-wrap"}`} dangerouslySetInnerHTML={{ __html: content }}></p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
function ImageElement({ src = img, alt = "Placeholder", width = "100%", height = "auto", borderRadius = "8px", boxShadow = "none", isSelected, isPreviewMode, style }) {
    const getStyleValue = (v) => v === "auto" || (typeof v === "string" && v.endsWith("%")) ? v : `${parseInt(v, 10) || "auto"}px`;
    return (
        <div className={`p-1 ${!isPreviewMode ? `rounded-lg ${isSelected ? "" : "hover:ring-2 hover:ring-green-400/20"}` : ""}`} style={style}>
            <img src={src} alt={alt} className={`max-w-full h-auto block mx-auto transition-all`} style={{ width: getStyleValue(width), height: getStyleValue(height), minHeight: "50px", objectFit: "cover", borderRadius: borderRadius, boxShadow: boxShadow }} />
        </div>
    );
}
function ButtonElement({ buttonText = "Click Me", link = "#", onUpdate, isSelected, sizeClass, textAlign, backgroundColor = "#16a34a", textColor = "#ffffff", borderRadius = "9999px", variant = "solid", fullWidth = false, isPreviewMode, onNavigate, isEditable, style }) {
    const handleTextBlur = (e) => { if (onUpdate && !isPreviewMode) onUpdate({ buttonText: e.currentTarget.innerText }); };
    const solidStyle = { backgroundColor: backgroundColor, color: textColor, borderRadius: borderRadius, border: "2px solid transparent" };
    const outlineStyle = { backgroundColor: "transparent", color: backgroundColor, borderRadius: borderRadius, border: `2px solid ${backgroundColor}` };
    const buttonStyle = variant === "outline" ? outlineStyle : solidStyle;
    const handleClick = (e) => {
        if (!isPreviewMode) { e.preventDefault(); return; }
        if (link && link.startsWith("/")) { e.preventDefault(); if (onNavigate) onNavigate(link.substring(1)); }
        else if (link === "#") { e.preventDefault(); }
    };
    return (
        <div className={`py-3 px-2 ${textAlign || "text-center"} ${!isPreviewMode && isSelected ? "rounded-xl bg-green-500/5" : ""}`} style={style}>
            <a href={link} onClick={handleClick} target={ isPreviewMode && link && !link.startsWith("/") && link !== "#" ? "_blank" : "_self" } rel={ isPreviewMode && link && !link.startsWith("/") && link !== "#" ? "noopener noreferrer" : "" } className={`inline-block px-8 py-3 font-semibold shadow-md hover:opacity-90 transition-all transform hover:-translate-y-px active:translate-y-0`} style={buttonStyle}>
                <span contentEditable={!isPreviewMode && isEditable} suppressContentEditableWarning onBlur={handleTextBlur} dangerouslySetInnerHTML={{ __html: buttonText }} className={`${!isPreviewMode ? "focus:outline-none focus:ring-1 focus:ring-white/50 p-0.5 -m-0.5 rounded-sm" : ""}`}></span>
            </a>
        </div>
    );
}
function Divider({ isSelected, isPreviewMode, style }) {
    return (
        <div className={`py-4 px-1 ${!isPreviewMode && isSelected ? "rounded-xl bg-green-500/5" : ""}`} style={style}>
            <hr className="border-t border-slate-300" />
        </div>
    );
}
function Spacer({ height = "20px", onUpdate, isSelected, isPreviewMode, style }) {
    return <div style={{ height, ...style }} className={`w-full transition-all ${!isPreviewMode && isSelected ? "bg-green-200/50" : !isPreviewMode ? "bg-transparent hover:bg-slate-200/50" : ""}`}></div>;
}
function IconElement({ iconName = "Star", size = "32px", color = "currentColor", onUpdate, isSelected, isPreviewMode, style }) {
    const IconComponent = LucideIcons[iconName] || LucideIcons.HelpCircle;
    const ActualIconComponent = IconComponent || LucideIcons.HelpCircle;
    return (
        <div className={`p-2 flex justify-center items-center ${!isPreviewMode && isSelected ? "rounded-xl bg-green-500/5" : ""}`} style={style}>
            <ActualIconComponent style={{ fontSize: size, color: color }} strokeWidth={color === "currentColor" ? 1.75 : 2} />
        </div>
    );
}
function GoogleMapsPlaceholder({ address = "1600 Amphitheatre Parkway, Mountain View, CA", zoom = 14, onUpdate, isSelected, isPreviewMode, style }) {
    return (
        <div className={`p-3 rounded-xl ${!isPreviewMode ? `${isSelected ? "bg-green-500/5 ring-2 ring-green-500" : "bg-slate-100 border border-slate-200 hover:border-green-300"}` : "bg-slate-100 border border-slate-200"} aspect-video flex flex-col items-center justify-center text-center`} style={style}>
            <LucideIcons.MapPin className="h-12 w-12 text-slate-400 mb-2" />
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
        if (!src) return (<div className="p-4 text-center text-slate-500 aspect-video flex items-center justify-center bg-slate-100 rounded-lg border border-slate-200">Video source not configured.</div>);
        switch (videoType) {
            case "youtube": return (<iframe src={getYouTubeEmbedUrl(src)} style={{ width: effectiveWidth, height: effectiveHeight }} frameBorder="0" allow="autoplay; fullscreen; picture-in-picture" allowFullScreen title="YouTube Video" className="block mx-auto rounded-lg shadow-lg"></iframe>);
            case "vimeo": return (<iframe src={getVimeoEmbedUrl(src)} style={{ width: effectiveWidth, height: effectiveHeight }} frameBorder="0" allow="autoplay; fullscreen; picture-in-picture" allowFullScreen title="Vimeo Video" className="block mx-auto rounded-lg shadow-lg"></iframe>);
            case "mp4": default: return (<video src={src} style={{ width: effectiveWidth, height: effectiveHeight }} controls={controls} autoPlay={autoplay} loop={loop} muted={muted} playsInline className="block mx-auto bg-black rounded-lg shadow-lg"></video>);
        }
    };
    return (
        <div className={`p-1 ${!isPreviewMode ? `rounded-xl ${isSelected ? "" : "hover:ring-2 hover:ring-green-400/20"}` : ""}`} style={style}>
            {renderVideo()}
        </div>
    );
}
function InnerSectionComponentDisplay({ sectionData, onOpenStructureModal, onSelect, isSelected, onUpdateProps, onDelete, selectedItemId, isPreviewMode, isDraggable, style }) {
  const hasColumns = sectionData.columns && sectionData.columns.length > 0;
  const ownPath = sectionData.path;
  if (!hasColumns) {
    return (
      <div onClick={(e) => { if (!isPreviewMode && isDraggable) { e.stopPropagation(); onSelect(sectionData.id, "element", ownPath); } }} className={`p-4 min-h-[80px] flex flex-col items-center justify-center ${!isPreviewMode ? `rounded-xl border-2 border-dashed ${isSelected ? "border-green-500 bg-green-50/80" : "border-slate-300 bg-slate-100/80 hover:border-green-400 hover:bg-green-50/50"} cursor-pointer transition-all` : ""}`} style={style}>
          <LucideIcons.Rows3 className="h-8 w-8 text-slate-400 mb-2" />
          {!isPreviewMode && (
            <button onClick={(e) => { e.stopPropagation(); onOpenStructureModal(ownPath, "innerSection"); }} className="px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 transition-colors">Set Inner Structure</button>
          )}
      </div>
    );
  }
  return (
    <div onClick={(e) => { if (!isPreviewMode && isDraggable) { e.stopPropagation(); onSelect(sectionData.id, "element", ownPath); } }} className={`p-1 ${!isPreviewMode ? `border rounded-xl ${isSelected ? "border-green-500 bg-green-50/50" : "border-slate-200 hover:border-green-300/70"}` : ""}`} style={style}>
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
          <div className={`p-4 min-h-[150px] flex flex-col items-center justify-center text-center border-2 border-dashed rounded-xl ${isSelected ? "border-green-500 bg-green-500/10" : "border-slate-300 bg-slate-100/80"}`} style={style}>
              <LucideIcons.GalleryHorizontalEnd className="h-12 w-12 text-slate-400 mb-3" />
              <p className="text-sm font-medium text-slate-600">Card Slider</p>
              <p className="text-xs text-slate-500">Add slides in the Properties Panel.</p>
          </div>
      );
  }
  if (totalSlides === 0 && isPreviewMode) return null;
  return (
      <div className={`p-2 relative ${!isPreviewMode && isSelected ? "rounded-xl bg-green-500/5" : ""}`} style={style}>
          <div className="overflow-hidden relative">
              <div ref={sliderWrapperRef} className="flex transition-transform duration-500 ease-in-out" style={{ transform: `translateX(-${currentIndex * (100 / effectiveSlidesPerView)}%)`, transitionDuration: `${speed}ms` }}>
                  {slides.map((slide, index) => (
                      <div key={slide.id || index} className="flex-shrink-0 w-full" style={{ width: `${100 / effectiveSlidesPerView}%`, paddingLeft: `${spaceBetween / 2}px`, paddingRight: `${spaceBetween / 2}px` }}>
                          <div className="bg-white p-4 flex flex-col h-full shadow-lg" style={{ borderRadius: cardBorderRadius }}>
                              <h3 className={`text-lg font-semibold mb-1 ${!isPreviewMode ? "focus:outline-none focus:ring-1 focus:ring-green-400 p-0.5 -m-0.5 rounded-lg" : ""}`} contentEditable={!isPreviewMode && isEditable} suppressContentEditableWarning onBlur={(e) => handleCardTextUpdate( index, "heading", e.currentTarget.innerText )} dangerouslySetInnerHTML={{ __html: slide.heading || `Slide ${index + 1}` }} ></h3>
                              <p className={`text-sm text-slate-600 flex-grow ${!isPreviewMode ? "focus:outline-none focus:ring-1 focus:ring-green-400 p-0.5 -m-0.5 rounded-lg whitespace-pre-wrap" : "whitespace-pre-wrap"}`} contentEditable={!isPreviewMode && isEditable} suppressContentEditableWarning onBlur={(e) => handleCardTextUpdate( index, "text", e.currentTarget.innerText )} dangerouslySetInnerHTML={{ __html: slide.text || "Slide content goes here." }}></p>
                              {slide.link && isPreviewMode && (
                                  <a href={slide.link} onClick={(e) => { if (slide.link.startsWith("/")) { e.preventDefault(); if (onNavigate) onNavigate(slide.link.substring(1)); } else if (slide.link === "#") { e.preventDefault(); } }} target={ !slide.link.startsWith("/") && slide.link !== "#" ? "_blank" : "_self" } rel={ !slide.link.startsWith("/") && slide.link !== "#" ? "noopener noreferrer" : "" } className="mt-auto pt-2 text-green-600 hover:text-green-700 text-sm font-medium self-start flex items-center gap-1">Learn More<LucideIcons.ArrowRight className="w-4 h-4" /></a>
                              )}
                              {!isPreviewMode && slide.link && (<span className="mt-auto pt-2 text-green-600 text-sm font-medium self-start">Link: {slide.link}</span>)}
                          </div>
                      </div>
                  ))}
              </div>
          </div>
          {showNavigation && totalSlides > effectiveSlidesPerView && (<>
              <button onClick={handlePrev} disabled={!loop && currentIndex === 0} className="absolute top-1/2 left-0 transform -translate-y-1/2 -translate-x-3 bg-white/80 hover:bg-white text-slate-700 p-2 rounded-full shadow-md z-10 disabled:opacity-40 disabled:cursor-not-allowed transition-all" aria-label="Previous slide"><LucideIcons.ChevronLeft className="w-6 h-6" /></button>
              <button onClick={handleNext} disabled={ !loop && currentIndex >= totalSlides - effectiveSlidesPerView } className="absolute top-1/2 right-0 transform -translate-y-1/2 translate-x-3 bg-white/80 hover:bg-white text-slate-700 p-2 rounded-full shadow-md z-10 disabled:opacity-40 disabled:cursor-not-allowed transition-all" aria-label="Next slide"><LucideIcons.ChevronRight className="w-6 h-6" /></button>
          </>)}
          {showPagination && totalSlides > effectiveSlidesPerView && (
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-2 p-2">
                  {Array.from({ length: loop ? totalSlides : Math.max(1, totalSlides - effectiveSlidesPerView + 1), }).map((_, idx) => (
                      <button key={idx} onClick={() => goToSlide(idx)} className={`w-2.5 h-2.5 rounded-full ${currentIndex === idx ? "bg-green-600 scale-125" : "bg-slate-300 hover:bg-slate-400"} transition-all`} aria-label={`Go to slide ${idx + 1}`} />
                  ))}
              </div>
          )}
      </div>
  );
}
function NavbarElement({ logoType = "text", logoText = "MySite", logoSrc = img, links = [], rightContentType = "none", backgroundColor = "#ffffff", textColor = "#334155", linkColor = "#16a34a", isSelected, isPreviewMode, onUpdate, onNavigate, onSelect, onDelete, path, previewDevice, isDraggable, style }) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const navStyle = { backgroundColor, ...style };
    const textStyle = { color: textColor };
    const linkStyle = { color: linkColor };
    const forceMobileLayout = isPreviewMode && (previewDevice === "mobile" || previewDevice === "tablet");
    const handleLinkClick = (e, linkUrl) => {
        if (isMobileMenuOpen) setIsMobileMenuOpen(false);
        if (!isPreviewMode) { e.preventDefault(); return; }
        if (linkUrl && linkUrl.startsWith("/")) { e.preventDefault(); if (onNavigate) onNavigate(linkUrl.substring(1)); }
        else if (linkUrl === "#") { e.preventDefault(); }
    };
    const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
    const handleClick = (e) => { if (!isPreviewMode && onSelect && isDraggable) { e.stopPropagation(); onSelect(); } };
    return (
        <div onClick={handleClick} className={`p-1 relative group ${!isPreviewMode && isSelected ? "rounded-xl bg-green-500/5" : !isPreviewMode && path ? "hover:ring-2 hover:ring-green-400/20 rounded-xl" : ""}`}>
            <nav style={navStyle} className="relative px-4 sm:px-6 py-4 shadow-md rounded-xl">
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        {logoType === "image" && logoSrc ? (<img src={logoSrc} alt={logoText || "Logo"} className="h-9 sm:h-10 w-auto mr-4 rounded-sm object-contain" />) : (
                            <a href={isPreviewMode ? links.find((l) => l.text.toLowerCase() === "home")?.url || "/home" : "#"} onClick={(e) => handleLinkClick(e, links.find((l) => l.text.toLowerCase() === "home")?.url || "/home")} style={textStyle} className="text-xl lg:text-2xl font-bold hover:opacity-80 transition-opacity">{logoText}</a>
                        )}
                    </div>
                    <div className={`${forceMobileLayout ? "hidden" : "hidden md:flex"} items-center`}>
                        <div className="flex items-center space-x-5 lg:space-x-8">
                            {links.map((link, index) => (
                                <a key={link.id || index} href={link.url} onClick={(e) => handleLinkClick(e, link.url)} target={isPreviewMode && link.target === "_blank" && link.url && !link.url.startsWith("/") ? "_blank" : "_self"} rel={isPreviewMode && link.target === "_blank" && link.url && !link.url.startsWith("/") ? "noopener noreferrer" : ""} style={linkStyle} className="text-sm font-medium hover:opacity-80 transition-opacity">{link.text}</a>
                            ))}
                        </div>
                        {(rightContentType === "userIcon" || rightContentType === "searchIcon") && (
                            <div className="flex items-center ml-6">{rightContentType === "userIcon" && <LucideIcons.CircleUserRound style={linkStyle} className="h-6 w-6" />}{rightContentType === "searchIcon" && <LucideIcons.Search style={linkStyle} className="h-5 w-5" />}</div>
                        )}
                    </div>
                    <div className={`${forceMobileLayout ? "flex" : "md:hidden flex"} items-center`}>
                        {rightContentType === "userIcon" && <LucideIcons.CircleUserRound style={linkStyle} className="h-6 w-6 mr-3" />}
                        {rightContentType === "searchIcon" && <LucideIcons.Search style={linkStyle} className="h-5 w-5 mr-3" />}
                        <button onClick={toggleMobileMenu} style={linkStyle} aria-label="Toggle menu" className="p-1">
                            {isMobileMenuOpen ? (<LucideIcons.X className="h-7 w-7" />) : (<LucideIcons.Menu className="h-7 w-7" />)}
                        </button>
                    </div>
                </div>
                {isMobileMenuOpen && (
                    <div className="absolute top-full left-0 right-0 z-50 mt-1 rounded-b-xl transition transform origin-top animate-fadeInDown" style={navStyle}>
                        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                            {links.map((link, index) => (
                                <a key={link.id || index} href={link.url} onClick={(e) => handleLinkClick(e, link.url)} target={isPreviewMode && link.target === "_blank" && link.url && !link.url.startsWith("/") ? "_blank" : "_self"} rel={isPreviewMode && link.target === "_blank" && link.url && !link.url.startsWith("/") ? "noopener noreferrer" : ""} style={linkStyle} className="block px-3 py-3 rounded-lg text-base font-medium hover:bg-white/10 hover:opacity-80 transition-colors">{link.text}</a>
                            ))}
                        </div>
                    </div>
                )}
            </nav>
            {!isPreviewMode && isSelected && onDelete && (
                <button onClick={(e) => { e.stopPropagation(); onDelete(); }} title="Remove Global Navbar" className="absolute -top-3 -right-3 p-1.5 bg-red-600 text-white rounded-full hover:bg-red-700 hover:scale-110 transition-all w-7 h-7 flex items-center justify-center shadow-md z-30 print-hidden">
                    <LucideIcons.X className="w-4 h-4" strokeWidth={3} />
                </button>
            )}
        </div>
    );
}
function FooterElement({ copyrightText = `© ${new Date().getFullYear()} MySite. All rights reserved.`, links = [], backgroundColor = "#f1f5f9", textColor = "#64748b", linkColor = "#16a34a", isSelected, isPreviewMode, onUpdate, onNavigate, onSelect, onDelete, path, isDraggable, style }) {
    const footerStyle = { backgroundColor, ...style };
    const textStyle = { color: textColor };
    const linkStyle = { color: linkColor };
    const handleLinkClick = (e, linkUrl) => {
        if (!isPreviewMode) { e.preventDefault(); return; }
        if (linkUrl && linkUrl.startsWith("/")) { e.preventDefault(); if (onNavigate) onNavigate(linkUrl.substring(1)); }
        else if (linkUrl === "#") { e.preventDefault(); }
    };
    const handleClick = (e) => { if (!isPreviewMode && onSelect && isDraggable) { e.stopPropagation(); onSelect(); } };
    return (
        <div onClick={handleClick} className={`p-1 relative group ${!isPreviewMode && isSelected ? "rounded-xl bg-green-500/5" : !isPreviewMode && path ? "hover:ring-2 hover:ring-green-400/20 rounded-xl" : ""}`}>
            <footer style={footerStyle} className="px-6 py-10 text-center border-t border-slate-200/80 rounded-xl">
                <div className="max-w-5xl mx-auto">
                    <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-8 mb-6">
                        {links.map((link, index) => (
                            <a key={link.id || index} href={link.url} onClick={(e) => handleLinkClick(e, link.url)} target={isPreviewMode && link.target === "_blank" && link.url && !link.url.startsWith("/") ? "_blank" : "_self"} rel={isPreviewMode && link.target === "_blank" && link.url && !link.url.startsWith("/") ? "noopener noreferrer" : ""} style={linkStyle} className="text-sm sm:text-base hover:underline">{link.text}</a>
                        ))}
                    </div>
                    <p style={textStyle} className="text-sm sm:text-base">{copyrightText}</p>
                </div>
            </footer>
            {!isPreviewMode && isSelected && onDelete && (
                <button onClick={(e) => { e.stopPropagation(); onDelete(); }} title="Remove Global Footer" className="absolute -top-3 -right-3 p-1.5 bg-red-600 text-white rounded-full hover:bg-red-700 hover:scale-110 transition-all w-7 h-7 flex items-center justify-center shadow-md z-30 print-hidden">
                    <LucideIcons.X className="w-4 h-4" strokeWidth={3} />
                </button>
            )}
        </div>
    );
}
// --- UI & DATA MANAGERS (UNCHANGED) ---
function LinkManager({ links, onUpdateLinks, elementId, pages, linkTypeLabel = "Link" }) {
  const [localLinks, setLocalLinks] = useState(links || []);
  useEffect(() => { setLocalLinks(links || []); }, [links]);
  const handleLinkChange = (index, field, value) => {
      const newLinks = [...localLinks]; newLinks[index] = { ...newLinks[index], [field]: value };
      if (field === "url" && value.startsWith("/")) { newLinks[index].isInternal = true; }
      else if (field === "url") { newLinks[index].isInternal = false; }
      setLocalLinks(newLinks); onUpdateLinks(newLinks);
  };
  const addLink = () => {
      const newLink = { id: generateId("link"), text: `New ${linkTypeLabel}`, url: "#", target: "_self", isInternal: false };
      const newLinks = [...localLinks, newLink]; setLocalLinks(newLinks); onUpdateLinks(newLinks);
  };
  const removeLink = (index) => {
      const newLinks = localLinks.filter((_, i) => i !== index); setLocalLinks(newLinks); onUpdateLinks(newLinks);
  };
  const pageOptions = [ { label: "External URL", value: "external" }, ...Object.values(pages).map((p) => ({ label: `${p.name} (/${p.id})`, value: `internal:${p.id}` })) ];
  return (
    <div className="space-y-3">
        {localLinks.map((link, index) => (
            <div key={link.id || index} className="p-3 border border-slate-200 rounded-xl space-y-2.5 bg-slate-50/70">
                <input type="text" placeholder={`${linkTypeLabel} Text`} value={link.text} onChange={(e) => handleLinkChange(index, "text", e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-green-500 focus:border-green-500" />
                <input type="text" placeholder="URL (e.g. /page-slug or https://...)" value={link.url} onChange={(e) => handleLinkChange(index, "url", e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-green-500 focus:border-green-500 mb-1" />
                <CustomDropdown options={pageOptions} value={ link.url && link.url.startsWith("/") ? `internal:${link.url.substring(1)}` : "external" } onChange={(val) => { if (val.startsWith("internal:")) { handleLinkChange(index, "url", `/${val.split(":")[1]}`); } else { handleLinkChange( index, "url", link.url && link.url.startsWith("/") ? "#" : link.url ); } }} idSuffix={`link-${index}`} />
                <div className="flex items-center justify-between pt-1.5">
                    <div className="flex items-center space-x-2">
                        <input type="checkbox" id={`${elementId}-link-${index}-target`} checked={link.target === "_blank"} onChange={(e) => handleLinkChange( index, "target", e.target.checked ? "_blank" : "_self" )} className="h-4 w-4 rounded border-slate-300 text-green-600 focus:ring-green-500" />
                        <label htmlFor={`${elementId}-link-${index}-target`} className="text-xs text-slate-600">Open in new tab</label>
                    </div>
                    <button onClick={() => removeLink(index)} className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100"><LucideIcons.Trash2 className="w-4 h-4" /></button>
                </div>
            </div>
        ))}
        <button onClick={addLink} className="w-full mt-2 px-3 py-2 bg-green-100 text-green-800 text-sm font-medium rounded-lg hover:bg-green-200 transition-colors flex items-center justify-center space-x-2">
            <LucideIcons.PlusCircle className="w-4 h-4" />
            <span>Add {linkTypeLabel}</span>
        </button>
    </div>
  );
}
function SlideManager({ slides, onUpdateSlides, elementId }) {
    const [localSlides, setLocalSlides] = useState(slides || []);
    const slideImgInputRefs = useRef([]);
    useEffect(() => { setLocalSlides(slides || []); slideImgInputRefs.current = (slides || []).map( (_, i) => slideImgInputRefs.current[i] || React.createRef() ); }, [slides]);
    const handleSlideChange = (index, field, value) => { const newSlides = [...localSlides]; newSlides[index] = { ...newSlides[index], [field]: value }; setLocalSlides(newSlides); onUpdateSlides(newSlides); };
    const handleImageFileChange = (e, index) => {
        const file = e.target.files[0]; if (file) { const reader = new FileReader(); reader.onloadend = () => { handleSlideChange(index, "imgSrc", reader.result); }; reader.readAsDataURL(file); } e.target.value = null;
    };
    const addSlide = () => {
        const newSlide = { id: generateId("slide"), imgSrc: img, heading: "New Slide", text: "New slide content.", link: "#" };
        const newSlides = [...localSlides, newSlide]; slideImgInputRefs.current.push(React.createRef()); setLocalSlides(newSlides); onUpdateSlides(newSlides);
    };
    const removeSlide = (index) => { const newSlides = localSlides.filter((_, i) => i !== index); slideImgInputRefs.current.splice(index, 1); setLocalSlides(newSlides); onUpdateSlides(newSlides); };
    return (
      <div className="space-y-3">
          {localSlides.map((slide, index) => (
              <div key={slide.id || index} className="p-3 border border-slate-200 rounded-xl space-y-2.5 bg-slate-50/70">
                  <div className="flex justify-between items-center mb-1"><p className="text-sm font-medium text-slate-700">Slide {index + 1}</p><button onClick={() => removeSlide(index)} className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100"><LucideIcons.Trash2 className="w-4 h-4" /></button></div>
                  {slide.imgSrc && (<img src={slide.imgSrc} alt={`Preview ${index}`} className="w-full h-24 object-contain rounded-lg border border-slate-200 bg-white p-1 mb-2" />)}
                  <button onClick={() => slideImgInputRefs.current[index]?.current?.click()} className="w-full px-3 py-2 bg-slate-200 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-300 transition-colors">Change Image</button>
                  <input type="file" accept="image/*" ref={slideImgInputRefs.current[index]} className="hidden" onChange={(e) => handleImageFileChange(e, index)} />
                  <input type="text" placeholder="Image URL" value={slide.imgSrc} onChange={(e) => handleSlideChange(index, "imgSrc", e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-green-500 focus:border-green-500" />
                  <input type="text" placeholder="Heading" value={slide.heading} onChange={(e) => handleSlideChange(index, "heading", e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-green-500 focus:border-green-500" />
                  <textarea placeholder="Text" value={slide.text} onChange={(e) => handleSlideChange(index, "text", e.target.value)} rows="3" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-green-500 focus:border-green-500 whitespace-pre-wrap"></textarea>
                  <input type="text" placeholder="Link URL (optional)" value={slide.link || ""} onChange={(e) => handleSlideChange(index, "link", e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-green-500 focus:border-green-500" />
              </div>
          ))}
          <button onClick={addSlide} className="w-full mt-2 px-3 py-2 bg-green-100 text-green-800 text-sm font-medium rounded-lg hover:bg-green-200 transition-colors flex items-center justify-center space-x-2"><LucideIcons.PlusCircle className="w-4 h-4" /> <span>Add Slide</span></button>
      </div>
    );
}
// --- CORE BUILDER COMPONENTS (UNCHANGED) ---
const ALL_ELEMENT_TYPES = { Heading, TextBlock, ImageElement, ButtonElement, Divider, Spacer, IconElement, GoogleMapsPlaceholder, VideoElement, InnerSectionComponentDisplay, NavbarElement, FooterElement, CardSliderElement, AccordionElement };
const getDefaultProps = (id) => ({ ...(AVAILABLE_ELEMENTS_CONFIG.find(c => c.id === id)?.defaultProps || {}), style: {} })
const AVAILABLE_ELEMENTS_CONFIG = [
    { id: "header", name: "Heading", component: "Heading", category: 'Basic', defaultProps: { text: "Powerful Headline Here", sizeClass: "text-4xl", fontWeight: "font-bold", textColor: "#1e293b", textAlign: "text-left" } },
    { id: "textBlock", name: "Paragraph", component: "TextBlock", category: 'Basic', defaultProps: { text: "This is an engaging paragraph. You can edit this text to share more about your brand, services, or products.", sizeClass: "text-base", textColor: "#475569", textAlign: "text-left" } },
    { id: "button", name: "Button", component: "ButtonElement", category: 'Basic', defaultProps: { buttonText: "Get Started", link: "#", backgroundColor: "#16a34a", textColor: "#ffffff", borderRadius: "9999px", textAlign: 'text-center' } },
    { id: "icon", name: "Icon", component: "IconElement", category: 'Basic', defaultProps: { iconName: "Rocket", size: "48px", color: "#16a34a" } },
    { id: "image", name: "Image", component: "ImageElement", category: 'Media', defaultProps: { src: img, alt: "Placeholder Image", borderRadius: "12px", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" } },
    { id: "video", name: "Video", component: "VideoElement", category: 'Media', defaultProps: { videoType: "mp4", src: "" } },
    { id: "divider", name: "Divider", component: "Divider", category: 'Layout', defaultProps: {} },
    { id: "spacer", name: "Spacer", component: "Spacer", category: 'Layout', defaultProps: { height: "40px" } },
    { id: "innerSection", name: "Inner Section", component: "InnerSectionComponentDisplay", category: 'Layout', isContainer: true, hasOwnColumns: true, defaultProps: {} },
    { id: "accordion", name: "Accordion", component: "AccordionElement", category: 'Advanced', defaultProps: { title: "Accordion Title", content: "Details of the accordion." } },
    { id: "cardSlider", name: "Card Slider", component: "CardSliderElement", category: 'Advanced', defaultProps: { slides: [{ id: generateId(), imgSrc: img, heading: "Feature One", text: "Description for feature one.", link: "#" }], slidesPerView: 3, spaceBetween: 16 } },
    { id: "navbar", name: "Navbar", component: "NavbarElement", category: 'Global', isGlobalOnly: true, defaultProps: { logoType: "text", logoText: "SiteName", links: [{ id: generateId(), text: "Home", url: "#" }, { id: generateId(), text: "About", url: "#" }], backgroundColor: "#FFFFFF", linkColor: "#16a34a" } },
    { id: "footer", name: "Footer", component: "FooterElement", category: 'Global', isGlobalOnly: true, defaultProps: { copyrightText: `© ${new Date().getFullYear()} Your Company.`, links: [{ id: generateId(), text: "Privacy", url: "#" }], backgroundColor: "#0f172a", textColor: "#94a3b8", linkColor: "#ffffff" } },
];
const elementIcons = { header: <LucideIcons.Heading1 />, textBlock: <LucideIcons.Baseline />, image: <LucideIcons.Image />, button: <LucideIcons.MousePointerClick />, divider: <LucideIcons.Minus />, spacer: <LucideIcons.StretchVertical />, icon: <LucideIcons.Star />, video: <LucideIcons.Youtube />, innerSection: <LucideIcons.LayoutPanelLeft />, accordion: <LucideIcons.ChevronsUpDown />, cardSlider: <LucideIcons.GalleryHorizontalEnd />, navbar: <LucideIcons.Navigation />, footer: <LucideIcons.PanelBottom />, default: <LucideIcons.Puzzle />, section: <LucideIcons.LayoutPanelTop />, column: <LucideIcons.View /> };
function DraggableCanvasElement({ elementData, onUpdateProps, onDelete, onSelect, isSelected, onOpenStructureModal, parentColumnId, isPreviewMode, onNavigate, isDraggable, }) {
  const config = AVAILABLE_ELEMENTS_CONFIG.find((c) => c.id === elementData.type);
  if (!config) return null;
  const ComponentToRender = ALL_ELEMENT_TYPES[config.component];
  if (!ComponentToRender) return null;
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: elementData.id,
    data: { type: "canvasElement", elementId: elementData.id, parentColumnId, elementType: elementData.type, elementData, path: elementData.path },
    disabled: isPreviewMode || !isDraggable,
  });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging && !isPreviewMode ? 0.5 : 1, zIndex: isDragging && !isPreviewMode ? 100 : "auto" };
  const handleUpdate = (newProps) => { if (!isPreviewMode) onUpdateProps(elementData.path, newProps); };
  const handleClick = (e) => { e.stopPropagation(); if (!isPreviewMode && isDraggable) onSelect(elementData.id, "element", elementData.path, elementData); };
  return (
    <div ref={setNodeRef} style={style} onClick={handleClick} className={`relative group my-2 transition-all duration-150 ease-in-out ${!isPreviewMode && isDragging ? "bg-green-50/80 shadow-2xl ring-2 ring-green-400 scale-[1.01] rounded-lg" : ""}`}>
        {isDraggable && !isPreviewMode && (
          <div {...attributes} {...listeners} title="Drag element" className="absolute top-1/2 -left-3.5 transform -translate-y-1/2 p-2 cursor-grab bg-white hover:bg-green-600 text-slate-500 hover:text-white rounded-full border border-slate-300 hover:border-green-500 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 focus:opacity-100 z-20 print-hidden transition-all shadow-md">
            <LucideIcons.GripVertical className="w-5 h-5" />
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
            />
        </div>
        {!isPreviewMode && isSelected && isDraggable && (
          <button onClick={(e) => { e.stopPropagation(); onDelete(elementData.path); }} title="Delete element" className="absolute -top-3.5 -right-3.5 p-1.5 bg-red-600 text-white rounded-full hover:bg-red-700 hover:scale-110 transition-all w-7 h-7 flex items-center justify-center shadow-md z-20 print-hidden">
              <LucideIcons.X className="w-4 h-4" strokeWidth={3} />
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
  const columnStyle = { ...columnData.props?.style, flexBasis: columnData.props.width || "100%" };
  return (
    <div onClick={handleClick} style={columnStyle} className={`p-2 flex-shrink-0 transition-all ${!isPreviewMode && isDraggable ? 'cursor-pointer' : ''} ${!isPreviewMode && isSelected ? "selected-outline" : !isPreviewMode ? "hover:outline hover:outline-1 hover:outline-offset-1 hover:outline-green-300/70 rounded-2xl" : ""}`}>
        <SortableContext items={elementIds} strategy={verticalListSortingStrategy} disabled={isPreviewMode || !isDraggable}>
            <div ref={setDroppableRef} className={`min-h-[100px] p-2 rounded-xl transition-all ${!isPreviewMode ? `border ${isOver && isDraggable ? "bg-green-100/90 border-green-400 border-solid ring-2 ring-green-400" : "bg-white/30 border-slate-200/90"} ${columnData.elements.length === 0 && !isOver ? "border-dashed flex items-center justify-center text-slate-400/80 text-sm font-medium" : ""}` : ""}`}>
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
  const sectionPath = `pages[${pageId}].layout[${sectionIndex}]`;
  const isSelected = selectedItemId === sectionData.id;
  const handleClick = (e) => { e.stopPropagation(); if (!isPreviewMode && isDraggable) { onSelect(sectionData.id, "section", sectionPath, sectionData); } };
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
      id: sectionData.id,
      data: { type: "section", sectionId: sectionData.id, path: sectionPath, sectionData, pageId },
      disabled: isPreviewMode || !isDraggable
  });
  const sortableStyle = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging && !isPreviewMode ? 0.75 : 1, zIndex: isDragging && !isPreviewMode ? 200 : "auto" };
  const sectionProps = sectionData.props || {};
  const effectiveBgStyle = { ...sortableStyle, ...sectionProps.style };
  if (sectionProps.backgroundType === "color" && sectionProps.backgroundColor) { effectiveBgStyle.backgroundColor = sectionProps.backgroundColor; }
  const getSectionBaseBgClass = () => {
      if (isPreviewMode) return sectionProps.backgroundType === "image" || sectionProps.backgroundType === "video" ? "" : "bg-transparent";
      const editModeBase = "";
      if (isDragging) return `bg-green-50/80 shadow-2xl ring-2 ring-green-400 rounded-2xl`;
      return `${sectionProps.backgroundType !== "image" && sectionProps.backgroundType !== "video" ? "bg-white" : ""} ${editModeBase}`;
  };
  const sectionRootClasses = ["relative", "group", "transition-all", "duration-200", "ease-in-out", getSectionBaseBgClass(), !isPreviewMode && isSelected ? "selected-outline" : "", !isPreviewMode && !isSelected ? "hover:ring-2 hover:ring-green-300/80 cursor-pointer" : ""].join(" ").replace(/\s+/g, " ").trim();
  const sectionPaddingStyle = { paddingTop: sectionProps.paddingTop, paddingBottom: sectionProps.paddingBottom, paddingLeft: sectionProps.paddingLeft, paddingRight: sectionProps.paddingRight };
  return (
      <div ref={setNodeRef} style={effectiveBgStyle} className={sectionRootClasses} onClick={handleClick}>
          {!isPreviewMode && isDraggable && (
              <div {...attributes} {...listeners} title="Drag section" className="absolute top-4 -left-4 transform p-2.5 cursor-grab bg-white hover:bg-green-600 text-slate-500 hover:text-white rounded-full border border-slate-300 hover:border-green-500 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 focus:opacity-100 z-30 print-hidden transition-opacity shadow-md">
                  <LucideIcons.Move className="w-5 h-5" />
              </div>
          )}
          {sectionProps.backgroundType === "image" && sectionProps.backgroundImageSrc && (<div className="absolute inset-0 bg-cover bg-center -z-20 rounded-2xl" style={{ backgroundImage: `url("${sectionProps.backgroundImageSrc}")` }}></div>)}
          {sectionProps.backgroundType === "video" && sectionProps.backgroundVideoSrc && (<video className="absolute inset-0 w-full h-full object-cover -z-20 rounded-2xl" src={sectionProps.backgroundVideoSrc} autoPlay={sectionProps.backgroundVideoAutoplay !== false} loop={sectionProps.backgroundVideoLoop !== false} muted={sectionProps.backgroundVideoMuted !== false} playsInline key={sectionProps.backgroundVideoSrc + (sectionProps.backgroundVideoAutoplay ? "1" : "0")}></video>)}
          {(sectionProps.backgroundType === "image" || sectionProps.backgroundType === "video") && sectionProps.backgroundOverlayColor && typeof sectionProps.backgroundOverlayOpacity === "number" && sectionProps.backgroundOverlayOpacity > 0 && (
              <div className="absolute inset-0 -z-10 rounded-2xl" style={{ backgroundColor: sectionProps.backgroundOverlayColor, opacity: sectionProps.backgroundOverlayOpacity }}></div>
          )}
          {!isPreviewMode && isSelected && isDraggable && (
              <button onClick={(e) => { e.stopPropagation(); onDelete(sectionPath); }} title="Delete section" className="absolute -top-3.5 -right-3.5 p-1.5 bg-red-600 text-white rounded-full hover:bg-red-700 hover:scale-110 transition-all w-7 h-7 flex items-center justify-center shadow-md z-30 print-hidden">
                  <LucideIcons.Trash2 className="w-4 h-4" strokeWidth={2.5} />
              </button>
          )}
          <div style={sectionPaddingStyle} className="flex flex-wrap -m-1.5 relative z-0">
              {sectionData.columns.map((col, colIdx) => (
                  <ColumnComponent key={col.id} parentPath={sectionPath} columnData={col} columnIndex={colIdx} onUpdateProps={onUpdateProps} onDelete={onDelete} onSelect={onSelect} selectedItemId={selectedItemId} onOpenStructureModal={onOpenStructureModal} isPreviewMode={isPreviewMode} onNavigate={onNavigate} isDraggable={isDraggable} />
              ))}
          </div>
      </div>
  );
}
// --- HIGH-LEVEL BUILDER COMPONENTS (Panels, Toolbars, etc. UNCHANGED) ---
const DEVICE_FRAMES_CONFIG = [ { name: "Mobile", width: 390, icon: LucideIcons.Smartphone }, { name: "Tablet", width: 768, icon: LucideIcons.Tablet }, { name: "Desktop", width: 1440, icon: LucideIcons.Monitor }, ];

function DeviceFrame({ device, page, globalNavbar, globalFooter, onUpdateProps, onDelete, onSelect, selectedItemId, onOpenStructureModal, isPreviewMode, onNavigate, onDeleteGlobalElement, isDraggable, comments, onAddComment, activeTool, }) {
    const { setNodeRef: setPageDroppableRef, isOver } = useDroppable({ id: `page-droppable-${page.id}-${device.name}`, data: { type: "page", accepts: ["paletteItem", "section"], pageId: page.id }, disabled: isPreviewMode || !isDraggable, });
    const sectionIds = useMemo(() => page.layout.map((sec) => sec.id), [page.layout]);
    const handleCommentOverlayClick = (e) => { e.stopPropagation(); onAddComment(page.id, device.name, { x: e.clientX, y: e.clientY }); };
    
    // **NEW**: Added container-type property to enable container queries for responsiveness.
    const containerStyle = {
      width: device.width,
      containerType: 'inline-size',
    };

    return (
        <div className="flex flex-col gap-4 items-center flex-shrink-0">
            <h3 className="text-white/90 font-semibold px-4 py-1.5 bg-black/20 rounded-lg flex items-center gap-2 text-sm"> <device.icon className="w-4 h-4" /> {device.name} </h3>
            <div className="relative">
                <div style={containerStyle} className="bg-white shadow-2xl rounded-2xl border border-slate-200 flex flex-col">
                    <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300">
                        {globalNavbar && (
                            <header className="p-2 border-b border-slate-200 shadow-sm z-10 flex-shrink-0 relative">
                                <NavbarElement {...globalNavbar.props} path="globalNavbar" isSelected={selectedItemId === globalNavbar.id} onSelect={() => onSelect(globalNavbar.id, 'globalElement', 'globalNavbar')} onUpdate={(p) => onUpdateProps("globalNavbar", p)} onDelete={() => onDeleteGlobalElement("navbar")} isDraggable={isDraggable} previewDevice={device.name.toLowerCase()} />
                            </header>
                        )}
                        <div className="p-4 bg-slate-50/50 min-h-full">
                        <SortableContext items={sectionIds} strategy={verticalListSortingStrategy} disabled={isPreviewMode || !isDraggable}>
                            <div ref={setPageDroppableRef} className={`rounded-xl transition-all ${isOver && isDraggable ? "bg-green-100/80 ring-2 ring-green-400 ring-dashed" : ""} ${page.layout.length === 0 && !isOver ? "border-2 border-dashed border-slate-300/80 min-h-[50vh]" : "border-transparent"}`}>
                                {page.layout.map((sec, idx) => ( <SectionComponent key={sec.id} pageId={page.id} sectionData={sec} sectionIndex={idx} onUpdateProps={onUpdateProps} onDelete={onDelete} onSelect={onSelect} selectedItemId={selectedItemId} onOpenStructureModal={onOpenStructureModal} isPreviewMode={isPreviewMode} onNavigate={onNavigate} isDraggable={isDraggable}/> ))}
                                {!isPreviewMode && page.layout.length === 0 && !isOver && isDraggable && (
                                    <div className="flex flex-col items-center justify-center h-full text-center py-24 select-none pointer-events-none">
                                        <LucideIcons.LayoutTemplate className="h-24 w-24 text-slate-300/90 mb-5" strokeWidth={1} />
                                        <p className="text-slate-500 text-xl font-medium mt-2">Your canvas is empty</p>
                                        <p className="text-slate-400/90 text-base">Drag elements or add a new section.</p>
                                    </div>
                                )}
                            </div>
                        </SortableContext>
                        </div>
                        {globalFooter && (
                            <footer className="p-2 border-t border-slate-200 shadow-sm z-10 flex-shrink-0 relative bg-white">
                                <FooterElement {...globalFooter.props} path="globalFooter" isSelected={selectedItemId === globalFooter.id} onSelect={() => onSelect(globalFooter.id, 'globalElement', 'globalFooter')} onUpdate={(p) => onUpdateProps("globalFooter", p)} onDelete={() => onDeleteGlobalElement("footer")} isDraggable={isDraggable} />
                            </footer>
                        )}
                    </div>
                </div>
                {activeTool === 'comment' && ( <div className="absolute inset-0 z-30 cursor-crosshair" onClick={handleCommentOverlayClick} /> )}
                {comments.map((comment, index) => (
                    <div key={comment.id} style={{ top: `${comment.position.y}px`, left: `${comment.position.x}px`}} className="absolute w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-black font-bold text-sm border-2 border-white cursor-pointer z-50 transform -translate-x-1/2 -translate-y-1/2 shadow-lg" title={comment.text}> {index + 1} </div>
                ))}
            </div>
        </div>
    );
}
function StructureSelectorModal({ isOpen, onClose, onSelectStructure, context }) {
    if (!isOpen) return null;
    return (
        <GeneralModal isOpen={isOpen} onClose={onClose} title="Select a Structure" size="xl">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-5 pt-2">
                {PREDEFINED_STRUCTURES.map((s) => (
                    <button key={s.id} onClick={() => { onSelectStructure(s.layout, context); onClose(); }} className="p-3 bg-slate-50 rounded-xl hover:bg-white hover:ring-2 hover:ring-green-500 hover:shadow-lg hover:scale-[1.03] transition-all duration-200 flex flex-col items-center justify-start group focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500">
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
}
function ElementPaletteItem({ config }) {
    const { attributes, listeners, setNodeRef, isDragging, transform } = useDraggable({ id: `palette-${config.id}`, data: { type: "paletteItem", config } });
    const style = transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`, zIndex: 9999, opacity: isDragging ? 0.95 : 1 } : {};
    let IconToShow = React.cloneElement(elementIcons[config.id] || elementIcons.default, { className: "w-6 h-6" });

    if (isDragging) {
        return (
            <div ref={setNodeRef} style={style} className="flex items-center gap-3 p-3 text-left bg-green-100 rounded-lg shadow-xl ring-2 ring-green-400 opacity-95">
                <div className="flex items-center justify-center text-green-600">{IconToShow}</div>
                <span className="text-sm font-semibold text-green-800">{config.name}</span>
            </div>
        );
    }
    
    return (
        <div ref={setNodeRef} {...listeners} {...attributes} style={style} className="flex items-center gap-3 p-3 text-left bg-white border border-slate-200 rounded-lg cursor-grab hover:bg-green-50 hover:border-green-300 hover:shadow-md transition-all group focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-green-500">
            <div className="text-slate-500 group-hover:text-green-600 transition-colors">{IconToShow}</div>
            <span className="text-sm font-medium text-slate-700 group-hover:text-green-800">{config.name}</span>
        </div>
    );
}
function PaletteItemDragOverlay({ config }) {
    let IconToShow = React.cloneElement(elementIcons[config.id] || elementIcons.default, { className: "w-6 h-6" });
    return (
        <div className="flex items-center p-3 text-left bg-green-100 rounded-lg shadow-2xl ring-2 ring-green-500 opacity-95 cursor-grabbing">
            <div className="w-8 h-8 flex items-center justify-center text-green-600 mr-2">{IconToShow}</div>
            <span className="text-sm font-semibold text-green-800">{config.name}</span>
        </div>
    );
}
function AiLoader() {
    return (
        <div className="flex space-x-2 justify-center items-center">
            <span className="sr-only">Loading...</span>
            <div className="h-2 w-2 bg-green-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="h-2 w-2 bg-green-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="h-2 w-2 bg-green-500 rounded-full animate-bounce"></div>
        </div>
    );
}
function AiModeView({ onBack, onAiSubmit, isAiLoading, aiChatHistory, aiSuggestions, handleUndo, handleRedo }) {
    const handleKeyDown = (e) => {
        if(e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            onAiSubmit(e.target.value);
            e.target.value = '';
        }
    };
    return (
        <div className="p-4 flex flex-col h-full bg-white">
            <div className="flex items-center justify-between mb-4">
                <button onClick={onBack} className="flex items-center gap-2 text-sm text-slate-600 hover:text-green-700 p-1 rounded-md -ml-1">
                    <LucideIcons.ArrowLeft className="w-4 h-4" /> Back to Elements
                </button>
                <div className="flex items-center gap-2">
                    <button onClick={handleUndo} title="Undo" className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors">
                        <LucideIcons.Undo2 className="w-5 h-5"/>
                    </button>
                     <button onClick={handleRedo} title="Redo" className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors">
                        <LucideIcons.Redo2 className="w-5 h-5"/>
                    </button>
                </div>
            </div>
            <div className="relative">
                <textarea onKeyDown={handleKeyDown} placeholder="e.g., create a sleek corporate landing page..." className="w-full p-3 pr-10 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-green-400 focus:border-green-400" rows="3" />
                <LucideIcons.CornerDownLeft className="absolute right-3 top-3 w-5 h-5 text-slate-400" />
            </div>
            {aiSuggestions && aiSuggestions.length > 0 && (
                 <div className="pt-3">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Suggestions</p>
                    <div className="flex flex-wrap gap-2">
                        {aiSuggestions.map((s, i) => (
                             <button key={i} onClick={() => onAiSubmit(s.prompt)} className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full hover:bg-green-200 transition-colors">
                                {s.shortText}
                            </button>
                        ))}
                    </div>
                </div>
            )}
            {isAiLoading && <div className="py-4"><AiLoader /></div>}
            <div className="mt-4 flex-1 overflow-y-auto space-y-3">
                {aiChatHistory.map(entry => (
                    <div key={entry.id} className="text-sm p-2 rounded-lg bg-slate-50">
                        <p className="font-semibold text-slate-700">{entry.prompt}</p>
                        {entry.status === 'success' && <p className="text-xs text-green-600 flex items-center gap-1"><LucideIcons.Check className="w-3 h-3"/>✓ Success</p>}
                        {entry.status === 'error' && <p className="text-xs text-red-600">✗ Error</p>}
                    </div>
                ))}
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
            <div onClick={handleSelect} className={`flex items-center p-1.5 my-0.5 rounded-lg cursor-pointer transition-colors ${isSelected ? 'bg-green-100 text-green-800' : 'hover:bg-slate-100'}`}>
                <div style={{ paddingLeft: `${depth * 18}px` }} className="flex items-center flex-grow truncate">
                    {hasChildren ? (
                        <button onClick={handleToggle} className="p-0.5 mr-1 rounded-sm hover:bg-slate-200">
                            <LucideIcons.ChevronRight className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
                        </button>
                    ) : (
                        <span className="w-5 h-5 mr-1"></span>
                    )}
                    <div className="w-4 h-4 mr-2.5 text-slate-500">{React.cloneElement(Icon, { className: 'w-full h-full' })}</div>
                    <span className="text-sm truncate">{node.name || config?.name || node.type}</span>
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
        <div className="p-2 space-y-0.5">
            {page.layout.map((section, idx) => (
                <LayerNode key={section.id} node={section} type="section" path={`${pagePath}.layout[${idx}]`} depth={0} onSelect={onSelect} selectedItemId={selectedItemId} />
            ))}
        </div>
    );
}
const ElementAccordion = ({ title, children, defaultOpen = true }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    return (
        <div className="border-b border-slate-200/80 last:border-b-0 pb-4">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center py-2 rounded-lg hover:bg-slate-100/50 transition-colors -mx-2 px-2">
                <h3 className="text-sm font-semibold uppercase text-slate-600 tracking-wider">{title}</h3>
                <LucideIcons.ChevronDown className={`w-5 h-5 text-slate-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}/>
            </button>
            <div className={`grid overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100 pt-3' : 'grid-rows-[0fr] opacity-0'}`}>
                <div className="overflow-hidden">
                    {children}
                </div>
            </div>
        </div>
    );
};
function LeftPanel({ isOpen, onClose, onAddTopLevelSection, pages, activePageId, onAddPage, onSelectPage, onRenamePage, onDeletePage, onAiSubmit, isAiLoading, aiChatHistory, onSwitchToAiMode, onSelect, selectedItem, aiSuggestions, handleUndo, handleRedo }) {
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
    <button onClick={() => setActiveTab(tabName)} className={`w-full flex-1 flex flex-col items-center justify-center gap-1.5 py-3 text-sm font-medium transition-colors border-b-2 ${activeTab === tabName ? 'border-green-500 text-green-600 bg-green-50' : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100'}`}>
        {icon}
        <span>{label}</span>
    </button>
  );

  return (
    <aside className={`absolute top-0 left-0 h-full w-80 bg-white border-r border-slate-200 shadow-xl flex-shrink-0 flex flex-col print-hidden transition-transform duration-300 ease-in-out z-40 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex justify-between items-center p-4 border-b border-slate-200 h-[60px]">
            <h2 className="text-lg font-bold text-slate-800">Add Content</h2>
            <button onClick={onClose} className="p-2 rounded-full text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors">
                <LucideIcons.PanelLeftClose className="w-5 h-5"/>
            </button>
        </div>
        <div className="flex border-b border-slate-200">
            <TabButton tabName="insert" icon={<LucideIcons.PlusSquare className="w-5 h-5" />} label="Insert" />
            <TabButton tabName="layers" icon={<LucideIcons.Layers3 className="w-5 h-5" />} label="Layers" />
            <TabButton tabName="pages" icon={<LucideIcons.FileText className="w-5 h-5" />} label="Pages" />
        </div>
        <div className="flex-1 overflow-y-auto bg-slate-50">
            {activeTab === 'insert' && isAiMode && <AiModeView onBack={() => setIsAiMode(false)} onAiSubmit={onAiSubmit} isAiLoading={isAiLoading} aiChatHistory={aiChatHistory} aiSuggestions={aiSuggestions} handleUndo={handleUndo} handleRedo={handleRedo} />}
            {activeTab === 'insert' && !isAiMode && (
                <div className="p-4 space-y-5">
                    <div className="relative"><LucideIcons.Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><input type="text" placeholder="Search elements..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-3 py-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:ring-1 focus:ring-green-500" /></div>
                    <button onClick={() => setIsAiMode(true)} className="w-full flex items-center justify-center gap-2.5 px-3 py-2.5 bg-green-50 text-green-700 font-semibold rounded-lg hover:bg-green-100 transition-colors border border-green-200 hover:border-green-300 relative group">
                        <span className="absolute inset-0 bg-green-400/20 rounded-lg blur-lg opacity-0 group-hover:opacity-100 group-hover:animate-pulse transition-opacity duration-300"></span>
                        <LucideIcons.Sparkles className="w-5 h-5 relative text-green-500"/>
                        <span className="relative">Build with AI</span>
                    </button>
                    <ElementAccordion title="Structure">
                        <div className="grid grid-cols-1 gap-2.5">
                            <button onClick={onAddTopLevelSection} className="w-full flex items-center justify-center gap-3 p-3 text-left bg-white border border-slate-200 rounded-lg cursor-pointer hover:bg-green-50 hover:border-green-300 hover:shadow-md transition-all group focus:outline-none focus-visible:ring-1 focus-visible:ring-green-500">
                                <LucideIcons.PlusSquare className="w-6 h-6 text-slate-500 group-hover:text-green-600 transition-colors" />
                                <span className="text-sm font-medium text-slate-700 group-hover:text-green-800">Add Section</span>
                            </button>
                        </div>
                    </ElementAccordion>
                    {Object.entries(categorizedElements).map(([category, elements]) => (
                        elements.length > 0 && <ElementAccordion key={category} title={category}>
                            <div className="grid grid-cols-1 gap-2.5">{elements.map((elConf) => (<ElementPaletteItem key={elConf.id} config={elConf} />))}</div>
                        </ElementAccordion>
                    ))}
                    {globalElements.length > 0 && (
                        <ElementAccordion title="Global">
                            <div className="grid grid-cols-1 gap-2.5">{globalElements.map((elConf) => (<ElementPaletteItem key={elConf.id} config={elConf} />))}</div>
                        </ElementAccordion>
                    )}
                </div>
            )}
            {activeTab === 'layers' && <LayersTreeView page={pages[activePageId]} pagePath={`pages[${activePageId}]`} onSelect={onSelect} selectedItemId={selectedItem?.id} />}
            {activeTab === 'pages' && (
                <div className="p-4">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-base font-semibold text-slate-800">Your Pages</h3>
                        <button onClick={onAddPage} title="Add New Page" className="p-1.5 text-green-600 hover:text-green-700 rounded-lg hover:bg-green-100 transition-colors"><LucideIcons.Plus className="w-5 h-5" /></button>
                    </div>
                    <ul className="space-y-1.5">
                        {Object.values(pages).map((page) => (
                            <li key={page.id} className="group">
                                <button onClick={() => onSelectPage(page.id)} className={`w-full text-left px-3 py-2.5 text-sm rounded-lg transition-all duration-150 flex items-center justify-between ${activePageId === page.id ? "bg-green-600 text-white font-semibold shadow-md" : "text-slate-600 hover:bg-white hover:text-slate-900 bg-white border border-slate-200"}`}>
                                    <span className="truncate">{page.name}</span>
                                    <div className={`flex items-center transition-opacity ${activePageId === page.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                                        <button onClick={(e) => { e.stopPropagation(); onRenamePage(page.id, page.name); }} className="p-1.5 hover:bg-white/20 rounded-md"><LucideIcons.Edit3 className="w-4 h-4" /></button>
                                        <button onClick={(e) => { e.stopPropagation(); onDeletePage(page.id, page.name); }} className="p-1.5 hover:bg-white/20 rounded-md"><LucideIcons.Trash2 className="w-4 h-4" /></button>
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
        {label && <label className="block text-xs font-medium text-slate-600 mb-1.5">{label}</label>}
        <InputComponent type={type} value={value || ''} onChange={e => setValue(e.target.value)} onBlur={handleBlur} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-1 focus:ring-green-500 focus:border-green-500 shadow-sm" {...props} />
    </div>
  );
}
function RightSidebar({ selectedItemData, onUpdateSelectedProps, pages, activePageId, onRenamePage, onAddGlobalElement, comments, onUpdateComment, onDeleteComment }) {
  const [activeTab, setActiveTab] = useState('properties');
  const PropertyGroup = ({ title, children, defaultOpen = true }) => {
      const [isOpen, setIsOpen] = useState(defaultOpen);
      return (
        <div className="border-b border-slate-200/80 last:border-b-0 pb-4 mb-4">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center py-1">
                <h3 className="text-xs font-semibold uppercase text-slate-500 tracking-wider">{title}</h3>
                <LucideIcons.ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && <div className="space-y-4 pt-4">{children}</div>}
        </div>
      );
  };
  const ColorInput = ({ label, value, onChange }) => (
    <div className="flex justify-between items-center">
        <label className="text-sm font-medium text-slate-700">{label}</label>
        <div className="flex items-center gap-2">
            <input type="text" value={value || '#000000'} onChange={e => onChange(e.target.value)} className="w-24 text-sm border-slate-300 rounded-md px-2 py-1 focus:ring-1 focus:ring-green-500 shadow-sm" />
            <div className="relative w-8 h-8 rounded-md overflow-hidden border border-slate-300 shadow-sm">
                <div className="absolute inset-0" style={{backgroundColor: value || '#000000'}}></div>
                <input type="color" value={value || '#000000'} onChange={e => onChange(e.target.value)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
            </div>
        </div>
    </div>
  );
  const StyledSlider = ({ label, value, onChange, min = 0, max = 200, step = 1, unit = "px" }) => {
      const displayValue = parseInt(value, 10) || 0;
      return (
        <div>
            <div className="flex justify-between items-center mb-1.5"><label className="text-xs font-medium text-slate-600">{label}</label><span className="text-xs text-slate-500 bg-slate-200 px-1.5 py-0.5 rounded">{`${displayValue}${unit}`}</span></div>
            <input type="range" min={min} max={max} step={step} value={displayValue} onChange={(e) => onChange(`${e.target.value}${unit}`)} className="w-full custom-slider" />
        </div>
      );
  };
  const ToggleSwitch = ({ label, checked, onChange }) => (
    <div className="flex justify-between items-center">
        <label className="text-sm font-medium text-slate-700">{label}</label>
        <button onClick={() => onChange(!checked)} className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${checked ? 'bg-green-600' : 'bg-slate-300'}`}><span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} /></button>
    </div>
  );
  const AlignmentButtons = ({ value, onChange }) => (
    <div>
        <label className="block text-xs font-medium text-slate-600 mb-1.5">Alignment</label>
        <div className="flex items-center bg-slate-100 rounded-lg p-1">{textAlignOptions.map(opt => (<button key={opt.value} onClick={() => onChange(opt.value)} title={opt.label} className={`flex-1 p-2 rounded-md transition-all text-slate-600 ${value === opt.value ? 'bg-white text-green-700 shadow-sm' : 'hover:bg-slate-200/50'}`}>{opt.icon}</button>))}</div>
    </div>
  );
  const TabButton = ({ tabName, icon, label }) => (
    <button onClick={() => setActiveTab(tabName)} className={`w-full flex-1 flex flex-col items-center justify-center gap-1.5 py-3 text-sm font-medium transition-colors border-b-2 ${activeTab === tabName ? 'border-green-500 text-green-600 bg-white' : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100'}`}>
        {icon}
        <span>{label}</span>
    </button>
  );
  const renderPropertiesPanel = () => {
    if (!selectedItemData || !selectedItemData.itemType) {
        return ( <div className="flex flex-col items-center justify-center h-full text-center p-4 bg-white"><LucideIcons.Pointer className="w-16 h-16 text-slate-300 mb-4"/><h3 className="font-semibold text-slate-700">Nothing Selected</h3><p className="text-sm text-slate-500 mt-1">Click an element on the canvas to edit.</p></div> );
    }
    if (selectedItemData.itemType === 'page') {
      const currentPage = pages[activePageId];
      return ( <> <div className="flex justify-between items-center px-4 py-3.5 border-b border-slate-200 h-[60px] bg-white"><h2 className="text-lg font-bold text-slate-800">Page Settings</h2></div><div className="p-4 space-y-4 flex-grow bg-slate-50"><DebouncedTextInput label="Page Name" initialValue={currentPage?.name || ""} onCommit={onRenamePage} key={activePageId}/></div> </> );
    }
    const { id, path, props, itemType } = selectedItemData;
    const config = AVAILABLE_ELEMENTS_CONFIG.find(c => c.id === itemType) || {};
    const onUpdate = (newProps) => onUpdateSelectedProps(path, newProps);

    const GeneralStyling = () => (
        <>
        <PropertyGroup title="Appearance" defaultOpen={false}>
            <StyledSlider label="Opacity" value={props.style?.opacity * 100 || 100} onChange={val => onUpdate({ style: { opacity: parseInt(val) / 100 } })} max={100} unit="%" />
            <StyledSlider label="Radius" value={props.style?.borderRadius} onChange={val => onUpdate({ style: { borderRadius: val } })} max={100} />
            <DebouncedTextInput label="Border" initialValue={props.style?.border} onCommit={val => onUpdate({ style: { border: val } })} placeholder="e.g. 1px solid #ccc" />
        </PropertyGroup>
        </>
    );
    return (<> <div className="flex justify-between items-center px-4 py-3.5 border-b border-slate-200/80 h-[60px] bg-white"><h2 className="text-lg font-bold text-slate-800 capitalize">{config?.name || itemType || 'Properties'}</h2></div><div className="overflow-y-auto flex-grow text-sm p-4 bg-slate-50"> {(() => {
        switch(itemType) {
            case 'header': case 'textBlock': return <><PropertyGroup title="Content"><DebouncedTextInput label="Text" type="textarea" rows={5} initialValue={props.text} onCommit={val => onUpdate({ text: val })} key={id}/></PropertyGroup><PropertyGroup title="Typography"><CustomDropdown label="Size" options={textSizeOptions} value={props.sizeClass} onChange={val => onUpdate({ sizeClass: val })} /><CustomDropdown label="Weight" options={fontWeightOptions} value={props.fontWeight} onChange={val => onUpdate({ fontWeight: val })} /><ColorInput label="Color" value={props.textColor} onChange={val => onUpdate({ textColor: val })} /><AlignmentButtons value={props.textAlign} onChange={val => onUpdate({ textAlign: val })} /></PropertyGroup><GeneralStyling/></>;
            case 'button': return <><PropertyGroup title="Content"><DebouncedTextInput label="Button Text" initialValue={props.buttonText} onCommit={val => onUpdate({ buttonText: val })} key={`${id}-text`} /><DebouncedTextInput label="Link URL" initialValue={props.link} onCommit={val => onUpdate({ link: val })} key={`${id}-link`} /></PropertyGroup><PropertyGroup title="Styling"><ColorInput label="Background" value={props.backgroundColor} onChange={val => onUpdate({ backgroundColor: val })} /><ColorInput label="Text Color" value={props.textColor} onChange={val => onUpdate({ textColor: val })} /><StyledSlider label="Border Radius" value={props.borderRadius} onChange={val => onUpdate({ borderRadius: val })} max={50} /><CustomDropdown label="Variant" options={[{label: 'Solid', value: 'solid'}, {label: 'Outline', value: 'outline'}]} value={props.variant} onChange={val => onUpdate({ variant: val })} /></PropertyGroup><PropertyGroup title="Layout"><AlignmentButtons value={props.textAlign} onChange={val => onUpdate({ textAlign: val })} /><ToggleSwitch label="Full Width" checked={props.fullWidth} onChange={val => onUpdate({ fullWidth: val })} /></PropertyGroup><GeneralStyling/></>;
            case 'image': return <><PropertyGroup title="Content"><DebouncedTextInput label="Image Source (URL)" initialValue={props.src} onCommit={val => onUpdate({ src: val })} key={`${id}-src`} /><DebouncedTextInput label="Alt Text" initialValue={props.alt} onCommit={val => onUpdate({ alt: val })} key={`${id}-alt`} /></PropertyGroup><GeneralStyling/></>;
            case 'spacer': return <><PropertyGroup title="Layout"><StyledSlider label="Height" value={props.height} onChange={val => onUpdate({ height: val })} max={300} /></PropertyGroup></>;
            case 'section': return <><PropertyGroup title="Spacing"><StyledSlider label="Padding Top" value={props.paddingTop} onChange={val => onUpdate({ paddingTop: val })} /><StyledSlider label="Padding Bottom" value={props.paddingBottom} onChange={val => onUpdate({ paddingBottom: val })} /><StyledSlider label="Padding Left" value={props.paddingLeft} onChange={val => onUpdate({ paddingLeft: val })} /><StyledSlider label="Padding Right" value={props.paddingRight} onChange={val => onUpdate({ paddingRight: val })} /></PropertyGroup><PropertyGroup title="Background"><ColorInput label="Color" value={props.backgroundColor} onChange={val => onUpdate({ backgroundColor: val })} /></PropertyGroup><GeneralStyling/></>;
            case 'column': return <><PropertyGroup title="Layout"><CustomDropdown label="Direction" options={[{label: 'Vertical', value: 'column'}, {label: 'Horizontal', value: 'row'}]} value={props.style?.flexDirection} onChange={val => onUpdate({ style: { flexDirection: val } })} /><CustomDropdown label="Justify" options={[{label: 'Start', value: 'flex-start'}, {label: 'Center', value: 'center'}, {label: 'End', value: 'flex-end'}, {label: 'Space Between', value: 'space-between'}]} value={props.style?.justifyContent} onChange={val => onUpdate({ style: { justifyContent: val } })} /><CustomDropdown label="Align" options={[{label: 'Start', value: 'flex-start'}, {label: 'Center', value: 'center'}, {label: 'End', value: 'flex-end'}, {label: 'Stretch', value: 'stretch'}]} value={props.style?.alignItems} onChange={val => onUpdate({ style: { alignItems: val } })} /><StyledSlider label="Gap" value={props.style?.gap} onChange={val => onUpdate({ style: { gap: val } })}/></PropertyGroup><GeneralStyling/></>;
            case 'navbar': return <><PropertyGroup title="Logo"><DebouncedTextInput label="Logo Text" initialValue={props.logoText} onCommit={val => onUpdate({ logoText: val })} key={`${id}-logo`}/></PropertyGroup><PropertyGroup title="Styling"><ColorInput label="Background" value={props.backgroundColor} onChange={val => onUpdate({ backgroundColor: val })} /><ColorInput label="Text" value={props.textColor} onChange={val => onUpdate({ textColor: val })} /><ColorInput label="Link" value={props.linkColor} onChange={val => onUpdate({ linkColor: val })} /></PropertyGroup><PropertyGroup title="Links"><LinkManager links={props.links} onUpdateLinks={links => onUpdate({links})} elementId={id} pages={pages} /></PropertyGroup><GeneralStyling/></>;
            case 'footer': return <><PropertyGroup title="Content"><DebouncedTextInput label="Copyright Text" initialValue={props.copyrightText} onCommit={val => onUpdate({ copyrightText: val })} key={`${id}-copyright`}/></PropertyGroup><PropertyGroup title="Styling"><ColorInput label="Background" value={props.backgroundColor} onChange={val => onUpdate({ backgroundColor: val })} /><ColorInput label="Text" value={props.textColor} onChange={val => onUpdate({ textColor: val })} /><ColorInput label="Link" value={props.linkColor} onChange={val => onUpdate({ linkColor: val })} /></PropertyGroup><PropertyGroup title="Links"><LinkManager links={props.links} onUpdateLinks={links => onUpdate({links})} elementId={id} pages={pages} linkTypeLabel="Footer Link"/></PropertyGroup><GeneralStyling/></>;
            case 'cardSlider': return <><PropertyGroup title="Slides"><SlideManager slides={props.slides} onUpdateSlides={slides => onUpdate({slides})} elementId={id} /></PropertyGroup><PropertyGroup title="Settings"><StyledSlider label="Slides Per View" value={props.slidesPerView} onChange={val => onUpdate({ slidesPerView: parseInt(val) })} min={1} max={6} unit=""/><StyledSlider label="Space Between" value={props.spaceBetween} onChange={val => onUpdate({ spaceBetween: parseInt(val) })} max={100} unit="px"/></PropertyGroup><PropertyGroup title="Behavior"><ToggleSwitch label="Autoplay" checked={props.autoplay} onChange={val => onUpdate({ autoplay: val })} /><ToggleSwitch label="Loop" checked={props.loop} onChange={val => onUpdate({ loop: val })} /><ToggleSwitch label="Navigation Arrows" checked={props.showNavigation} onChange={val => onUpdate({ showNavigation: val })} /><ToggleSwitch label="Pagination Dots" checked={props.showPagination} onChange={val => onUpdate({ showPagination: val })} /></PropertyGroup><GeneralStyling/></>;
            case 'accordion': return <><PropertyGroup title="Content"><DebouncedTextInput label="Title" initialValue={props.title} onCommit={val => onUpdate({ title: val })} key={`${id}-title`} /><DebouncedTextInput label="Content" type="textarea" rows={4} initialValue={props.content} onCommit={val => onUpdate({ content: val })} key={`${id}-content`} /></PropertyGroup><GeneralStyling/></>;
            default: return <p className="text-sm text-slate-500 text-center py-8">No properties to edit for this '{itemType}'.</p>;
        }
    })()}</div></>);
  };
  const renderCommentsPanel = () => {
    const pageComments = comments[activePageId] || [];
    const IconForFrame = ({frame}) => { const DeviceIcon = DEVICE_FRAMES_CONFIG.find(d => d.name === frame)?.icon || LucideIcons.HelpCircle; return <DeviceIcon className="w-4 h-4 text-slate-500"/> };
    return ( <> <div className="flex justify-between items-center px-4 py-3.5 border-b border-slate-200 h-[60px] bg-white"><h2 className="text-lg font-bold text-slate-800">Comments</h2></div> <div className="overflow-y-auto flex-grow text-sm p-4 space-y-3 bg-slate-50"> {pageComments.length === 0 ? ( <div className="text-center py-10 text-slate-500"><LucideIcons.MessageSquarePlus className="mx-auto w-12 h-12 text-slate-300 mb-2"/><p>No comments on this page.</p><p className="text-xs">Use the Comment tool to add notes.</p></div> ) : ( pageComments.map(comment => ( <div key={comment.id} className="p-3 bg-white border border-slate-200 rounded-lg"><div className="flex justify-between items-start"><textarea value={comment.text} onChange={(e) => onUpdateComment(activePageId, comment.id, e.target.value)} className="w-full bg-transparent border-0 focus:ring-0 p-0 text-sm text-slate-800 resize-none" rows={2}/> <button onClick={() => onDeleteComment(activePageId, comment.id)} className="ml-2 p-1 text-red-500 hover:bg-red-100 rounded-full"><LucideIcons.Trash2 className="w-4 h-4"/></button> </div> <div className="text-xs text-slate-500 mt-2 flex items-center gap-2"> <IconForFrame frame={comment.frame} /> <span>on {comment.frame} view</span> </div></div> )) )} </div> </> )
  }
  return (
    <aside className="h-full w-80 bg-slate-50 border-l border-slate-200 shadow-xl flex flex-col print-hidden">
        <div className="flex border-b border-slate-200">
            <TabButton tabName="properties" icon={<LucideIcons.SlidersHorizontal className="w-5 h-5"/>} label="Properties"/>
            <TabButton tabName="comments" icon={<LucideIcons.MessageSquareText className="w-5 h-5"/>} label="Comments"/>
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
            <div className="relative w-48 h-48 flex items-center justify-center">
                <div className="absolute w-20 h-20 bg-green-300 rounded-full flex items-center justify-center" style={{ animation: 'pulse-grow 2.5s ease-in-out infinite' }}>
                    <LucideIcons.BrainCircuit className="w-12 h-12 text-green-700/90" />
                </div>
                <div className="absolute w-full h-full" style={{ animation: 'rotate-slow 10s linear infinite' }}>
                    <div className="absolute top-0 left-1/2 -ml-2 w-4 h-4 bg-teal-400 rounded-full"></div>
                </div>
                <div className="absolute w-40 h-40" style={{ animation: 'rotate-fast 8s linear infinite' }}>
                    <div className="absolute bottom-0 left-1/2 -ml-3 w-6 h-6 border-2 border-green-400 rounded-full"></div>
                </div>
                <div className="absolute w-32 h-32" style={{ animation: 'rotate-slow 12s linear infinite' }}>
                    <div className="absolute top-1/2 -mt-2 right-0 w-3 h-3 bg-green-600/80 rounded-full"></div>
                </div>
            </div>
            <p className="text-slate-800 text-lg font-semibold mt-8 tracking-wider animate-pulse">Building with AI...</p>
            <p className="text-green-700 text-sm mt-2">Crafting something amazing for you!</p>
        </div>
    );
}
export function PagePreviewRenderer({ pageLayout, globalNavbar, globalFooter, onNavigate, activePageId }) {
    const [device, setDevice] = useState(PREVIEW_DEVICES[2]);
    const containerStyle = device.width === '100%' ? { width: '100%', height: '100%' } : { maxWidth: device.width, width: '100%', height: '100%', containerType: 'inline-size' };
    return (
        <div className="flex-1 overflow-hidden bg-slate-100 flex flex-col items-center p-4 gap-4">
            <div className="bg-white rounded-full p-1.5 flex items-center justify-center gap-2 text-sm font-medium text-slate-600 shadow-md">
                {PREVIEW_DEVICES.map(d => (<button key={d.name} onClick={() => setDevice(d)} className={`px-4 py-2 rounded-full flex items-center gap-2 transition-colors ${device.name === d.name ? 'bg-green-600 text-white' : 'hover:bg-slate-100'}`}><d.icon className="w-5 h-5" /> {d.name}</button>))}
            </div>
            <div className="flex-1 w-full flex items-center justify-center overflow-hidden">
                <div style={containerStyle} className="bg-white shadow-2xl mx-auto transition-all duration-300 rounded-2xl">
                    <div className="w-full h-full overflow-y-auto scrollbar-thin scrollbar-thumb-slate-400 scrollbar-track-slate-100">
                        {globalNavbar && (<NavbarElement {...globalNavbar.props} isPreviewMode={true} onNavigate={onNavigate} previewDevice={device.name.toLowerCase()} />)}
                        {pageLayout && pageLayout.map((sec, idx) => ( <SectionComponent key={`${activePageId}-${sec.id}-${idx}`} sectionData={sec} sectionIndex={idx} onUpdateProps={() => {}} onDelete={() => {}} onSelect={() => {}} selectedItemId={null} onOpenStructureModal={() => {}} isPreviewMode={true} onNavigate={onNavigate} />))}
                        {globalFooter && (<FooterElement {...globalFooter.props} isPreviewMode={true} onNavigate={onNavigate} />)}
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
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/70 backdrop-blur-xl h-12 p-1 rounded-full border border-slate-200/80 flex items-center justify-between text-sm z-30 shadow-lg shadow-black/5">
            <div className="flex items-center gap-1 pl-1">
                <button onClick={() => onToolChange('select')} title="Select Tool (V)" className={`p-2 rounded-full transition-all ${activeTool === 'select' ? 'bg-green-100 text-green-700 shadow-sm' : 'hover:bg-slate-200/80 text-slate-600'}`}><LucideIcons.MousePointer2 className="w-5 h-5"/></button>
                <button onClick={() => onToolChange('hand')} title="Hand Tool (H)" className={`p-2 rounded-full transition-all ${activeTool === 'hand' ? 'bg-green-100 text-green-700 shadow-sm' : 'hover:bg-slate-200/80 text-slate-600'}`}><LucideIcons.Hand className="w-5 h-5"/></button>
                <button onClick={() => onToolChange('comment')} title="Comment (C)" className={`p-2 rounded-full transition-all ${activeTool === 'comment' ? 'bg-green-100 text-green-700 shadow-sm' : 'hover:bg-slate-200/80 text-slate-600'}`}><LucideIcons.MessageSquarePlus className="w-5 h-5"/></button>
            </div>
            <div className="h-6 w-px bg-slate-300 mx-2"></div>
            <div className="flex items-center gap-1 text-slate-500 px-2 max-w-md overflow-x-auto">
                {breadcrumbs.map((crumb, index) => (
                    <React.Fragment key={index}>
                        <button onClick={() => onSelect(crumb.id, crumb.type, crumb.path)} className={`px-2 py-1 rounded-md transition-colors whitespace-nowrap ${index === breadcrumbs.length - 1 ? 'text-slate-800 font-semibold bg-slate-200/60' : 'hover:bg-slate-200/50'}`}>{crumb.name}</button>
                        {index < breadcrumbs.length - 1 && <LucideIcons.ChevronRight className="w-4 h-4 flex-shrink-0" />}
                    </React.Fragment>
                ))}
            </div>
            <div className="h-6 w-px bg-slate-300 mx-2"></div>
            <div className="flex items-center gap-2 px-2">
                <button onClick={() => onZoomChange(Math.max(0.1, zoom - 0.1))} className="p-1.5 hover:bg-slate-200 rounded-md text-slate-600"><LucideIcons.Minus className="w-4 h-4" /></button>
                <span className="w-12 text-center font-medium text-slate-700">{Math.round(zoom * 100)}%</span>
                <button onClick={() => onZoomChange(zoom + 0.1)} className="p-1.5 hover:bg-slate-200 rounded-md text-slate-600"><LucideIcons.Plus className="w-4 h-4" /></button>
            </div>
        </div>
    );
}
function TopBar({ onSave, onTogglePreview, isPreviewMode, onToggleLeftPanel, onToggleFullscreen, isFullscreen }) {
    return (
        <header className="bg-white h-[60px] p-2.5 border-b border-slate-200/80 shadow-sm print-hidden flex justify-between items-center px-4 z-[50] relative">
            <div className="flex items-center gap-3">
                {!isPreviewMode && (
                    <button onClick={onToggleLeftPanel} className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors" title="Toggle Content Panel">
                        <LucideIcons.PanelLeft className="w-6 h-6" />
                    </button>
                )}
                <a href="#" className="flex items-center gap-2.5 text-slate-800 text-lg">
                    <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                       <LucideIcons.Feather className="w-5 h-5 text-white" />
                    </div>
                    <span className="hidden sm:inline font-bold">Web<span className="font-light text-green-500">Forge</span></span>
                </a>
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="relative flex items-center p-1 bg-slate-200/70 rounded-full border border-slate-300/50 shadow-inner">
                     <span className={`absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-full bg-white shadow-sm transition-transform duration-300 ease-in-out`} style={{ transform: isPreviewMode ? 'translateX(calc(100% + 4px))' : 'translateX(0)' }}></span>
                     <button onClick={() => isPreviewMode && onTogglePreview()} className={`relative z-10 px-4 py-1.5 rounded-full flex items-center gap-2 transition-colors duration-300 text-sm font-medium ${!isPreviewMode ? "text-green-700" : "text-slate-500"}`}>
                        <LucideIcons.Edit3 className="w-4 h-4" />
                        Editor
                    </button>
                    <button onClick={() => !isPreviewMode && onTogglePreview()} className={`relative z-10 px-4 py-1.5 rounded-full flex items-center gap-2 transition-colors duration-300 text-sm font-medium ${isPreviewMode ? "text-green-700 " : "text-slate-500"}`}>
                        <LucideIcons.Eye className="w-4 h-4" />
                        Preview
                    </button>
                </div>
            </div>

            <div className="flex items-center gap-3">
                {!isPreviewMode && (
                    <button onClick={onToggleFullscreen} className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors" title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}>
                        {isFullscreen ? <LucideIcons.Minimize className="w-5 h-5" /> : <LucideIcons.Maximize className="w-5 h-5" />}
                    </button>
                )}
                <StyledModalButton onClick={onSave} variant="primary">
                    <LucideIcons.Save className="w-4 h-4 mr-2" />
                    Save
                </StyledModalButton>
            </div>
        </header>
    );
}
// --- AI DATA PARSERS ---
function htmlToBuilderJson(htmlString) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');
    const sections = [];
    const classToPropMap = {
        'text-left': { textAlign: 'text-left' }, 'text-center': { textAlign: 'text-center' }, 'text-right': { textAlign: 'text-right' },
        'font-bold': { fontWeight: 'font-bold' }, 'font-extrabold': { fontWeight: 'font-bold' }, 'font-semibold': { fontWeight: 'font-semibold' }, 'font-medium': { fontWeight: 'font-medium' }, 'font-normal': { fontWeight: 'font-normal' }, 'font-light': { fontWeight: 'font-light' },
        'text-xs': { sizeClass: 'text-xs' }, 'text-sm': { sizeClass: 'text-sm' }, 'text-base': { sizeClass: 'text-base' }, 'text-lg': { sizeClass: 'text-lg' }, 'text-xl': { sizeClass: 'text-xl' }, 'text-2xl': { sizeClass: 'text-2xl' }, 'text-3xl': { sizeClass: 'text-3xl' }, 'text-4xl': { sizeClass: 'text-4xl' }, 'text-5xl': { sizeClass: 'text-5xl' }
    };
    function parseNode(node) {
        if (node.nodeType !== Node.ELEMENT_NODE) return null;
        let element = null;

        if (node.tagName.match(/^H[1-6]$/)) {
            element = { type: 'header', props: { text: node.innerHTML.trim() } };
        } else if (node.tagName === 'P') {
            element = { type: 'textBlock', props: { text: node.innerHTML.trim() } };
        } else if (node.tagName === 'BUTTON') { 
             element = { type: 'button', props: { buttonText: node.innerHTML.trim() } };
        } else if (node.tagName === 'A' && node.classList.contains('button')) {
            element = { type: 'button', props: { buttonText: node.innerHTML.trim(), link: node.getAttribute('href') || '#' } };
        } else if (node.tagName === 'IMG') {
            element = { type: 'image', props: { src: node.src, alt: node.alt } };
        } else if (node.tagName === 'HR') {
            element = { type: 'divider', props: {} };
        }
        
        if (element) {
            element.id = generateId(element.type);
            const config = AVAILABLE_ELEMENTS_CONFIG.find(c => c.id === element.type);
            if (config) {
                element.props = { ...getDefaultProps(element.type), ...element.props };
            }
            node.classList.forEach(cls => {
                if (classToPropMap[cls]) {
                    Object.assign(element.props, classToPropMap[cls]);
                }
            });
            if (!element.props.textAlign && node.parentElement?.classList) {
                 node.parentElement.classList.forEach(cls => {
                     if(classToPropMap[cls] && classToPropMap[cls].textAlign) {
                         Object.assign(element.props, classToPropMap[cls]);
                     }
                 });
            }
            return element;
        }
        return null;
    }
    function parseContainer(containerEl) {
        const elements = [];
        containerEl.childNodes.forEach(childNode => {
            if (childNode.nodeType !== Node.ELEMENT_NODE || ['SCRIPT', 'STYLE', 'HEADER', 'FOOTER'].includes(childNode.tagName) || (childNode.id && childNode.id.includes('modal'))) {
                return;
            }
            const parsedEl = parseNode(childNode);
            if (parsedEl) {
                elements.push(parsedEl);
            } else if (childNode.children.length > 0) {
                elements.push(...parseContainer(childNode));
            }
        });
        return elements;
    }
    const body = doc.querySelector('body');
    const main = doc.querySelector('main');
    const contentRoot = main || body;

    if (contentRoot) {
        contentRoot.querySelectorAll(':scope > section').forEach(sectionEl => {
            if (sectionEl.classList.contains('faq-section')) {
                const faqBuilderSection = {
                    id: generateId('section'),
                    type: 'section',
                    props: { paddingTop: "48px", paddingBottom: "48px", style: {} },
                    columns: [{ id: generateId('col'), type: 'column', props: { width: '100%' }, elements: [] }]
                };
                const mainHeading = sectionEl.querySelector('h2');
                if (mainHeading) {
                    const headingElement = parseNode(mainHeading);
                    if (headingElement) {
                        faqBuilderSection.columns[0].elements.push(headingElement);
                    }
                }
                sectionEl.querySelectorAll('.faq-question').forEach(questionButton => {
                    const title = questionButton.querySelector('span')?.innerText.trim();
                    const answerDiv = questionButton.nextElementSibling;
                    const content = answerDiv && answerDiv.classList.contains('faq-answer') ? answerDiv.innerText.trim() : '';

                    if (title && content) {
                        const accordionEl = {
                            type: 'accordion',
                            id: generateId('accordion'),
                            props: { ...getDefaultProps('accordion'), title, content, }
                        };
                        faqBuilderSection.columns[0].elements.push(accordionEl);
                    }
                });
                if (faqBuilderSection.columns[0].elements.length > 0) sections.push(faqBuilderSection);
                return;
            }
            
            const newSection = { id: generateId('section'), type: 'section', props: {}, columns: [] };
            const layoutContainers = sectionEl.querySelectorAll('.grid, .flex');
            
            if (layoutContainers.length > 0 && Array.from(layoutContainers[0].children).length > 1 && Array.from(layoutContainers[0].children).every(child => child.tagName === 'DIV' || child.tagName === 'ARTICLE')) {
                const container = layoutContainers[0];
                const cols = Array.from(container.children);
                const colWidth = 100 / (cols.length || 1);
                cols.forEach(colEl => {
                    const newCol = { id: generateId('col'), type: 'column', props: { width: `${colWidth}%` }, elements: parseContainer(colEl) };
                    newSection.columns.push(newCol);
                });
            } else {
                const newColumn = { id: generateId('col'), type: 'column', props: { width: '100%' }, elements: parseContainer(sectionEl) };
                newSection.columns.push(newColumn);
            }
            if (newSection.columns.some(col => col.elements.length > 0)) sections.push(newSection);
        });
    }

    return sections;
}

function apiStateToBuilderJson(apiResponse) {
    const { sections: sectionsHtml, section_order } = apiResponse;
    if (!sectionsHtml || !section_order) return [];

    const newLayout = [];
    for (const sectionId of section_order) {
        if (sectionId.includes('navbar') || sectionId.includes('navigation_bar') || sectionId.includes('footer')) continue;
        
        const sectionHtml = sectionsHtml[sectionId];
        
        // This handles both empty sections and sections with content
        const parsedSections = htmlToBuilderJson(sectionHtml || '<section></section>');

        if (parsedSections.length > 0) {
            // The AI might return multiple sections inside one HTML blob
            parsedSections.forEach((parsedSection, index) => {
                // For the first parsed section, use the ID from the backend's order
                // For subsequent ones, keep their generated ID.
                if (index === 0) {
                    parsedSection.id = sectionId;
                }
                newLayout.push(parsedSection);
            });
        } else {
            // If parsing results in nothing (e.g., an empty <section> tag), add a placeholder
            newLayout.push({
                id: sectionId, type: 'section', props: { paddingTop: "48px", paddingBottom: "48px", style: {} },
                columns: [{ id: generateId("col"), type: "column", props: { width: "100%" }, elements: [] }]
            });
        }
    }
    return newLayout;
}

// --- MAIN PAGE COMPONENT ---
export default function ElementBuilderPage({ onExternalSave, initialBuilderState }) {
  const [newlyAddedElementId, setNewlyAddedElementId] = useState(null);
  const initialPageId = useMemo(() => generateId("page-home"), []);
  const [pages, setPages] = useState(initialBuilderState?.pages && Object.keys(initialBuilderState.pages).length > 0 ? initialBuilderState.pages : { [initialPageId]: { id: initialPageId, name: "Home", layout: [] } });
  const [activePageId, setActivePageId] = useState(initialBuilderState?.activePageId && pages[initialBuilderState.activePageId] ? initialBuilderState.activePageId : initialPageId);
  const [globalNavbar, setGlobalNavbar] = useState(initialBuilderState?.globalNavbar || null);
  const [globalFooter, setGlobalFooter] = useState(initialBuilderState?.globalFooter || null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [activeDragItem, setActiveDragItem] = useState(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [activeTool, setActiveTool] = useState('select');
  const [zoom, setZoom] = useState(0.5);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [comments, setComments] = useState(initialBuilderState?.comments || {});
  const canvasRef = useRef(null);
  const builderRef = useRef(null);
  const isPanning = useRef(false);
  const lastMousePos = useRef({ x: 0, y: 0 });
  const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(true);
  const [isStructureModalOpen, setIsStructureModalOpen] = useState(false);
  const [structureModalContext, setStructureModalContext] = useState({ path: null, elementType: null, pageId: null });
  const [isAiLoading, setIsAiLoading] = useState(false);
  const aiSessionId = useRef(null);
  const [aiChatHistory, setAiChatHistory] = useState([]);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [modalStates, setModalStates] = useState({ addPage: { isOpen: false }, renamePage: { isOpen: false, pageId: null, currentName: "" }, deletePage: { isOpen: false, pageId: null, pageName: "" }, alert: { isOpen: false, title: "", message: "" }, saveConfirm: { isOpen: false, title: "", message: "" } });
  const [isFullscreen, setIsFullscreen] = useState(false);

  const updateLayoutForPage = (pageId, callback) => setPages((p) => { const targetPage = p[pageId]; if (!targetPage) return p; return { ...p, [pageId]: { ...targetPage, layout: callback(targetPage.layout || []) } }; });

  const syncPageWithAI = useCallback(async () => {
      if (!aiSessionId.current || !activePageId) return;
      setIsAiLoading(true);
      try {
          const pageStateResponse = await apiRequest('get', '/get-page', { session_id: aiSessionId.current });
          const apiResult = pageStateResponse.data;
          
          if (apiResult && apiResult.sections && apiResult.section_order) {
              const newLayout = apiStateToBuilderJson(apiResult);
              updateLayoutForPage(activePageId, () => newLayout);

              if (apiResult.suggestions && apiResult.suggestions.length > 0) {
                  setAiSuggestions(apiResult.suggestions);
              }
          } else {
              throw new Error("Could not retrieve a valid page state from AI.");
          }
      } catch (error) {
          console.error("AI Sync Error:", error);
          setModalStates(p => ({ ...p, alert: { isOpen: true, title: "AI Sync Error", message: error.message || `Failed to sync page state with AI.` } }));
      } finally {
        setIsAiLoading(false);
      }
  }, [activePageId]);

  const getAiSuggestions = useCallback(async () => {
    if (!aiSessionId.current) return;
    try {
        const response = await apiRequest('get', '/suggestions', { session_id: aiSessionId.current });
        if (response.data && response.data.suggestions) {
            setAiSuggestions(response.data.suggestions);
        } else {
            setAiSuggestions([]);
        }
    } catch (error) {
        console.error("Failed to fetch AI suggestions:", error);
    }
  }, []);

  const startAiSession = useCallback(async () => {
    if (aiSessionId.current) {
        await getAiSuggestions();
        return;
    }
    try {
        const sessionResponse = await apiRequest('post', '/start-session');
        if (sessionResponse.data.session_id) {
            aiSessionId.current = sessionResponse.data.session_id;
            await getAiSuggestions();
        } else {
            throw new Error("Received an empty session ID from the API.");
        }
    } catch (error) {
        setModalStates(p => ({ ...p, alert: { isOpen: true, title: "AI Error", message: "Could not connect to the AI service." } }));
    }
  }, [getAiSuggestions]);
  
  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
        builderRef.current?.requestFullscreen().catch(err => {
            alert(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
        });
    } else {
        document.exitFullscreen();
    }
  };
  
  useEffect(() => {
    startAiSession();
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [startAiSession]);

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
    if (newPageName?.trim()) { const newId = generateId(newPageName.trim().toLowerCase().replace(/\s+/g, "-")); setPages((p) => ({ ...p, [newId]: { id: newId, name: newPageName.trim(), layout: [] } })); setActivePageId(newId); setSelectedItem({ pageId: newId, path: null, type: 'page', id: null }); }
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
  
  const handleSetStructure = async (columnLayouts, context) => {
    const newColumns = columnLayouts.map(layout => ({ id: generateId("col"), type: "column", props: { width: layout.width, style: {} }, elements: [] }));
    const targetPageId = context.pageId || activePageId;
    let newSectionId = null;

    if (context.path === null) {
        const newSection = { id: generateId("section"), type: "section", props: { paddingTop: "48px", paddingBottom: "48px", style: {} }, columns: newColumns };
        newSectionId = newSection.id;
        updateLayoutForPage(targetPageId, layout => [...layout, newSection]);
    } else {
        updateLayoutForPage(targetPageId, layout => {
            const newLayout = JSON.parse(JSON.stringify(layout));
            const item = getItemByPath({ layout: newLayout }, context.path.replace(`pages[${targetPageId}].`, ''));
            if (item) item.columns = newColumns;
            return newLayout;
        });
    }

    if (newSectionId && aiSessionId.current) {
        const currentLayout = pages[targetPageId]?.layout || [];
        const numSections = currentLayout.length + 1;
        const position = (numSections === 1) ? 'at_beginning' : 'after';
        const ref_section = (numSections > 1) ? currentLayout[numSections - 2].id : null;

        try {
            await apiRequest('post', '/add-section', { session_id: aiSessionId.current, section_name: newSectionId, html: "", position, ref_section });
            await syncPageWithAI();
        } catch (err) {
            console.error("AI: Failed to add and sync section.", err);
        }
    }
    
    setIsLeftPanelOpen(false);
  };
  
  const handleSelect = (id, type, path, itemData) => {
    if (activeTool !== 'select') return;
    if (type === 'page') { setSelectedItem({ pageId: activePageId, id: null, type: 'page', itemType: 'page', path: null, props: {} }); return; }
    if (type === 'globalElement') {
        const globalItem = path === 'globalNavbar' ? globalNavbar : globalFooter;
        if (globalItem) setSelectedItem({ pageId: activePageId, id: globalItem.id, type: 'globalElement', itemType: globalItem.type, path: path, props: globalItem.props });
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
        const updater = path === 'globalNavbar' ? setGlobalNavbar : setGlobalFooter;
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

  const handleDelete = (path) => {
    const itemToDelete = getItemByPath({ pages }, path);
    if (!itemToDelete) return;

    const isSection = itemToDelete.type === 'section';

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

    if (isSection && aiSessionId.current) {
        apiRequest('post', '/remove-section', { session_id: aiSessionId.current, section_name: itemToDelete.id })
            .then(() => syncPageWithAI())
            .catch(err => {
                console.error("AI Section Delete Error:", err);
                setModalStates(p => ({...p, alert: {isOpen: true, title: "AI Sync Error", message: "Failed to delete section via AI. The action was performed locally."}}));
            });
    }
  };

  const handleAddGlobalElement = (type) => { const config = AVAILABLE_ELEMENTS_CONFIG.find(c => c.id === type && c.isGlobalOnly); if(!config) return; const newGlobalElement = { id: `global-${config.id}`, type: config.id, props: getDefaultProps(type) }; if (type === 'navbar') setGlobalNavbar(newGlobalElement); if (type === 'footer') setGlobalFooter(newGlobalElement); };
  const handleDeleteGlobalElement = (elementType) => { const updater = elementType === "navbar" ? setGlobalNavbar : setGlobalFooter; updater(null); if (selectedItem?.itemType === elementType) setSelectedItem({ pageId: activePageId, path: null, type: 'page', id: null }); };

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

    if (activeType === 'paletteItem') {
        const config = active.data.current.config;
        if (config.isGlobalOnly) {
            handleAddGlobalElement(config.id);
            return;
        }

        const newElement = {
            id: generateId(config.id), type: config.id, props: getDefaultProps(config.id),
            ...(config.hasOwnColumns && { columns: [] })
        };
        setNewlyAddedElementId(newElement.id);

        updateLayoutForPage(activePageId, (layout) => {
            const newLayout = JSON.parse(JSON.stringify(layout));
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
            return newLayout;
        });
        return;
    }

    if (activeType === 'canvasElement') {
        updateLayoutForPage(activePageId, layout => {
            const newLayout = JSON.parse(JSON.stringify(layout));
            const sourceInfo = findContainerById(newLayout, active.id);
            if (!sourceInfo) return layout;
            const [movedElement] = sourceInfo.container.splice(sourceInfo.index, 1);
            const destInfo = findContainerById(newLayout, over.id);
            if (destInfo?.container) {
                 destInfo.container.splice(destInfo.index, 0, movedElement);
            } else {
                 sourceInfo.container.splice(sourceInfo.index, 0, movedElement);
            }
            return newLayout;
        });
    }

    if (activeType === 'section') {
        updateLayoutForPage(activePageId, layout => {
            if (!layout) return [];
            const activeIndex = layout.findIndex(s => s.id === active.id);
            const overIndex = layout.findIndex(s => s.id === overId);
            if (activeIndex === -1 || overIndex === -1) return layout;
            
            const newLayout = arrayMove(layout, activeIndex, overIndex);
            
            if (aiSessionId.current) {
                const position = (overIndex === 0) ? 'at_beginning' : 'after';
                const ref_section = (overIndex > 0) ? newLayout[overIndex - 1].id : null;
                
                apiRequest('post', '/move-section', { session_id: aiSessionId.current, section_name: active.id, new_position: position, ref_section: ref_section })
                    .then(() => syncPageWithAI())
                    .catch(err => {
                        console.error("AI Section Move Error:", err);
                        setModalStates(p => ({...p, alert: {isOpen: true, title: "AI Sync Error", message: "Failed to move section with AI. The action was performed locally."}}));
                    });
            }
            return newLayout;
        });
    }
  };

  const togglePreviewMode = () => { setSelectedItem(null); setIsPreviewMode((prev) => !prev); };
  const handleSave = () => {
    setIsAiLoading(false);
    if (onExternalSave) onExternalSave({ pages, activePageId, globalNavbar, globalFooter, comments });
    setModalStates(p => ({ ...p, saveConfirm: { isOpen: true, title: "Save Successful", message: "Your project has been saved." } }));
  };

  const handleAiSubmit = async (prompt) => {
    if (!aiSessionId.current) { setModalStates(p => ({...p, alert: {isOpen: true, title: "AI Error", message: "AI session not started. Please try again."}})); startAiSession(); return; }
    setIsAiLoading(true);
    const historyId = generateId('history');
    setAiChatHistory(prev => [{ id: historyId, prompt, status: 'loading' }, ...prev]);
    try {
        const pageResponse = await apiRequest('post', '/generate-page', { session_id: aiSessionId.current, prompt: prompt, as_file: false });
        const apiResult = pageResponse.data;
        if (apiResult.html || (apiResult.sections && apiResult.section_order)) { 
            await syncPageWithAI();
            setAiChatHistory(prev => prev.map(entry => entry.id === historyId ? {...entry, status: 'success'} : entry));
        } else { 
            throw new Error("Invalid response from AI. No 'html' or 'sections' data found."); 
        }
    } catch (error) {
        setAiChatHistory(prev => prev.map(entry => entry.id === historyId ? {...entry, status: 'error'} : entry));
        setModalStates(p => ({...p, alert: {isOpen: true, title: "AI Error", message: `Failed to generate content: ${error.message}`}}));
    } finally { setIsAiLoading(false); }
  };

  const handleAiAction = useCallback(async (action) => {
    if (!aiSessionId.current) {
        setModalStates(p => ({ ...p, alert: { isOpen: true, title: "AI Error", message: "AI session not started. Please try again." } }));
        return;
    }
    setIsAiLoading(true);
    try {
        const actionResponse = await apiRequest('post', `/${action}`, { session_id: aiSessionId.current });
        if (!actionResponse.data.success) {
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

  const handleCanvasMouseDown = (e) => { if (activeTool === 'hand') { isPanning.current = true; lastMousePos.current = { x: e.clientX, y: e.clientY }; e.currentTarget.style.cursor = 'grabbing'; } };
  const handleCanvasMouseMove = (e) => { if (activeTool === 'hand' && isPanning.current) { const dx = e.clientX - lastMousePos.current.x; const dy = e.clientY - lastMousePos.current.y; lastMousePos.current = { x: e.clientX, y: e.clientY }; setPanOffset(prev => ({ x: prev.x + dx, y: prev.y + dy })); } };
  const handleCanvasMouseUpOrLeave = (e) => { if (activeTool === 'hand' && isPanning.current) { isPanning.current = false; e.currentTarget.style.cursor = 'grab'; } };

  const handleAddComment = (pageId, frameName, clickPosition) => {
    if (!canvasRef.current) return;
    const canvasRect = canvasRef.current.getBoundingClientRect(); const viewX = clickPosition.x - canvasRect.left; const viewY = clickPosition.y - canvasRect.top; const transformedX = (viewX - panOffset.x) / zoom; const transformedY = (viewY - panOffset.y) / zoom;
    let frameLeftEdge = 0; const paddingLeft = 80; const gap = 80; let currentLeft = paddingLeft;
    for (const device of DEVICE_FRAMES_CONFIG) { if (frameName === device.name) { frameLeftEdge = currentLeft; break; } currentLeft += device.width + gap; }
    const paddingTop = 80; const finalX = transformedX - frameLeftEdge; const finalY = transformedY - paddingTop;
    const newComment = { id: generateId('comment'), text: 'New comment...', position: { x: finalX, y: finalY }, frame: frameName, author: 'User', createdAt: new Date().toISOString() };
    setComments(prev => ({...prev, [pageId]: [...(prev[pageId] || []), newComment]}));
  };
  const handleUpdateComment = (pageId, commentId, newText) => setComments(prev => ({ ...prev, [pageId]: prev[pageId].map(c => c.id === commentId ? { ...c, text: newText } : c) }));
  const handleDeleteComment = (pageId, commentId) => setComments(prev => ({ ...prev, [pageId]: prev[pageId].filter(c => c.id !== commentId) }));

  const activePage = pages[activePageId];
  const getCanvasCursor = () => { switch(activeTool) { case 'hand': return 'grab'; case 'comment': return 'crosshair'; default: return 'default'; } }
  const isRightPanelOpen = !!selectedItem;

  if (isPreviewMode) {
    return (<div className="flex flex-col h-screen bg-white antialiased"><TopBar onSave={handleSave} onTogglePreview={togglePreviewMode} isPreviewMode={true} onToggleLeftPanel={() => setIsLeftPanelOpen(p => !p)} onToggleFullscreen={handleToggleFullscreen} isFullscreen={isFullscreen} /><PagePreviewRenderer pageLayout={pages[activePageId]?.layout || []} globalNavbar={globalNavbar} globalFooter={globalFooter} onNavigate={handleNavigate} activePageId={activePageId} /></div>);
  }
  
  return (
    <DndContext sensors={sensors} collisionDetection={rectIntersection} onDragStart={handleDragStart} onDragEnd={handleDragEnd} disabled={isPreviewMode || activeTool !== 'select'}>
        <div ref={builderRef} className="h-screen bg-white antialiased flex flex-col relative">
            <style>{`.selected-outline { box-shadow: 0 0 0 2px #ffffff, 0 0 0 4px #22c55e; border-radius: 1.25rem; } .custom-slider { -webkit-appearance: none; appearance: none; width: 100%; height: 6px; background: #e2e8f0; border-radius: 9999px; outline: none; opacity: 0.9; transition: opacity .2s; } .custom-slider:hover { opacity: 1; } .custom-slider::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 18px; height: 18px; background: #16a34a; border-radius: 50%; cursor: pointer; border: 3px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.2); } .custom-slider::-moz-range-thumb { width: 18px; height: 18px; background: #16a34a; border-radius: 50%; cursor: pointer; border: 3px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.2); }`}</style>
            <TopBar onSave={handleSave} onTogglePreview={togglePreviewMode} isPreviewMode={false} onToggleLeftPanel={() => setIsLeftPanelOpen(p => !p)} onToggleFullscreen={handleToggleFullscreen} isFullscreen={isFullscreen} />
            <div className="flex-1 flex flex-row relative overflow-hidden z-0">
                <LeftPanel isOpen={isLeftPanelOpen} onClose={() => setIsLeftPanelOpen(false)} onAddTopLevelSection={() => handleOpenStructureModal(null, "section", activePageId)} pages={pages} activePageId={activePageId} onAddPage={handleAddPage} onSelectPage={handleSelectPage} onRenamePage={handleRenamePage} onDeletePage={handleDeletePage} onAiSubmit={handleAiSubmit} isAiLoading={isAiLoading} aiChatHistory={aiChatHistory} onSwitchToAiMode={() => {}} onSelect={handleSelect} selectedItem={selectedItem} aiSuggestions={aiSuggestions} handleUndo={handleUndo} handleRedo={handleRedo} />
                <main ref={canvasRef} className={`flex-1 flex flex-col relative bg-dots ${isAiLoading ? '' : 'overflow-auto'}`} onMouseDown={handleCanvasMouseDown} onMouseMove={handleCanvasMouseMove} onMouseUp={handleCanvasMouseUpOrLeave} onMouseLeave={handleCanvasMouseUpOrLeave} style={{ cursor: getCanvasCursor(), backgroundSize: '40px 40px', backgroundImage: 'radial-gradient(circle, #d1d5db 1px, rgba(0, 0, 0, 0) 1px)' }}>
                {isAiLoading ? ( <AiCanvasLoader /> ) : (
                    <>
                    <CanvasToolbar selectedItem={selectedItem} zoom={zoom} onZoomChange={setZoom} onSelect={handleSelect} pages={pages} activeTool={activeTool} onToolChange={setActiveTool}/>
                    <div style={{ transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoom})`, transformOrigin: "0 0", transition: isPanning.current ? 'none' : "transform 0.2s" }} className="flex-1 flex gap-20 items-start p-20" onClick={(e) => { if (e.target === e.currentTarget && activeTool === 'select') { setSelectedItem({ pageId: activePageId, path: null, type: 'page', id: null }); } }}>
                        {activePage && DEVICE_FRAMES_CONFIG.map((device) => (
                            <DeviceFrame key={device.name} device={device} page={activePage} globalNavbar={globalNavbar} globalFooter={globalFooter} onUpdateProps={handleUpdateProps} onDelete={handleDelete} onSelect={handleSelect} selectedItemId={selectedItem?.id} onOpenStructureModal={(path, type) => handleOpenStructureModal(path, type, activePage.id)} isPreviewMode={isPreviewMode} onNavigate={handleNavigate} onDeleteGlobalElement={handleDeleteGlobalElement} isDraggable={activeTool === 'select'} comments={(comments[activePageId] || []).filter(c => c.frame === device.name)} onAddComment={handleAddComment} activeTool={activeTool} />
                        ))}
                    </div>
                    </>
                )}
                </main>
                <div className={`absolute top-0 right-0 h-full transition-transform duration-300 ease-in-out z-40 transform ${isRightPanelOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                  <RightSidebar selectedItemData={selectedItem} onUpdateSelectedProps={handleUpdateProps} pages={pages} activePageId={activePageId} onRenamePage={handleRenameActivePage} onAddGlobalElement={handleAddGlobalElement} comments={comments} onUpdateComment={handleUpdateComment} onDeleteComment={handleDeleteComment} />
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