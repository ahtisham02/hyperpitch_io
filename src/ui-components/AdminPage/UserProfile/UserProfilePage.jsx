import React, { useState, useEffect, useCallback } from 'react';
import * as LucideIcons from 'lucide-react';

const ValidationItem = ({ isValid, text }) => {
  return (
    <div className={`flex items-center gap-1.5 ${isValid ? 'text-green-600' : 'text-slate-500'}`}>
      {isValid ? <LucideIcons.CheckCircle2 size={14} className="flex-shrink-0" /> : <LucideIcons.XCircle size={14} className="flex-shrink-0 text-slate-400" />}
      <span className="text-xs">{text}</span>
    </div>
  );
};

export default function UserProfilePage() {
  const [firstName, setFirstName] = useState('Alex');
  const [lastName, setLastName] = useState('Hyper');
  const [nickname, setNickname] = useState('alex_h');
  const [companyname, setCompanyname] = useState('HyperPitch.io');
  const [selectedDisplayName, setSelectedDisplayName] = useState({ value: 'Alex Hyper', label: 'Alex Hyper' });
  const [email, setEmail] = useState('alex@hyperpitch.io');
  const [website, setWebsite] = useState('https://hyperpitch.io');
  const [bio, setBio] = useState('Pioneering the future of impactful presentations with Hyperpitch.io. Avid learner and tech enthusiast.');
  const [jobTitle, setJobTitle] = useState('Founder & CEO');
  const [location, setLocation] = useState('New York, USA');
  const [pronouns, setPronouns] = useState({ value: 'he/him', label: 'He/Him' });
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordValidation, setPasswordValidation] = useState({
    length: false, uppercase: false, lowercase: false, number: false, specialChar: false,
  });

  const [profileImage, setProfileImage] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState('');

  const [notifications, setNotifications] = useState({ productUpdates: true, weeklyDigest: false, pitchFeedback: true, accountSecurity: true });

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
  
  useEffect(() => {
    setProfileImagePreview(`https://www.gravatar.com/avatar/${email ? btoa(email.trim().toLowerCase()) : '0'}?d=mp&s=128`);
  }, [email]);


  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfileImage(file);
      setProfileImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const allValid = Object.values(passwordValidation).every(Boolean);
    if (newPassword && (!allValid || newPassword !== confirmPassword)) {
        alert('Please ensure your new password meets all requirements and passwords match.');
        return;
    }
    console.log({ firstName, lastName, nickname,companyname, selectedDisplayName, email, website, bio, jobTitle, location, pronouns, notifications, profileImage });
    alert('Hyperpitch.io Profile Updated!');
  };

  const displayNameOptions = [firstName, lastName, nickname,companyname, `${firstName} ${lastName}`, `${lastName} ${firstName}`]
    .filter(name => name && name.trim() !== '')
    .filter((v, i, a) => a.indexOf(v) === i)
    .map(name => ({ value: name, label: name }));
  if (displayNameOptions.length === 0) displayNameOptions.push({ value: 'alex_hyper', label: 'alex_hyper' });

  const pronounOptions = [
    { value: 'he/him', label: 'He/Him' }, { value: 'she/her', label: 'She/Her' }, { value: 'they/them', label: 'They/Them' }, { value: 'prefer_not_to_say', label: 'Prefer not to say' }, { value: 'custom', label: 'Custom...' }
  ];

  const inputBase = "block w-full bg-white/70 border border-slate-300/70 rounded-lg py-2.5 px-3.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2e8b57]/60 focus:border-[#2e8b57] transition-all duration-150 ease-in-out text-sm";
  const labelBase = "block text-xs font-semibold text-slate-700 mb-1";
  const sectionWrapper = "bg-white/90 backdrop-blur-sm p-6 md:p-8 rounded-xl border border-slate-200/60";
  const fieldGroup = "grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5";
  const toggleBase = "relative inline-flex items-center h-5 rounded-full w-9 transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#2e8b57]/50 focus:ring-offset-1 focus:ring-offset-white";
  const toggleChecked = "bg-[#2e8b57]";
  const toggleUnchecked = "bg-slate-300";
  const toggleKnob = "inline-block w-3.5 h-3.5 transform bg-white rounded-full transition-transform duration-150 ease-in-out";

  return (
    <div className="space-y-10">
      <header className="text-center md:text-left">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900">My Profile</h1>
        <p className="mt-1.5 text-base text-slate-600 max-w-2xl mx-auto md:mx-0">Keep your personal information accurate and up-to-date.</p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-10">
        <section className={sectionWrapper}>
          <h2 className="text-xl font-semibold text-slate-900 mb-6 flex items-center">
            <LucideIcons.UserCircle2 size={24} className="mr-2.5 text-[#2e8b57]" />Basic Information
          </h2>
          <div className={fieldGroup}>
            <div><label htmlFor="firstName" className={labelBase}>First Name</label><input type="text" id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} className={inputBase} /></div>
            <div><label htmlFor="lastName" className={labelBase}>Last Name</label><input type="text" id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} className={inputBase} /></div>
            <div><label htmlFor="nickname" className={labelBase}>Username (Nickname) <span className="text-red-500">*</span></label><input type="text" id="nickname" value={nickname} onChange={(e) => setNickname(e.target.value)} required className={inputBase} /></div>
            <div><label htmlFor="companyname" className={labelBase}>Company Name<span className="text-red-500">*</span></label><input type="text" id="companyname" value={companyname} onChange={(e) => setCompanyname(e.target.value)} required className={inputBase} /></div>
            <div><label htmlFor="jobTitle" className={labelBase}>Job Title / Role</label><input type="text" id="jobTitle" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} className={inputBase} placeholder="e.g., Marketing Manager" /></div>
            <div><label htmlFor="location" className={labelBase}>Location</label><input type="text" id="location" value={location} onChange={(e) => setLocation(e.target.value)} className={inputBase} placeholder="e.g., San Francisco, CA" /></div>
          </div>
        </section>

        <section className={sectionWrapper}>
          <h2 className="text-xl font-semibold text-slate-900 mb-6 flex items-center">
            <LucideIcons.AtSign size={24} className="mr-2.5 text-[#2e8b57]" />Contact Details
          </h2>
          <div className={fieldGroup}>
            <div><label htmlFor="email" className={labelBase}>Email Address <span className="text-red-500">*</span></label><input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required className={inputBase} /></div>
            <div><label htmlFor="website" className={labelBase}>Website / Portfolio</label><input type="url" id="website" value={website} onChange={(e) => setWebsite(e.target.value)} className={inputBase} placeholder="https://your.portfolio.com" /></div>
          </div>
          <div className="mt-6">
            <label htmlFor="bio" className={labelBase}>Your Bio</label>
            <textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} rows="3" className={inputBase} placeholder="Tell us a bit about yourself..." />
          </div>
          <div className="mt-6 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-4">
            <img className="h-20 w-20 rounded-full border-2 border-white object-cover shadow-md" src={profileImagePreview || `https://www.gravatar.com/avatar/0?d=mp&s=96`} alt="Profile" />
            <div>
              <p className="text-xs text-slate-600 mb-1">Profile Picture</p>
              <input type="file" id="profileImageInput" accept="image/*" onChange={handleImageChange} className="hidden" />
              <label htmlFor="profileImageInput" className="cursor-pointer text-xs px-3 py-1.5 bg-green-50 text-[#2e8b57] border border-green-200 rounded-md hover:bg-green-100 transition-colors font-medium">
                Change Picture
              </label>
            </div>
          </div>
        </section>

        <section className={sectionWrapper}>
          <h2 className="text-xl font-semibold text-slate-900 mb-6 flex items-center">
            <LucideIcons.ShieldCheck size={24} className="mr-2.5 text-[#2e8b57]" />Password & Security
          </h2>
          <div className={fieldGroup}>
            <div className="relative">
              <label htmlFor="new_password" className={labelBase}>New Password</label>
              <input id="new_password" type={showPassword ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className={`${inputBase} pr-10`} placeholder="••••••••" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 top-5 pr-3 flex items-center text-sm leading-5 text-slate-500 hover:text-[#2e8b57]">
                {showPassword ? <LucideIcons.EyeOff size={16} /> : <LucideIcons.Eye size={16} />}
              </button>
            </div>
            <div>
              <label htmlFor="confirm_password" className={labelBase}>Confirm New Password</label>
              <input id="confirm_password" type={showPassword ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className={`${inputBase} ${newPassword && newPassword !== confirmPassword && confirmPassword ? 'border-red-400 focus:ring-red-400/60 focus:border-red-400' : ''}`} placeholder="••••••••" />
            </div>
          </div>
          {newPassword && (
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
              <ValidationItem isValid={passwordValidation.length} text="At least 12 characters" />
              <ValidationItem isValid={passwordValidation.uppercase} text="An uppercase letter (A-Z)" />
              <ValidationItem isValid={passwordValidation.lowercase} text="A lowercase letter (a-z)" />
              <ValidationItem isValid={passwordValidation.number} text="A number (0-9)" />
              <ValidationItem isValid={passwordValidation.specialChar} text="A special character (!@#$...)" />
            </div>
          )}
          {!newPassword && <p className="mt-2 text-xs text-slate-500">Leave blank to keep your current password.</p>}
        </section>
        
        <section className={sectionWrapper}>
            <h2 className="text-xl font-semibold text-slate-900 mb-6 flex items-center">
                <LucideIcons.BellDot size={24} className="mr-2.5 text-[#2e8b57]" />Notification Preferences
            </h2>
            <div className="space-y-4">
                {[
                    { id: 'productUpdates', label: 'Product Updates & Announcements', desc: 'New features and important Hyperpitch.io news.' },
                    { id: 'weeklyDigest', label: 'Weekly Activity Digest', desc: 'Summary of your activity and key metrics.' },
                    { id: 'pitchFeedback', label: 'Pitch Feedback & Comments', desc: 'Instant notifications for feedback on pitches.' },
                    { id: 'accountSecurity', label: 'Account Security Alerts', desc: 'Notifications for important security events.' },
                ].map(item => (
                    <div key={item.id} className="flex flex-col gap-2 py-2 sm:flex-row sm:items-center sm:justify-between">
                        <div className="pr-4">
                            <label htmlFor={item.id} className="font-medium text-sm text-slate-800">{item.label}</label>
                            <p className="text-xs text-slate-500">{item.desc}</p>
                        </div>
                        <button type="button" onClick={() => setNotifications(prev => ({...prev, [item.id]: !prev[item.id]}))} className={`${toggleBase} flex-shrink-0 ${notifications[item.id] ? toggleChecked : toggleUnchecked}`}>
                            <span className={`${toggleKnob} ${notifications[item.id] ? 'translate-x-[18px]' : 'translate-x-0.5'}`} />
                        </button>
                    </div>
                ))}
            </div>
        </section>

        <div className="pt-6 flex flex-col sm:flex-row sm:justify-end sm:items-center gap-3">
            <button type="button" className="px-5 py-2.5 rounded-lg text-slate-700 font-medium hover:bg-slate-100/80 transition-colors duration-150 text-sm order-2 sm:order-1 border border-slate-300">Cancel</button>
            <button type="submit" className="order-1 sm:order-2 inline-flex items-center justify-center px-6 py-2.5 border border-transparent text-sm font-semibold rounded-lg text-white bg-[#2e8b57] hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-green-200 focus:ring-green-500 transition-all duration-150 ease-in-out transform hover:scale-[1.02]">
                <LucideIcons.Check size={18} className="mr-2" />Save Changes
            </button>
        </div>
      </form>
    </div>
  );
}