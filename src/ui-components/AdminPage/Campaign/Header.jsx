import React, { useState, useRef, useMemo, useEffect } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCenter,
  useDraggable,
  useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import img from "../../../assets/img/cards/672e98fa2d1ed0b7d1bf2adb_glass.png";
import * as LucideIcons from "lucide-react";

const StyledModalButton = ({
  children,
  onClick,
  variant = "primary",
  className = "",
}) => {
  const baseStyle =
    "px-4 py-2 flex items-center text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";
  const greenButton =
    "bg-[#2e8b57] hover:bg-green-800 text-white focus:ring-green-500";
  const variantStyles = {
    primary: greenButton,
    secondary:
      "bg-slate-100 hover:bg-slate-200 text-slate-700 focus:ring-slate-400",
    danger: "bg-red-600 hover:bg-red-700 text-white focus:ring-red-500",
  };
  return (
    <button
      onClick={onClick}
      className={`${baseStyle} ${variantStyles[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

function GeneralModal({ isOpen, onClose, title, children, size = "md" }) {
  if (!isOpen) return null;
  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
  };
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[200] p-4 print-hidden">
      <div
        className={`bg-white p-5 sm:p-6 rounded-xl shadow-2xl w-full ${
          sizeClasses[size] || sizeClasses.md
        }`}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-slate-800">{title}</h3>
          {onClose && (
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-full hover:bg-slate-100"
            >
              <LucideIcons.X className="w-6 h-6" />
            </button>
          )}
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
}

function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmButtonVariant = "primary",
}) {
  if (!isOpen) return null;
  return (
    <GeneralModal isOpen={isOpen} onClose={onClose} title={title}>
      <p className="text-sm text-slate-600 mb-6">{message}</p>
      <div className="flex justify-end space-x-3">
        <StyledModalButton onClick={onClose} variant="secondary">
          {cancelText}
        </StyledModalButton>
        <StyledModalButton
          onClick={() => {
            onConfirm();
            onClose();
          }}
          variant={confirmButtonVariant}
        >
          {confirmText}
        </StyledModalButton>
      </div>
    </GeneralModal>
  );
}

function InputModal({
  isOpen,
  onClose,
  onSubmit,
  title,
  message,
  inputLabel,
  initialValue = "",
  placeholder = "",
  submitText = "Submit",
  cancelText = "Cancel",
}) {
  const [inputValue, setInputValue] = React.useState(initialValue);
  React.useEffect(() => {
    if (isOpen) {
      setInputValue(initialValue);
    }
  }, [isOpen, initialValue]);
  const handleSubmit = () => {
    onSubmit(inputValue);
    onClose();
  };
  if (!isOpen) return null;
  return (
    <GeneralModal isOpen={isOpen} onClose={onClose} title={title}>
      {message && <p className="text-sm text-slate-600 mb-3">{message}</p>}
      <label
        htmlFor="input-modal-field"
        className="block text-sm font-medium text-slate-700 mb-2"
      >
        {inputLabel}
      </label>
      <input
        id="input-modal-field"
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-base focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-shadow shadow-sm"
      />
      <div className="flex justify-end space-x-3 mt-6">
        <StyledModalButton onClick={onClose} variant="secondary">
          {cancelText}
        </StyledModalButton>
        <StyledModalButton onClick={handleSubmit} variant="primary">
          {submitText}
        </StyledModalButton>
      </div>
    </GeneralModal>
  );
}

function CustomDropdown({
  options,
  value,
  onChange,
  placeholder = "Select an option",
  label,
  disabled = false,
  idSuffix = "",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const selectedOption = options.find((opt) => opt.value === value);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target))
        setIsOpen(false);
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
      {label && (
        <label className="block text-xs font-medium text-slate-700 mb-1">
          {label}
        </label>
      )}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-shadow shadow-sm bg-white text-left flex justify-between items-center ${
          disabled ? "bg-slate-100 cursor-not-allowed" : "cursor-pointer"
        }`}
      >
        <span className={selectedOption ? "text-slate-800" : "text-slate-500"}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <LucideIcons.ChevronDown
          className={`w-5 h-5 text-slate-500 transition-transform ${
            isOpen ? "transform rotate-180" : ""
          }`}
        />
      </button>
      {isOpen && !disabled && (
        <ul className="absolute z-20 mt-1 w-full bg-white border border-slate-300 rounded-lg shadow-lg max-h-60 overflow-auto py-1 text-sm">
          {options.map((opt) => (
            <li
              key={`${opt.value}-${idSuffix}`}
              onClick={() => handleSelect(opt.value)}
              className={`px-4 py-2 hover:bg-green-50 cursor-pointer ${
                opt.value === value
                  ? "bg-green-100 text-green-800 font-semibold"
                  : "text-slate-700"
              }`}
            >
              {opt.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function generateId(prefix = "id") {
  return `${prefix}-${Date.now()}-${Math.random()
    .toString(36)
    .substring(2, 9)}`;
}
const textSizeOptions = [
  { label: "Tiny", value: "text-xs" },
  { label: "Small", value: "text-sm" },
  { label: "Base", value: "text-base" },
  { label: "Large", value: "text-lg" },
  { label: "XL", value: "text-xl" },
  { label: "2XL", value: "text-2xl" },
  { label: "3XL", value: "text-3xl" },
  { label: "4XL", value: "text-4xl" },
  { label: "5XL", value: "text-5xl" },
  { label: "6XL", value: "text-6xl" },
];
const fontWeightOptions = [
  { label: "Light", value: "font-light" },
  { label: "Normal", value: "font-normal" },
  { label: "Medium", value: "font-medium" },
  { label: "Semibold", value: "font-semibold" },
  { label: "Bold", value: "font-bold" },
  { label: "Extrabold", value: "font-extrabold" },
];
const textAlignOptions = [
  {
    label: "Left",
    value: "text-left",
    icon: <LucideIcons.AlignLeft className="w-5 h-5" />,
  },
  {
    label: "Center",
    value: "text-center",
    icon: <LucideIcons.AlignCenter className="w-5 h-5" />,
  },
  {
    label: "Right",
    value: "text-right",
    icon: <LucideIcons.AlignRight className="w-5 h-5" />,
  },
];
function getItemByPath(obj, pathString) {
  const path = pathString
    .replace(/\[(\w+)\]/g, ".$1")
    .replace(/^\./, "")
    .split(".");
  let current = obj;
  for (const key of path) {
    if (
      current &&
      typeof current === "object" &&
      (key in current || (Array.isArray(current) && !isNaN(parseInt(key))))
    ) {
      current = current[key];
    } else {
      return undefined;
    }
  }
  return current;
}
function deleteItemByPath(obj, pathString) {
  const path = pathString
    .replace(/\[(\w+)\]/g, ".$1")
    .replace(/^\./, "")
    .split(".");
  let current = obj;
  for (let i = 0; i < path.length - 1; i++) {
    if (
      current &&
      typeof current === "object" &&
      (path[i] in current ||
        (Array.isArray(current) && !isNaN(parseInt(path[i]))))
    ) {
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
        const found = findItemAndPathRecursive(
          item.columns,
          targetId,
          `${itemPath}.columns`
        );
        if (found) return found;
      }
      if (item.elements) {
        const found = findItemAndPathRecursive(
          item.elements,
          targetId,
          `${itemPath}.elements`
        );
        if (found) return found;
      }
    }
  }
  return null;
}

function Heading({
  text = "Default Heading Title",
  onUpdate,
  isSelected,
  sizeClass,
  fontWeight,
  textAlign,
  textColor,
  isPreviewMode,
}) {
  const handleBlur = (e) => {
    if (onUpdate && !isPreviewMode)
      onUpdate({ text: e.currentTarget.innerText });
  };
  return (
    <div
      className={`p-2 ${
        !isPreviewMode
          ? `rounded-lg ${
              isSelected
                ? "ring-2 ring-green-500 ring-offset-2 bg-green-50/70"
                : "hover:ring-1 hover:ring-green-300/70"
            }`
          : ""
      }`}
    >
      <h1
        style={{ color: textColor || undefined }}
        className={`${sizeClass || "text-2xl"} ${fontWeight || "font-bold"} ${
          textAlign || "text-left"
        } ${!textColor ? "text-slate-800" : ""} ${
          !isPreviewMode
            ? "focus:outline-none focus:ring-1 focus:ring-green-400 focus:bg-white p-1 -m-1 rounded-lg"
            : ""
        } transition-all`}
        contentEditable={!isPreviewMode}
        suppressContentEditableWarning
        onBlur={handleBlur}
        dangerouslySetInnerHTML={{ __html: text }}
      ></h1>
    </div>
  );
}
function TextBlock({
  text = "Lorem ipsum dolor sit amet...",
  onUpdate,
  isSelected,
  sizeClass,
  fontWeight,
  textAlign,
  textColor,
  isPreviewMode,
}) {
  const handleBlur = (e) => {
    if (onUpdate && !isPreviewMode)
      onUpdate({ text: e.currentTarget.innerText });
  };
  return (
    <div
      className={`p-2 ${
        !isPreviewMode
          ? `rounded-lg ${
              isSelected
                ? "ring-2 ring-green-500 ring-offset-2 bg-green-50/70"
                : "hover:ring-1 hover:ring-green-300/70"
            }`
          : ""
      }`}
    >
      <p
        style={{ color: textColor || undefined }}
        className={`${sizeClass || "text-base"} ${
          fontWeight || "font-normal"
        } ${textAlign || "text-left"} ${
          !textColor ? "text-slate-700" : ""
        } leading-relaxed ${
          !isPreviewMode
            ? "focus:outline-none focus:ring-1 focus:ring-green-400 focus:bg-white p-1 -m-1 rounded-lg whitespace-pre-wrap"
            : "whitespace-pre-wrap"
        } transition-all`}
        contentEditable={!isPreviewMode}
        suppressContentEditableWarning
        onBlur={handleBlur}
        dangerouslySetInnerHTML={{ __html: text }}
      ></p>
    </div>
  );
}
function ImageElement({
  src = img,
  alt = "Placeholder",
  width = "100%",
  height = "auto",
  borderRadius = "8px",
  boxShadow = "none",
  isSelected,
  isPreviewMode,
}) {
  const getStyleValue = (v) =>
    v === "auto" || (typeof v === "string" && v.endsWith("%"))
      ? v
      : `${parseInt(v, 10) || "auto"}px`;
  return (
    <div
      className={`p-1 ${
        !isPreviewMode
          ? `rounded-lg ${
              isSelected
                ? "ring-2 ring-green-500 ring-offset-2"
                : "hover:ring-1 hover:ring-green-300/70"
            }`
          : ""
      }`}
    >
      <img
        src={src}
        alt={alt}
        className={`max-w-full h-auto block mx-auto transition-all`}
        style={{
          width: getStyleValue(width),
          height: getStyleValue(height),
          minHeight: "50px",
          objectFit: "cover",
          borderRadius: borderRadius,
          boxShadow: boxShadow,
        }}
      />
    </div>
  );
}
function ButtonElement({
  buttonText = "Click Me",
  link = "#",
  onUpdate,
  isSelected,
  sizeClass,
  textAlign,
  backgroundColor = "#16a34a",
  textColor = "#ffffff",
  borderRadius = "8px",
  variant = "solid",
  fullWidth = false,
  isPreviewMode,
  onNavigate,
}) {
  const handleTextBlur = (e) => {
    if (onUpdate && !isPreviewMode)
      onUpdate({ buttonText: e.currentTarget.innerText });
  };
  const solidStyle = {
    backgroundColor: backgroundColor,
    color: textColor,
    borderRadius: borderRadius,
    border: "2px solid transparent",
  };
  const outlineStyle = {
    backgroundColor: "transparent",
    color: backgroundColor,
    borderRadius: borderRadius,
    border: `2px solid ${backgroundColor}`,
  };
  const buttonStyle = variant === "outline" ? outlineStyle : solidStyle;
  const handleClick = (e) => {
    if (!isPreviewMode) {
      e.preventDefault();
      return;
    }
    if (link && link.startsWith("/")) {
      e.preventDefault();
      if (onNavigate) onNavigate(link.substring(1));
    } else if (link === "#") {
      e.preventDefault();
    }
  };
  return (
    <div
      className={`py-3 px-2 ${textAlign || "text-center"} ${
        !isPreviewMode && isSelected
          ? "ring-2 ring-green-500 ring-offset-2 rounded-xl"
          : ""
      }`}
    >
      <a
        href={link}
        onClick={handleClick}
        target={
          isPreviewMode && link && !link.startsWith("/") && link !== "#"
            ? "_blank"
            : "_self"
        }
        rel={
          isPreviewMode && link && !link.startsWith("/") && link !== "#"
            ? "noopener noreferrer"
            : ""
        }
        className={`inline-block px-6 py-3 font-semibold shadow-md hover:opacity-90 transition-all ${
          sizeClass || "text-base"
        } ${fullWidth ? "w-full" : "w-auto"}`}
        style={buttonStyle}
      >
        <span
          contentEditable={!isPreviewMode}
          suppressContentEditableWarning
          onBlur={handleTextBlur}
          dangerouslySetInnerHTML={{ __html: buttonText }}
          className={`${
            !isPreviewMode
              ? "focus:outline-none focus:ring-1 focus:ring-white/50 p-0.5 -m-0.5 rounded-sm"
              : ""
          }`}
        ></span>
      </a>
    </div>
  );
}
function Divider({ isSelected, isPreviewMode }) {
  return (
    <div
      className={`py-4 px-1 ${
        !isPreviewMode && isSelected
          ? "ring-2 ring-green-500 ring-offset-1 rounded-xl"
          : ""
      }`}
    >
      <hr className="border-t border-slate-300" />
    </div>
  );
}
function Spacer({ height = "20px", onUpdate, isSelected, isPreviewMode }) {
  return (
    <div
      style={{ height }}
      className={`w-full transition-all ${
        !isPreviewMode && isSelected
          ? "bg-green-100/80 ring-2 ring-green-500 ring-offset-1"
          : !isPreviewMode
          ? "bg-transparent hover:bg-slate-200/50"
          : ""
      }`}
    ></div>
  );
}
function IconElement({
  iconName = "Star",
  size = "32px",
  color = "currentColor",
  onUpdate,
  isSelected,
  isPreviewMode,
}) {
  const IconComponent = LucideIcons[iconName] || LucideIcons.HelpCircle;
  const ActualIconComponent = IconComponent || LucideIcons.HelpCircle;
  return (
    <div
      className={`p-2 flex justify-center items-center ${
        !isPreviewMode && isSelected
          ? "ring-2 ring-green-500 ring-offset-1 rounded-xl"
          : ""
      }`}
    >
      <ActualIconComponent
        style={{ fontSize: size, color: color }}
        strokeWidth={color === "currentColor" ? 1.75 : 2}
      />
    </div>
  );
}
function GoogleMapsPlaceholder({
  address = "1600 Amphitheatre Parkway, Mountain View, CA",
  zoom = 14,
  onUpdate,
  isSelected,
  isPreviewMode,
}) {
  return (
    <div
      className={`p-3 rounded-xl ${
        !isPreviewMode
          ? `${
              isSelected
                ? "ring-2 ring-green-500 ring-offset-2 bg-green-50/70"
                : "bg-slate-100 border border-slate-200 hover:border-green-300"
            }`
          : "bg-slate-100 border border-slate-200"
      } aspect-video flex flex-col items-center justify-center text-center`}
    >
      <LucideIcons.MapPin className="h-12 w-12 text-slate-400 mb-2" />
      <p className="text-sm font-medium text-slate-600">{address}</p>
      <p className="text-xs text-slate-500 mt-0.5">
        Maps Placeholder (Zoom: {zoom})
      </p>
    </div>
  );
}
function VideoElement({
  videoType = "mp4",
  src,
  width = "100%",
  height = "auto",
  controls = true,
  autoplay = false,
  loop = false,
  muted = true,
  isSelected,
  isPreviewMode,
}) {
  const getYouTubeEmbedUrl = (videoId) =>
    `https://www.youtube.com/embed/${videoId}?autoplay=${
      autoplay ? 1 : 0
    }&loop=${loop ? 1 : 0}&mute=${muted ? 1 : 0}&controls=${controls ? 1 : 0}${
      loop ? `&playlist=${videoId}` : ""
    }`;
  const getVimeoEmbedUrl = (videoId) =>
    `https://player.vimeo.com/video/${videoId}?autoplay=${
      autoplay ? 1 : 0
    }&loop=${loop ? 1 : 0}&muted=${muted ? 1 : 0}&controls=${controls ? 1 : 0}`;
  const effectiveHeight =
    height === "auto"
      ? "auto"
      : parseInt(height)
      ? `${parseInt(height)}px`
      : "300px";
  const effectiveWidth =
    width === "auto"
      ? "auto"
      : parseInt(width) || (typeof width === "string" && width.endsWith("%"))
      ? width
      : "100%";
  const renderVideo = () => {
    if (!src)
      return (
        <div className="p-4 text-center text-slate-500 aspect-video flex items-center justify-center bg-slate-100 rounded-lg border border-slate-200">
          Video source not configured.
        </div>
      );
    switch (videoType) {
      case "youtube":
        return (
          <iframe
            src={getYouTubeEmbedUrl(src)}
            style={{ width: effectiveWidth, height: effectiveHeight }}
            frameBorder="0"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            title="YouTube Video"
            className="block mx-auto rounded-lg"
          ></iframe>
        );
      case "vimeo":
        return (
          <iframe
            src={getVimeoEmbedUrl(src)}
            style={{ width: effectiveWidth, height: effectiveHeight }}
            frameBorder="0"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            title="Vimeo Video"
            className="block mx-auto rounded-lg"
          ></iframe>
        );
      case "mp4":
      default:
        return (
          <video
            src={src}
            style={{ width: effectiveWidth, height: effectiveHeight }}
            controls={controls}
            autoPlay={autoplay}
            loop={loop}
            muted={muted}
            playsInline
            className="block mx-auto bg-black rounded-lg"
          ></video>
        );
    }
  };
  return (
    <div
      className={`p-1 ${
        !isPreviewMode
          ? `rounded-xl ${
              isSelected
                ? "ring-2 ring-green-500 ring-offset-2"
                : "hover:ring-1 hover:ring-green-300/70"
            }`
          : ""
      }`}
    >
      {renderVideo()}
    </div>
  );
}
function InnerSectionComponentDisplay({
  sectionData,
  onOpenStructureModal,
  onSelect,
  isSelected,
  onUpdateProps,
  onDelete,
  selectedItemId,
  isPreviewMode,
}) {
  const hasColumns = sectionData.columns && sectionData.columns.length > 0;
  const ownPath = sectionData.path;
  if (!hasColumns) {
    return (
      <div
        onClick={(e) => {
          if (!isPreviewMode) {
            e.stopPropagation();
            onSelect(sectionData.id, "element", ownPath);
          }
        }}
        className={`p-4 min-h-[80px] flex flex-col items-center justify-center ${
          !isPreviewMode
            ? `rounded-xl border-2 border-dashed ${
                isSelected
                  ? "border-green-500 bg-green-50/80"
                  : "border-slate-300 bg-slate-100/80 hover:border-green-400 hover:bg-green-50/50"
              } cursor-pointer transition-all`
            : ""
        }`}
      >
        <LucideIcons.Rows3 className="h-8 w-8 text-slate-400 mb-2" />
        {!isPreviewMode && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenStructureModal(ownPath, "innerSection");
            }}
            className="px-3 py-1.5 bg-[#2e8b57] text-white text-xs font-medium rounded-lg hover:bg-green-700 transition-colors"
          >
            Set Inner Structure
          </button>
        )}
      </div>
    );
  }
  return (
    <div
      onClick={(e) => {
        if (!isPreviewMode) {
          e.stopPropagation();
          onSelect(sectionData.id, "element", ownPath);
        }
      }}
      className={`p-1 ${
        !isPreviewMode
          ? `border rounded-xl ${
              isSelected
                ? "border-green-500 bg-green-50/50"
                : "border-slate-200 hover:border-green-300/70"
            }`
          : ""
      }`}
    >
      <div className="flex flex-wrap -m-0.5">
        {sectionData.columns.map((col, colIdx) => (
          <ColumnComponent
            key={col.id}
            parentPath={ownPath}
            columnData={col}
            columnIndex={colIdx}
            onUpdateProps={onUpdateProps}
            onDelete={onDelete}
            onSelect={onSelect}
            selectedItemId={selectedItemId}
            onOpenStructureModal={onOpenStructureModal}
            isInner={true}
            isPreviewMode={isPreviewMode}
          />
        ))}
      </div>
    </div>
  );
}
function CardSliderElement({
  slides = [],
  slidesPerView = 3,
  spaceBetween = 16,
  speed = 500,
  autoplay = false,
  autoplayDelay = 3000,
  loop = false,
  showNavigation = true,
  showPagination = true,
  cardBorderRadius = "8px",
  onUpdate,
  isSelected,
  isPreviewMode,
  onNavigate,
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const timeoutRef = useRef(null);
  const sliderWrapperRef = useRef(null);
  const totalSlides = slides.length;
  const effectiveSlidesPerView = Math.min(
    slidesPerView,
    totalSlides > 0 ? totalSlides : slidesPerView
  );
  const resetTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };
  useEffect(() => {
    resetTimeout();
    if (autoplay && totalSlides > effectiveSlidesPerView && isPreviewMode) {
      timeoutRef.current = setTimeout(() => {
        setCurrentIndex((prevIndex) => {
          const nextIndex = prevIndex + 1;
          if (loop) {
            return nextIndex % totalSlides;
          }
          return Math.min(nextIndex, totalSlides - effectiveSlidesPerView);
        });
      }, autoplayDelay);
    }
    return () => resetTimeout();
  }, [
    currentIndex,
    autoplay,
    autoplayDelay,
    loop,
    totalSlides,
    effectiveSlidesPerView,
    isPreviewMode,
  ]);
  const goToSlide = (index) => {
    let newIndex = index;
    if (loop) {
      if (index < 0) newIndex = totalSlides - 1;
      else if (index >= totalSlides) newIndex = 0;
    } else {
      newIndex = Math.max(
        0,
        Math.min(index, totalSlides - effectiveSlidesPerView)
      );
    }
    setCurrentIndex(newIndex);
  };
  const handlePrev = () => goToSlide(currentIndex - 1);
  const handleNext = () => goToSlide(currentIndex + 1);
  const handleCardTextUpdate = (slideIndex, field, newText) => {
    if (onUpdate && !isPreviewMode) {
      const newSlides = slides.map((slide, idx) =>
        idx === slideIndex ? { ...slide, [field]: newText } : slide
      );
      onUpdate({ slides: newSlides });
    }
  };
  if (totalSlides === 0 && !isPreviewMode) {
    return (
      <div
        className={`p-4 min-h-[150px] flex flex-col items-center justify-center text-center border-2 border-dashed rounded-xl ${
          isSelected
            ? "border-green-500 bg-green-50/70"
            : "border-slate-300 bg-slate-100/80"
        }`}
      >
        <LucideIcons.GalleryHorizontalEnd className="h-12 w-12 text-slate-400 mb-3" />
        <p className="text-sm font-medium text-slate-600">Card Slider</p>
        <p className="text-xs text-slate-500">
          Add slides in the Properties Panel.
        </p>
      </div>
    );
  }
  if (totalSlides === 0 && isPreviewMode) return null;
  return (
    <div
      className={`p-2 relative ${
        !isPreviewMode && isSelected
          ? "ring-2 ring-green-500 ring-offset-2 rounded-xl"
          : ""
      }`}
    >
      <div className="overflow-hidden relative">
        <div
          ref={sliderWrapperRef}
          className="flex transition-transform duration-500 ease-in-out"
          style={{
            transform: `translateX(-${
              currentIndex * (100 / effectiveSlidesPerView)
            }%)`,
            transitionDuration: `${speed}ms`,
          }}
        >
          {slides.map((slide, index) => (
            <div
              key={slide.id || index}
              className="flex-shrink-0 w-full"
              style={{
                width: `${100 / effectiveSlidesPerView}%`,
                paddingLeft: `${spaceBetween / 2}px`,
                paddingRight: `${spaceBetween / 2}px`,
              }}
            >
              <div
                className="bg-white shadow-lg p-4 flex flex-col h-full"
                style={{ borderRadius: cardBorderRadius }}
              >
                {slide.imgSrc && (
                  <img
                    src={slide.imgSrc}
                    alt={slide.heading || `Slide ${index + 1}`}
                    className="w-full h-40 object-cover mb-3"
                    style={{ borderRadius: `calc(${cardBorderRadius} - 4px)` }}
                  />
                )}
                <h3
                  className={`text-lg font-semibold mb-1 ${
                    !isPreviewMode
                      ? "focus:outline-none focus:ring-1 focus:ring-green-400 p-0.5 -m-0.5 rounded-lg"
                      : ""
                  }`}
                  contentEditable={!isPreviewMode}
                  suppressContentEditableWarning
                  onBlur={(e) =>
                    handleCardTextUpdate(
                      index,
                      "heading",
                      e.currentTarget.innerText
                    )
                  }
                  dangerouslySetInnerHTML={{
                    __html: slide.heading || `Slide ${index + 1}`,
                  }}
                ></h3>
                <p
                  className={`text-sm text-slate-600 flex-grow ${
                    !isPreviewMode
                      ? "focus:outline-none focus:ring-1 focus:ring-green-400 p-0.5 -m-0.5 rounded-lg whitespace-pre-wrap"
                      : "whitespace-pre-wrap"
                  }`}
                  contentEditable={!isPreviewMode}
                  suppressContentEditableWarning
                  onBlur={(e) =>
                    handleCardTextUpdate(
                      index,
                      "text",
                      e.currentTarget.innerText
                    )
                  }
                  dangerouslySetInnerHTML={{
                    __html: slide.text || "Slide content goes here.",
                  }}
                ></p>
                {slide.link && isPreviewMode && (
                  <a
                    href={slide.link}
                    onClick={(e) => {
                      if (slide.link.startsWith("/")) {
                        e.preventDefault();
                        if (onNavigate) onNavigate(slide.link.substring(1));
                      } else if (slide.link === "#") {
                        e.preventDefault();
                      }
                    }}
                    target={
                      !slide.link.startsWith("/") && slide.link !== "#"
                        ? "_blank"
                        : "_self"
                    }
                    rel={
                      !slide.link.startsWith("/") && slide.link !== "#"
                        ? "noopener noreferrer"
                        : ""
                    }
                    className="mt-auto pt-2 text-green-600 hover:text-green-700 text-sm font-medium self-start"
                  >
                    Learn More
                    <LucideIcons.ArrowRight className="inline w-4 h-4" />
                  </a>
                )}
                {!isPreviewMode && slide.link && (
                  <span className="mt-auto pt-2 text-green-600 text-sm font-medium self-start">
                    Link: {slide.link}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      {showNavigation && totalSlides > effectiveSlidesPerView && (
        <>
          <button
            onClick={handlePrev}
            disabled={!loop && currentIndex === 0}
            className="absolute top-1/2 left-0 transform -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-2 rounded-full z-10 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
            aria-label="Previous slide"
          >
            <LucideIcons.ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={handleNext}
            disabled={
              !loop && currentIndex >= totalSlides - effectiveSlidesPerView
            }
            className="absolute top-1/2 right-0 transform -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-2 rounded-full z-10 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
            aria-label="Next slide"
          >
            <LucideIcons.ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}
      {showPagination && totalSlides > effectiveSlidesPerView && (
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 flex space-x-2 p-2">
          {Array.from({
            length: loop
              ? totalSlides
              : Math.max(1, totalSlides - effectiveSlidesPerView + 1),
          }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => goToSlide(idx)}
              className={`w-2.5 h-2.5 rounded-full ${
                currentIndex === idx
                  ? "bg-[#2e8b57] scale-125"
                  : "bg-slate-300 hover:bg-slate-400"
              } transition-all`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
function NavbarElement({
  logoType = "text",
  logoText = "MySite",
  logoSrc = img,
  links = [],
  rightContentType = "none",
  backgroundColor = "#ffffff",
  textColor = "#334155",
  linkColor = "#16a34a",
  isSelected,
  isPreviewMode,
  onUpdate,
  onNavigate,
  onSelect,
  onDelete,
  path,
  previewDevice,
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navStyle = { backgroundColor };
  const textStyle = { color: textColor };
  const linkStyle = { color: linkColor };
  const forceMobileLayout =
    isPreviewMode && (previewDevice === "mobile" || previewDevice === "tablet");
  const handleLinkClick = (e, linkUrl) => {
    if (isMobileMenuOpen) setIsMobileMenuOpen(false);
    if (!isPreviewMode) {
      e.preventDefault();
      return;
    }
    if (linkUrl && linkUrl.startsWith("/")) {
      e.preventDefault();
      if (onNavigate) onNavigate(linkUrl.substring(1));
    } else if (linkUrl === "#") {
      e.preventDefault();
    }
  };
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  const handleClick = (e) => {
    if (!isPreviewMode && onSelect) {
      e.stopPropagation();
      onSelect();
    }
  };
  return (
    <div
      onClick={handleClick}
      className={`p-1 relative group ${
        !isPreviewMode && isSelected
          ? "ring-2 ring-green-500 ring-offset-1 rounded-xl"
          : !isPreviewMode && path
          ? "hover:ring-1 hover:ring-green-300/70 rounded-xl"
          : ""
      }`}
    >
      <nav
        style={navStyle}
        className="relative px-4 sm:px-6 py-4 shadow-md rounded-xl"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {logoType === "image" && logoSrc ? (
              <img
                src={logoSrc}
                alt={logoText || "Logo"}
                className="h-9 sm:h-10 w-auto mr-4 rounded-sm object-contain"
              />
            ) : (
              <a
                href={
                  isPreviewMode
                    ? links.find((l) => l.text.toLowerCase() === "home")?.url ||
                      "/home"
                    : "#"
                }
                onClick={(e) =>
                  handleLinkClick(
                    e,
                    links.find((l) => l.text.toLowerCase() === "home")?.url ||
                      "/home"
                  )
                }
                style={textStyle}
                className="text-xl lg:text-2xl font-bold hover:opacity-80 transition-opacity"
              >
                {logoText}
              </a>
            )}
          </div>
          <div
            className={`${
              forceMobileLayout ? "hidden" : "hidden md:flex"
            } items-center`}
          >
            <div className="flex items-center space-x-5 lg:space-x-8">
              {links.map((link, index) => (
                <a
                  key={link.id || index}
                  href={link.url}
                  onClick={(e) => handleLinkClick(e, link.url)}
                  target={
                    isPreviewMode &&
                    link.target === "_blank" &&
                    link.url &&
                    !link.url.startsWith("/")
                      ? "_blank"
                      : "_self"
                  }
                  rel={
                    isPreviewMode &&
                    link.target === "_blank" &&
                    link.url &&
                    !link.url.startsWith("/")
                      ? "noopener noreferrer"
                      : ""
                  }
                  style={linkStyle}
                  className="text-sm font-medium hover:opacity-80 transition-opacity"
                >
                  {link.text}
                </a>
              ))}
            </div>
            {(rightContentType === "userIcon" ||
              rightContentType === "searchIcon") && (
              <div className="flex items-center ml-6">
                {rightContentType === "userIcon" && (
                  <LucideIcons.CircleUserRound
                    style={linkStyle}
                    className="h-6 w-6"
                  />
                )}
                {rightContentType === "searchIcon" && (
                  <LucideIcons.Search style={linkStyle} className="h-5 w-5" />
                )}
              </div>
            )}
          </div>
          <div
            className={`${
              forceMobileLayout ? "flex" : "md:hidden flex"
            } items-center`}
          >
            {rightContentType === "userIcon" && (
              <LucideIcons.CircleUserRound
                style={linkStyle}
                className="h-6 w-6 mr-3"
              />
            )}
            {rightContentType === "searchIcon" && (
              <LucideIcons.Search style={linkStyle} className="h-5 w-5 mr-3" />
            )}
            <button
              onClick={toggleMobileMenu}
              style={linkStyle}
              aria-label="Toggle menu"
              className="p-1"
            >
              {isMobileMenuOpen ? (
                <LucideIcons.X className="h-7 w-7" />
              ) : (
                <LucideIcons.Menu className="h-7 w-7" />
              )}
            </button>
          </div>
        </div>
        {isMobileMenuOpen && (
          <div
            className="absolute top-full left-0 right-0 z-50 mt-1 rounded-b-xl shadow-lg transition transform origin-top animate-fadeInDown"
            style={navStyle}
          >
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {links.map((link, index) => (
                <a
                  key={link.id || index}
                  href={link.url}
                  onClick={(e) => handleLinkClick(e, link.url)}
                  target={
                    isPreviewMode &&
                    link.target === "_blank" &&
                    link.url &&
                    !link.url.startsWith("/")
                      ? "_blank"
                      : "_self"
                  }
                  rel={
                    isPreviewMode &&
                    link.target === "_blank" &&
                    link.url &&
                    !link.url.startsWith("/")
                      ? "noopener noreferrer"
                      : ""
                  }
                  style={linkStyle}
                  className="block px-3 py-3 rounded-lg text-base font-medium hover:bg-white/10 hover:opacity-80 transition-colors"
                >
                  {link.text}
                </a>
              ))}
            </div>
          </div>
        )}
        {!isPreviewMode && links.length === 0 && (
          <div className="hidden md:block text-xs text-slate-400 mt-2 text-center">
            Navbar: Edit properties to add links
          </div>
        )}
      </nav>
      {!isPreviewMode && isSelected && onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          title="Remove Global Navbar"
          className="absolute -top-2.5 -right-2.5 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 hover:scale-110 transition-all w-7 h-7 flex items-center justify-center shadow-md z-30 print-hidden"
        >
          <LucideIcons.X className="w-4 h-4" strokeWidth={3} />
        </button>
      )}
    </div>
  );
}
function FooterElement({
  copyrightText = `© ${new Date().getFullYear()} MySite. All rights reserved.`,
  links = [],
  backgroundColor = "#f1f5f9",
  textColor = "#64748b",
  linkColor = "#16a34a",
  isSelected,
  isPreviewMode,
  onUpdate,
  onNavigate,
  onSelect,
  onDelete,
  path,
}) {
  const footerStyle = { backgroundColor };
  const textStyle = { color: textColor };
  const linkStyle = { color: linkColor };
  const handleLinkClick = (e, linkUrl) => {
    if (!isPreviewMode) {
      e.preventDefault();
      return;
    }
    if (linkUrl && linkUrl.startsWith("/")) {
      e.preventDefault();
      if (onNavigate) onNavigate(linkUrl.substring(1));
    } else if (linkUrl === "#") {
      e.preventDefault();
    }
  };
  const handleClick = (e) => {
    if (!isPreviewMode && onSelect) {
      e.stopPropagation();
      onSelect();
    }
  };
  return (
    <div
      onClick={handleClick}
      className={`p-1 relative group ${
        !isPreviewMode && isSelected
          ? "ring-2 ring-green-500 ring-offset-1 rounded-xl"
          : !isPreviewMode && path
          ? "hover:ring-1 hover:ring-green-300/70 rounded-xl"
          : ""
      }`}
    >
      <footer
        style={footerStyle}
        className="px-6 py-10 text-center border-t border-slate-200/80 rounded-xl"
      >
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-8 mb-6">
            {links.map((link, index) => (
              <a
                key={link.id || index}
                href={link.url}
                onClick={(e) => handleLinkClick(e, link.url)}
                target={
                  isPreviewMode &&
                  link.target === "_blank" &&
                  link.url &&
                  !link.url.startsWith("/")
                    ? "_blank"
                    : "_self"
                }
                rel={
                  isPreviewMode &&
                  link.target === "_blank" &&
                  link.url &&
                  !link.url.startsWith("/")
                    ? "noopener noreferrer"
                    : ""
                }
                style={linkStyle}
                className="text-sm sm:text-base hover:underline"
              >
                {link.text}
              </a>
            ))}
          </div>
          <p style={textStyle} className="text-sm sm:text-base">
            {copyrightText}
          </p>
        </div>
      </footer>
      {!isPreviewMode && isSelected && onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          title="Remove Global Footer"
          className="absolute -top-2.5 -right-2.5 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 hover:scale-110 transition-all w-7 h-7 flex items-center justify-center shadow-md z-30 print-hidden"
        >
          <LucideIcons.X className="w-4 h-4" strokeWidth={3} />
        </button>
      )}
    </div>
  );
}

const ALL_ELEMENT_TYPES = {
  Heading,
  TextBlock,
  ImageElement,
  ButtonElement,
  Divider,
  Spacer,
  IconElement,
  GoogleMapsPlaceholder,
  VideoElement,
  InnerSectionComponentDisplay,
  NavbarElement,
  FooterElement,
  CardSliderElement,
};
const AVAILABLE_ELEMENTS_CONFIG = [
  {
    id: "header",
    name: "Heading",
    component: "Heading",
    defaultProps: {
      text: "Powerful Headline Here",
      sizeClass: "text-4xl",
      fontWeight: "font-bold",
      textAlign: "text-left",
      textColor: "#1e293b",
    },
  },
  {
    id: "textBlock",
    name: "Paragraph",
    component: "TextBlock",
    defaultProps: {
      text: "This is a paragraph. You can edit this text to share information, tell a story, or describe your products and services. Make it engaging and easy to read.",
      sizeClass: "text-base",
      fontWeight: "font-normal",
      textAlign: "text-left",
      textColor: "#475569",
    },
  },
  {
    id: "image",
    name: "Image",
    component: "ImageElement",
    defaultProps: {
      src: img,
      alt: "Placeholder Image",
      width: "100%",
      height: "auto",
      borderRadius: "12px",
      boxShadow:
        "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
    },
  },
  {
    id: "button",
    name: "Button",
    component: "ButtonElement",
    defaultProps: {
      buttonText: "Get Started",
      link: "#",
      sizeClass: "text-base",
      textAlign: "text-center",
      backgroundColor: "#16a34a",
      textColor: "#ffffff",
      borderRadius: "9999px",
      variant: "solid",
      fullWidth: false,
    },
  },
  { id: "divider", name: "Divider", component: "Divider", defaultProps: {} },
  {
    id: "spacer",
    name: "Spacer",
    component: "Spacer",
    defaultProps: { height: "40px" },
  },
  {
    id: "icon",
    name: "Icon",
    component: "IconElement",
    defaultProps: { iconName: "Rocket", size: "48px", color: "#16a34a" },
  },
  {
    id: "googleMaps",
    name: "Google Maps",
    component: "GoogleMapsPlaceholder",
    defaultProps: { address: "New York, NY", zoom: 14 },
  },
  {
    id: "video",
    name: "Video",
    component: "VideoElement",
    defaultProps: {
      videoType: "mp4",
      src: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
      width: "100%",
      height: "300px",
      controls: true,
      autoplay: false,
      loop: false,
      muted: true,
    },
  },
  {
    id: "innerSection",
    name: "Inner Section",
    component: "InnerSectionComponentDisplay",
    defaultProps: {},
    isContainer: true,
    hasOwnColumns: true,
  },
  {
    id: "cardSlider",
    name: "Card Slider",
    component: "CardSliderElement",
    defaultProps: {
      slides: [
        {
          id: generateId("slide"),
          imgSrc: img,
          heading: "Feature One",
          text: "Highlight a key feature or benefit with a compelling description.",
          link: "#",
        },
        {
          id: generateId("slide"),
          imgSrc: img,
          heading: "Feature Two",
          text: "Showcase another great aspect of your offering in this card.",
          link: "#",
        },
        {
          id: generateId("slide"),
          imgSrc: img,
          heading: "Feature Three",
          text: "Use this space to talk about a third important point or feature.",
          link: "#",
        },
      ],
      slidesPerView: 3,
      spaceBetween: 24,
      speed: 500,
      autoplay: false,
      autoplayDelay: 3000,
      loop: false,
      showNavigation: true,
      showPagination: true,
      cardBorderRadius: "12px",
    },
  },
  {
    id: "navbar",
    name: "Navbar",
    component: "NavbarElement",
    isGlobalOnly: true,
    defaultProps: {
      logoType: "text",
      logoText: "SiteName",
      links: [
        {
          id: generateId("navlink"),
          text: "Home",
          url: "/home",
          target: "_self",
        },
        {
          id: generateId("navlink"),
          text: "About",
          url: "/about",
          target: "_self",
        },
        {
          id: generateId("navlink"),
          text: "Services",
          url: "/services",
          target: "_self",
        },
        {
          id: generateId("navlink"),
          text: "Contact",
          url: "/contact",
          target: "_self",
        },
      ],
      rightContentType: "userIcon",
      backgroundColor: "#FFFFFF",
      textColor: "#1e293b",
      linkColor: "#16a34a",
    },
  },
  {
    id: "footer",
    name: "Footer",
    component: "FooterElement",
    isGlobalOnly: true,
    defaultProps: {
      copyrightText: `© ${new Date().getFullYear()} Your Company. All rights reserved.`,
      links: [
        {
          id: generateId("footerlink"),
          text: "Privacy Policy",
          url: "/privacy",
          target: "_self",
        },
        {
          id: generateId("footerlink"),
          text: "Terms of Service",
          url: "/terms",
          target: "_self",
        },
      ],
      backgroundColor: "#0f172a",
      textColor: "#94a3b8",
      linkColor: "#ffffff",
    },
  },
];
const elementIcons = {
  header: <LucideIcons.Heading1 />,
  textBlock: <LucideIcons.Baseline />,
  image: <LucideIcons.Image />,
  button: <LucideIcons.MousePointer />,
  divider: <LucideIcons.Minus />,
  spacer: <LucideIcons.StretchVertical />,
  icon: <LucideIcons.Star />,
  googleMaps: <LucideIcons.MapPin />,
  video: <LucideIcons.Youtube />,
  innerSection: <LucideIcons.LayoutPanelLeft />,
  cardSlider: <LucideIcons.GalleryHorizontalEnd />,
  navbar: <LucideIcons.Navigation />,
  footer: <LucideIcons.PanelBottom />,
  default: <LucideIcons.Puzzle />,
};
const PREDEFINED_STRUCTURES = [
  { name: "1 Column", id: "1col", layout: [{ width: "100%" }] },
  {
    name: "2 Columns (50/50)",
    id: "2col5050",
    layout: [{ width: "50%" }, { width: "50%" }],
  },
  {
    name: "2 Columns (33/67)",
    id: "2col3367",
    layout: [{ width: "33.33%" }, { width: "66.67%" }],
  },
  {
    name: "2 Columns (67/33)",
    id: "2col6733",
    layout: [{ width: "66.67%" }, { width: "33.33%" }],
  },
  {
    name: "3 Columns",
    id: "3col33",
    layout: [{ width: "33.33%" }, { width: "33.33%" }, { width: "33.33%" }],
  },
  {
    name: "3 Columns (25/50/25)",
    id: "3col255025",
    layout: [{ width: "25%" }, { width: "50%" }, { width: "25%" }],
  },
  {
    name: "4 Columns",
    id: "4col25",
    layout: [
      { width: "25%" },
      { width: "25%" },
      { width: "25%" },
      { width: "25%" },
    ],
  },
  {
    name: "Left Sidebar",
    id: "leftsidebar",
    layout: [{ width: "25%" }, { width: "75%" }],
  },
];

function StructureSelectorModal({
  isOpen,
  onClose,
  onSelectStructure,
  context,
}) {
  if (!isOpen) return null;
  return (
    <GeneralModal
      isOpen={isOpen}
      onClose={onClose}
      title="Select a Structure"
      size="2xl"
    >
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
        {PREDEFINED_STRUCTURES.map((s) => (
          <button
            key={s.id}
            onClick={() => {
              onSelectStructure(s.layout, context);
              onClose();
            }}
            className="p-4 bg-slate-50 rounded-2xl hover:bg-green-50 hover:ring-2 hover:ring-green-400 transition-all flex flex-col items-center justify-start aspect-w-3 aspect-h-4 group focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
          >
            <div className="flex w-full h-full min-h-[6rem] mb-3 space-x-2 items-stretch p-1 bg-white ring-1 ring-slate-200 rounded-lg">
              {s.layout.map((col, idx) => (
                <div
                  key={idx}
                  className="bg-slate-300 group-hover:bg-green-300 rounded-md transition-colors"
                  style={{ flexBasis: col.width }}
                ></div>
              ))}
            </div>
            <span className="text-sm text-slate-700 group-hover:text-green-800 text-center font-medium">
              {s.name}
            </span>
          </button>
        ))}
      </div>
    </GeneralModal>
  );
}
function ElementPaletteItem({ config }) {
  const { attributes, listeners, setNodeRef, isDragging, transform } =
    useDraggable({
      id: `palette-${config.id}`,
      data: { type: "paletteItem", config: config },
    });
  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: 9999,
        opacity: isDragging ? 0.9 : 1,
      }
    : {};
  let IconToShow = React.cloneElement(
    elementIcons[config.id] || elementIcons.default,
    { className: "w-8 h-8" }
  );
  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="flex flex-col items-center justify-center p-4 text-center bg-green-100 rounded-2xl shadow-xl ring-2 ring-green-400 opacity-95"
      >
        <div className="w-10 h-10 flex items-center justify-center text-green-600 mb-2">
          {IconToShow}
        </div>
        <span className="text-sm font-semibold text-green-800 leading-tight">
          {config.name}
        </span>
      </div>
    );
  }
  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={style}
      className="flex flex-col items-center justify-center p-4 text-center bg-slate-50 rounded-2xl cursor-grab hover:bg-green-50 hover:shadow-lg hover:ring-2 hover:ring-green-300 transition-all group focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
    >
      <div className="w-10 h-10 flex items-center justify-center text-slate-500 group-hover:text-green-600 mb-2 transition-colors">
        {IconToShow}
      </div>
      <span className="text-sm font-semibold text-slate-600 group-hover:text-green-800 leading-tight">
        {config.name}
      </span>
    </div>
  );
}
function PaletteItemDragOverlay({ config }) {
  let IconToShow = React.cloneElement(
    elementIcons[config.id] || elementIcons.default,
    { className: "w-8 h-8" }
  );
  return (
    <div className="flex flex-col items-center justify-center p-4 text-center bg-green-50 rounded-2xl shadow-2xl ring-2 ring-green-500 opacity-95 cursor-grabbing">
      <div className="w-10 h-10 flex items-center justify-center text-green-600 mb-2">
        {IconToShow}
      </div>
      <span className="text-sm font-semibold text-green-700 leading-tight">
        {config.name}
      </span>
    </div>
  );
}
function ElementPalette({
  onAddTopLevelSection,
  pages,
  activePageId,
  onAddPage,
  onSelectPage,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const filteredElements = useMemo(
    () =>
      AVAILABLE_ELEMENTS_CONFIG.filter((el) =>
        el.name.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [searchTerm]
  );
  return (
    <div className="w-72 bg-white p-4 border-r border-slate-200/70 shadow-xl flex-shrink-0 flex flex-col print-hidden">
      <div className="mb-4 pb-4 border-b border-slate-200/90">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-base font-semibold text-slate-700">Pages</h3>
          <button
            onClick={onAddPage}
            title="Add New Page"
            className="p-1.5 text-green-600 hover:text-green-700 rounded-lg hover:bg-green-100 transition-colors"
          >
            <LucideIcons.FilePlus2 className="w-5 h-5" />
          </button>
        </div>
        <ul className="space-y-1 max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100 scrollbar-thumb-rounded-full">
          {Object.values(pages).map((page) => (
            <li key={page.id}>
              <button
                onClick={() => onSelectPage(page.id)}
                className={`w-full text-left px-3 py-2.5 text-sm rounded-lg transition-all duration-150 flex items-center justify-between ${
                  activePageId === page.id
                    ? "bg-[#2e8b57] text-white font-semibold shadow-md"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <span>{page.name}</span>
                {activePageId === page.id && (
                  <LucideIcons.CheckCircle2 className="w-5 h-5 opacity-90" />
                )}
              </button>
            </li>
          ))}
        </ul>
      </div>
      <input
        type="text"
        placeholder="Search elements..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full px-4 py-2.5 mb-4 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-green-400 focus:border-green-400 transition-shadow shadow-sm placeholder-slate-400"
      />
      <div className="grid grid-cols-2 gap-3 overflow-y-auto pr-1.5 -mr-4 min-h-0 flex-1 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100 scrollbar-thumb-rounded-full">
        <div
          onClick={onAddTopLevelSection}
          className="flex flex-col items-center justify-center p-4 text-center rounded-2xl cursor-pointer transition-all group bg-[#2e8b57] hover:bg-green-800 border border-green-700 shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:ring-offset-1"
        >
          <div className="w-10 h-10 flex items-center justify-center text-white mb-2">
            <LucideIcons.PlusSquare className="w-8 h-8" />
          </div>
          <span className="text-sm font-semibold text-white leading-tight">
            Add Section
          </span>
        </div>
        {filteredElements.map((elConf) => (
          <ElementPaletteItem key={elConf.id} config={elConf} />
        ))}
      </div>
    </div>
  );
}
function DraggableCanvasElement({
  elementData,
  onUpdateProps,
  onDelete,
  onSelect,
  isSelected,
  onOpenStructureModal,
  parentColumnId,
  isPreviewMode,
  onNavigate,
}) {
  const config = AVAILABLE_ELEMENTS_CONFIG.find(
    (c) => c.id === elementData.type
  );
  if (!config)
    return isPreviewMode ? null : (
      <div className="text-red-500 p-2 border border-red-500 rounded-lg">
        Error: Config not found for type '{elementData.type}'.
      </div>
    );
  const ComponentToRender = ALL_ELEMENT_TYPES[config.component];
  if (!ComponentToRender)
    return isPreviewMode ? null : (
      <div className="text-red-500 p-2 border border-red-500 rounded-lg">
        Error: Component '{config.component}' missing.
      </div>
    );
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: elementData.id,
    data: {
      type: "canvasElement",
      elementId: elementData.id,
      parentColumnId: parentColumnId,
      elementType: elementData.type,
      elementData: elementData,
    },
    disabled: isPreviewMode,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging && !isPreviewMode ? 0.5 : 1,
    zIndex: isDragging && !isPreviewMode ? 100 : "auto",
  };
  const handleUpdate = (newProps) => {
    if (!isPreviewMode) onUpdateProps(elementData.path, newProps);
  };
  const handleClick = (e) => {
    if (!isPreviewMode) {
      e.stopPropagation();
      onSelect(elementData.id, "element", elementData.path);
    }
  };
  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={handleClick}
      className={`relative group my-2 transition-all duration-150 ease-in-out ${
        !isPreviewMode
          ? `${
              isDragging
                ? "bg-green-50/80 shadow-xl ring-2 ring-green-400 scale-[1.01]"
                : ""
            } ${
              isSelected
                ? "outline-none ring-2 ring-offset-2 ring-green-500 rounded-2xl"
                : "hover:shadow-md hover:ring-1 hover:ring-green-300/80 rounded-2xl"
            }`
          : ""
      }`}
    >
      {!isPreviewMode && (
        <div
          {...attributes}
          {...listeners}
          title="Drag element"
          className="absolute top-1/2 -left-4 transform -translate-y-1/2 p-2 cursor-grab bg-white hover:bg-[#2e8b57] text-slate-500 hover:text-white rounded-full shadow-lg border border-slate-300 hover:border-green-500 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 focus:opacity-100 z-20 print-hidden transition-opacity"
        >
          <LucideIcons.GripVertical className="w-5 h-5" />
        </div>
      )}
      <div
        className={
          isPreviewMode || (!isPreviewMode && isSelected)
            ? ""
            : "pointer-events-none"
        }
      >
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
        />
      </div>
      {!isPreviewMode && isSelected && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(elementData.path);
          }}
          title="Delete element"
          className="absolute -top-3 -right-3 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 hover:scale-110 transition-all w-7 h-7 flex items-center justify-center shadow-md z-20 print-hidden"
        >
          <LucideIcons.X className="w-4 h-4" strokeWidth={3} />
        </button>
      )}
    </div>
  );
}
function ColumnComponent({
  parentPath,
  columnData,
  columnIndex,
  onUpdateProps,
  onDelete,
  onSelect,
  selectedItemId,
  onOpenStructureModal,
  isInner = false,
  isPreviewMode,
  onNavigate,
}) {
  const columnPath = `${parentPath}.${
    isInner ? "columns" : "columns"
  }[${columnIndex}]`;
  const isSelected = selectedItemId === columnData.id;
  const handleClick = (e) => {
    if (!isPreviewMode) {
      e.stopPropagation();
      onSelect(columnData.id, "column", columnPath);
    }
  };
  const { setNodeRef: setDroppableRef, isOver } = useDroppable({
    id: `col-${columnData.id}`,
    data: {
      type: "column",
      columnId: columnData.id,
      path: columnPath,
      accepts: ["paletteItem", "canvasElement"],
    },
    disabled: isPreviewMode,
  });
  const elementIds = useMemo(
    () => columnData.elements.map((el) => el.id),
    [columnData.elements]
  );
  return (
    <div
      onClick={handleClick}
      style={{ flexBasis: columnData.props.width || "100%" }}
      className={`p-1.5 md:p-2 flex-shrink-0 transition-all ${
        !isPreviewMode && isSelected
          ? "outline outline-2 outline-offset-2 outline-blue-500 rounded-2xl bg-blue-50/70"
          : !isPreviewMode
          ? "hover:outline hover:outline-1 hover:outline-offset-1 hover:outline-blue-300/70 rounded-2xl"
          : ""
      }`}
    >
      <SortableContext
        items={elementIds}
        strategy={verticalListSortingStrategy}
        disabled={isPreviewMode}
      >
        <div
          ref={setDroppableRef}
          className={`min-h-[100px] p-2 rounded-xl transition-all ${
            !isPreviewMode
              ? `border ${
                  isOver
                    ? "bg-green-100/90 border-green-400 border-solid ring-2 ring-green-400"
                    : "bg-slate-100/60 border-slate-200/90"
                } ${
                  columnData.elements.length === 0 && !isOver
                    ? "border-dashed flex items-center justify-center text-slate-400/80 text-sm font-medium"
                    : ""
                }`
              : ""
          }`}
        >
          {!isPreviewMode && columnData.elements.length === 0 && !isOver
            ? "Drop Element Here"
            : null}
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
            />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}
function SectionComponent({
  sectionData,
  sectionIndex,
  onUpdateProps,
  onDelete,
  onSelect,
  selectedItemId,
  onOpenStructureModal,
  isPreviewMode,
  onNavigate,
}) {
  const sectionPath = `sections[${sectionIndex}]`;
  const isSelected = selectedItemId === sectionData.id;
  const handleClick = (e) => {
    if (!isPreviewMode) onSelect(sectionData.id, "section", sectionPath);
  };
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: sectionData.id,
    data: {
      type: "section",
      sectionId: sectionData.id,
      path: sectionPath,
      sectionData: sectionData,
    },
    disabled: isPreviewMode,
  });
  const sortableStyle = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging && !isPreviewMode ? 0.75 : 1,
    zIndex: isDragging && !isPreviewMode ? 200 : "auto",
  };
  const sectionProps = sectionData.props || {};
  const effectiveBgStyle = { ...sortableStyle };
  if (sectionProps.backgroundType === "color" && sectionProps.backgroundColor) {
    effectiveBgStyle.backgroundColor = sectionProps.backgroundColor;
  } else if (
    sectionProps.backgroundType !== "image" &&
    sectionProps.backgroundType !== "video"
  ) {
    if (!isPreviewMode) effectiveBgStyle.backgroundColor = "white";
  }
  const getSectionBaseBgClass = () => {
    const editModeBase = "shadow-lg hover:shadow-xl rounded-2xl my-3";
    if (isPreviewMode) {
      return sectionProps.backgroundType === "image" ||
        sectionProps.backgroundType === "video"
        ? ""
        : "bg-transparent";
    } else {
      if (isDragging) {
        return `bg-green-50/80 shadow-2xl ring-2 ring-green-400 rounded-2xl`;
      }
      const noMediaBackground =
        sectionProps.backgroundType !== "image" &&
        sectionProps.backgroundType !== "video";
      return `${noMediaBackground ? "bg-white" : ""} ${editModeBase}`;
    }
  };
  const sectionRootClasses = [
    "relative",
    "group",
    "transition-all duration-200 ease-in-out",
    getSectionBaseBgClass(),
    !isPreviewMode && isSelected
      ? "outline-none ring-2 ring-offset-2 ring-green-500"
      : "",
  ]
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
  const sectionPaddingStyle = {
    paddingTop: sectionProps.paddingTop,
    paddingBottom: sectionProps.paddingBottom,
    paddingLeft: sectionProps.paddingLeft,
    paddingRight: sectionProps.paddingRight,
  };
  return (
    <div
      ref={setNodeRef}
      style={effectiveBgStyle}
      onClick={handleClick}
      className={sectionRootClasses}
    >
      {sectionProps.backgroundType === "image" &&
        sectionProps.backgroundImageSrc && (
          <div
            className="absolute inset-0 bg-cover bg-center -z-20 rounded-2xl"
            style={{
              backgroundImage: `url("${sectionProps.backgroundImageSrc}")`,
            }}
          ></div>
        )}
      {sectionProps.backgroundType === "video" &&
        sectionProps.backgroundVideoSrc && (
          <video
            className="absolute inset-0 w-full h-full object-cover -z-20 rounded-2xl"
            src={sectionProps.backgroundVideoSrc}
            autoPlay={sectionProps.backgroundVideoAutoplay !== false}
            loop={sectionProps.backgroundVideoLoop !== false}
            muted={sectionProps.backgroundVideoMuted !== false}
            playsInline
            key={
              sectionProps.backgroundVideoSrc +
              (sectionProps.backgroundVideoAutoplay ? "1" : "0")
            }
          ></video>
        )}
      {(sectionProps.backgroundType === "image" ||
        sectionProps.backgroundType === "video") &&
        sectionProps.backgroundOverlayColor &&
        typeof sectionProps.backgroundOverlayOpacity === "number" &&
        sectionProps.backgroundOverlayOpacity > 0 && (
          <div
            className="absolute inset-0 -z-10 rounded-2xl"
            style={{
              backgroundColor: sectionProps.backgroundOverlayColor,
              opacity: sectionProps.backgroundOverlayOpacity,
            }}
          ></div>
        )}
      {!isPreviewMode && (
        <div
          {...attributes}
          {...listeners}
          title="Drag section"
          className="absolute top-2.5 -left-4 transform p-2 cursor-grab bg-white hover:bg-[#2e8b57] text-slate-500 hover:text-white rounded-full shadow-lg border border-slate-300 hover:border-green-500 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 focus:opacity-100 z-30 print-hidden transition-opacity"
        >
          <LucideIcons.Move className="w-5 h-5" />
        </div>
      )}
      {!isPreviewMode && isSelected && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(sectionPath);
          }}
          title="Delete section"
          className="absolute -top-3 -right-3 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 hover:scale-110 transition-all w-7 h-7 flex items-center justify-center shadow-md z-30 print-hidden"
        >
          <LucideIcons.Trash2 className="w-4 h-4" strokeWidth={2.5} />
        </button>
      )}
      <div
        style={sectionPaddingStyle}
        className="flex flex-wrap -m-1.5 relative z-0"
      >
        {sectionData.columns.map((col, colIdx) => (
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
          />
        ))}
      </div>
    </div>
  );
}
function LinkManager({
  links,
  onUpdateLinks,
  elementId,
  pages,
  linkTypeLabel = "Link",
}) {
  const [localLinks, setLocalLinks] = useState(links || []);
  useEffect(() => {
    setLocalLinks(links || []);
  }, [links]);
  const handleLinkChange = (index, field, value) => {
    const newLinks = [...localLinks];
    newLinks[index] = { ...newLinks[index], [field]: value };
    if (field === "url" && value.startsWith("/")) {
      newLinks[index].isInternal = true;
    } else if (field === "url") {
      newLinks[index].isInternal = false;
    }
    setLocalLinks(newLinks);
    onUpdateLinks(newLinks);
  };
  const addLink = () => {
    const newLink = {
      id: generateId("link"),
      text: `New ${linkTypeLabel}`,
      url: "#",
      target: "_self",
      isInternal: false,
    };
    const newLinks = [...localLinks, newLink];
    setLocalLinks(newLinks);
    onUpdateLinks(newLinks);
  };
  const removeLink = (index) => {
    const newLinks = localLinks.filter((_, i) => i !== index);
    setLocalLinks(newLinks);
    onUpdateLinks(newLinks);
  };
  const pageOptions = [
    { label: "External URL", value: "external" },
    ...Object.values(pages).map((p) => ({
      label: `${p.name} (/${p.id})`,
      value: `internal:${p.id}`,
    })),
  ];
  return (
    <div className="space-y-3">
      {localLinks.map((link, index) => (
        <div
          key={link.id || index}
          className="p-3 border border-slate-200 rounded-xl space-y-2 bg-slate-50/70"
        >
          <input
            type="text"
            placeholder={`${linkTypeLabel} Text`}
            value={link.text}
            onChange={(e) => handleLinkChange(index, "text", e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-green-500 focus:border-green-500"
          />
          <div>
            <input
              type="text"
              placeholder="URL (e.g. /page-slug or https://...)"
              value={link.url}
              onChange={(e) => handleLinkChange(index, "url", e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-green-500 focus:border-green-500 mb-1.5"
            />
            <CustomDropdown
              options={pageOptions}
              value={
                link.url && link.url.startsWith("/")
                  ? `internal:${link.url.substring(1)}`
                  : "external"
              }
              onChange={(val) => {
                if (val.startsWith("internal:")) {
                  handleLinkChange(index, "url", `/${val.split(":")[1]}`);
                } else {
                  handleLinkChange(
                    index,
                    "url",
                    link.url && link.url.startsWith("/") ? "#" : link.url
                  );
                }
              }}
              idSuffix={`link-${index}`}
            />
          </div>
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id={`${elementId}-link-${index}-target`}
                checked={link.target === "_blank"}
                onChange={(e) =>
                  handleLinkChange(
                    index,
                    "target",
                    e.target.checked ? "_blank" : "_self"
                  )
                }
                className="h-4 w-4 rounded border-slate-300 text-green-600 focus:ring-green-500"
              />
              <label
                htmlFor={`${elementId}-link-${index}-target`}
                className="text-xs text-slate-600"
              >
                Open in new tab
              </label>
            </div>
            <button
              onClick={() => removeLink(index)}
              className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100"
            >
              <LucideIcons.Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
      <button
        onClick={addLink}
        className="w-full mt-2 px-3 py-2 bg-green-100 text-green-800 text-sm font-medium rounded-lg hover:bg-green-200 transition-colors flex items-center justify-center space-x-2"
      >
        <LucideIcons.PlusCircle className="w-4 h-4" />
        <span>Add {linkTypeLabel}</span>
      </button>
    </div>
  );
}
function SlideManager({ slides, onUpdateSlides, elementId }) {
  const [localSlides, setLocalSlides] = useState(slides || []);
  const slideImgInputRefs = useRef([]);
  useEffect(() => {
    setLocalSlides(slides || []);
    slideImgInputRefs.current = (slides || []).map(
      (_, i) => slideImgInputRefs.current[i] || React.createRef()
    );
  }, [slides]);
  const handleSlideChange = (index, field, value) => {
    const newSlides = [...localSlides];
    newSlides[index] = { ...newSlides[index], [field]: value };
    setLocalSlides(newSlides);
    onUpdateSlides(newSlides);
  };
  const handleImageFileChange = (e, index) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleSlideChange(index, "imgSrc", reader.result);
      };
      reader.readAsDataURL(file);
    }
    e.target.value = null;
  };
  const addSlide = () => {
    const newSlide = {
      id: generateId("slide"),
      imgSrc: img,
      heading: "New Slide",
      text: "New slide content.",
      link: "#",
    };
    const newSlides = [...localSlides, newSlide];
    slideImgInputRefs.current.push(React.createRef());
    setLocalSlides(newSlides);
    onUpdateSlides(newSlides);
  };
  const removeSlide = (index) => {
    const newSlides = localSlides.filter((_, i) => i !== index);
    slideImgInputRefs.current.splice(index, 1);
    setLocalSlides(newSlides);
    onUpdateSlides(newSlides);
  };
  return (
    <div className="space-y-3">
      {localSlides.map((slide, index) => (
        <div
          key={slide.id || index}
          className="p-3 border border-slate-200 rounded-xl space-y-2 bg-slate-50/70"
        >
          <div className="flex justify-between items-center mb-1">
            <p className="text-sm font-medium text-slate-700">
              Slide {index + 1}
            </p>
            <button
              onClick={() => removeSlide(index)}
              className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100"
            >
              <LucideIcons.Trash2 className="w-4 h-4" />
            </button>
          </div>
          {slide.imgSrc && (
            <img
              src={slide.imgSrc}
              alt={`Preview ${index}`}
              className="w-full h-24 object-contain rounded-lg border border-slate-200 bg-white p-1 mb-2"
            />
          )}
          <button
            onClick={() => slideImgInputRefs.current[index]?.current?.click()}
            className="w-full px-3 py-2 bg-slate-200 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-300 transition-colors"
          >
            Change Image
          </button>
          <input
            type="file"
            accept="image/*"
            ref={slideImgInputRefs.current[index]}
            className="hidden"
            onChange={(e) => handleImageFileChange(e, index)}
          />
          <input
            type="text"
            placeholder="Image URL"
            value={slide.imgSrc}
            onChange={(e) => handleSlideChange(index, "imgSrc", e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-green-500 focus:border-green-500"
          />
          <input
            type="text"
            placeholder="Heading"
            value={slide.heading}
            onChange={(e) =>
              handleSlideChange(index, "heading", e.target.value)
            }
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-green-500 focus:border-green-500"
          />
          <textarea
            placeholder="Text"
            value={slide.text}
            onChange={(e) => handleSlideChange(index, "text", e.target.value)}
            rows="3"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-green-500 focus:border-green-500 whitespace-pre-wrap"
          ></textarea>
          <input
            type="text"
            placeholder="Link URL (optional)"
            value={slide.link || ""}
            onChange={(e) => handleSlideChange(index, "link", e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-green-500 focus:border-green-500"
          />
        </div>
      ))}
      <button
        onClick={addSlide}
        className="w-full mt-2 px-3 py-2 bg-green-100 text-green-800 text-sm font-medium rounded-lg hover:bg-green-200 transition-colors flex items-center justify-center space-x-2"
      >
        <LucideIcons.PlusCircle className="w-4 h-4" /> <span>Add Slide</span>
      </button>
    </div>
  );
}
function PropertiesPanel({
  selectedItemData,
  onUpdateSelectedProps,
  onClosePanel,
  pages,
  onDeleteGlobalElement,
}) {
  const elementFileInputRef = useRef(null);
  const sectionBgImageInputRef = useRef(null);
  const sectionBgVideoInputRef = useRef(null);
  const navbarLogoInputRef = useRef(null);
  if (!selectedItemData) {
    return (
      <div className="w-96 bg-white p-6 border-l border-slate-200/80 shadow-xl flex-shrink-0 print-hidden flex flex-col">
        <h2 className="text-xl font-semibold mb-4 text-slate-800">
          Properties
        </h2>
        <div className="flex-grow flex flex-col items-center justify-center text-center bg-slate-50 rounded-2xl p-4">
          <LucideIcons.SlidersHorizontal className="w-20 h-20 text-slate-300 mb-4" />
          <p className="text-slate-500 text-base">
            Select an element on the canvas to edit its properties.
          </p>
        </div>
      </div>
    );
  }
  const { id, type, path, props, itemType: globalItemType } = selectedItemData;
  const elementType =
    globalItemType ||
    props.elementType ||
    (type === "element" ? props.type : null);
  const isGlobalContext = type === "globalElement";
  const handlePropChange = (propName, value) => {
    let newPropsToUpdate = { [propName]: value };
    if (type === "section" && propName === "backgroundType") {
      if (value === "color") {
        newPropsToUpdate.backgroundColor = props.backgroundColor || "#FFFFFF";
        newPropsToUpdate.backgroundImageSrc = "";
        newPropsToUpdate.backgroundVideoSrc = "";
      } else if (value === "image") {
        newPropsToUpdate.backgroundImageSrc = props.backgroundImageSrc || img;
        newPropsToUpdate.backgroundColor = "";
        newPropsToUpdate.backgroundVideoSrc = "";
      } else if (value === "video") {
        newPropsToUpdate.backgroundVideoSrc =
          props.backgroundVideoSrc ||
          "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4";
        newPropsToUpdate.backgroundColor = "";
        newPropsToUpdate.backgroundImageSrc = "";
      } else {
        newPropsToUpdate.backgroundColor = "";
        newPropsToUpdate.backgroundImageSrc = "";
        newPropsToUpdate.backgroundVideoSrc = "";
      }
    }
    onUpdateSelectedProps(path, newPropsToUpdate);
  };
  const handleGenericLogoFileChange = (e, logoSrcPropName) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handlePropChange(logoSrcPropName, reader.result);
      };
      reader.readAsDataURL(file);
    }
    e.target.value = null;
  };
  const handleSectionBgImageFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdateSelectedProps(path, {
          backgroundImageSrc: reader.result,
          backgroundType: "image",
          backgroundColor: "",
          backgroundVideoSrc: "",
        });
      };
      reader.readAsDataURL(file);
    }
    e.target.value = null;
  };
  const handleSectionBgVideoFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdateSelectedProps(path, {
          backgroundVideoSrc: reader.result,
          backgroundType: "video",
          backgroundColor: "",
          backgroundImageSrc: "",
        });
      };
      reader.readAsDataURL(file);
    }
    e.target.value = null;
  };
  const renderInput = (
    key,
    value,
    labelText,
    placeholder = "",
    inputType = "text"
  ) => {
    const inputId = `${id}-${key}`;
    return (
      <div key={key}>
        <label
          htmlFor={inputId}
          className="block text-xs font-medium text-slate-700 mb-1"
        >
          {labelText}
        </label>
        <input
          type={inputType === "number" ? "number" : "text"}
          id={inputId}
          value={value}
          placeholder={placeholder}
          onChange={(e) =>
            handlePropChange(
              key,
              inputType === "number"
                ? parseFloat(e.target.value)
                : e.target.value
            )
          }
          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-green-400 focus:border-green-400 transition-shadow shadow-sm"
        />
      </div>
    );
  };
  const renderToggle = (key, value, labelText) => {
    const inputId = `${id}-${key}`;
    return (
      <div key={key} className="flex items-center justify-between">
        <label htmlFor={inputId} className="text-sm font-medium text-slate-700">
          {labelText}
        </label>
        <label
          htmlFor={inputId}
          className="relative inline-flex items-center cursor-pointer"
        >
          <input
            type="checkbox"
            checked={!!value}
            onChange={(e) => handlePropChange(key, e.target.checked)}
            id={inputId}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2e8b57]"></div>
        </label>
      </div>
    );
  };
  const renderColorInput = (key, value, labelText) => (
    <div key={key}>
      <label className="block text-xs font-medium text-slate-700 mb-1">
        {labelText}
      </label>
      <input
        type="color"
        value={value || "#000000"}
        onChange={(e) => handlePropChange(key, e.target.value)}
        className="w-full p-0 h-10 border border-slate-300 rounded-lg shadow-sm cursor-pointer"
      />
    </div>
  );
  const renderCustomDropdown = (key, value, options, labelText) => (
    <CustomDropdown
      label={labelText}
      options={options}
      value={value || ""}
      onChange={(val) => handlePropChange(key, val)}
      idSuffix={key}
    />
  );
  const renderTextAlignButtons = () => (
    <div>
      <label className="block text-xs font-medium text-slate-700 mb-1.5">
        Text Align
      </label>
      <div className="grid grid-cols-3 gap-1.5">
        {textAlignOptions.map((opt) => (
          <button
            key={opt.value}
            title={opt.label}
            onClick={() => handlePropChange("textAlign", opt.value)}
            className={`p-2 flex items-center justify-center rounded-lg border transition-colors ${
              props.textAlign === opt.value
                ? "bg-[#2e8b57] text-white border-green-600 shadow-md"
                : "bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-600"
            }`}
          >
            {React.cloneElement(opt.icon, { className: "w-5 h-5" })}
          </button>
        ))}
      </div>
    </div>
  );
  const renderFileUploadButton = (ref, onChange, text, accept) => (
    <>
      <button
        onClick={() => ref.current?.click()}
        className="w-full px-3 py-2 bg-[#2e8b57] text-white rounded-lg hover:bg-green-800 text-sm font-medium transition-colors shadow-md"
      >
        {text}
      </button>
      <input
        type="file"
        accept={accept}
        ref={ref}
        className="hidden"
        onChange={onChange}
      />
    </>
  );
  const panelTitle = isGlobalContext
    ? `Global ${elementType.charAt(0).toUpperCase() + elementType.slice(1)}`
    : type === "element"
    ? AVAILABLE_ELEMENTS_CONFIG.find((el) => el.id === elementType)?.name ||
      elementType
    : type;
  return (
    <div className="w-96 bg-white p-4 border-l border-slate-200/80 shadow-xl flex-shrink-0 flex flex-col print-hidden">
      <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-200/90">
        <h2 className="text-xl font-semibold text-slate-800 capitalize">
          {panelTitle} Settings
        </h2>
        <button
          onClick={onClosePanel}
          className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-full hover:bg-slate-100"
        >
          <LucideIcons.X className="w-6 h-6" />
        </button>
      </div>
      <div className="overflow-y-auto flex-grow scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100 scrollbar-thumb-rounded-full text-sm space-y-5 pr-2 -mr-4">
        {type === "section" && (
          <>
            <details open className="prop-section">
              <summary className="prop-summary">Background</summary>
              <div className="prop-content">
                {renderCustomDropdown(
                  "backgroundType",
                  props.backgroundType,
                  [
                    { label: "None", value: "none" },
                    { label: "Color", value: "color" },
                    { label: "Image", value: "image" },
                    { label: "Video", value: "video" },
                  ],
                  "Type"
                )}
                {props.backgroundType === "color" &&
                  renderColorInput(
                    "backgroundColor",
                    props.backgroundColor,
                    "Color"
                  )}
                {props.backgroundType === "image" && (
                  <div className="space-y-2">
                    {renderFileUploadButton(
                      sectionBgImageInputRef,
                      handleSectionBgImageFileChange,
                      "Upload Background Image",
                      "image/*"
                    )}
                    {renderInput(
                      "backgroundImageSrc",
                      props.backgroundImageSrc || "",
                      "Image URL"
                    )}
                  </div>
                )}
                {props.backgroundType === "video" && (
                  <div className="space-y-2">
                    {renderFileUploadButton(
                      sectionBgVideoInputRef,
                      handleSectionBgVideoFileChange,
                      "Upload Background Video",
                      "video/*"
                    )}
                    {renderInput(
                      "backgroundVideoSrc",
                      props.backgroundVideoSrc || "",
                      "Video URL"
                    )}
                    <div className="flex items-center justify-between">
                      {renderToggle(
                        "backgroundVideoAutoplay",
                        props.backgroundVideoAutoplay,
                        "Autoplay"
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      {renderToggle(
                        "backgroundVideoLoop",
                        props.backgroundVideoLoop,
                        "Loop"
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      {renderToggle(
                        "backgroundVideoMuted",
                        props.backgroundVideoMuted,
                        "Muted"
                      )}
                    </div>
                  </div>
                )}
                {(props.backgroundType === "image" ||
                  props.backgroundType === "video") &&
                  (props.backgroundImageSrc || props.backgroundVideoSrc) && (
                    <div className="space-y-3 pt-4 border-t border-slate-200/70 mt-4">
                      {renderColorInput(
                        "backgroundOverlayColor",
                        props.backgroundOverlayColor,
                        "Overlay Color"
                      )}
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          Overlay Opacity (
                          {(
                            (props.backgroundOverlayOpacity || 0) * 100
                          ).toFixed(0)}
                          %)
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.01"
                          value={props.backgroundOverlayOpacity || 0}
                          onChange={(e) =>
                            handlePropChange(
                              "backgroundOverlayOpacity",
                              parseFloat(e.target.value)
                            )
                          }
                          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-green-600"
                        />
                      </div>
                    </div>
                  )}
              </div>
            </details>
            <details open className="prop-section">
              <summary className="prop-summary">Spacing</summary>
              <div className="prop-content grid grid-cols-2 gap-3">
                {renderInput(
                  "paddingTop",
                  props.paddingTop,
                  "Padding Top",
                  "e.g. 48px"
                )}
                {renderInput(
                  "paddingBottom",
                  props.paddingBottom,
                  "Padding Bottom",
                  "e.g. 48px"
                )}
                {renderInput(
                  "paddingLeft",
                  props.paddingLeft,
                  "Padding Left",
                  "e.g. 24px"
                )}
                {renderInput(
                  "paddingRight",
                  props.paddingRight,
                  "Padding Right",
                  "e.g. 24px"
                )}
              </div>
            </details>
          </>
        )}
        {elementType === "cardSlider" && (
          <details open className="prop-section">
            <summary className="prop-summary">Slider Settings</summary>
            <div className="prop-content">
              <div className="grid grid-cols-2 gap-3 mb-3">
                {renderInput(
                  "slidesPerView",
                  props.slidesPerView,
                  "Slides Per View",
                  "e.g. 3",
                  "number"
                )}
                {renderInput(
                  "spaceBetween",
                  props.spaceBetween,
                  "Spacing (px)",
                  "e.g. 16",
                  "number"
                )}
              </div>
              <div className="grid grid-cols-2 gap-3 mb-3">
                {renderInput(
                  "speed",
                  props.speed,
                  "Speed (ms)",
                  "e.g. 500",
                  "number"
                )}
                {renderInput(
                  "cardBorderRadius",
                  props.cardBorderRadius,
                  "Card Radius",
                  "e.g. 8px"
                )}
              </div>
              <div className="space-y-2 mb-3">
                {renderToggle("autoplay", props.autoplay, "Autoplay")}
                {props.autoplay &&
                  renderInput(
                    "autoplayDelay",
                    props.autoplayDelay,
                    "Autoplay Delay (ms)",
                    "e.g. 3000",
                    "number"
                  )}
                {renderToggle("loop", props.loop, "Loop")}
                {renderToggle(
                  "showNavigation",
                  props.showNavigation,
                  "Show Navigation Arrows"
                )}
                {renderToggle(
                  "showPagination",
                  props.showPagination,
                  "Show Pagination Dots"
                )}
              </div>
              <SlideManager
                slides={props.slides}
                onUpdateSlides={(updatedSlides) =>
                  handlePropChange("slides", updatedSlides)
                }
                elementId={id}
              />
            </div>
          </details>
        )}
        {elementType === "button" && (
          <details open className="prop-section">
            <summary className="prop-summary">Button Style</summary>
            <div className="prop-content">
              {renderCustomDropdown(
                "variant",
                props.variant,
                [
                  { label: "Solid", value: "solid" },
                  { label: "Outline", value: "outline" },
                ],
                "Variant"
              )}
              {renderColorInput(
                "backgroundColor",
                props.backgroundColor,
                "Main Color"
              )}
              {props.variant === "solid" &&
                renderColorInput("textColor", props.textColor, "Text Color")}
              {renderInput(
                "borderRadius",
                props.borderRadius || "8px",
                "Border Radius",
                "e.g., 8px"
              )}
              {renderToggle("fullWidth", props.fullWidth, "Full Width")}
            </div>
          </details>
        )}
        {(elementType === "header" ||
          elementType === "textBlock" ||
          elementType === "button") && (
          <details open className="prop-section">
            <summary className="prop-summary">Typography</summary>
            <div className="prop-content">
              {renderCustomDropdown(
                "sizeClass",
                props.sizeClass,
                [{ label: "Default", value: "" }, ...textSizeOptions],
                "Text Size"
              )}
              {elementType !== "button" &&
                renderCustomDropdown(
                  "fontWeight",
                  props.fontWeight,
                  [{ label: "Default", value: "" }, ...fontWeightOptions],
                  "Font Weight"
                )}
              {renderTextAlignButtons()}
              {elementType !== "button" &&
                renderColorInput("textColor", props.textColor, "Text Color")}
            </div>
          </details>
        )}
        {elementType === "image" && (
          <details open className="prop-section">
            <summary className="prop-summary">Image Settings</summary>
            <div className="prop-content">
              {renderFileUploadButton(
                elementFileInputRef,
                (e) => handleGenericLogoFileChange(e, "src"),
                "Upload Image",
                "image/*"
              )}
              {renderInput("src", props.src || "", "Image URL")}
              {renderInput("alt", props.alt || "", "Alt Text (for SEO)")}
              <div className="grid grid-cols-2 gap-3">
                {renderInput("width", props.width || "", "Width", "e.g. 100%")}
                {renderInput(
                  "height",
                  props.height || "",
                  "Height",
                  "e.g. auto"
                )}
              </div>
              {renderInput(
                "borderRadius",
                props.borderRadius,
                "Border Radius",
                "e.g. 12px"
              )}
              {renderCustomDropdown(
                "boxShadow",
                props.boxShadow,
                [
                  { label: "None", value: "none" },
                  { label: "Small", value: "0 1px 2px 0 rgb(0 0 0 / 0.05)" },
                  {
                    label: "Medium",
                    value:
                      "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
                  },
                  {
                    label: "Large",
                    value:
                      "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
                  },
                  {
                    label: "Extra Large",
                    value:
                      "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
                  },
                ],
                "Shadow"
              )}
            </div>
          </details>
        )}
        {elementType === "video" && (
          <details open className="prop-section">
            <summary className="prop-summary">Video Settings</summary>
            <div className="prop-content">
              {renderCustomDropdown(
                "videoType",
                props.videoType,
                [
                  { label: "MP4 URL", value: "mp4" },
                  { label: "YouTube ID", value: "youtube" },
                  { label: "Vimeo ID", value: "vimeo" },
                ],
                "Source Type"
              )}
              {renderInput(
                "src",
                props.src || "",
                props.videoType === "mp4" ? "Video URL" : "Video ID"
              )}
              <div className="grid grid-cols-2 gap-3">
                {renderInput("width", props.width || "100%", "Width")}
                {renderInput("height", props.height || "300px", "Height")}
              </div>
              <div className="space-y-2 pt-2">
                {renderToggle("controls", props.controls, "Controls")}
                {renderToggle("autoplay", props.autoplay, "Autoplay")}
                {renderToggle("loop", props.loop, "Loop")}
                {renderToggle("muted", props.muted, "Muted")}
              </div>
            </div>
          </details>
        )}
        {elementType === "icon" && (
          <details open className="prop-section">
            <summary className="prop-summary">Icon Settings</summary>
            <div className="prop-content">
              {renderInput(
                "iconName",
                props.iconName || "",
                "Lucide Icon Name",
                "e.g. Star"
              )}
              {renderInput("size", props.size || "28px", "Size", "e.g. 28px")}
              {renderColorInput("color", props.color, "Icon Color")}
            </div>
          </details>
        )}
        {elementType === "navbar" && (
          <details open className="prop-section">
            <summary className="prop-summary">Navbar Settings</summary>
            <div className="prop-content">
              {renderCustomDropdown(
                "logoType",
                props.logoType,
                [
                  { label: "Text", value: "text" },
                  { label: "Image", value: "image" },
                ],
                "Logo Type"
              )}
              {props.logoType === "text" &&
                renderInput("logoText", props.logoText, "Logo Text")}
              {props.logoType === "image" && (
                <>
                  {renderFileUploadButton(
                    navbarLogoInputRef,
                    (e) => handleGenericLogoFileChange(e, "logoSrc"),
                    "Upload Logo",
                    "image/*"
                  )}
                  {renderInput("logoSrc", props.logoSrc, "Logo Image URL")}
                </>
              )}
              {renderColorInput(
                "backgroundColor",
                props.backgroundColor,
                "Background Color"
              )}
              {renderColorInput(
                "textColor",
                props.textColor,
                "Main Text/Logo Color"
              )}
              {renderColorInput("linkColor", props.linkColor, "Link Color")}
              {renderCustomDropdown(
                "rightContentType",
                props.rightContentType,
                [
                  { label: "None", value: "none" },
                  { label: "User Icon", value: "userIcon" },
                  { label: "Search Icon", value: "searchIcon" },
                ],
                "Right Content"
              )}
            </div>
          </details>
        )}
        {elementType === "navbar" && (
          <details className="prop-section">
            <summary className="prop-summary">Navigation Links</summary>
            <div className="prop-content">
              <LinkManager
                links={props.links}
                onUpdateLinks={(updatedLinks) =>
                  handlePropChange("links", updatedLinks)
                }
                elementId={id}
                pages={pages}
                linkTypeLabel="Nav Link"
              />
            </div>
          </details>
        )}
        {elementType === "footer" && (
          <details open className="prop-section">
            <summary className="prop-summary">Footer Settings</summary>
            <div className="prop-content">
              {renderInput(
                "copyrightText",
                props.copyrightText,
                "Copyright Text"
              )}
              {renderColorInput(
                "backgroundColor",
                props.backgroundColor,
                "Background Color"
              )}
              {renderColorInput("textColor", props.textColor, "Text Color")}
              {renderColorInput("linkColor", props.linkColor, "Link Color")}
            </div>
          </details>
        )}
        {elementType === "footer" && (
          <details className="prop-section">
            <summary className="prop-summary">Footer Links</summary>
            <div className="prop-content">
              <LinkManager
                links={props.links}
                onUpdateLinks={(updatedLinks) =>
                  handlePropChange("links", updatedLinks)
                }
                elementId={id + "-pageLinks"}
                pages={pages}
                linkTypeLabel="Footer Link"
              />
            </div>
          </details>
        )}
        <details className="prop-section">
          <summary className="prop-summary">Advanced: Raw JSON</summary>
          <pre className="bg-slate-100 p-3 rounded-xl overflow-x-auto mt-2 text-xs leading-relaxed shadow-inner">
            {JSON.stringify(props, null, 2)}
          </pre>
        </details>
        {isGlobalContext && onDeleteGlobalElement && (
          <div className="mt-6 pt-4 border-t border-slate-200">
            <StyledModalButton
              onClick={() => onDeleteGlobalElement(elementType)}
              variant="danger"
              className="w-full flex items-center justify-center space-x-2"
            >
              <LucideIcons.Trash2 className="w-4 h-4" />
              <span>
                Remove Global{" "}
                {elementType.charAt(0).toUpperCase() + elementType.slice(1)}
              </span>
            </StyledModalButton>
          </div>
        )}
      </div>
    </div>
  );
}

function CanvasArea({
  pageLayout,
  onUpdateProps,
  onDelete,
  onSelect,
  selectedItemId,
  onOpenStructureModal,
  isPreviewMode,
  onNavigate,
}) {
  const { setNodeRef: setPageDroppableRef, isOver: isPageOver } = useDroppable({
    id: "page-sections-droppable",
    data: { type: "page", accepts: ["paletteItem", "section"] },
    disabled: isPreviewMode,
  });
  const sectionIds = useMemo(
    () => pageLayout.map((sec) => sec.id),
    [pageLayout]
  );
  return (
    <div
      className={`flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-400/70 scrollbar-track-slate-200/50 scrollbar-thumb-rounded-full ${
        isPreviewMode ? "p-0 bg-white" : "p-4 md:p-8 bg-slate-200"
      }`}
    >
      <div className={`${isPreviewMode ? "" : "max-w-7xl mx-auto"}`}>
        <SortableContext
          items={sectionIds}
          strategy={verticalListSortingStrategy}
          disabled={isPreviewMode}
        >
          <div
            ref={setPageDroppableRef}
            className={`min-h-full rounded-xl ${
              isPreviewMode
                ? ""
                : `p-3 sm:p-4 transition-all duration-200 ease-in-out canvas-render-area ${
                    isPageOver
                      ? "bg-green-100/80 ring-2 ring-green-400 ring-dashed"
                      : ""
                  } ${
                    pageLayout.length === 0 && !isPageOver
                      ? "border-2 border-dashed border-slate-300/80"
                      : "border-transparent"
                  }`
            }`}
          >
            {pageLayout.map((sec, idx) => (
              <SectionComponent
                key={sec.id}
                sectionData={sec}
                sectionIndex={idx}
                onUpdateProps={onUpdateProps}
                onDelete={onDelete}
                onSelect={onSelect}
                selectedItemId={selectedItemId}
                onOpenStructureModal={onOpenStructureModal}
                isPreviewMode={isPreviewMode}
                onNavigate={onNavigate}
              />
            ))}
            {!isPreviewMode && pageLayout.length === 0 && !isPageOver && (
              <div className="flex flex-col items-center justify-center h-full text-center py-24 select-none pointer-events-none">
                <LucideIcons.LayoutTemplate
                  className="h-24 w-24 text-slate-300/90 mb-5"
                  strokeWidth={1}
                />
                <p className="text-slate-500 text-xl font-medium mt-2">
                  Your canvas is empty
                </p>
                <p className="text-slate-400/90 text-base">
                  Drag elements from the left panel or click "Add Section".
                </p>
              </div>
            )}
          </div>
        </SortableContext>
      </div>
    </div>
  );
}
export function PagePreviewRenderer({
  pageLayout,
  globalNavbar,
  globalFooter,
  onNavigate,
  previewDevice,
  activePageId,
}) {
  const deviceWidths = { mobile: "390px", tablet: "768px", desktop: "100%" };
  return (
    <div
      className={`flex-1 overflow-hidden bg-slate-200 flex justify-center items-start pt-6 md:pt-10`}
    >
      <div
        style={{
          width: deviceWidths[previewDevice],
          transition: "width 0.4s cubic-bezier(0.25, 1, 0.5, 1)",
        }}
        className={`h-[calc(100%-3rem)] md:h-[calc(100%-5rem)] bg-white shadow-2xl rounded-t-2xl overflow-y-auto scrollbar-thin scrollbar-thumb-slate-400 scrollbar-track-slate-100`}
      >
        <div className="max-w-full mx-auto">
          {globalNavbar && (
            <NavbarElement
              {...globalNavbar.props}
              isPreviewMode={true}
              onNavigate={onNavigate}
              previewDevice={previewDevice}
            />
          )}
          {pageLayout &&
            pageLayout.map((sec, idx) => (
              <SectionComponent
                key={`${activePageId}-${sec.id}-${idx}`}
                sectionData={sec}
                sectionIndex={idx}
                onUpdateProps={() => {}}
                onDelete={() => {}}
                onSelect={() => {}}
                selectedItemId={null}
                onOpenStructureModal={() => {}}
                isPreviewMode={true}
                onNavigate={onNavigate}
              />
            ))}
          {globalFooter && (
            <FooterElement
              {...globalFooter.props}
              isPreviewMode={true}
              onNavigate={onNavigate}
            />
          )}
        </div>
      </div>
    </div>
  );
}
function PageActions({
  onSave,
  onTogglePreview,
  isPreviewMode,
  pages,
  activePageId,
  onRenamePage,
  onDeletePage,
  previewDevice,
  onSetPreviewDevice,
  modalStates,
  setModalStates,
}) {
  const [showDeviceOptions, setShowDeviceOptions] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth < 768);
  useEffect(() => {
    const handleResize = () => setIsSmallScreen(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  const handleRename = () => {
    setModalStates((prev) => ({
      ...prev,
      renamePage: {
        isOpen: true,
        pageId: activePageId,
        currentName: pages[activePageId]?.name || "",
      },
    }));
  };
  const handleDelete = () => {
    if (Object.keys(pages).length <= 1) {
      setModalStates((prev) => ({
        ...prev,
        alert: {
          isOpen: true,
          title: "Action Not Allowed",
          message: "You cannot delete the only page in your project.",
        },
      }));
      return;
    }
    setModalStates((prev) => ({
      ...prev,
      deletePage: {
        isOpen: true,
        pageId: activePageId,
        pageName: pages[activePageId]?.name || "this page",
      },
    }));
  };
  const deviceButtons = (
    <>
      <button
        onClick={() => {
          onSetPreviewDevice("mobile");
          if (isSmallScreen) setShowDeviceOptions(false);
        }}
        title="Mobile View (390px)"
        className={`p-2 rounded-lg ${
          previewDevice === "mobile"
            ? "bg-[#2e8b57] text-white shadow-inner"
            : "text-slate-500 hover:bg-slate-100"
        }`}
      >
        <LucideIcons.Smartphone className="w-5 h-5" />
      </button>
      <button
        onClick={() => {
          onSetPreviewDevice("tablet");
          if (isSmallScreen) setShowDeviceOptions(false);
        }}
        title="Tablet View (768px)"
        className={`p-2 rounded-lg ${
          previewDevice === "tablet"
            ? "bg-[#2e8b57] text-white shadow-inner"
            : "text-slate-500 hover:bg-slate-100"
        }`}
      >
        <LucideIcons.Tablet className="w-5 h-5" />
      </button>
      <button
        onClick={() => {
          onSetPreviewDevice("desktop");
          if (isSmallScreen) setShowDeviceOptions(false);
        }}
        title="Desktop View (100%)"
        className={`p-2 rounded-lg ${
          previewDevice === "desktop"
            ? "bg-[#2e8b57] text-white shadow-inner"
            : "text-slate-500 hover:bg-slate-100"
        }`}
      >
        <LucideIcons.Monitor className="w-5 h-5" />
      </button>
    </>
  );
  return (
    <div
      className={`bg-white p-2.5 border-b border-slate-200/90 shadow-sm print-hidden`}
    >
      <div className="max-w-full mx-auto px-2 sm:px-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          {!isPreviewMode && Object.keys(pages).length > 0 && (
            <>
              <span className="text-sm text-slate-500 mr-1 hidden sm:inline">
                Editing:
              </span>
              <span className="text-sm font-semibold text-green-700">
                {pages[activePageId]?.name || "..."}
              </span>
              <button
                onClick={handleRename}
                title="Rename Current Page"
                className="p-2 text-slate-600 hover:text-green-600 rounded-lg hover:bg-green-50 transition-colors"
              >
                <LucideIcons.Edit3 className="w-4 h-4" />
              </button>
              {Object.keys(pages).length > 1 && (
                <button
                  onClick={handleDelete}
                  title="Delete Current Page"
                  className="p-2 text-red-500 hover:text-red-700 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <LucideIcons.Trash className="w-4 h-4" />
                </button>
              )}
            </>
          )}
          {isPreviewMode && (
            <div className="relative">
              {isSmallScreen ? (
                <button
                  onClick={() => setShowDeviceOptions((prev) => !prev)}
                  className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg"
                >
                  <LucideIcons.LayoutPanelTop className="w-5 h-5" />
                </button>
              ) : (
                <div className="flex items-center space-x-1.5 p-1 bg-slate-100/70 rounded-xl">
                  {deviceButtons}
                </div>
              )}
              {isSmallScreen && showDeviceOptions && (
                <div className="absolute top-full left-0 mt-2 bg-white p-1 rounded-lg shadow-lg border border-slate-200 flex space-x-1 z-10">
                  {deviceButtons}
                </div>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center space-x-2.5">
          <StyledModalButton onClick={onTogglePreview} variant="primary">
            {isPreviewMode ? (
              <>
                <LucideIcons.ArrowLeft className="w-4 h-4 mr-1.5" /> Back to
                Editor
              </>
            ) : (
              <>
                Preview <LucideIcons.Eye className="w-4 h-4 ml-1.5" />
              </>
            )}
          </StyledModalButton>
          {!isPreviewMode && (
            <StyledModalButton onClick={onSave} variant="primary">
              <LucideIcons.Save className="w-4 h-4 mr-1.5" /> Save Project
            </StyledModalButton>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ElementBuilderPage({
  onExternalSave,
  initialBuilderState,
}) {
  const initialPageIdGenerated = useMemo(() => generateId("page-home"), []);
  const [pages, setPages] = useState(
    initialBuilderState?.pages &&
      Object.keys(initialBuilderState.pages).length > 0
      ? initialBuilderState.pages
      : {
          [initialPageIdGenerated]: {
            id: initialPageIdGenerated,
            name: "Home",
            layout: [],
          },
        }
  );
  const [activePageId, setActivePageId] = useState(
    initialBuilderState?.activePageId && pages[initialBuilderState.activePageId]
      ? initialBuilderState.activePageId
      : initialPageIdGenerated
  );
  const [globalNavbar, setGlobalNavbar] = useState(
    initialBuilderState?.globalNavbar || null
  );
  const [globalFooter, setGlobalFooter] = useState(
    initialBuilderState?.globalFooter || null
  );
  useEffect(() => {
    if (!pages[activePageId]) {
      const availablePageIds = Object.keys(pages);
      if (availablePageIds.length > 0) {
        setActivePageId(availablePageIds[0]);
      } else {
        const newFallbackPageId = generateId("page-fallback");
        setPages({
          [newFallbackPageId]: {
            id: newFallbackPageId,
            name: "Fallback Page",
            layout: [],
          },
        });
        setActivePageId(newFallbackPageId);
      }
    }
  }, [pages, activePageId]);
  const [isStructureModalOpen, setIsStructureModalOpen] = useState(false);
  const [structureModalContext, setStructureModalContext] = useState({
    path: null,
    elementType: null,
  });
  const [selectedItem, setSelectedItem] = useState(null);
  const [activeDragItem, setActiveDragItem] = useState(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [previewDevice, setPreviewDevice] = useState("desktop");
  const [modalStates, setModalStates] = useState({
    addPage: { isOpen: false },
    renamePage: { isOpen: false, pageId: null, currentName: "" },
    deletePage: { isOpen: false, pageId: null, pageName: "" },
    alert: { isOpen: false, title: "", message: "" },
    dragEndAlert: { isOpen: false, title: "", message: "" },
    saveConfirm: { isOpen: false, title: "", message: "" },
  });
  const closeModal = (modalName) =>
    setModalStates((prev) => ({
      ...prev,
      [modalName]: { ...prev[modalName], isOpen: false },
    }));
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor)
  );
  const currentPageLayout = useMemo(() => {
    const pageData = pages[activePageId];
    const layout = pageData?.layout || [];
    if (!Array.isArray(layout)) {
      return [];
    }
    return layout;
  }, [pages, activePageId]);
  const updatePageLayout = (newLayoutOrCallback) => {
    setPages((prevPages) => {
      const currentActivePage = prevPages[activePageId];
      if (!currentActivePage) {
        return prevPages;
      }
      const newLayout =
        typeof newLayoutOrCallback === "function"
          ? newLayoutOrCallback(currentActivePage.layout || [])
          : newLayoutOrCallback;
      if (!Array.isArray(newLayout)) {
        return prevPages;
      }
      return {
        ...prevPages,
        [activePageId]: { ...currentActivePage, layout: newLayout },
      };
    });
  };
  const handleAddPage = () => {
    setModalStates((prev) => ({ ...prev, addPage: { isOpen: true } }));
  };
  const submitAddPage = (newPageName) => {
    if (newPageName && newPageName.trim() !== "") {
      let newPageId = newPageName
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");
      if (!newPageId) newPageId = generateId("page");
      if (pages[newPageId]) {
        newPageId = generateId("page");
        setModalStates((prev) => ({
          ...prev,
          alert: {
            isOpen: true,
            title: "Page ID Conflict",
            message: `Page with ID derived from "${newPageName}" already exists. A new unique ID "${newPageId}" was generated.`,
          },
        }));
      }
      setPages((prev) => ({
        ...prev,
        [newPageId]: { id: newPageId, name: newPageName.trim(), layout: [] },
      }));
      setActivePageId(newPageId);
      setSelectedItem(null);
    }
  };
  const handleSelectPage = (pageId) => {
    if (pages[pageId]) {
      setSelectedItem(null);
      setActivePageId(pageId);
    }
  };
  const submitRenamePage = (newName) => {
    if (
      newName &&
      newName.trim() !== "" &&
      newName.trim() !== modalStates.renamePage.currentName
    ) {
      setPages((prev) => ({
        ...prev,
        [modalStates.renamePage.pageId]: {
          ...prev[modalStates.renamePage.pageId],
          name: newName.trim(),
        },
      }));
    }
  };
  const confirmDeletePage = () => {
    const pageIdToDelete = modalStates.deletePage.pageId;
    if (Object.keys(pages).length <= 1) {
      setModalStates((prev) => ({
        ...prev,
        alert: {
          isOpen: true,
          title: "Error",
          message: "Cannot delete the last page.",
        },
      }));
      return;
    }
    setPages((prev) => {
      const newPages = { ...prev };
      delete newPages[pageIdToDelete];
      const remainingPageIds = Object.keys(newPages);
      let nextActivePageId =
        activePageId === pageIdToDelete
          ? remainingPageIds.length > 0
            ? remainingPageIds[0]
            : null
          : activePageId;
      if (!nextActivePageId && remainingPageIds.length > 0) {
        nextActivePageId = remainingPageIds[0];
      } else if (remainingPageIds.length === 0) {
        const newHomePageId = generateId("page-home");
        newPages[newHomePageId] = {
          id: newHomePageId,
          name: "Home",
          layout: [],
        };
        nextActivePageId = newHomePageId;
      }
      setActivePageId(nextActivePageId);
      return newPages;
    });
    setSelectedItem(null);
  };
  const handleNavigate = (pageSlugOrId) => {
    const targetPageId = pageSlugOrId.startsWith("/")
      ? pageSlugOrId.substring(1)
      : pageSlugOrId;
    if (pages[targetPageId]) {
      setActivePageId(targetPageId);
      if (!isPreviewMode) {
        setIsPreviewMode(true);
        setSelectedItem(null);
      }
    }
  };
  const handleOpenStructureModal = (contextPath, forElementType = null) => {
    setStructureModalContext({
      path: contextPath,
      elementType: forElementType,
    });
    setIsStructureModalOpen(true);
  };
  const handleSetStructure = (columnLayouts, context) => {
    const newColumns = columnLayouts.map((layout) => ({
      id: generateId("col"),
      type: "column",
      props: { width: layout.width },
      elements: [],
    }));
    updatePageLayout((prevLayout) => {
      const newLayout = JSON.parse(JSON.stringify(prevLayout || []));
      if (context.path === null && context.elementType === "section") {
        const newSection = {
          id: generateId("section"),
          type: "section",
          props: {
            backgroundType: "none",
            backgroundColor: "#FFFFFF",
            backgroundImageSrc: "",
            backgroundVideoSrc: "",
            backgroundVideoAutoplay: true,
            backgroundVideoLoop: true,
            backgroundVideoMuted: true,
            backgroundOverlayColor: "rgba(0,0,0,0.3)",
            backgroundOverlayOpacity: 0.0,
            paddingTop: "48px",
            paddingBottom: "48px",
            paddingLeft: "24px",
            paddingRight: "24px",
          },
          columns: newColumns,
        };
        newLayout.push(newSection);
      } else if (context.path && context.elementType === "innerSection") {
        const itemToUpdate = getItemByPath(
          { sections: newLayout },
          context.path
        );
        if (itemToUpdate && itemToUpdate.type === "innerSection") {
          itemToUpdate.columns = newColumns;
        }
      }
      return newLayout;
    });
  };
  const handleSelect = (id, type, path) => {
    if (isPreviewMode) return;
    const itemData = getItemByPath({ sections: currentPageLayout }, path);
    if (itemData) {
      let propsToSet = itemData.props;
      if (type === "element")
        propsToSet = { ...itemData.props, elementType: itemData.type };
      setSelectedItem({ id, type, path, props: propsToSet });
    } else {
      setSelectedItem(null);
    }
  };
  const handleSelectGlobalElement = (elementType) => {
    if (isPreviewMode) return;
    if (elementType === "navbar" && globalNavbar) {
      setSelectedItem({
        id: globalNavbar.id,
        type: "globalElement",
        itemType: "navbar",
        path: "globalNavbar",
        props: globalNavbar.props,
      });
    } else if (elementType === "footer" && globalFooter) {
      setSelectedItem({
        id: globalFooter.id,
        type: "globalElement",
        itemType: "footer",
        path: "globalFooter",
        props: globalFooter.props,
      });
    } else {
      setSelectedItem(null);
    }
  };
  const handleUpdateProps = (itemPath, newProps) => {
    if (itemPath === "globalNavbar" && globalNavbar) {
      const updatedGlobalNavbar = {
        ...globalNavbar,
        props: { ...globalNavbar.props, ...newProps },
      };
      setGlobalNavbar(updatedGlobalNavbar);
      if (selectedItem?.path === "globalNavbar")
        setSelectedItem((prev) => ({
          ...prev,
          props: updatedGlobalNavbar.props,
        }));
    } else if (itemPath === "globalFooter" && globalFooter) {
      const updatedGlobalFooter = {
        ...globalFooter,
        props: { ...globalFooter.props, ...newProps },
      };
      setGlobalFooter(updatedGlobalFooter);
      if (selectedItem?.path === "globalFooter")
        setSelectedItem((prev) => ({
          ...prev,
          props: updatedGlobalFooter.props,
        }));
    } else {
      updatePageLayout((prevLayout) => {
        const newLayout = JSON.parse(JSON.stringify(prevLayout || []));
        const itemToUpdate = getItemByPath({ sections: newLayout }, itemPath);
        if (itemToUpdate) {
          if (itemToUpdate.props && typeof itemToUpdate.props === "object") {
            itemToUpdate.props = { ...itemToUpdate.props, ...newProps };
          } else {
            if (typeof itemToUpdate === "object" && !itemToUpdate.props)
              itemToUpdate.props = {};
            itemToUpdate.props = { ...itemToUpdate.props, ...newProps };
          }
          if (selectedItem && selectedItem.path === itemPath) {
            const updatedItemFromLayout = getItemByPath(
              { sections: newLayout },
              itemPath
            );
            if (updatedItemFromLayout) {
              let propsToSetForSelection = updatedItemFromLayout.props;
              if (selectedItem.type === "element")
                propsToSetForSelection = {
                  ...updatedItemFromLayout.props,
                  elementType: updatedItemFromLayout.type,
                };
              else if (selectedItem.type === "section")
                propsToSetForSelection = updatedItemFromLayout.props;
              setSelectedItem((prev) => ({
                ...prev,
                props: propsToSetForSelection,
              }));
            }
          }
          return newLayout;
        }
        return prevLayout;
      });
    }
  };
  const handleDelete = (itemPath) => {
    if (isPreviewMode) return;
    updatePageLayout((prevLayout) => {
      const newLayout = JSON.parse(JSON.stringify(prevLayout || []));
      if (deleteItemByPath({ sections: newLayout }, itemPath)) {
        if (selectedItem && selectedItem.path === itemPath)
          setSelectedItem(null);
        return newLayout;
      }
      return prevLayout;
    });
  };
  const handleDeleteGlobalElement = (elementType) => {
    if (elementType === "navbar") {
      setGlobalNavbar(null);
      if (selectedItem?.path === "globalNavbar") setSelectedItem(null);
    } else if (elementType === "footer") {
      setGlobalFooter(null);
      if (selectedItem?.path === "globalFooter") setSelectedItem(null);
    }
  };
  const findColumn = (layout, columnId) => {
    for (const section of layout) {
      if (section.columns) {
        for (const col of section.columns) {
          if (col.id === columnId) return col;
          if (col.elements) {
            for (const el of col.elements) {
              if (el.type === "innerSection" && el.columns) {
                const innerCol = el.columns.find((ic) => ic.id === columnId);
                if (innerCol) return innerCol;
              }
            }
          }
        }
      }
    }
    return null;
  };
  const handleDragStart = (event) => {
    if (isPreviewMode) return;
    setActiveDragItem(event.active);
  };
  const handleDragEnd = (event) => {
    if (isPreviewMode) return;
    const { active, over } = event;
    setActiveDragItem(null);
    if (!over) return;
    if (active.id === over.id && active.data.current?.type !== "paletteItem")
      return;
    const activeType = active.data.current?.type;
    const activeId = active.id;
    const overId = over.id;
    const overDataType = over.data.current?.type;
    const overColumnId =
      overDataType === "column"
        ? over.data.current?.columnId
        : overDataType === "canvasElement"
        ? over.data.current?.parentColumnId
        : null;
    if (activeType === "paletteItem") {
      const currentConfig = active.data.current.config;
      if (currentConfig.isGlobalOnly) {
        const defaultProps =
          AVAILABLE_ELEMENTS_CONFIG.find((el) => el.id === currentConfig.id)
            ?.defaultProps || {};
        if (currentConfig.id === "navbar") {
          setGlobalNavbar({
            id: "global-navbar",
            type: "navbar",
            props: { ...defaultProps },
            path: "globalNavbar",
          });
          handleSelectGlobalElement("navbar");
        } else if (currentConfig.id === "footer") {
          setGlobalFooter({
            id: "global-footer",
            type: "footer",
            props: { ...defaultProps },
            path: "globalFooter",
          });
          handleSelectGlobalElement("footer");
        }
        return;
      }
    }
    updatePageLayout((prevLayout) => {
      let newLayout = JSON.parse(JSON.stringify(prevLayout || []));
      if (activeType === "paletteItem") {
        const currentConfig = active.data.current.config;
        const newElementInstance = {
          id: generateId(currentConfig.id),
          type: currentConfig.id,
          props: { ...currentConfig.defaultProps },
        };
        if (currentConfig.hasOwnColumns) newElementInstance.columns = [];
        if (
          overDataType === "column" ||
          (overDataType === "canvasElement" && overColumnId)
        ) {
          const targetColId =
            overDataType === "column"
              ? over.id.replace("col-", "")
              : overColumnId;
          const targetColumn = findColumn(newLayout, targetColId);
          if (targetColumn) {
            if (!targetColumn.elements) targetColumn.elements = [];
            let insertAtIndex = targetColumn.elements.length;
            if (overDataType === "canvasElement") {
              const overElementIndex = targetColumn.elements.findIndex(
                (el) => el.id === over.id
              );
              if (overElementIndex !== -1) insertAtIndex = overElementIndex;
            }
            targetColumn.elements.splice(insertAtIndex, 0, newElementInstance);
          } else {
            return prevLayout;
          }
        } else if (overDataType === "page" || overDataType === "section") {
          if (newElementInstance.type === "innerSection") {
            setModalStates((prev) => ({
              ...prev,
              dragEndAlert: {
                isOpen: true,
                title: "Placement Info",
                message:
                  "Inner Sections are best placed inside an existing section's column. Consider adding a section first or using 'Set Inner Structure'. This will create a new section for it.",
              },
            }));
          }
          const newSection = {
            id: generateId("section"),
            type: "section",
            props: {
              backgroundType: "none",
              backgroundColor: "#FFFFFF",
              backgroundImageSrc: "",
              backgroundVideoSrc: "",
              backgroundVideoAutoplay: true,
              backgroundVideoLoop: true,
              backgroundVideoMuted: true,
              backgroundOverlayColor: "rgba(0,0,0,0.3)",
              backgroundOverlayOpacity: 0.0,
              paddingTop: "48px",
              paddingBottom: "48px",
              paddingLeft: "24px",
              paddingRight: "24px",
            },
            columns: [
              {
                id: generateId("col"),
                type: "column",
                props: { width: "100%" },
                elements: [newElementInstance],
              },
            ],
          };
          let sectionInsertIndex = newLayout.length;
          if (overDataType === "section") {
            const targetSectionIndex = newLayout.findIndex(
              (s) => s.id === over.id
            );
            if (targetSectionIndex !== -1) {
              sectionInsertIndex = targetSectionIndex + 1;
            }
          }
          newLayout.splice(sectionInsertIndex, 0, newSection);
        } else {
          return prevLayout;
        }
      } else if (activeType === "section") {
        const activeSectionIndex = newLayout.findIndex(
          (s) => s.id === activeId
        );
        if (activeSectionIndex === -1) {
          return prevLayout;
        }
        let overSectionIndex = -1;
        if (overDataType === "section" && overId !== activeId) {
          overSectionIndex = newLayout.findIndex((s) => s.id === overId);
        } else if (
          overDataType === "page" &&
          overId === "page-sections-droppable"
        ) {
          const potentialOverSection = newLayout.find((s) => s.id === overId);
          if (potentialOverSection) {
            overSectionIndex = newLayout.findIndex((s) => s.id === overId);
          } else {
            overSectionIndex = newLayout.length;
          }
        } else if (
          overDataType === "column" ||
          overDataType === "canvasElement"
        ) {
          let parentSectionId = null;
          if (overDataType === "column") {
            const colPath = over.data.current?.path;
            if (colPath)
              parentSectionId = colPath.match(/sections\[(\d+)\]/)?.[1];
            if (parentSectionId && newLayout[parseInt(parentSectionId)])
              parentSectionId = newLayout[parseInt(parentSectionId)]?.id;
            else parentSectionId = null;
          } else {
            const elPath = over.data.current?.elementData?.path;
            if (elPath)
              parentSectionId = elPath.match(/sections\[(\d+)\]/)?.[1];
            if (parentSectionId && newLayout[parseInt(parentSectionId)])
              parentSectionId = newLayout[parseInt(parentSectionId)]?.id;
            else parentSectionId = null;
          }
          if (parentSectionId) {
            overSectionIndex = newLayout.findIndex(
              (s) => s.id === parentSectionId
            );
          }
          if (overSectionIndex === -1) {
            overSectionIndex = newLayout.length;
          }
        }
        if (
          overSectionIndex !== -1 &&
          activeSectionIndex !== overSectionIndex
        ) {
          newLayout = arrayMove(
            newLayout,
            activeSectionIndex,
            overSectionIndex
          );
        } else if (
          overSectionIndex === -1 &&
          overId === "page-sections-droppable" &&
          activeSectionIndex !== -1
        ) {
          const movedSection = newLayout.splice(activeSectionIndex, 1)[0];
          newLayout.push(movedSection);
        } else {
          return prevLayout;
        }
      } else if (activeType === "canvasElement") {
        const sourceColumnId = active.data.current.parentColumnId;
        const sourceColumn = findColumn(newLayout, sourceColumnId);
        let targetColumn;
        let targetElementInsertIndex = 0;
        if (overDataType === "column") {
          targetColumn = findColumn(newLayout, over.id.replace("col-", ""));
          if (targetColumn)
            targetElementInsertIndex = targetColumn.elements?.length || 0;
        } else if (overDataType === "canvasElement") {
          targetColumn = findColumn(
            newLayout,
            over.data.current.parentColumnId
          );
          if (targetColumn) {
            const overElIdx = targetColumn.elements.findIndex(
              (el) => el.id === over.id
            );
            if (overElIdx !== -1) targetElementInsertIndex = overElIdx;
            else targetElementInsertIndex = targetColumn.elements?.length || 0;
          }
        } else {
          return prevLayout;
        }
        if (sourceColumn && targetColumn) {
          const activeElementIndex = sourceColumn.elements.findIndex(
            (el) => el.id === activeId
          );
          if (activeElementIndex !== -1) {
            const [movedElement] = sourceColumn.elements.splice(
              activeElementIndex,
              1
            );
            if (!targetColumn.elements) targetColumn.elements = [];
            if (
              sourceColumn.id === targetColumn.id &&
              targetElementInsertIndex > activeElementIndex
            ) {
              targetElementInsertIndex--;
            }
            targetColumn.elements.splice(
              targetElementInsertIndex,
              0,
              movedElement
            );
          } else {
            return prevLayout;
          }
        } else {
          return prevLayout;
        }
      } else {
        return prevLayout;
      }
      if (selectedItem && selectedItem.type !== "globalElement") {
        const found = findItemAndPathRecursive(
          newLayout,
          selectedItem.id,
          "sections"
        );
        if (found) {
          const { item: newItemData, path: newPath } = found;
          let propsToSet = newItemData.props;
          if (selectedItem.type === "element")
            propsToSet = {
              ...newItemData.props,
              elementType: newItemData.type,
            };
          else if (selectedItem.type === "section")
            propsToSet = newItemData.props;
          setSelectedItem({
            id: selectedItem.id,
            type: selectedItem.type,
            path: newPath,
            props: propsToSet,
          });
        } else {
          setSelectedItem(null);
        }
      }
      return newLayout;
    });
  };
  const togglePreviewMode = () => {
    if (isPreviewMode) {
      setIsPreviewMode(false);
    } else {
      setSelectedItem(null);
      setIsPreviewMode(true);
    }
  };
  useEffect(() => {
    if (isPreviewMode) {
      setSelectedItem(null);
    }
  }, [isPreviewMode, activePageId]);
  useEffect(() => {
    const pageExists = !!pages[activePageId];
    if (!pageExists && Object.keys(pages).length > 0) {
      setActivePageId(Object.keys(pages)[0]);
    }
  }, [activePageId, pages]);
  const handleSave = () => {
    const saveData = {
      pages: pages,
      activePageId: activePageId,
      globalNavbar: globalNavbar,
      globalFooter: globalFooter,
    };
    if (onExternalSave) {
      onExternalSave(saveData);
    }
    setModalStates((prev) => ({
      ...prev,
      saveConfirm: {
        isOpen: true,
        title: "Save Successful",
        message: "Your project data has been successfully saved.",
      },
    }));
  };
  if (isPreviewMode) {
    return (
      <div className="flex flex-col h-screen bg-white antialiased">
        <PageActions
          onTogglePreview={togglePreviewMode}
          isPreviewMode={isPreviewMode}
          pages={pages}
          activePageId={activePageId}
          previewDevice={previewDevice}
          onSetPreviewDevice={setPreviewDevice}
          modalStates={modalStates}
          setModalStates={setModalStates}
        />
        <PagePreviewRenderer
          pageLayout={currentPageLayout}
          globalNavbar={globalNavbar}
          globalFooter={globalFooter}
          onNavigate={handleNavigate}
          previewDevice={previewDevice}
          activePageId={activePageId}
        />
      </div>
    );
  }
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      disabled={isPreviewMode}
    >
      <div className="flex flex-col h-screen bg-slate-100 antialiased">
        <PageActions
          onSave={handleSave}
          onTogglePreview={togglePreviewMode}
          isPreviewMode={isPreviewMode}
          pages={pages}
          activePageId={activePageId}
          onSelectPage={handleSelectPage}
          onRenamePage={() => {}}
          onDeletePage={() => {}}
          previewDevice={previewDevice}
          onSetPreviewDevice={setPreviewDevice}
          modalStates={modalStates}
          setModalStates={setModalStates}
        />
        <div className="flex flex-row flex-1 overflow-hidden">
          {!isPreviewMode &&
            (selectedItem ? (
              <PropertiesPanel
                selectedItemData={selectedItem}
                onUpdateSelectedProps={handleUpdateProps}
                onClosePanel={() => setSelectedItem(null)}
                pages={pages}
                onDeleteGlobalElement={handleDeleteGlobalElement}
              />
            ) : (
              <ElementPalette
                onAddTopLevelSection={() =>
                  handleOpenStructureModal(null, "section")
                }
                pages={pages}
                activePageId={activePageId}
                onAddPage={handleAddPage}
                onSelectPage={handleSelectPage}
              />
            ))}
          <div className="flex-1 flex flex-col overflow-hidden relative">
            {globalNavbar && !isPreviewMode && (
              <header className="bg-slate-100 p-2 border-b border-slate-200/70 shadow-sm z-40">
                <div className="absolute top-0 left-2 text-[10px] bg-blue-500 text-white px-2 py-0.5 rounded-b-md font-bold">
                  Global
                </div>
                <NavbarElement
                  {...globalNavbar.props}
                  path={globalNavbar.path}
                  isSelected={selectedItem?.id === globalNavbar.id}
                  onSelect={() => handleSelectGlobalElement("navbar")}
                  onUpdate={(newProps) =>
                    handleUpdateProps("globalNavbar", newProps)
                  }
                  onDelete={() => handleDeleteGlobalElement("navbar")}
                  isPreviewMode={false}
                  onNavigate={handleNavigate}
                />
              </header>
            )}
            <main className="flex-1 overflow-y-auto">
              <CanvasArea
                pageLayout={currentPageLayout}
                onUpdateProps={handleUpdateProps}
                onDelete={handleDelete}
                onSelect={handleSelect}
                selectedItemId={selectedItem ? selectedItem.id : null}
                onOpenStructureModal={handleOpenStructureModal}
                isPreviewMode={isPreviewMode}
                onNavigate={handleNavigate}
              />
            </main>
            {globalFooter && !isPreviewMode && (
              <footer className="bg-slate-100 p-2 border-t border-slate-200/70 shadow-sm z-40">
                <div className="absolute bottom-full left-2 text-[10px] bg-blue-500 text-white px-2 py-0.5 rounded-t-md font-bold">
                  Global
                </div>
                <FooterElement
                  {...globalFooter.props}
                  path={globalFooter.path}
                  isSelected={selectedItem?.id === globalFooter.id}
                  onSelect={() => handleSelectGlobalElement("footer")}
                  onUpdate={(newProps) =>
                    handleUpdateProps("globalFooter", newProps)
                  }
                  onDelete={() => handleDeleteGlobalElement("footer")}
                  isPreviewMode={false}
                  onNavigate={handleNavigate}
                />
              </footer>
            )}
          </div>
        </div>
      </div>
      <DragOverlay dropAnimation={null} zIndex={9999}>
        {activeDragItem ? (
          activeDragItem.data.current?.type === "paletteItem" ? (
            <PaletteItemDragOverlay
              config={activeDragItem.data.current.config}
            />
          ) : activeDragItem.data.current?.type === "canvasElement" ? (
            <div className="p-3 bg-green-100 border-2 border-green-400 rounded-xl shadow-xl opacity-90 text-sm font-semibold text-green-700">
              Moving:{" "}
              {AVAILABLE_ELEMENTS_CONFIG.find(
                (c) => c.id === activeDragItem.data.current?.elementType
              )?.name || "Element"}
            </div>
          ) : activeDragItem.data.current?.type === "section" ? (
            <div className="p-4 bg-emerald-100 border-2 border-emerald-400 rounded-xl shadow-xl opacity-90 text-base font-semibold text-emerald-700">
              Moving Section
            </div>
          ) : null
        ) : null}
      </DragOverlay>
      <StructureSelectorModal
        isOpen={isStructureModalOpen}
        onClose={() => setIsStructureModalOpen(false)}
        onSelectStructure={handleSetStructure}
        context={structureModalContext}
      />
      <InputModal
        isOpen={modalStates.addPage.isOpen}
        onClose={() => closeModal("addPage")}
        onSubmit={submitAddPage}
        title="Add New Page"
        inputLabel="Page Name"
        placeholder="e.g., About Us"
        initialValue={`Page ${Object.keys(pages).length + 1}`}
      />
      <InputModal
        isOpen={modalStates.renamePage.isOpen}
        onClose={() => closeModal("renamePage")}
        onSubmit={submitRenamePage}
        title="Rename Page"
        inputLabel="New Page Name"
        initialValue={modalStates.renamePage.currentName}
      />
      <ConfirmationModal
        isOpen={modalStates.deletePage.isOpen}
        onClose={() => closeModal("deletePage")}
        onConfirm={confirmDeletePage}
        title="Delete Page"
        message={`Are you sure you want to delete the page "${modalStates.deletePage.pageName}"? This action cannot be undone.`}
        confirmButtonVariant="danger"
      />
      <ConfirmationModal
        isOpen={modalStates.alert.isOpen}
        onClose={() => closeModal("alert")}
        onConfirm={() => {}}
        title={modalStates.alert.title}
        message={modalStates.alert.message}
        confirmText="OK"
        confirmButtonVariant="primary"
      />
      <ConfirmationModal
        isOpen={modalStates.dragEndAlert.isOpen}
        onClose={() => closeModal("dragEndAlert")}
        onConfirm={() => {}}
        title={modalStates.dragEndAlert.title}
        message={modalStates.dragEndAlert.message}
        confirmText="OK"
        confirmButtonVariant="primary"
      />
      <ConfirmationModal
        isOpen={modalStates.saveConfirm.isOpen}
        onClose={() => closeModal("saveConfirm")}
        onConfirm={() => {}}
        title={modalStates.saveConfirm.title}
        message={modalStates.saveConfirm.message}
        confirmText="Understood"
        confirmButtonVariant="primary"
      />
    </DndContext>
  );
}