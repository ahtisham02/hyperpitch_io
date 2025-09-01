const mockGenerateId = (prefix = "tpl-id") => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`;

export const mockTemplates = () => {
    const pageId1 = mockGenerateId("page");
    const pageId2 = mockGenerateId("page");
    const pageId3 = mockGenerateId("page");
    const pageId4 = mockGenerateId("page");
    
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
                                    paddingTop: "60px", 
                                    paddingBottom: "60px" 
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
                                                    sizeClass: "text-4xl", 
                                                    textAlign: "text-center", 
                                                    textColor: "#1e293b", 
                                                    fontWeight: "font-bold" 
                                                } 
                                            }, 
                                            { 
                                                id: mockGenerateId("spacer"), 
                                                type: "spacer", 
                                                props: { height: "40px" } 
                                            }, 
                                            { 
                                                id: mockGenerateId("testimonials"), 
                                                type: "cardSlider", 
                                                props: { 
                                                    slides: [
                                                        { 
                                                            id: mockGenerateId("slide"), 
                                                            imgSrc: "https://randomuser.me/api/portraits/men/32.jpg", 
                                                            heading: "Alex Johnson, CEO of TechCorp", 
                                                            text: '"Working with this team has been a game changer for our business. Highly recommended!"', 
                                                            link: "#" 
                                                        }, 
                                                        { 
                                                            id: mockGenerateId("slide"), 
                                                            imgSrc: "https://randomuser.me/api/portraits/women/44.jpg", 
                                                            heading: "Maria Garcia, Marketing Director", 
                                                            text: '"Their strategic insights and creative execution are top-notch. Results exceeded expectations."', 
                                                            link: "#" 
                                                        }, 
                                                        { 
                                                            id: mockGenerateId("slide"), 
                                                            imgSrc: "https://randomuser.me/api/portraits/men/75.jpg", 
                                                            heading: "David Lee, Founder of StartUpX", 
                                                            text: '"Professional, responsive, and delivered outstanding quality. Will definitely partner again."', 
                                                            link: "#" 
                                                        }
                                                    ], 
                                                    slidesPerView: 1, 
                                                    spaceBetween: 20, 
                                                    speed: 700, 
                                                    autoplay: true, 
                                                    autoplayDelay: 5000, 
                                                    loop: true, 
                                                    showNavigation: true, 
                                                    showPagination: true, 
                                                    cardBorderRadius: "12px"
                                                }
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
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
                            { id: mockGenerateId("nav"), text: "Contact", url: "#" }
                        ], 
                        backgroundColor: "#ffffff", 
                        textColor: "#1e293b", 
                        linkColor: "#0ea5e9", 
                        rightContentType: "none" 
                    } 
                }, 
                globalFooter: { 
                    id: "global-footer-corp", 
                    type: "footer", 
                    path: "globalFooter", 
                    props: { 
                        copyrightText: `© ${new Date().getFullYear()} CORP. Solutions. All Rights Reserved.`, 
                        links: [
                            { id: mockGenerateId("foot"), text: "Privacy Policy", url: "#" }, 
                            { id: mockGenerateId("foot"), text: "Terms of Use", url: "#" }
                        ], 
                        backgroundColor: "#1e293b", 
                        textColor: "#94a3b8", 
                        linkColor: "#e0f2fe" 
                    } 
                } 
            } 
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
                                id: mockGenerateId("section"), 
                                type: "section", 
                                props: { 
                                    backgroundType: "color", 
                                    backgroundColor: "#ecfdf5", 
                                    paddingTop: "80px", 
                                    paddingBottom: "80px" 
                                }, 
                                columns: [
                                    { 
                                        id: mockGenerateId("col"), 
                                        type: "column", 
                                        props: { width: "100%" }, 
                                        elements: [
                                            { 
                                                id: mockGenerateId("head"), 
                                                type: "header", 
                                                props: { 
                                                    text: "Our Creative Portfolio", 
                                                    sizeClass: "text-5xl", 
                                                    textAlign: "text-center", 
                                                    textColor: "#059669", 
                                                    fontWeight: "font-extrabold" 
                                                } 
                                            }, 
                                            { 
                                                id: mockGenerateId("sub"), 
                                                type: "textBlock", 
                                                props: { 
                                                    text: "We love making our clients happy. Here's a showcase of our best work.", 
                                                    sizeClass: "text-xl", 
                                                    textAlign: "text-center", 
                                                    textColor: "#047857" 
                                                } 
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
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
                            { id: mockGenerateId("nav"), text: "Join Us", url: "#" }
                        ], 
                        backgroundColor: "#0d9488", 
                        textColor: "#ffffff", 
                        linkColor: "#ccfbf1", 
                        rightContentType: "searchIcon" 
                    } 
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
                            { id: mockGenerateId("foot"), text: "Careers", url: "#" }
                        ], 
                        backgroundColor: "#f0fdfa", 
                        textColor: "#0f766e", 
                        linkColor: "#14b8a6" 
                    } 
                } 
            } 
        },
        { 
            id: "tpl_product_launch", 
            name: "Modern Product Launch", 
            builderData: { 
                pages: {
                    [pageId3]: {
                        id: pageId3, 
                        name: "Launch Page", 
                        layout: [
                            { 
                                id: mockGenerateId("sec-hero"), 
                                type: "section", 
                                props: { 
                                    backgroundType: "color", 
                                    backgroundColor: "#111827", 
                                    paddingTop: "100px", 
                                    paddingBottom: "100px" 
                                }, 
                                columns: [
                                    { 
                                        id: mockGenerateId("col-hero"), 
                                        type: "column", 
                                        props: { width: "100%" }, 
                                        elements: [
                                            { 
                                                id: mockGenerateId("head"), 
                                                type: "header", 
                                                props: { 
                                                    text: "Introducing The Future of Innovation", 
                                                    sizeClass: "text-6xl", 
                                                    textAlign: "text-center", 
                                                    textColor: "#ffffff", 
                                                    fontWeight: "font-bold" 
                                                } 
                                            }, 
                                            { 
                                                id: mockGenerateId("sub"), 
                                                type: "textBlock", 
                                                props: { 
                                                    text: "Our new product is engineered to perfection, designed for you. Discover a new era of excellence.", 
                                                    sizeClass: "text-xl", 
                                                    textAlign: "text-center", 
                                                    textColor: "#d1d5db" 
                                                } 
                                            }, 
                                            { 
                                                id: mockGenerateId("spacer"), 
                                                type: "spacer", 
                                                props: { height: "20px" } 
                                            }, 
                                            { 
                                                id: mockGenerateId("btn"), 
                                                type: "button", 
                                                props: { 
                                                    buttonText: "Pre-Order Now", 
                                                    link: "#", 
                                                    sizeClass: "text-lg", 
                                                    textAlign: "text-center", 
                                                    backgroundColor: "#22c55e", 
                                                    textColor: "#ffffff", 
                                                    borderRadius: "8px", 
                                                    variant: "solid", 
                                                    fullWidth: false 
                                                } 
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                }, 
                activePageId: pageId3 
            } 
        },
        { 
            id: "tpl_webinar_invite", 
            name: "Professional Webinar Invite", 
            builderData: { 
                pages: {
                    [pageId4]: {
                        id: pageId4, 
                        name: "Webinar Page", 
                        layout: [
                            { 
                                id: mockGenerateId("sec-main"), 
                                type: "section", 
                                props: { 
                                    backgroundType: "color", 
                                    backgroundColor: "#f9fafb", 
                                    paddingTop: "60px", 
                                    paddingBottom: "60px" 
                                }, 
                                columns: [
                                    { 
                                        id: mockGenerateId("col-left"), 
                                        type: "column", 
                                        props: { width: "60%" }, 
                                        elements: [
                                            { 
                                                id: mockGenerateId("head-cat"), 
                                                type: "textBlock", 
                                                props: { 
                                                    text: "EXCLUSIVE WEBINAR", 
                                                    sizeClass: "text-sm", 
                                                    textColor: "#166534", 
                                                    fontWeight: "font-bold" 
                                                } 
                                            }, 
                                            { 
                                                id: mockGenerateId("head-main"), 
                                                type: "header", 
                                                props: { 
                                                    text: "Mastering the Art of Digital Marketing", 
                                                    sizeClass: "text-5xl", 
                                                    fontWeight: "font-extrabold", 
                                                    textColor: "#1f2937" 
                                                } 
                                            }, 
                                            { 
                                                id: mockGenerateId("date"), 
                                                type: "textBlock", 
                                                props: { 
                                                    text: "<strong>Date:</strong> October 26, 2024 at 2:00 PM EST", 
                                                    sizeClass: "text-lg", 
                                                    textColor: "#4b5563" 
                                                } 
                                            }, 
                                            { 
                                                id: mockGenerateId("btn"), 
                                                type: "button", 
                                                props: { 
                                                    buttonText: "Register for Free", 
                                                    link: "#", 
                                                    sizeClass: "text-lg", 
                                                    textAlign: "text-left", 
                                                    backgroundColor: "#2e8b57", 
                                                    textColor: "#ffffff", 
                                                    borderRadius: "8px" 
                                                } 
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                }, 
                activePageId: pageId4 
            } 
        }
    ];
};
