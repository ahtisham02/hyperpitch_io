import React, { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import * as LucideIcons from 'lucide-react';
import { toast } from 'react-toastify';
import apiRequest from '../../../utils/apiRequest';
import { updateUserData } from '../../../auth/authSlice';

const ValidationItem = ({ isValid, text }) => (
  <div className={`flex items-center gap-1.5 ${isValid ? 'text-green-600' : 'text-slate-500'}`}>
    {isValid ? <LucideIcons.CheckCircle2 size={14} className="flex-shrink-0" /> : <LucideIcons.XCircle size={14} className="flex-shrink-0 text-slate-400" />}
    <span className="text-xs">{text}</span>
  </div>
);

export default function UserProfilePage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [location, setLocation] = useState('');
  const [bio, setBio] = useState('');
  const [linkedinId, setLinkedinId] = useState('');
  const [remainingCredits, setRemainingCredits] = useState(0);
  const [totalCredits, setTotalCredits] = useState(0);
  const [isVerified, setIsVerified] = useState(false);
  const [createdAt, setCreatedAt] = useState('');
  
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordValidation, setPasswordValidation] = useState({
    length: false, uppercase: false, lowercase: false, number: false, specialChar: false,
  });
  
  const [profileImage, setProfileImage] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState('');
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPasswordChanging, setIsPasswordChanging] = useState(false);
  
  const { userInfo } = useSelector((state) => state.auth);
  const { userToken } = useSelector((state) => state.auth);
  
  const dispatch = useDispatch();

  const populateProfileData = useCallback((profile) => {
    if (!profile) return;
    
    const nameParts = (profile.name || '').split(' ');
    setFirstName(nameParts[0] || '');
    setLastName(nameParts.slice(1).join(' ') || '');
    setEmail(profile.email || '');
    setJobTitle(profile.jobtitle || '');
    setLocation(profile.location || '');
    setBio(profile.userBio || '');
    setLinkedinId(profile.linkedinid || '');
    setRemainingCredits(profile.remainingCredits || 0);
    setTotalCredits(profile.totalCredits || 0);
    setIsVerified(profile.isVerified || false);
    setCreatedAt(profile.createdAt || '');
    setProfileImagePreview(profile.profilePic || `https://www.gravatar.com/avatar/${btoa(profile.email || '0')}?d=mp&s=128`);
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!userInfo?.id || !userToken) {
        toast.error("Authentication error. Please log in again.");
        setIsLoading(false);
        return;
      }
      try {
        const response = await apiRequest('get', `/profile`, null, userToken);
        populateProfileData(response.data);
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to fetch profile data.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [userInfo, userToken, populateProfileData]);

  const validatePassword = useCallback((password) => {
    setPasswordValidation({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      specialChar: /[^A-Za-z0-9]/.test(password),
    });
  }, []);

  useEffect(() => {
    if (newPassword) {
      validatePassword(newPassword);
    } else {
      setPasswordValidation({ length: false, uppercase: false, lowercase: false, number: false, specialChar: false });
    }
  }, [newPassword, validatePassword]);

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfileImage(file);
      setProfileImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    const formData = new FormData();
    formData.append('name', `${firstName} ${lastName}`.trim());
    formData.append('jobTitle', jobTitle);
    formData.append('location', location);
    formData.append('userBio', bio);
    formData.append('linkedinid', linkedinId);
    if (profileImage) {
      formData.append('profilePic', profileImage);
    }
    
    try {
      const response = await apiRequest('put', `/profile`, formData, userToken);
      dispatch(updateUserData(response.data));
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (!oldPassword.trim()) {
      toast.error('Please enter your current password.');
      return;
    }
    
    if (!newPassword.trim()) {
      toast.error('Please enter a new password.');
      return;
    }

    const isPasswordValid = Object.values(passwordValidation).every(Boolean);
    if (!isPasswordValid) {
      toast.error('Please ensure your new password meets all requirements.');
      return;
    }

    setIsPasswordChanging(true);
    try {
      await apiRequest('put', `/user/update-password`, {
        oldPassword: oldPassword,
        newPassword: newPassword
      }, userToken);
      
      toast.success('Password updated successfully!');
      setOldPassword('');
      setNewPassword('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update password.');
    } finally {
      setIsPasswordChanging(false);
    }
  };

  const inputBase = "block w-full bg-white/70 border border-slate-300/70 rounded-lg py-2.5 px-3.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2e8b57]/60 focus:border-[#2e8b57] transition-all duration-150 ease-in-out text-sm disabled:opacity-50 disabled:cursor-not-allowed";
  const labelBase = "block text-xs font-semibold text-slate-700 mb-1";
  const sectionWrapper = "bg-white/90 backdrop-blur-sm p-6 md:p-8 rounded-xl border border-slate-200/60";
  const fieldGroup = "grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5";

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LucideIcons.LoaderCircle size={32} className="animate-spin text-[#2e8b57]" />
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <header className="text-center md:text-left">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900">My Profile</h1>
        <p className="mt-1.5 text-base text-slate-600 max-w-2xl mx-auto md:mx-0">Keep your personal information accurate and up-to-date.</p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-10">
        <section className={sectionWrapper}>
          <h2 className="text-xl font-semibold text-slate-900 mb-6 flex items-center">
            <LucideIcons.UserCircle2 size={24} className="mr-2.5 text-[#2e8b57]" />Account Information
          </h2>
          <div className={fieldGroup}>
            <div>
              <label htmlFor="firstName" className={labelBase}>First Name</label>
              <input 
                type="text" 
                id="firstName" 
                value={firstName} 
                onChange={(e) => setFirstName(e.target.value)} 
                className={inputBase} 
                disabled={isSaving} 
              />
            </div>
            <div>
              <label htmlFor="lastName" className={labelBase}>Last Name</label>
              <input 
                type="text" 
                id="lastName" 
                value={lastName} 
                onChange={(e) => setLastName(e.target.value)} 
                className={inputBase} 
                disabled={isSaving} 
              />
            </div>
            <div>
              <label htmlFor="email" className={labelBase}>Email Address</label>
              <input 
                type="email" 
                id="email" 
                value={email} 
                readOnly 
                className={`${inputBase} bg-slate-100 cursor-not-allowed`} 
              />
            </div>
            <div>
              <label htmlFor="jobTitle" className={labelBase}>Job Title</label>
              <input 
                type="text" 
                id="jobTitle" 
                value={jobTitle} 
                onChange={(e) => setJobTitle(e.target.value)} 
                className={inputBase} 
                placeholder="e.g., Marketing Manager" 
                disabled={isSaving} 
              />
            </div>
            <div>
              <label htmlFor="location" className={labelBase}>Location</label>
              <input 
                type="text" 
                id="location" 
                value={location} 
                onChange={(e) => setLocation(e.target.value)} 
                className={inputBase} 
                placeholder="e.g., San Francisco, CA" 
                disabled={isSaving} 
              />
            </div>
            <div>
              <label htmlFor="linkedinId" className={labelBase}>LinkedIn ID</label>
              <input 
                type="text" 
                id="linkedinId" 
                value={linkedinId} 
                onChange={(e) => setLinkedinId(e.target.value)} 
                className={inputBase} 
                placeholder="LinkedIn profile ID" 
                disabled={isSaving} 
              />
            </div>
          </div>
          <div className="mt-6">
            <label htmlFor="bio" className={labelBase}>Your Bio</label>
            <textarea 
              id="bio" 
              value={bio} 
              onChange={(e) => setBio(e.target.value)} 
              rows="3" 
              className={inputBase} 
              placeholder="Tell us a bit about yourself..." 
              disabled={isSaving} 
            />
          </div>
        </section>

        <section className={sectionWrapper}>
          <h2 className="text-xl font-semibold text-slate-900 mb-6 flex items-center">
            <LucideIcons.Coins size={24} className="mr-2.5 text-[#2e8b57]" />Credits Information
          </h2>
          <div className={fieldGroup}>
            <div>
              <label className={labelBase}>Remaining Credits</label>
              <div className="flex items-center space-x-2">
                <input 
                  type="number" 
                  value={remainingCredits} 
                  readOnly 
                  className={`${inputBase} bg-slate-100 cursor-not-allowed`} 
                />
                <LucideIcons.Coins size={20} className="text-[#2e8b57]" />
              </div>
            </div>
            <div>
              <label className={labelBase}>Total Credits</label>
              <div className="flex items-center space-x-2">
                <input 
                  type="number" 
                  value={totalCredits} 
                  readOnly 
                  className={`${inputBase} bg-slate-100 cursor-not-allowed`} 
                />
                <LucideIcons.Coins size={20} className="text-[#2e8b57]" />
              </div>
            </div>
            <div>
              <label className={labelBase}>Account Status</label>
              <div className="flex items-center space-x-2">
                <input 
                  type="text" 
                  value={isVerified ? "Verified" : "Not Verified"} 
                  readOnly 
                  className={`${inputBase} bg-slate-100 cursor-not-allowed`} 
                />
                {isVerified ? (
                  <LucideIcons.CheckCircle2 size={20} className="text-green-500" />
                ) : (
                  <LucideIcons.XCircle size={20} className="text-red-500" />
                )}
              </div>
            </div>
            <div>
              <label className={labelBase}>Member Since</label>
              <input 
                type="text" 
                value={new Date(createdAt).toLocaleDateString()} 
                readOnly 
                className={`${inputBase} bg-slate-100 cursor-not-allowed`} 
              />
            </div>
          </div>
        </section>

        <div className="pt-6 flex flex-col sm:flex-row sm:justify-end sm:items-center gap-3">
          <button 
            type="button" 
            className="px-5 py-2.5 rounded-lg text-slate-700 font-medium hover:bg-slate-100/80 transition-colors duration-150 text-sm order-2 sm:order-1 border border-slate-300" 
            disabled={isSaving}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="order-1 sm:order-2 inline-flex items-center justify-center px-6 py-2.5 border border-transparent text-sm font-semibold rounded-lg text-white bg-[#2e8b57] hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-green-200 focus:ring-green-500 transition-all duration-150 ease-in-out transform hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed" 
            disabled={isSaving}
          >
            {isSaving ? <LucideIcons.LoaderCircle size={18} className="mr-2 animate-spin" /> : <LucideIcons.Check size={18} className="mr-2" />}
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>

      <section className={sectionWrapper}>
        <h2 className="text-xl font-semibold text-slate-900 mb-6 flex items-center">
          <LucideIcons.Lock size={24} className="mr-2.5 text-[#2e8b57]" />Change Password
        </h2>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div className={fieldGroup}>
            <div>
              <label htmlFor="oldPassword" className={labelBase}>Current Password</label>
              <div className="relative">
                <input 
                  type={showOldPassword ? "text" : "password"} 
                  id="oldPassword" 
                  value={oldPassword} 
                  onChange={(e) => setOldPassword(e.target.value)} 
                  className={inputBase} 
                  placeholder="Enter current password" 
                  disabled={isPasswordChanging} 
                />
                <button 
                  type="button" 
                  onClick={() => setShowOldPassword(!showOldPassword)} 
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showOldPassword ? <LucideIcons.EyeOff size={16} /> : <LucideIcons.Eye size={16} />}
                </button>
              </div>
            </div>
            <div>
              <label htmlFor="newPassword" className={labelBase}>New Password</label>
              <div className="relative">
                <input 
                  type={showNewPassword ? "text" : "password"} 
                  id="newPassword" 
                  value={newPassword} 
                  onChange={(e) => setNewPassword(e.target.value)} 
                  className={inputBase} 
                  placeholder="Enter new password" 
                  disabled={isPasswordChanging} 
                />
                <button 
                  type="button" 
                  onClick={() => setShowNewPassword(!showNewPassword)} 
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showNewPassword ? <LucideIcons.EyeOff size={16} /> : <LucideIcons.Eye size={16} />}
                </button>
              </div>
            </div>
          </div>
          
          {newPassword && (
            <div className="bg-slate-50 p-4 rounded-lg">
              <p className="text-xs font-semibold text-slate-700 mb-3">Password Requirements:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <ValidationItem isValid={passwordValidation.length} text="At least 8 characters" />
                <ValidationItem isValid={passwordValidation.uppercase} text="One uppercase letter" />
                <ValidationItem isValid={passwordValidation.lowercase} text="One lowercase letter" />
                <ValidationItem isValid={passwordValidation.number} text="One number" />
                <ValidationItem isValid={passwordValidation.specialChar} text="One special character" />
              </div>
            </div>
          )}
          
          <div className="flex justify-end">
            <button 
              type="submit" 
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-semibold rounded-lg text-white bg-[#2e8b57] hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-green-200 focus:ring-green-500 transition-all duration-150 ease-in-out transform hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed" 
              disabled={isPasswordChanging || !oldPassword || !newPassword}
            >
              {isPasswordChanging ? <LucideIcons.LoaderCircle size={18} className="mr-2 animate-spin" /> : <LucideIcons.Lock size={18} className="mr-2" />}
              {isPasswordChanging ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}