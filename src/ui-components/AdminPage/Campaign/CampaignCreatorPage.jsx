import React, { useState, useMemo, useEffect } from "react";
import * as LucideIcons from "lucide-react";
import { UserCheck, UsersRound as AudienceIcon } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
  getContactLists,
  addOrUpdateCampaign,
  getCampaignById,
} from "../../../utils/localStorageHelper";
import ElementBuilderPage, { PagePreviewRenderer } from "./Header";

// In CampaignCreatorPage.js...

const generateInitialAnalyticsData = (campaignId) => {
    const seed = campaignId.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    const random = (min, max, offset = 0) => Math.floor((Math.sin(seed + offset) * 10000 % 1) * (max - min + 1) + min);

    const trend = (base, len = 7) => Array.from({length: len}, (_, i) => ({ val: base + random(-base*0.1, base*0.1, i) }));
    const totalViews = random(5000, 25000, 1);
    const totalVisitors = Math.floor(totalViews * (random(70, 95, 2)/100));
    const totalClicks = Math.floor(totalVisitors * (random(20, 60, 3)/100));
    const totalConversions = Math.floor(totalClicks * (random(5, 25, 4)/100));
    
    const detailedAudience = Array.from({length: random(25, 75, 500)}, (_, i) => {
        const statuses = ['Converted', 'Clicked', 'Viewed', 'Sent'];
        const status = statuses[random(0,3, 501+i)];
        const name = ['Alice', 'Bob', 'Charlie', 'Diana', 'Ethan', 'Fiona', 'George', 'Hannah'][random(0,7, 502+i)] + ' ' + ['Johnson', 'Smith', 'Lee', 'Patel'][random(0,3, 503+i)];
        const email = name.toLowerCase().replace(' ','.') + '@example.com';
        return { id: `aud-${i}`, name, email, status, lastActivity: `${random(1, 28, 504+i)}d ago` };
    });

    return {
        kpi: {
            totalViews: { value: totalViews, change: random(-10, 25, 5), trend: trend(totalViews/7) },
            uniqueVisitors: { value: totalVisitors, change: random(-10, 20, 6), trend: trend(totalVisitors/7) },
            ctr: { value: parseFloat(((totalViews > 0 ? totalClicks / totalViews : 0) * 100).toFixed(1)), change: random(-5, 15, 7), trend: trend(5) },
            conversions: { value: totalConversions, change: random(-15, 30, 8), trend: trend(totalConversions/7) },
        },
        performanceChart: Array.from({ length: 30 }, (_, i) => ({
            date: new Date(new Date().setDate(new Date().getDate() - (29 - i))).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            views: random(150, 500, 10 + i), clicks: random(10, 80, 50 + i),
        })),
        deviceData: [
            { name: 'Desktop', value: random(55, 70, 400) }, { name: 'Mobile', value: random(20, 35, 401) }, { name: 'Tablet', value: random(5, 10, 402) },
        ],
        topReferrers: [
            { source: 'Google', value: random(30, 65, 200), color: '#34A853' }, { source: 'LinkedIn', value: random(15, 40, 201), color: '#0A66C2' },
            { source: 'Direct', value: random(5, 20, 202), color: '#708090' }, { source: 'Email Campaign', value: random(5, 15, 203), color: '#5F9EA0' },
        ].sort((a,b) => b.value - a.value),
        conversionFunnel: [
            { stage: 'Sent', value: totalVisitors, iconName: 'Users' },
            { stage: 'Viewed', value: totalViews, iconName: 'Eye' },
            { stage: 'Clicked', value: totalClicks, iconName: 'MousePointerClick' },
            { stage: 'Converted', value: totalConversions, iconName: 'Target' }
        ],
        geoBreakdown: [
            { name: 'United States', value: random(20, 50, 100) }, { name: 'United Kingdom', value: random(10, 25, 101) },
            { name: 'Canada', value: random(5, 15, 102) }, { name: 'Germany', value: random(5, 10, 103) },
            { name: 'India', value: random(5, 15, 104) }, { name: 'Australia', value: random(3, 10, 105) },
        ].sort((a,b) => b.value - a.value),
        detailedAudience
    };
};

const mockGenerateId = (prefix = "tpl-id") =>
  `${prefix}-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .substring(2, 7)}`;

