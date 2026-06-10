import { useState, useRef, useEffect } from 'react';
import type { User } from '../../App';

interface SettingsViewProps {
  currentUser: User;
  deferredPrompt?: any;
  onClearPrompt?: () => void;
  onUpdateUser: (updated: User) => void;
  onLogout: () => void;
}

type ThemeMode = 'light' | 'dark' | 'system';
type FontSize = 'small' | 'medium' | 'large';

const ACCENT_COLORS = [
  { label: 'Default primary blue', value: '#004ad3', bg: 'bg-[#004ad3]' },
  { label: 'Modern Indigo Accent', value: '#4648d4', bg: 'bg-[#4648d4]' },
  { label: 'Deep Teal Accent', value: '#005d86', bg: 'bg-[#005d86]' },
  { label: 'Vibrant Crimson Red', value: '#ba1a1a', bg: 'bg-[#ba1a1a]' },
  { label: 'Emerald Forest Green', value: '#2e7d32', bg: 'bg-[#2e7d32]' },
  { label: 'Sunset Orange Accent', value: '#ed6c02', bg: 'bg-[#ed6c02]' },
  { label: 'Royal Purple Accent', value: '#6750A4', bg: 'bg-[#6750A4]' },
  { label: 'Sleek Dark Accent', value: '#434656', bg: 'bg-[#434656]' },
];

