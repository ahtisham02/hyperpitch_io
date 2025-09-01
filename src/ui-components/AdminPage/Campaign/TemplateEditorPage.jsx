import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import * as LucideIcons from "lucide-react";
import { toast } from "react-toastify";
import ElementBuilderPage from "./Header";

const TemplateEditorPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { initialData, returnTo, step } = location.state || {};
    
    const [templateData, setTemplateData] = useState(initialData || { pages: {}, activePageId: null });

    useEffect(() => {
        if (!initialData) {
            toast.error("No initial data provided. Redirecting back.");
            navigate(returnTo || "/campaigns/create");
        }
    }, [initialData, returnTo, navigate]);



    if (!initialData) {
        return (
            <div className="min-h-screen bg-slate-100 flex items-center justify-center">
                <LucideIcons.Loader2 className="animate-spin text-green-600 w-12 h-12" />
            </div>
        );
    }

    const handleSaveTemplate = async () => {
        try {
            // Simulate save delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            
    
            
            // Save the actual template data to localStorage
            localStorage.setItem('campaign_template_data', JSON.stringify(templateData));

            
            toast.success("Template saved successfully!");
            
            // Navigate back to step 3 with URL parameter
            navigate(`${returnTo || "/campaigns/create"}?step=3`, {
                state: {
                    templateData,
                    step: 3,
                    fromEditor: true
                }
            });
        } catch (error) {
            toast.error("Failed to save template. Please try again.");
        }
    };

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Save Button - Fixed Position */}
            <div className="fixed top-4 right-4 z-50">
                <button
                    onClick={handleSaveTemplate}
                    className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors flex items-center space-x-2 shadow-lg"
                >
                    <LucideIcons.Save className="w-4 h-4" />
                    <span>Save Template</span>
                </button>
            </div>

            {/* Full-screen Editor */}
            <div className="h-full">
                <ElementBuilderPage
                    initialData={templateData}
                    onDataChange={(newData) => {
                
                        setTemplateData(newData);
                        // Also save to localStorage as you make changes
                        localStorage.setItem('campaign_template_data', JSON.stringify(newData));
                    }}
                    isFullScreen={true}
                />
            </div>
        </div>
    );
};

export default TemplateEditorPage;