const StepperNav = ({ currentStep, steps, setCurrentStep }) => {
  return (
    <nav
      className="w-full lg:w-72 lg:ml-64 lg:pt-24 p-6 bg-white border-r border-slate-200 
                   lg:fixed lg:top-0 lg:left-0 lg:h-screen lg:overflow-y-auto"
    >
      <div className="md:text-left mb-10 flex items-center md:block">
        <LucideIcons.ClipboardCheck
          className="w-10 h-10 text-green-600 mr-3 md:mr-0 md:mb-2"
          strokeWidth={1.5}
        />
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Campaign Setup</h1>
          <p className="text-xs text-slate-500 mt-0.5">Follow the steps</p>
        </div>
      </div>
      <ol role="list" className="space-y-2">
        {steps.map((step) => (
          <li key={step.name}>
            <button
              onClick={() =>
                currentStep > step.id ||
                step.id === currentStep + 1 ||
                step.id === currentStep
                  ? setCurrentStep(step.id)
                  : null
              }
              disabled={step.id > currentStep + 1 && !(currentStep > step.id)}
              className={`w-full flex items-center p-3 rounded-lg transition-colors duration-150 group
                ${
                  currentStep === step.id
                    ? "bg-green-50"
                    : currentStep > step.id
                    ? "hover:bg-slate-100"
                    : "hover:bg-slate-100 opacity-60 cursor-not-allowed"
                }
                ${
                  (currentStep > step.id ||
                    step.id === currentStep + 1 ||
                    step.id === currentStep) &&
                  !(step.id > currentStep + 1 && !(currentStep > step.id))
                    ? "cursor-pointer"
                    : ""
                }
              `}
            >
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-all duration-150 border-2
                  ${
                    currentStep > step.id
                      ? "bg-[#2e8b57] border-green-500 text-white"
                      : ""
                  } ${
                  currentStep === step.id
                    ? "bg-[#2e8b57] border-green-600 text-white scale-105"
                    : ""
                }
                  ${
                    currentStep < step.id
                      ? "bg-slate-200 border-slate-200 text-slate-500 group-hover:border-slate-300"
                      : ""
                  } `}
              >
                {currentStep > step.id ? (
                  <LucideIcons.Check size={16} strokeWidth={3} />
                ) : (
                  step.id
                )}
              </span>
              <span
                className={`ml-3 text-sm truncate ${
                  currentStep === step.id ? "text-green-700 font-semibold" : ""
                } ${
                  currentStep > step.id
                    ? "text-slate-700 group-hover:text-slate-800"
                    : ""
                } ${currentStep < step.id ? "text-slate-500" : ""} `}
              >
                {step.name}
              </span>
            </button>
          </li>
        ))}
      </ol>
    </nav>
  );
};

const InputField = ({
  label,
  type = "text",
  value,
  onChange,
  name,
  placeholder,
  required = false,
  icon,
  accept,
  className = "",
}) => (
  <div className={`mb-5 ${className}`}>
    <label
      htmlFor={name}
      className="block text-xs font-medium text-slate-600 mb-1"
    >
      {" "}
      {label} {required && <span className="text-red-500">*</span>}{" "}
    </label>
    <div className="relative group">
      {" "}
      {icon && (
        <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">
          {React.cloneElement(icon, {
            className:
              "h-4 w-4 text-slate-400 group-focus-within:text-green-600 transition-colors duration-200",
          })}
        </div>
      )}
      <input
        type={type}
        name={name}
        id={name}
        value={value === null || typeof value === "undefined" ? "" : value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        accept={accept}
        className={`block w-full ${
          icon ? "pl-9" : "px-3"
        } py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/70 focus:border-green-500 transition-all duration-200 sm:text-sm placeholder-slate-400 bg-white text-slate-800 shadow-sm hover:border-slate-400 focus:shadow-md`}
      />
    </div>
  </div>
);

const StyledButton = ({
  onClick,
  children,
  type = "button",
  variant = "primary",
  disabled = false,
  className = "",
  iconLeft,
  iconRight,
}) => {
  const baseStyle =
    "px-5 py-2 rounded-lg font-medium text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-150 ease-in-out inline-flex items-center justify-center group transform hover:-translate-y-px active:translate-y-0";
  const greenButton =
    "bg-[#2e8b57] hover:bg-green-700 text-white shadow-md hover:shadow-lg focus:ring-green-500 focus:ring-offset-white active:bg-green-800";
  const variantStyles = {
    primary: greenButton,
    secondary:
      "bg-slate-100 hover:bg-slate-200 text-slate-700 focus:ring-slate-400 border border-slate-300 hover:border-slate-400 shadow-sm hover:shadow-md active:bg-slate-300 focus:ring-offset-white",
    launch: `${greenButton} text-base px-6 py-2.5`,
    success: `${greenButton} text-base px-6 py-2.5`,
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyle} ${variantStyles[variant]} ${
        disabled ? "opacity-60 cursor-not-allowed saturate-50" : ""
      } ${className}`}
    >
      {" "}
      {iconLeft &&
        React.cloneElement(iconLeft, {
          className:
            "w-4 h-4 mr-1.5 -ml-1 group-hover:scale-105 transition-transform",
        })}{" "}
      {children}{" "}
      {iconRight &&
        React.cloneElement(iconRight, {
          className:
            "w-4 h-4 ml-1.5 -mr-1 group-hover:translate-x-0.5 transition-transform",
        })}{" "}
    </button>
  );
};

const OptionCard = ({
  title,
  description,
  selected,
  onClick,
  icon,
  disabled = false,
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={`w-full p-4 border rounded-xl text-left transition-all duration-150 ease-in-out group
            ${
              selected
                ? "border-green-500 bg-green-50 ring-1 ring-green-500/80 shadow-lg transform scale-[1.01]"
                : `border-slate-300 bg-white ${
                    disabled
                      ? "opacity-60 cursor-not-allowed bg-slate-50"
                      : "hover:border-green-400/70 hover:bg-green-50/30 hover:shadow-md"
                  }`
            } `}
  >
    <div className="flex items-center">
      {" "}
      {icon && (
        <div
          className={`mr-3 p-2 rounded-lg transition-colors duration-150 ${
            selected
              ? "bg-green-100 text-green-600"
              : `bg-slate-100 text-slate-500 ${
                  !disabled
                    ? "group-hover:bg-slate-200 group-hover:text-slate-600"
                    : ""
                }`
          }`}
        >
          {React.cloneElement(icon, { className: "w-5 h-5" })}
        </div>
      )}
      <div className="flex-1">
        {" "}
        <h3
          className={`text-sm font-semibold ${
            selected
              ? "text-green-700"
              : `text-slate-700 ${
                  !disabled ? "group-hover:text-slate-800" : ""
                }`
          }`}
        >
          {title}
        </h3>{" "}
        {description && (
          <p
            className={`text-xs text-slate-500 mt-0.5 ${
              !disabled ? "group-hover:text-slate-600" : ""
            }`}
          >
            {description}
          </p>
        )}{" "}
      </div>
      {selected && (
        <div className="w-4 h-4 rounded-full bg-[#2e8b57] flex items-center justify-center ml-2 shrink-0">
          <LucideIcons.Check
            className="h-2.5 w-2.5 text-white"
            strokeWidth={3}
          />
        </div>
      )}
    </div>
  </button>
);

const SummaryCard = ({ title, icon, children }) => (
  <div className="bg-white p-5 rounded-xl shadow-lg border border-slate-200">
    {" "}
    <h3 className="text-md font-semibold text-slate-700 mb-3 flex items-center">
      {" "}
      {React.cloneElement(icon, {
        className: "w-5 h-5 mr-2 text-green-600 stroke-[2]",
      })}{" "}
      {title}{" "}
    </h3>{" "}
    <div className="space-y-1.5 text-xs text-slate-600"> {children} </div>{" "}
  </div>
);

const SuccessModal = ({
  isOpen,
  onConfirm,
  title,
  message,
  buttonText,
  onSecondaryAction,
  secondaryButtonText,
}) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-slate-500/30 backdrop-blur-sm flex items-center justify-center z-[300] p-4 transform transition-opacity duration-150 ease-out animate-fadeInModal">
      <div className="bg-white p-8 sm:p-10 rounded-xl shadow-2xl w-full max-w-md text-center transform transition-all duration-150 ease-out animate-scaleUpModal border border-slate-200">
        <div className="mx-auto flex items-center justify-center h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-green-100 mb-5 sm:mb-6 ring-4 ring-green-200/70">
          <svg
            className="checkmark h-8 w-8 sm:h-10 sm:w-10 text-green-600"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 52 52"
          >
            {" "}
            <circle
              className="checkmark__circle"
              cx="26"
              cy="26"
              r="25"
              fill="none"
            />{" "}
            <path
              className="checkmark__check"
              fill="none"
              d="M14.1 27.2l7.1 7.2 16.7-16.8"
            />{" "}
          </svg>
        </div>
        <h3 className="text-xl sm:text-2xl font-bold text-slate-800 mb-2">
          {title || "Campaign Saved!"}
        </h3>
        <p className="text-slate-500 mb-6 sm:mb-8 text-sm sm:text-base">
          {" "}
          {message ||
            "Your campaign configuration has been successfully saved."}{" "}
        </p>
        <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-3">
          {onSecondaryAction && secondaryButtonText && (
            <StyledButton onClick={onSecondaryAction} variant="secondary">
              {" "}
              {secondaryButtonText}{" "}
            </StyledButton>
          )}
          <StyledButton
            onClick={onConfirm}
            variant="success"
            iconLeft={<LucideIcons.PlusCircle />}
          >
            {" "}
            {buttonText || "Create New Campaign"}{" "}
          </StyledButton>
        </div>
      </div>
      <style jsx>{`
        @keyframes fadeInModal {
          0% {
            opacity: 0;
          }
          100% {
            opacity: 1;
          }
        }
        .animate-fadeInModal {
          animation: fadeInModal 0.15s ease-out forwards;
        }
        @keyframes scaleUpModal {
          0% {
            transform: scale(0.95) translateY(10px);
            opacity: 0;
          }
          100% {
            transform: scale(1) translateY(0);
            opacity: 1;
          }
        }
        .animate-scaleUpModal {
          animation: scaleUpModal 0.2s cubic-bezier(0.22, 1, 0.36, 1) 0.05s
            forwards;
        }
        .checkmark__circle {
          stroke-dasharray: 166;
          stroke-dashoffset: 166;
          stroke-width: 3;
          stroke-miterlimit: 10;
          stroke: #4ade80;
          fill: none;
          animation: stroke 0.6s cubic-bezier(0.65, 0, 0.45, 1) 0.3s forwards;
        }
        .checkmark__check {
          transform-origin: 50% 50%;
          stroke-dasharray: 48;
          stroke-dashoffset: 48;
          stroke-width: 4;
          stroke: #16a34a;
          animation: stroke 0.3s cubic-bezier(0.65, 0, 0.45, 1) 0.7s forwards;
        }
        @keyframes stroke {
          100% {
            stroke-dashoffset: 0;
          }
        }
      `}</style>
    </div>
  );
};

const initialCampaignDetails = { campaignName: "", startTime: "", endTime: "" };
const initialDataSource = {
  type: "file",
  file: null,
  fileName: "",
  fields: { firstName: "", lastName: "", email: "", linkedInUrl: "" },
  contactListId: null,
  selectedContactIds: [],
};
const initialTemplateConfig = {
  type: "create",
  selectedTemplateId: null,
  templateData: null,
  editingTemplate: null,
};

export default function CampaignCreatorPage() {
  const { campaignId } = useParams();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [currentLoadedCampaignId, setCurrentLoadedCampaignId] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [campaignDetails, setCampaignDetails] = useState(
    initialCampaignDetails
  );
  const [dataSource, setDataSource] = useState(initialDataSource);
  const [availableContactLists, setAvailableContactLists] = useState([]);
  const [contactsInSelectedList, setContactsInSelectedList] = useState([]);
  const [searchTermInList, setSearchTermInList] = useState("");
  const [templateConfig, setTemplateConfig] = useState(initialTemplateConfig);
  const [previewDevice, setPreviewDevice] = useState("desktop");
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    if (campaignId && campaignId !== currentLoadedCampaignId) {
      const campaignToEdit = getCampaignById(campaignId);
      if (campaignToEdit) {
        setIsEditing(true);
        setCurrentLoadedCampaignId(campaignId);
        setCampaignDetails(
          campaignToEdit.campaignDetails || initialCampaignDetails
        );
        setDataSource(campaignToEdit.dataSource || initialDataSource);
        setTemplateConfig(
          campaignToEdit.templateConfig || initialTemplateConfig
        );
        setCurrentStep(1);
      } else {
        toast.error("Campaign not found. Redirecting to create new.");
        navigate("/campaigns/create");
        resetCampaignStates();
      }
    } else if (!campaignId && currentLoadedCampaignId) {
      resetCampaignStates();
      setCurrentLoadedCampaignId(null);
      setIsEditing(false);
    }
  }, [campaignId, navigate, currentLoadedCampaignId]);

  const mockTemplates = useMemo(() => {
    const pageId1 = mockGenerateId("page");
    const pageId2 = mockGenerateId("page");
    return [
      {
        id: "tpl_corporate_sleek",
        name: "Sleek Corporate Testimonial",
        builderData: {
          pages: {
            [pageId1]: {
              id: pageId1,
              name: "Main Page",
              layout: [
                {
                  id: mockGenerateId("section"),
                  type: "section",
                  props: {
                    backgroundType: "color",
                    backgroundColor: "#f8fafc",
                  },
                  columns: [
                    {
                      id: mockGenerateId("col"),
                      type: "column",
                      props: { width: "100%" },
                      elements: [
                        {
                          id: mockGenerateId("heading"),
                          type: "header",
                          props: {
                            text: "What Our Clients Say",
                            sizeClass: "text-3xl",
                            textAlign: "text-center",
                            textColor: "#1e293b",
                          },
                        },
                        {
                          id: mockGenerateId("spacer"),
                          type: "spacer",
                          props: { height: "20px" },
                        },
                        {
                          id: mockGenerateId("testimonials"),
                          type: "cardSlider",
                          props: {
                            slides: [
                              {
                                id: mockGenerateId("slide"),
                                imgSrc:
                                  "https://via.placeholder.com/100x100/cbd5e1/475569?Text=User+A",
                                heading: "Alex Johnson, CEO of TechCorp",
                                text: '"Working with this team has been a game changer for our business. Highly recommended!"',
                                link: "#",
                              },
                              {
                                id: mockGenerateId("slide"),
                                imgSrc:
                                  "https://via.placeholder.com/100x100/e2e8f0/334155?Text=User+B",
                                heading:
                                  "Maria Garcia, Marketing Director at Innovate Ltd.",
                                text: '"Their strategic insights and creative execution are top-notch. Results exceeded expectations."',
                                link: "#",
                              },
                              {
                                id: mockGenerateId("slide"),
                                imgSrc:
                                  "https://via.placeholder.com/100x100/94a3b8/ffffff?Text=User+C",
                                heading: "David Lee, Founder of StartUpX",
                                text: '"Professional, responsive, and delivered outstanding quality. Will definitely partner again."',
                                link: "#",
                              },
                            ],
                            slidesPerView: 1,
                            spaceBetween: 20,
                            speed: 700,
                            autoplay: true,
                            autoplayDelay: 5000,
                            loop: true,
                            showNavigation: true,
                            showPagination: true,
                            cardBorderRadius: "12px",
                          },
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          },
          activePageId: pageId1,
          globalNavbar: {
            id: "global-navbar-corp",
            type: "navbar",
            path: "globalNavbar",
            props: {
              logoType: "text",
              logoText: "CORP.",
              links: [
                { id: mockGenerateId("nav"), text: "Services", url: "#" },
                { id: mockGenerateId("nav"), text: "About Us", url: "#" },
                { id: mockGenerateId("nav"), text: "Contact", url: "#" },
              ],
              backgroundColor: "#ffffff",
              textColor: "#1e293b",
              linkColor: "#0ea5e9",
              rightContentType: "none",
            },
          },
          globalFooter: {
            id: "global-footer-corp",
            type: "footer",
            path: "globalFooter",
            props: {
              copyrightText: `© ${new Date().getFullYear()} CORP. Solutions. All Rights Reserved.`,
              links: [
                {
                  id: mockGenerateId("foot"),
                  text: "Privacy Policy",
                  url: "#",
                },
                { id: mockGenerateId("foot"), text: "Terms of Use", url: "#" },
              ],
              backgroundColor: "#1e293b",
              textColor: "#94a3b8",
              linkColor: "#e0f2fe",
            },
          },
        },
      },
      {
        id: "tpl_creative_vibrant",
        name: "Vibrant Creative Showcase",
        builderData: {
          pages: {
            [pageId2]: {
              id: pageId2,
              name: "Showcase Page",
              layout: [
                {
                  id: mockGenerateId("section-intro"),
                  type: "section",
                  props: {
                    backgroundType: "color",
                    backgroundColor: "#ecfdf5",
                  },
                  columns: [
                    {
                      id: mockGenerateId("col-intro"),
                      type: "column",
                      props: { width: "100%" },
                      elements: [
                        {
                          id: mockGenerateId("head"),
                          type: "header",
                          props: {
                            text: "Hear From Our Awesome Clients!",
                            sizeClass: "text-4xl",
                            textAlign: "text-center",
                            textColor: "#059669",
                          },
                        },
                        {
                          id: mockGenerateId("sub"),
                          type: "textBlock",
                          props: {
                            text: "We love making our clients happy. Here's what they're saying about their experiences.",
                            sizeClass: "text-lg",
                            textAlign: "text-center",
                            textColor: "#047857",
                          },
                        },
                      ],
                    },
                  ],
                },
                {
                  id: mockGenerateId("section-slider"),
                  type: "section",
                  props: {
                    backgroundType: "color",
                    backgroundColor: "#f0fdfa",
                  },
                  columns: [
                    {
                      id: mockGenerateId("col-slider"),
                      type: "column",
                      props: { width: "100%" },
                      elements: [
                        {
                          id: mockGenerateId("testimonials-creative"),
                          type: "cardSlider",
                          props: {
                            slides: [
                              {
                                id: mockGenerateId("slide"),
                                imgSrc:
                                  "https://randomuser.me/api/portraits/women/44.jpg",
                                heading: "Sarah Miller, Artist",
                                text: '"Unleashed my creative potential! The platform is intuitive and inspiring."',
                                link: "#",
                              },
                              {
                                id: mockGenerateId("slide"),
                                imgSrc:
                                  "https://randomuser.me/api/portraits/men/32.jpg",
                                heading: "James Chen, Designer",
                                text: '"A truly collaborative process with stunning visual outcomes. Five stars!"',
                                link: "#",
                              },
                              {
                                id: mockGenerateId("slide"),
                                imgSrc:
                                  "https://randomuser.me/api/portraits/women/68.jpg",
                                heading: "Priya Patel, Photographer",
                                text: '"They understood my vision perfectly and brought it to life beautifully."',
                                link: "#",
                              },
                              {
                                id: mockGenerateId("slide"),
                                imgSrc:
                                  "https://randomuser.me/api/portraits/men/75.jpg",
                                heading: "Kenji Tanaka, Illustrator",
                                text: '"Exceptional tools and support. My go-to for all creative projects."',
                                link: "#",
                              },
                            ],
                            slidesPerView: 2,
                            spaceBetween: 24,
                            speed: 600,
                            autoplay: false,
                            loop: false,
                            showNavigation: true,
                            showPagination: true,
                            cardBorderRadius: "16px",
                          },
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          },
          activePageId: pageId2,
          globalNavbar: {
            id: "global-navbar-creative",
            type: "navbar",
            path: "globalNavbar",
            props: {
              logoType: "text",
              logoText: "CreativeHub",
              links: [
                { id: mockGenerateId("nav"), text: "Portfolio", url: "#" },
                { id: mockGenerateId("nav"), text: "Blog", url: "#" },
                { id: mockGenerateId("nav"), text: "Join Us", url: "#" },
              ],
              backgroundColor: "#0d9488",
              textColor: "#ffffff",
              linkColor: "#ccfbf1",
              rightContentType: "searchIcon",
            },
          },
          globalFooter: {
            id: "global-footer-creative",
            type: "footer",
            path: "globalFooter",
            props: {
              copyrightText: `© ${new Date().getFullYear()} CreativeHub Studios. Be Bold. Be Creative.`,
              links: [
                { id: mockGenerateId("foot"), text: "Inspiration", url: "#" },
                { id: mockGenerateId("foot"), text: "Support", url: "#" },
                { id: mockGenerateId("foot"), text: "Careers", url: "#" },
              ],
              backgroundColor: "#f0fdfa",
              textColor: "#0f766e",
              linkColor: "#14b8a6",
            },
          },
        },
      },
    ];
  }, []);
  const steps = [
    { id: 1, name: "Campaign Details" },
    { id: 2, name: "Audience Source" },
    { id: 3, name: "Template Design" },
    { id: 4, name: "Review & Save" },
  ];

  useEffect(() => {
    if (dataSource.type === "fromContacts") {
      const lists = getContactLists();
      setAvailableContactLists(lists);
      if (dataSource.contactListId) {
        const currentList = lists.find(
          (l) => l.id === dataSource.contactListId
        );
        if (currentList) setContactsInSelectedList(currentList.contacts);
        else {
          setDataSource((prev) => ({
            ...prev,
            contactListId: null,
            selectedContactIds: [],
          }));
          setContactsInSelectedList([]);
        }
      }
    } else {
      setAvailableContactLists([]);
      setContactsInSelectedList([]);
      setSearchTermInList("");
    }
  }, [dataSource.type, dataSource.contactListId]);

  const handleDetailChange = (e) => {
    const { name, value } = e.target;
    setCampaignDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleDataSourceChange = (e) => {
    const { name, value, type, files, checked } = e.target;
    if (name === "fileUpload" && type === "file")
      setDataSource((prev) => ({
        ...prev,
        file: files[0],
        fileName: files[0]?.name || "",
      }));
    else if (name === "contactListId") {
      const selectedList = availableContactLists.find((l) => l.id === value);
      setDataSource((prev) => ({
        ...prev,
        contactListId: value,
        selectedContactIds: [],
      }));
      setContactsInSelectedList(selectedList ? selectedList.contacts : []);
      setSearchTermInList("");
    } else if (name && name.startsWith("contact-select-")) {
      const contactId = name.split("contact-select-")[1];
      setDataSource((prev) => {
        const newSelectedIds = checked
          ? [...prev.selectedContactIds, contactId]
          : prev.selectedContactIds.filter((id) => id !== contactId);
        return { ...prev, selectedContactIds: newSelectedIds };
      });
    } else
      setDataSource((prev) => ({
        ...prev,
        fields: { ...prev.fields, [name]: value },
      }));
  };

  const handleDataSourceTypeChange = (newType) => {
    setDataSource((prev) => ({
      ...prev,
      type: newType,
      file: newType !== "file" ? null : prev.file,
      fileName: newType !== "file" ? "" : prev.fileName,
      contactListId: newType !== "fromContacts" ? null : prev.contactListId,
      selectedContactIds:
        newType !== "fromContacts" ? [] : prev.selectedContactIds,
    }));
  };

  const filteredContactsForSelection = useMemo(() => {
    if (!searchTermInList) return contactsInSelectedList;
    return contactsInSelectedList.filter(
      (contact) =>
        String(contact.userName || "")
          .toLowerCase()
          .includes(searchTermInList.toLowerCase()) ||
        String(contact.email || "")
          .toLowerCase()
          .includes(searchTermInList.toLowerCase())
    );
  }, [contactsInSelectedList, searchTermInList]);

  const canProceedToNext = () => {
    switch (currentStep) {
      case 1:
        return !!(
          campaignDetails.campaignName &&
          campaignDetails.startTime &&
          campaignDetails.endTime
        );
      case 2:
        if (dataSource.type === "file")
          return !!(dataSource.file && dataSource.fields.email);
        else if (dataSource.type === "fromContacts")
          return !!(
            dataSource.contactListId && dataSource.selectedContactIds.length > 0
          );
        else if (dataSource.type === "api") return false;
        return false;
      case 3:
        if (templateConfig.type === "create" || templateConfig.type === "edit")
          return !!templateConfig.templateData;
        if (templateConfig.type === "select")
          return !!templateConfig.selectedTemplateId;
        return false;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (canProceedToNext())
      setCurrentStep((prev) => Math.min(prev + 1, steps.length));
  };
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const resetCampaignStates = () => {
    setCampaignDetails(initialCampaignDetails);
    setDataSource(initialDataSource);
    setTemplateConfig(initialTemplateConfig);
    setCurrentStep(1);
    setContactsInSelectedList([]);
    setSearchTermInList("");
    setIsEditing(false);
    setCurrentLoadedCampaignId(null);
  };

  const handleSaveCampaign = () => {
    if (!campaignDetails.campaignName) {
      toast.warn("Campaign Name is required to save.");
      setCurrentStep(1);
      return;
    }

    const campaignIdToSave = isEditing
      ? campaignId
      : `camp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    // --- START: MODIFICATION TO SAVE ANALYTICS ---
    // Check if we are creating a NEW campaign. If so, generate analytics.
    // If we are editing, we assume analytics already exist and preserve them.
    let analyticsData;
    if (isEditing) {
      const existingCampaign = getCampaignById(campaignIdToSave);
      analyticsData = existingCampaign?.analyticsData; // Keep existing data
    } else {
      analyticsData = generateInitialAnalyticsData(campaignIdToSave); // Generate new data
    }
    // --- END: MODIFICATION ---

    const campaignToSave = {
      id: campaignIdToSave,
      campaignDetails,
      dataSource,
      templateConfig,
      analyticsData, // --- ADD ANALYTICS DATA TO THE CAMPAIGN OBJECT ---
    };

    addOrUpdateCampaign(campaignToSave);
    setShowSuccessModal(true);
  };

  const handleTemplateDataFromBuilder = (builderData) => {
    setTemplateConfig((prev) => ({ ...prev, templateData: builderData }));
  };

  const selectTemplateToEdit = (templateId) => {
    const templateToEdit = mockTemplates.find((t) => t.id === templateId);
    if (templateToEdit) {
      setTemplateConfig((prev) => ({
        ...prev,
        type: "edit",
        selectedTemplateId: templateId,
        editingTemplate: templateToEdit.builderData,
        templateData: templateToEdit.builderData,
      }));
    }
  };

  const renderStepContent = () => {
    const currentStepData = steps[currentStep - 1];
    const stepConfig = {
      title: currentStepData ? currentStepData.name : "Unknown Step",
      icon: LucideIcons.ClipboardList,
      description: "",
    };
    if (currentStepData) {
      switch (currentStep) {
        case 1:
          stepConfig.icon = LucideIcons.FileText;
          stepConfig.description =
            "Define the core parameters of your campaign.";
          break;
        case 2:
          stepConfig.icon = AudienceIcon;
          stepConfig.description = "Connect your audience data source.";
          break;
        case 3:
          stepConfig.icon = LucideIcons.Palette;
          stepConfig.description =
            "Design or select your landing page template.";
          break;
        case 4:
          stepConfig.icon = LucideIcons.Rocket;
          stepConfig.description = isEditing
            ? "Review and update your campaign."
            : "Final check before saving your campaign!";
          break;
        default:
          stepConfig.icon = LucideIcons.AlertTriangle;
          stepConfig.description = "Step not configured.";
          break;
      }
    }
    const StepIcon = stepConfig.icon;
    let content;
    switch (currentStep) {
      case 1:
        content = (
          <>
            {" "}
            <InputField
              label="Campaign Name"
              name="campaignName"
              value={campaignDetails.campaignName}
              onChange={handleDetailChange}
              placeholder="e.g., Q4 Product Showcase"
              required
              icon={<LucideIcons.Edit3 />}
            />{" "}
            <div className="grid md:grid-cols-2 gap-x-5">
              {" "}
              <InputField
                label="Start Date & Time"
                name="startTime"
                type="datetime-local"
                value={campaignDetails.startTime}
                onChange={handleDetailChange}
                required
                icon={<LucideIcons.CalendarPlus />}
              />{" "}
              <InputField
                label="End Date & Time"
                name="endTime"
                type="datetime-local"
                value={campaignDetails.endTime}
                onChange={handleDetailChange}
                required
                icon={<LucideIcons.CalendarMinus />}
              />{" "}
            </div>{" "}
          </>
        );
        break;
      case 2:
        content = (
          <>
            {" "}
            <div className="space-y-3 mb-6">
              {" "}
              <OptionCard
                title="Upload File (.xls, .xlsx, .csv)"
                description="Import contacts directly from a spreadsheet."
                selected={dataSource.type === "file"}
                onClick={() => handleDataSourceTypeChange("file")}
                icon={<LucideIcons.FileUp />}
              />{" "}
              <OptionCard
                title="From My Contacts"
                description="Select from your saved contact lists."
                selected={dataSource.type === "fromContacts"}
                onClick={() => handleDataSourceTypeChange("fromContacts")}
                icon={<UserCheck />}
              />{" "}
              <OptionCard
                title="Connect API (Future)"
                description="Sync contacts from your CRM. (Feature in development)"
                selected={dataSource.type === "api"}
                onClick={() => {}}
                icon={<LucideIcons.Share2 />}
                disabled={true}
              />{" "}
            </div>{" "}
            {dataSource.type === "file" && (
              <div className="mt-5 p-4 border border-slate-200 rounded-xl bg-slate-50/70 animate-fadeIn">
                {" "}
                <h3 className="text-base font-semibold text-slate-700 mb-3">
                  Audience File Details
                </h3>{" "}
                <InputField
                  label="Choose Spreadsheet File"
                  type="file"
                  name="fileUpload"
                  onChange={handleDataSourceChange}
                  accept=".xls,.xlsx,.csv"
                  icon={<LucideIcons.UploadCloud />}
                />{" "}
                {dataSource.fileName && (
                  <p className="text-xs text-slate-500 mb-4 -mt-3">
                    Selected:{" "}
                    <span className="font-medium text-green-600">
                      {dataSource.fileName}
                    </span>
                  </p>
                )}{" "}
                <p className="text-xs text-slate-600 mb-2 font-medium">
                  Map your spreadsheet columns (required if file used):
                </p>{" "}
                <div className="grid sm:grid-cols-2 gap-x-4 gap-y-0">
                  {" "}
                  <InputField
                    label="First Name Column Header"
                    name="firstName"
                    value={dataSource.fields.firstName}
                    onChange={handleDataSourceChange}
                    placeholder="e.g., FNAME or first_name"
                  />{" "}
                  <InputField
                    label="Last Name Column Header"
                    name="lastName"
                    value={dataSource.fields.lastName}
                    onChange={handleDataSourceChange}
                    placeholder="e.g., LNAME or last_name"
                  />{" "}
                  <InputField
                    label="Email Column Header"
                    name="email"
                    type="text"
                    value={dataSource.fields.email}
                    onChange={handleDataSourceChange}
                    placeholder="e.g., email_address"
                    required={dataSource.type === "file"}
                  />{" "}
                  <InputField
                    label="LinkedIn URL Column Header"
                    name="linkedInUrl"
                    value={dataSource.fields.linkedInUrl}
                    onChange={handleDataSourceChange}
                    placeholder="e.g., linkedin_profile_url"
                  />{" "}
                </div>{" "}
              </div>
            )}{" "}
            {dataSource.type === "fromContacts" && (
              <div className="mt-5 p-4 border border-slate-200 rounded-xl bg-slate-50/70 animate-fadeIn">
                {" "}
                <h3 className="text-base font-semibold text-slate-700 mb-3">
                  Select From Your Contacts
                </h3>{" "}
                {availableContactLists.length > 0 ? (
                  <>
                    {" "}
                    <div className="mb-4">
                      {" "}
                      <label
                        htmlFor="contactListSelect"
                        className="block text-xs font-medium text-slate-600 mb-1"
                      >
                        Choose a Contact List:
                      </label>{" "}
                      <select
                        id="contactListSelect"
                        name="contactListId"
                        value={dataSource.contactListId || ""}
                        onChange={handleDataSourceChange}
                        className="block w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/70 focus:border-green-500 sm:text-sm bg-white"
                      >
                        {" "}
                        <option value="" disabled>
                          -- Select a List --
                        </option>{" "}
                        {availableContactLists.map((list) => (
                          <option key={list.id} value={list.id}>
                            {" "}
                            {list.name} ({list.contacts.length} contacts){" "}
                          </option>
                        ))}{" "}
                      </select>{" "}
                    </div>{" "}
                    {dataSource.contactListId &&
                      contactsInSelectedList.length > 0 && (
                        <>
                          {" "}
                          <InputField
                            label="Search Contacts in Selected List"
                            name="searchTermInList"
                            value={searchTermInList}
                            onChange={(e) =>
                              setSearchTermInList(e.target.value)
                            }
                            placeholder="Search by name or email..."
                            icon={<LucideIcons.Search size={14} />}
                            className="mb-3"
                          />{" "}
                          <p className="text-xs text-slate-600 mb-2">
                            Select contacts for this campaign (
                            {dataSource.selectedContactIds.length} selected):
                          </p>{" "}
                          <div className="max-h-60 overflow-y-auto border border-slate-300 rounded-lg bg-white p-2 space-y-1.5 custom-scrollbar">
                            {" "}
                            {filteredContactsForSelection.length > 0 ? (
                              filteredContactsForSelection.map((contact) => (
                                <div
                                  key={contact.id}
                                  className="flex items-center p-2 rounded-md hover:bg-slate-100 transition-colors"
                                >
                                  {" "}
                                  <input
                                    type="checkbox"
                                    id={`contact-select-${contact.id}`}
                                    name={`contact-select-${contact.id}`}
                                    checked={dataSource.selectedContactIds.includes(
                                      contact.id
                                    )}
                                    onChange={handleDataSourceChange}
                                    className="h-4 w-4 text-green-600 border-slate-300 rounded focus:ring-green-500 mr-2.5 cursor-pointer accent-[#2e8b57]"
                                  />{" "}
                                  <label
                                    htmlFor={`contact-select-${contact.id}`}
                                    className="flex-1 text-xs text-slate-700 cursor-pointer"
                                  >
                                    {" "}
                                    <span className="font-medium">
                                      {contact.userName || "N/A"}
                                    </span>{" "}
                                    -{" "}
                                    <span className="text-slate-500">
                                      {contact.email}
                                    </span>{" "}
                                  </label>{" "}
                                </div>
                              ))
                            ) : (
                              <p className="text-xs text-slate-500 text-center py-3">
                                {" "}
                                {searchTermInList
                                  ? "No contacts match your search."
                                  : "No contacts in this list (or clear search)."}{" "}
                              </p>
                            )}{" "}
                          </div>{" "}
                        </>
                      )}{" "}
                    {dataSource.contactListId &&
                      contactsInSelectedList.length === 0 && (
                        <p className="text-xs text-slate-500 text-center py-3">
                          This list is empty.
                        </p>
                      )}{" "}
                  </>
                ) : (
                  <div className="text-center py-6">
                    {" "}
                    <LucideIcons.Users
                      size={28}
                      className="mx-auto text-slate-400 mb-2"
                    />{" "}
                    <p className="text-sm text-slate-500">
                      No contact lists available.
                    </p>{" "}
                    <p className="text-xs text-slate-400">
                      {" "}
                      Please create a contact list in the{" "}
                      <Link
                        to="/contacts"
                        className="text-green-600 hover:underline font-medium"
                      >
                        {" "}
                        'Contacts'{" "}
                      </Link>{" "}
                      section first.{" "}
                    </p>{" "}
                  </div>
                )}{" "}
              </div>
            )}{" "}
            {dataSource.type === "api" && (
              <div className="mt-5 p-5 border-2 border-dashed border-amber-400/50 rounded-xl bg-amber-50/30 text-center flex flex-col items-center justify-center min-h-[150px]">
                {" "}
                <LucideIcons.Construction className="h-10 w-10 text-amber-500 mx-auto mb-2" />{" "}
                <p className="text-amber-700 font-semibold text-sm">
                  API Connection In Progress
                </p>{" "}
                <p className="text-xs text-amber-600 mt-0.5">
                  This feature is under development.
                </p>{" "}
              </div>
            )}{" "}
          </>
        );
        break;
      case 3:
        content = (
          <>
            {" "}
            <div className="grid md:grid-cols-2 gap-3 mb-5">
              {" "}
              <OptionCard
                title="Create New Template"
                description="Build a unique template from scratch."
                selected={templateConfig.type === "create"}
                onClick={() =>
                  setTemplateConfig((prev) => ({
                    ...prev,
                    type: "create",
                    selectedTemplateId: null,
                    editingTemplate: null,
                    templateData: null,
                  }))
                }
                icon={<LucideIcons.Brush />}
              />{" "}
              <OptionCard
                title="Select Existing Template"
                description="Choose and customize a pre-built design."
                selected={
                  templateConfig.type === "select" ||
                  templateConfig.type === "edit"
                }
                onClick={() =>
                  setTemplateConfig((prev) => ({
                    ...prev,
                    type: "select",
                    selectedTemplateId: null,
                    editingTemplate: null,
                    templateData: null,
                  }))
                }
                icon={<LucideIcons.LayoutGrid />}
              />{" "}
            </div>{" "}
            {(templateConfig.type === "select" ||
              templateConfig.type === "edit") &&
              !templateConfig.editingTemplate && (
                <div className="mt-5 p-4 border border-slate-200 rounded-xl bg-slate-50/70">
                  {" "}
                  <h3 className="text-base font-semibold text-slate-700 mb-3">
                    Available Templates
                  </h3>{" "}
                  {mockTemplates.length > 0 ? (
                    <ul className="space-y-2.5">
                      {" "}
                      {mockTemplates.map((template) => (
                        <li
                          key={template.id}
                          className="p-2.5 pr-3 border border-slate-300/80 rounded-lg hover:shadow-sm transition-shadow flex justify-between items-center bg-white hover:bg-slate-50"
                        >
                          {" "}
                          <span className="text-xs font-medium text-slate-600">
                            {template.name}
                          </span>{" "}
                          <StyledButton
                            onClick={() => selectTemplateToEdit(template.id)}
                            variant="secondary"
                            className="py-1 px-2.5 text-xs"
                            iconLeft={<LucideIcons.Edit3 size={12} />}
                          >
                            {" "}
                            Edit{" "}
                          </StyledButton>{" "}
                        </li>
                      ))}{" "}
                    </ul>
                  ) : (
                    <p className="text-xs text-slate-500 text-center py-2">
                      No existing templates. Create one!
                    </p>
                  )}{" "}
                </div>
              )}{" "}
            {(templateConfig.type === "create" ||
              templateConfig.editingTemplate) && (
              <div className="mt-5">
                {" "}
                <h3 className="text-lg font-semibold text-slate-800 mb-0.5">
                  {" "}
                  {templateConfig.editingTemplate
                    ? `Editing: ${
                        mockTemplates.find(
                          (t) => t.id === templateConfig.selectedTemplateId
                        )?.name
                      }`
                    : "Create New Template"}{" "}
                </h3>{" "}
                <p className="text-xs text-slate-500 mb-3">
                  Use "Save All Pages" in builder, then "Next" below.
                </p>{" "}
                {ElementBuilderPage ? (
                  <div
                    className="border-2 border-slate-300 rounded-xl overflow-hidden shadow-lg bg-slate-100"
                    style={{
                      height: "calc(100vh - 420px)",
                      minHeight: "610px",
                    }}
                  >
                    {" "}
                    <ElementBuilderPage
                      onExternalSave={handleTemplateDataFromBuilder}
                      initialBuilderState={
                        templateConfig.editingTemplate || undefined
                      }
                    />{" "}
                  </div>
                ) : (
                  <div className="p-4 bg-red-100 border border-red-300 rounded-lg text-red-700">
                    Error: ElementBuilderPage component not loaded. Check
                    console.
                  </div>
                )}{" "}
              </div>
            )}{" "}
          </>
        );
        break;
      case 4:
        const templateName = templateConfig.selectedTemplateId
          ? mockTemplates.find(
              (t) => t.id === templateConfig.selectedTemplateId
            )?.name
          : templateConfig.templateData
          ? "Custom Template"
          : "No Template Selected";
        const currentTemplateData = templateConfig.templateData;
        const selectedContactListName =
          dataSource.contactListId && availableContactLists.length > 0
            ? availableContactLists.find(
                (l) => l.id === dataSource.contactListId
              )?.name || "N/A"
            : "N/A";
        content = (
          <>
            {" "}
            <div className="grid lg:grid-cols-3 gap-5">
              {" "}
              <div className="lg:col-span-1 space-y-4">
                {" "}
                <SummaryCard
                  title="Campaign Settings"
                  icon={<LucideIcons.Settings2 />}
                >
                  {" "}
                  <p>
                    <strong>Name:</strong>{" "}
                    {campaignDetails.campaignName || "N/A"}
                  </p>{" "}
                  <p>
                    <strong>Start:</strong>{" "}
                    {campaignDetails.startTime
                      ? new Date(campaignDetails.startTime).toLocaleString()
                      : "N/A"}
                  </p>{" "}
                  <p>
                    <strong>End:</strong>{" "}
                    {campaignDetails.endTime
                      ? new Date(campaignDetails.endTime).toLocaleString()
                      : "N/A"}
                  </p>{" "}
                </SummaryCard>{" "}
                <SummaryCard title="Audience Data" icon={<AudienceIcon />}>
                  {" "}
                  <p>
                    <strong>Source:</strong>{" "}
                    {dataSource.type === "file" && " File Upload"}{" "}
                    {dataSource.type === "fromContacts" && " From My Contacts"}{" "}
                    {dataSource.type === "api" && " API (N/A)"}{" "}
                  </p>{" "}
                  {dataSource.type === "file" && dataSource.fileName && (
                    <>
                      {" "}
                      <p>
                        <strong>File:</strong> {dataSource.fileName || "N/A"}
                      </p>{" "}
                      <p className="mt-1 pt-1 border-t border-slate-200">
                        <strong>Column Mappings:</strong>
                      </p>{" "}
                      <ul className="list-disc list-inside pl-1.5 space-y-0.5">
                        {" "}
                        {dataSource.fields.firstName && (
                          <li>
                            First Name:{" "}
                            <span className="font-mono bg-slate-100 px-1 py-0.5 rounded text-green-700 text-[11px]">
                              {dataSource.fields.firstName}
                            </span>
                          </li>
                        )}{" "}
                        {dataSource.fields.lastName && (
                          <li>
                            Last Name:{" "}
                            <span className="font-mono bg-slate-100 px-1 py-0.5 rounded text-green-700 text-[11px]">
                              {dataSource.fields.lastName}
                            </span>
                          </li>
                        )}{" "}
                        <li>
                          Email:{" "}
                          <span className="font-mono bg-slate-100 px-1 py-0.5 rounded text-green-700 text-[11px]">
                            {dataSource.fields.email || "N/A"}
                          </span>
                        </li>{" "}
                        {dataSource.fields.linkedInUrl && (
                          <li>
                            LinkedIn:{" "}
                            <span className="font-mono bg-slate-100 px-1 py-0.5 rounded text-green-700 text-[11px]">
                              {dataSource.fields.linkedInUrl}
                            </span>
                          </li>
                        )}{" "}
                      </ul>{" "}
                    </>
                  )}{" "}
                  {dataSource.type === "fromContacts" && (
                    <>
                      {" "}
                      <p>
                        <strong>List Name:</strong> {selectedContactListName}
                      </p>{" "}
                      <p>
                        <strong>Selected Contacts:</strong>{" "}
                        {dataSource.selectedContactIds.length} contacts
                      </p>{" "}
                    </>
                  )}{" "}
                </SummaryCard>{" "}
              </div>{" "}
              <div className="lg:col-span-2">
                {" "}
                <SummaryCard
                  title="Template Preview"
                  icon={<LucideIcons.MonitorPlay />}
                >
                  {" "}
                  <p className="mb-2 text-xs">
                    <strong>Using:</strong> {templateName}
                  </p>{" "}
                  <div className="mb-2.5 flex justify-center space-x-1 p-0.5 bg-slate-100 rounded-lg">
                    {" "}
                    {["desktop", "tablet", "mobile"].map((device) => (
                      <button
                        key={device}
                        onClick={() => setPreviewDevice(device)}
                        title={`${
                          device.charAt(0).toUpperCase() + device.slice(1)
                        } View`}
                        className={`p-1.5 rounded-md transition-all ${
                          previewDevice === device
                            ? "bg-[#2e8b57] text-white shadow-sm"
                            : "text-slate-500 hover:bg-slate-200 hover:text-slate-700"
                        }`}
                      >
                        {" "}
                        {device === "desktop" && (
                          <LucideIcons.Monitor className="w-3.5 h-3.5" />
                        )}{" "}
                        {device === "tablet" && (
                          <LucideIcons.Tablet className="w-3.5 h-3.5" />
                        )}{" "}
                        {device === "mobile" && (
                          <LucideIcons.Smartphone className="w-3.5 h-3.5" />
                        )}{" "}
                      </button>
                    ))}{" "}
                  </div>{" "}
                  {currentTemplateData &&
                  currentTemplateData.pages &&
                  currentTemplateData.activePageId &&
                  PagePreviewRenderer ? (
                    <div
                      className="border-2 border-slate-200 rounded-lg overflow-hidden shadow-lg bg-white"
                      style={{ minHeight: "400px" }}
                    >
                      {" "}
                      <PagePreviewRenderer
                        pageLayout={
                          currentTemplateData.pages[
                            currentTemplateData.activePageId
                          ]?.layout || []
                        }
                        globalNavbar={currentTemplateData.globalNavbar}
                        globalFooter={currentTemplateData.globalFooter}
                        activePageId={currentTemplateData.activePageId}
                        previewDevice={previewDevice}
                        onNavigate={() => {}}
                      />{" "}
                    </div>
                  ) : (
                    <div className="p-4 bg-slate-100/70 rounded-lg text-slate-500 text-center min-h-[150px] flex flex-col items-center justify-center border border-slate-200">
                      {" "}
                      <LucideIcons.ImageOff className="w-6 h-6 mb-1.5 text-slate-400" />{" "}
                      <p className="font-medium text-xs">
                        No template preview available.{" "}
                        {(!ElementBuilderPage || !PagePreviewRenderer) &&
                          "Preview components not loaded."}
                      </p>{" "}
                      <p className="text-[11px]">
                        Please complete the template design step.
                      </p>{" "}
                    </div>
                  )}{" "}
                </SummaryCard>{" "}
              </div>{" "}
            </div>{" "}
          </>
        );
        break;
      default:
        content = (
          <div className="text-center py-8 text-slate-500">
            Error: Unknown step. Please restart.
          </div>
        );
    }
    return (
      <>
        {" "}
        <div className="flex items-center mb-5 md:mb-6">
          {" "}
          <div
            className={`p-2.5 bg-green-600/10 rounded-lg mr-3 transition-all duration-300 ${
              currentStepData && currentStep === currentStepData.id
                ? "ring-2 ring-green-500"
                : ""
            }`}
          >
            {" "}
            {StepIcon && (
              <StepIcon className="w-6 h-6 text-green-600" strokeWidth={2} />
            )}{" "}
          </div>{" "}
          <div>
            {" "}
            <h2 className="text-xl md:text-2xl font-bold text-slate-800">
              {stepConfig.title}
            </h2>{" "}
            <p className="text-xs text-slate-500">{stepConfig.description}</p>{" "}
          </div>{" "}
        </div>{" "}
        <div className="bg-white p-5 md:p-6 rounded-xl shadow-lg border border-slate-200">
          {" "}
          {content}{" "}
          <div className="mt-8 pt-5 border-t border-slate-200/80 flex justify-between items-center">
            {" "}
            <StyledButton
              onClick={prevStep}
              variant="secondary"
              iconLeft={<LucideIcons.ArrowLeft />}
              disabled={currentStep === 1}
            >
              {" "}
              Back{" "}
            </StyledButton>{" "}
            {currentStep < steps.length ? (
              <StyledButton
                onClick={nextStep}
                disabled={!canProceedToNext()}
                iconRight={<LucideIcons.ArrowRight />}
              >
                {" "}
                {canProceedToNext() ? "Next" : "Complete Current Step"}{" "}
              </StyledButton>
            ) : (
              <StyledButton
                onClick={handleSaveCampaign}
                variant="launch"
                iconLeft={<LucideIcons.Save />}
              >
                {" "}
                {isEditing ? "Update Campaign" : "Save Campaign"}{" "}
              </StyledButton>
            )}{" "}
          </div>{" "}
        </div>{" "}
      </>
    );
  };

  return (
    <>
      <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col lg:flex-row">
        <StepperNav
          currentStep={currentStep}
          steps={steps}
          setCurrentStep={(stepId) => {
            if (
              stepId < currentStep ||
              (stepId === currentStep + 1 && canProceedToNext()) ||
              stepId === currentStep
            ) {
              setCurrentStep(stepId);
            }
          }}
        />
        <main className="flex-1 p-4 md:p-6 lg:p-8 lg:ml-72 lg:h-screen lg:overflow-y-auto">
          {" "}
          {renderStepContent()}{" "}
        </main>
        <SuccessModal
          isOpen={showSuccessModal}
          title={isEditing ? "Campaign Updated!" : "Campaign Saved!"}
          message={
            isEditing
              ? "Your campaign changes have been successfully saved."
              : "Your new campaign has been saved. You can view it in the campaigns list."
          }
          buttonText="View All Campaigns"
          onConfirm={() => {
            setShowSuccessModal(false);
            navigate("/campaigns");
            resetCampaignStates();
          }}
          secondaryButtonText="Create Another"
          onSecondaryAction={() => {
            setShowSuccessModal(false);
            resetCampaignStates();
            navigate("/campaigns/create");
          }}
        />
      </div>
      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(5px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out forwards;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
          height: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f7fafc;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #a0aec0;
        }
      `}</style>
    </>
  );
}