export function SettingsView({ 
  currentUser, 
  deferredPrompt,
  onClearPrompt,
  onUpdateUser, 
  onLogout 
}: SettingsViewProps) {
  // Profile Form States
  const [fullName, setFullName] = useState(currentUser.name);
  const [username, setUsername] = useState(currentUser.username || 'arivera_dev');
  const [bio, setBio] = useState(currentUser.bio || 'Senior Product Designer focused on creating seamless collaborative experiences at CollabHub.');
  
  // Customization States
  const [theme, setTheme] = useState<ThemeMode>((currentUser.theme as ThemeMode) || 'light');
  const [accentColor, setAccentColor] = useState(currentUser.accentColor || '#004ad3');
  const [accentLabel, setAccentLabel] = useState('Default primary blue');
  const [fontSize, setFontSize] = useState<FontSize>((currentUser.fontSize as FontSize) || 'medium');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  
  // Database Preferences (Mapped exactly to user_preferences table schema)
  const [newMessages, setNewMessages] = useState(currentUser.newMessagesAlert ?? true);
  const [mentionsOnly, setMentionsOnly] = useState(currentUser.mentionsOnlyAlert ?? false);
  const [soundEffects, setSoundEffects] = useState(currentUser.soundEffectsAlert ?? true);

  // In-System Alert Banner States
  const [systemToast, setSystemToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync form state when currentUser prop changes (e.g., after backend authentication load)
  useEffect(() => {
    setFullName(currentUser.name);
    setUsername(currentUser.username || 'arivera_dev');
    setBio(currentUser.bio || 'Senior Product Designer focused on creating seamless collaborative experiences at CollabHub.');
    setTheme((currentUser.theme as ThemeMode) || 'light');
    setAccentColor(currentUser.accentColor || '#004ad3');
    setFontSize((currentUser.fontSize as FontSize) || 'medium');
    setNewMessages(currentUser.newMessagesAlert ?? true);
    setMentionsOnly(currentUser.mentionsOnlyAlert ?? false);
    setSoundEffects(currentUser.soundEffectsAlert ?? true);
  }, [currentUser]);

  // Custom function to trigger premium in-app alerts
  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setSystemToast({ message, type });
    setTimeout(() => setSystemToast(null), 3000);
  };

  // Sync Theme Mode with DOM
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else if (theme === 'light') {
      root.classList.add('light');
      root.classList.remove('dark');
    } else {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleSystemThemeChange = (e: MediaQueryListEvent | MediaQueryList) => {
        if (e.matches) {
          root.classList.add('dark');
          root.classList.remove('light');
        } else {
          root.classList.add('light');
          root.classList.remove('dark');
        }
      };
      handleSystemThemeChange(mediaQuery);
      mediaQuery.addEventListener('change', handleSystemThemeChange);
      return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
    }
  }, [theme]);

  // Handle local avatar upload
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showToast("File size exceeds the 2MB limit.", "error");
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setAvatarPreview(event.target.result as string);
          showToast("Avatar preview updated!", "success");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Perform Save action
  const handleSaveProfile = () => {
    const updatedUser: User = {
      ...currentUser,
      name: fullName.trim() || currentUser.name,
      avatar: fullName.trim().split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || currentUser.avatar,
      username,
      bio,
      theme,
      accentColor,
      fontSize,
      newMessagesAlert: newMessages,
      mentionsOnlyAlert: mentionsOnly,
      soundEffectsAlert: soundEffects
    };
    onUpdateUser(updatedUser);
    showToast("Changes saved successfully!", "success");
  };

  // Switch Toggle Helper Component
  const Toggle = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
    <button
      onClick={onChange}
      className={`relative w-11 h-6 rounded-full transition-colors duration-300 flex items-center flex-shrink-0 cursor-pointer focus:outline-none ${
        checked ? 'bg-primary' : 'bg-outline-variant dark:bg-slate-700'
      }`}
      role="switch"
      aria-checked={checked}
    >
      <span
        className={`absolute w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300 ${
          checked ? 'translate-x-[22px]' : 'translate-x-[2px]'
        }`}
      />
    </button>
  );

  return (
    <main className="flex-1 overflow-y-auto bg-background dark:bg-background hide-scrollbar relative">
      <div className="max-w-5xl mx-auto px-lg py-xl pb-32 space-y-lg relative">
        
        {/* PREMIUM IN-SYSTEM FLOATING TOAST BANNER */}
        {systemToast && (
          <div
            className={`fixed top-4 right-4 px-md py-sm rounded-lg shadow-xl flex items-center gap-sm z-50 animate-fade-in border border-white/10 ${
              systemToast.type === 'success'
                ? 'bg-green-500 text-white'
                : systemToast.type === 'error'
                ? 'bg-red-500 text-white'
                : 'bg-primary text-white'
            }`}
          >
            <span className="material-symbols-outlined">
              {systemToast.type === 'success' ? 'check_circle' : systemToast.type === 'error' ? 'error' : 'info'}
            </span>
            <span className="font-label-md text-label-md font-bold">{systemToast.message}</span>
          </div>
        )}

        {/* Unified Page Header */}
        <header className="flex flex-col gap-xs">
          <h1 className="font-headline-lg text-headline-lg text-on-surface dark:text-primary-fixed-dim">Settings</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">Update your personal profile, customize interface settings, and configure your app notifications.</p>
        </header>

        {/* Responsive Grid Layout: 2 Columns on Desktop, 1 Column on Mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg items-start">
          
          {/* ========================================== */}
          {/* MAIN SETTINGS COLUMN (Spans 2 cols on LG)  */}
          {/* ========================================== */}
          <div className="lg:col-span-2 space-y-lg">
            
            {/* CARD 1: PROFILE DETAILS */}
            <section className="bg-surface-container-lowest dark:bg-surface-container-low border border-outline-variant dark:border-outline rounded-xl p-lg shadow-sm space-y-lg animate-fade-in">
              <h2 className="font-headline-sm text-headline-sm text-on-surface dark:text-primary-fixed-dim border-b border-outline-variant/30 pb-sm font-bold">Profile Details</h2>
              
              <div className="flex flex-col sm:flex-row gap-xl items-center sm:items-start">
                
                {/* Avatar Image Uploader */}
                <div className="flex flex-col items-center gap-md">
                  <div className="relative group">
                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-surface-container-high dark:border-outline-variant shadow-inner">
                      {avatarPreview ? (
                        <img alt="Uploaded avatar preview" className="w-full h-full object-cover" src={avatarPreview} />
                      ) : (
                        <img
                          alt="Current avatar"
                          className="w-full h-full object-cover"
                          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCFRNhTNIhlTn0VLhQCMOT7TIk_pQZCO8UphzEVJadkbiWwTxytYSA0lKuVmta1OWaWsFIJmd-UrPPybkoYsbXCDXazAkhwDpf6QyML0prK89PlRGI7YNXgiceNShQfpy_-s9dM1DTUhcMuOE6yw286pEetUOkebYXLL9qWpGY0tuZc-STYmH4vOieMlYsqskfExIRFpTLnIXF1j1Kdm7wRRwLKECvtOFTKYb65Mn0D0KUB0ktn0Rzzi8kBtIthG7uEvWCfhY0eWXOq"
                        />
                      )}
                    </div>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer border-2 border-white"
                      title="Upload photo"
                    >
                      <span className="material-symbols-outlined text-[20px]">photo_camera</span>
                    </button>
                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                  </div>
                  <div className="text-center">
                    <p className="font-label-sm text-label-sm text-on-surface-variant">JPG, GIF or PNG. Max 2MB.</p>
                  </div>
                </div>

                {/* Profile Text Fields */}
                <div className="flex-1 w-full space-y-lg">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-lg">
                    <div className="space-y-xs">
                      <label className="font-label-md text-label-md text-on-surface-variant">Full Name</label>
                      <input
                        className="w-full bg-surface-bright dark:bg-surface-container border border-outline-variant dark:border-outline rounded-lg px-md py-sm font-body-md text-body-md focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all dark:text-white"
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-xs">
                      <label className="font-label-md text-label-md text-on-surface-variant">Username</label>
                      <div className="relative">
                        <span className="absolute left-md top-1/2 -translate-y-1/2 text-outline-variant font-bold">@</span>
                        <input
                          className="w-full bg-surface-bright dark:bg-surface-container border border-outline-variant dark:border-outline rounded-lg pl-8 pr-md py-sm font-body-md text-body-md focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all dark:text-white"
                          type="text"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-xs">
                    <label className="font-label-md text-label-md text-on-surface-variant">Bio</label>
                    <textarea
                      className="w-full bg-surface-bright dark:bg-surface-container border border-outline-variant dark:border-outline rounded-lg px-md py-sm font-body-md text-body-md focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all dark:text-white resize-none"
                      placeholder="Tell us a little about yourself..."
                      rows={3}
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                    />
                    <p className="font-label-sm text-label-sm text-on-surface-variant text-right">
                      {bio.length} / 200 characters
                    </p>
                  </div>

                  <div className="flex justify-end gap-md pt-md">
                    <button
                      onClick={() => {
                        setFullName(currentUser.name);
                        setUsername('arivera_dev');
                        setBio('Senior Product Designer focused on creating seamless collaborative experiences at CollabHub.');
                        showToast('Form values reset!', 'info');
                      }}
                      className="px-lg py-sm font-label-md text-label-md text-on-surface-variant hover:bg-surface-container-low rounded-lg transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveProfile}
                      className="px-xl py-sm font-label-md text-label-md bg-primary text-white rounded-lg hover:shadow-md hover:bg-primary/95 active:scale-95 transition-all cursor-pointer flex items-center gap-sm font-bold"
                    >
                      <span className="material-symbols-outlined text-[18px]">save</span>
                      Save Changes
                    </button>
                  </div>
                </div>

              </div>
            </section>

            {/* CARD 2: APPEARANCE CUSTOMIZATION */}
            <section className="bg-surface-container-lowest dark:bg-surface-container-low border border-outline-variant dark:border-outline rounded-xl p-lg shadow-sm space-y-lg">
              <h2 className="font-headline-sm text-headline-sm text-on-surface dark:text-primary-fixed-dim border-b border-outline-variant/30 pb-sm font-bold">Appearance Settings</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
                
                {/* Accent Color Selection Grid */}
                <div className="space-y-md border-b md:border-b-0 md:border-r border-outline-variant/20 pb-md md:pb-0 md:pr-md">
                  <h3 className="font-label-md text-label-md text-on-surface dark:text-white font-bold">Accent Color</h3>
                  <div className="grid grid-cols-4 gap-sm">
                    {ACCENT_COLORS.map((c) => (
                      <button
                        key={c.value}
                        onClick={() => {
                          setAccentColor(c.value);
                          setAccentLabel(c.label);
                          showToast(`Accent highlights set to: ${c.label}`, 'success');
                        }}
                        className={`aspect-square w-9 h-9 rounded-full transition-all hover:scale-110 active:scale-90 cursor-pointer ${c.bg} ${
                          accentColor === c.value
                            ? 'border-4 border-white shadow-md ring-2 ring-primary scale-105'
                            : ''
                        }`}
                        title={c.label}
                      ></button>
                    ))}
                  </div>
                  <p className="font-label-sm text-label-sm text-primary dark:text-primary-fixed-dim font-medium transition-colors" id="accent-label-text">
                    {accentLabel}
                  </p>
                </div>

                {/* Theme Mode Cards */}
                <div className="space-y-md border-b md:border-b-0 md:border-r border-outline-variant/20 pb-md md:pb-0 md:pr-md">
                  <h3 className="font-label-md text-label-md text-on-surface dark:text-white font-bold">Theme Mode</h3>
                  <div className="space-y-xs">
                    {(['light', 'dark', 'system'] as ThemeMode[]).map((mode) => (
                      <button
                        key={mode}
                        onClick={() => {
                          setTheme(mode);
                          showToast(`Theme updated to ${mode} mode`, 'success');
                        }}
                        className={`w-full flex items-center justify-between p-sm border rounded-lg transition-all cursor-pointer ${
                          theme === mode
                            ? 'border-primary bg-primary/10 text-primary font-bold'
                            : 'border-outline-variant/50 hover:border-primary text-on-surface-variant dark:text-white'
                        }`}
                      >
                        <span className="capitalize font-body-sm text-body-sm">{mode}</span>
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${theme === mode ? 'border-primary' : 'border-outline-variant'}`}>
                          {theme === mode && <div className="w-2 h-2 rounded-full bg-primary" />}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Font Scaling Track */}
                <div className="space-y-md">
                  <h3 className="font-label-md text-label-md text-on-surface dark:text-white font-bold">Font Size</h3>
                  <div className="space-y-md pt-sm">
                    <div className="flex justify-between items-end">
                      <span className="text-[12px] text-on-surface-variant">A</span>
                      <span className="text-[20px] font-bold text-on-surface dark:text-white">A</span>
                    </div>
                    {/* Range Selector Track */}
                    <div className="relative h-1.5 bg-surface-container-high dark:bg-surface-container-lowest/20 rounded-full cursor-pointer">
                      <div
                        className="absolute left-0 top-0 h-full bg-primary rounded-full transition-all"
                        style={{ width: fontSize === 'small' ? '0%' : fontSize === 'medium' ? '50%' : '100%' }}
                      ></div>
                      <div
                        onClick={() => {
                          const next = fontSize === 'small' ? 'medium' : fontSize === 'medium' ? 'large' : 'small';
                          setFontSize(next);
                          showToast(`Font scaling changed to: ${next}`, 'info');
                        }}
                        className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-primary border-2 border-white rounded-full shadow-md cursor-pointer transition-all"
                        style={{
                          left: fontSize === 'small' ? '0%' : fontSize === 'medium' ? '50%' : '100%',
                          transform: 'translate(-50%, -50%)',
                        }}
                      ></div>
                    </div>
                    <div className="flex justify-between font-label-sm text-label-sm text-on-surface-variant">
                      <span className={`cursor-pointer ${fontSize === 'small' ? 'text-primary font-bold' : ''}`} onClick={() => { setFontSize('small'); showToast('Font size set to Small', 'info'); }}>Small</span>
                      <span className={`cursor-pointer ${fontSize === 'medium' ? 'text-primary font-bold' : ''}`} onClick={() => { setFontSize('medium'); showToast('Font size set to Medium', 'info'); }}>Medium</span>
                      <span className={`cursor-pointer ${fontSize === 'large' ? 'text-primary font-bold' : ''}`} onClick={() => { setFontSize('large'); showToast('Font size set to Large', 'info'); }}>Large</span>
                    </div>
                  </div>
                </div>

              </div>
            </section>

            {/* CARD 3: DATABASE MAPPED USER PREFERENCES */}
            <section className="bg-surface-container-lowest dark:bg-surface-container-low border border-outline-variant dark:border-outline rounded-xl p-lg shadow-sm space-y-lg">
              <h2 className="font-headline-sm text-headline-sm text-on-surface dark:text-primary-fixed-dim border-b border-outline-variant/30 pb-sm font-bold">Preferences</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-md">
                
                {/* 1. New Messages Toggle */}
                <div className="flex flex-col justify-between p-md bg-background dark:bg-surface-container/50 border border-outline-variant/30 rounded-lg min-h-[100px]">
                  <div className="flex items-start gap-md">
                    <span className="material-symbols-outlined text-primary mt-0.5">chat</span>
                    <div>
                      <p className="font-body-md text-body-md text-on-surface dark:text-white font-bold leading-tight">New Messages</p>
                      <p className="font-label-sm text-label-sm text-on-surface-variant mt-0.5">Push alerts for incoming messages</p>
                    </div>
                  </div>
                  <div className="flex justify-end mt-sm">
                    <Toggle checked={newMessages} onChange={() => { setNewMessages(!newMessages); showToast(`New Messages ${!newMessages ? 'enabled' : 'disabled'}`, 'info'); }} />
                  </div>
                </div>

                {/* 2. Mentions Only Toggle */}
                <div className="flex flex-col justify-between p-md bg-background dark:bg-surface-container/50 border border-outline-variant/30 rounded-lg min-h-[100px]">
                  <div className="flex items-start gap-md">
                    <span className="material-symbols-outlined text-primary mt-0.5">alternate_email</span>
                    <div>
                      <p className="font-body-md text-body-md text-on-surface dark:text-white font-bold leading-tight">Mentions Only</p>
                      <p className="font-label-sm text-label-sm text-on-surface-variant mt-0.5">Only alert when someone @mentions you</p>
                    </div>
                  </div>
                  <div className="flex justify-end mt-sm">
                    <Toggle checked={mentionsOnly} onChange={() => { setMentionsOnly(!mentionsOnly); showToast(`Mentions Only ${!mentionsOnly ? 'enabled' : 'disabled'}`, 'info'); }} />
                  </div>
                </div>

                {/* 3. Sound Effects Toggle */}
                <div className="flex flex-col justify-between p-md bg-background dark:bg-surface-container/50 border border-outline-variant/30 rounded-lg min-h-[100px]">
                  <div className="flex items-start gap-md">
                    <span className="material-symbols-outlined text-primary mt-0.5">volume_up</span>
                    <div>
                      <p className="font-body-md text-body-md text-on-surface dark:text-white font-bold leading-tight">Sound Effects</p>
                      <p className="font-label-sm text-label-sm text-on-surface-variant mt-0.5">Play audio cues for notifications</p>
                    </div>
                  </div>
                  <div className="flex justify-end mt-sm">
                    <Toggle checked={soundEffects} onChange={() => { setSoundEffects(!soundEffects); showToast(`Sound Effects ${!soundEffects ? 'muted' : 'unmuted'}`, 'info'); }} />
                  </div>
                </div>

              </div>
            </section>

          </div>

          {/* ========================================== */}
          {/* SIDE/SECONDARY COLUMN (Spans 1 col on LG) */}
          {/* ========================================== */}
          <div className="space-y-lg">
            
            {/* CARD 4: ACCOUNT & SECURITY ACTIONS */}
            <section className="bg-surface-container-lowest dark:bg-surface-container-low border border-outline-variant dark:border-outline rounded-xl p-lg shadow-sm space-y-md animate-fade-in">
              <h2 className="font-headline-sm text-headline-sm text-on-surface dark:text-primary-fixed-dim border-b border-outline-variant/30 pb-sm font-bold">Account &amp; Security</h2>
              
              <div className="flex flex-col gap-sm">
                <button
                  onClick={() => showToast("Security parameters are secure on the admin server block.", "success")}
                  className="w-full p-md bg-background dark:bg-surface-container/50 border border-outline-variant/30 rounded-lg flex items-center justify-between hover:bg-surface-container-low dark:hover:bg-surface-dim transition-colors cursor-pointer text-left group"
                >
                  <div className="flex items-center gap-md">
                    <span className="material-symbols-outlined text-primary">shield</span>
                    <div className="flex flex-col">
                      <span className="font-body-md text-body-md text-on-surface dark:text-white font-medium font-bold">Security</span>
                      <span className="font-label-sm text-label-sm text-on-surface-variant">Password, 2FA, Sessions</span>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-on-surface-variant group-hover:translate-x-1 transition-transform">chevron_right</span>
                </button>

                <button
                  onClick={() => showToast("Notification configurations have been successfully updated.", "success")}
                  className="w-full p-md bg-background dark:bg-surface-container/50 border border-outline-variant/30 rounded-lg flex items-center justify-between hover:bg-surface-container-low dark:hover:bg-surface-dim transition-colors cursor-pointer text-left group"
                >
                  <div className="flex items-center gap-md">
                    <span className="material-symbols-outlined text-primary">notifications_active</span>
                    <div className="flex flex-col">
                      <span className="font-body-md text-body-md text-on-surface dark:text-white font-medium font-bold">Notifications</span>
                      <span className="font-label-sm text-label-sm text-on-surface-variant">Push notifications & digest</span>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-on-surface-variant group-hover:translate-x-1 transition-transform">chevron_right</span>
                </button>

                <button
                  onClick={() => showToast("System language is set to English (United States).", "info")}
                  className="w-full p-md bg-background dark:bg-surface-container/50 border border-outline-variant/30 rounded-lg flex items-center justify-between hover:bg-surface-container-low dark:hover:bg-surface-dim transition-colors cursor-pointer text-left group"
                >
                  <div className="flex items-center gap-md">
                    <span className="material-symbols-outlined text-primary">language</span>
                    <div className="flex flex-col">
                      <span className="font-body-md text-body-md text-on-surface dark:text-white font-medium font-bold">Language</span>
                      <span className="font-label-sm text-label-sm text-on-surface-variant">English (United States)</span>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-on-surface-variant group-hover:translate-x-1 transition-transform">chevron_right</span>
                </button>
              </div>
            </section>

            {/* CARD 4.5: DOWNLOAD APP (PWA) */}
            <section className="bg-surface-container-lowest dark:bg-surface-container-low border border-outline-variant dark:border-outline rounded-xl p-lg shadow-sm space-y-md animate-fade-in">
              <h2 className="font-headline-sm text-headline-sm text-on-surface dark:text-primary-fixed-dim border-b border-outline-variant/30 pb-sm font-bold">App Installation</h2>
              <div className="space-y-md">
                <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                  Install CollabHub on your device for a standalone, full-screen workspace, desktop notifications, and faster load times.
                </p>
                {deferredPrompt ? (
                  <button
                    onClick={() => {
                      if (deferredPrompt) {
                        deferredPrompt.prompt();
                        deferredPrompt.userChoice.then((choiceResult: any) => {
                          if (choiceResult.outcome === 'accepted') {
                            showToast("CollabHub installation initiated!", "success");
                          }
                          if (onClearPrompt) onClearPrompt();
                        });
                      }
                    }}
                    className="w-full py-md bg-primary hover:bg-primary/95 text-on-primary font-bold font-label-md text-label-md rounded-lg flex items-center justify-center gap-sm shadow-sm active:scale-95 transition-all cursor-pointer border-none"
                  >
                    <span className="material-symbols-outlined">download_for_offline</span>
                    Install CollabHub App
                  </button>
                ) : (
                  <div className="p-md bg-slate-50 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-700/50 rounded-lg flex items-center gap-md text-on-surface-variant font-body-sm">
                    <span className="material-symbols-outlined text-primary text-[20px]">check_circle</span>
                    <span>App is already installed, or installation is handled by your browser's menu.</span>
                  </div>
                )}
              </div>
            </section>

            {/* CARD 5: DANGER ZONE */}
            <section className="bg-surface-container-lowest dark:bg-surface-container-low border border-error/30 dark:border-error/40 rounded-xl p-lg shadow-sm space-y-md">
              <h2 className="font-label-md text-label-md text-error font-bold uppercase tracking-wider">Danger Zone</h2>
              <div className="space-y-sm">
                <button
                  onClick={onLogout}
                  className="w-full p-md bg-error/10 hover:bg-error/20 border border-error rounded-lg flex items-center justify-center gap-md text-error font-body-md font-bold transition-all cursor-pointer active:scale-[0.98]"
                >
                  <span className="material-symbols-outlined">logout</span>
                  Sign Out from all devices
                </button>
              </div>
            </section>

          </div>

        </div>

      </div>
    </main>
  );
}
