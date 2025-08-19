import React, { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import * as LucideIcons from 'lucide-react';
import { toast } from 'react-toastify';
import apiRequest from '../../../utils/apiRequest';
import { setUserInfo } from '../../../auth/authSlice';

const ValidationItem = ({ isValid, text }) => (
  <div className={`flex items-center gap-1.5 ${isValid ? 'text-green-600' : 'text-slate-500'}`}>
    {isValid ? <LucideIcons.CheckCircle2 size={14} className="flex-shrink-0" /> : <LucideIcons.XCircle size={14} className="flex-shrink-0 text-slate-400" />}
    <span className="text-xs">{text}</span>
  </div>
);

export default function UserProfilePage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [companyname, setCompanyname] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [bio, setBio] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [location, setLocation] = useState('');
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordValidation, setPasswordValidation] = useState({
    length: false, uppercase: false, lowercase: false, number: false, specialChar: false,
  });

  const [profileImage, setProfileImage] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState('');
  
  const [isLoading, setIsLoading] = useState(true);
  
  const { userInfo } = useSelector((state) => state.auth);
  const { userToken } = useSelector((state) => state.auth);
  
  const dispatch = useDispatch();

  const populateProfileData = useCallback((profile) => {
    if (!profile) return;
    const nameParts = (profile.name || '').split(' ');
    setFirstName(nameParts[0] || '');
    setLastName(nameParts.slice(1).join(' ') || '');
    setEmail(profile.email || '');
    setJobTitle(profile.jobTitle || '');
    setLocation(profile.location || '');
    setBio(profile.userBio || '');
    setCompanyname(profile.companyname || '');
    setWebsite(profile.website || '');
    setProfileImagePreview(profile.profilePic || `https://www.gravatar.com/avatar/${btoa(profile.email || '0')}?d=mp&s=128`);
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!userInfo?.profile?.id || !userToken) {
        toast.error("Authentication error. Please log in again.");
        setIsLoading(false);
        return;
      }
      try {
        const response = await apiRequest('get', `/user/profile/${userInfo.profile.id}`, null, userToken);
        populateProfileData(response.data.profile);
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to fetch profile data.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [userInfo, populateProfileData]);

  const validatePassword = useCallback((password) => {
    setPasswordValidation({
      length: password.length >= 12,
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
    setIsLoading(true);

    const formData = new FormData();
    formData.append('name', `${firstName} ${lastName}`.trim());
    formData.append('location', location);
    formData.append('userBio', bio);
    if (profileImage) {
      formData.append('profilePic', profileImage);
    }
    
    try {
      const response = await apiRequest('put', `/user/profile/${userInfo.profile.id}`, formData, userToken);
      
      const updatedUserInfo = {
        token: userToken,
        data: response.data,
      };

      dispatch(setUserInfo(updatedUserInfo));
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile.');
    } finally {
      setIsLoading(false);
    }
  };

  const inputBase = "block w-full bg-white/70 border border-slate-300/70 rounded-lg py-2.5 px-3.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2e8b57]/60 focus:border-[#2e8b57] transition-all duration-150 ease-in-out text-sm disabled:opacity-50 disabled:cursor-not-allowed";
  const labelBase = "block text-xs font-semibold text-slate-700 mb-1";
  const sectionWrapper = "bg-white/90 backdrop-blur-sm p-6 md:p-8 rounded-xl border border-slate-200/60";
  const fieldGroup = "grid grid-cols-1 gap-x-6 gap-y-5";

  return (
    <div className="space-y-10">
      <header className="text-center md:text-left">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900">My Profile</h1>
        <p className="mt-1.5 text-base text-slate-600 max-w-2xl mx-auto md:mx-0">Keep your personal information accurate and up-to-date.</p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-10">

        <section className={sectionWrapper}>
          <h2 className="text-xl font-semibold text-slate-900 mb-6 flex items-center">
            <LucideIcons.AtSign size={24} className="mr-2.5 text-[#2e8b57]" />Contact Details
          </h2>
          <div className={fieldGroup}>
            <div><label htmlFor="email" className={labelBase}>Email Address (cannot be changed)</label><input type="email" id="email" value={email} readOnly className={`${inputBase} bg-slate-100 cursor-not-allowed`} /></div>
          </div>
          <div className="mt-6">
            <label htmlFor="bio" className={labelBase}>Your Bio</label>
            <textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} rows="3" className={inputBase} placeholder="Tell us a bit about yourself..." disabled={isLoading} />
          </div>
          <div className="mt-6 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-4">
            <img className="h-20 w-20 rounded-full border-2 border-white object-cover shadow-md" src={profileImagePreview} alt="Profile Preview" />
            <div>
              <p className="text-xs text-slate-600 mb-1">Profile Picture</p>
              <input type="file" id="profileImageInput" accept="image/*" onChange={handleImageChange} className="hidden" disabled={isLoading} />
              <label htmlFor="profileImageInput" className={`cursor-pointer text-xs px-3 py-1.5 bg-green-50 text-[#2e8b57] border border-green-200 rounded-md hover:bg-green-100 transition-colors font-medium ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                Change Picture
              </label>
            </div>
          </div>
        </section>

                <section className={sectionWrapper}>
          <h2 className="text-xl font-semibold text-slate-900 mb-6 flex items-center">
            <LucideIcons.UserCircle2 size={24} className="mr-2.5 text-[#2e8b57]" />Basic Information
          </h2>
          <div className={fieldGroup}>
            <div><label htmlFor="firstName" className={labelBase}>First Name</label><input type="text" id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} className={inputBase} disabled={isLoading} /></div>
            <div><label htmlFor="lastName" className={labelBase}>Last Name</label><input type="text" id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} className={inputBase} disabled={isLoading} /></div>
            <div><label htmlFor="location" className={labelBase}>Location</label><input type="text" id="location" value={location} onChange={(e) => setLocation(e.target.value)} className={inputBase} placeholder="e.g., San Francisco, CA" disabled={isLoading} /></div>
          </div>
        </section>

        <div className="pt-6 flex flex-col sm:flex-row sm:justify-end sm:items-center gap-3">
          <button type="button" className="px-5 py-2.5 rounded-lg text-slate-700 font-medium hover:bg-slate-100/80 transition-colors duration-150 text-sm order-2 sm:order-1 border border-slate-300" disabled={isLoading}>Cancel</button>
          <button type="submit" className="order-1 sm:order-2 inline-flex items-center justify-center px-6 py-2.5 border border-transparent text-sm font-semibold rounded-lg text-white bg-[#2e8b57] hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-green-200 focus:ring-green-500 transition-all duration-150 ease-in-out transform hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed" disabled={isLoading}>
            {isLoading ? <LucideIcons.LoaderCircle size={18} className="mr-2 animate-spin" /> : <LucideIcons.Check size={18} className="mr-2" />}
            {isLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}