import { useEffect, useMemo, useState } from 'react'
import type { ChangeEvent, FormEvent, ReactNode } from 'react'
import { useAuth } from './hooks/useAuth'
import { AuthModal } from './components/AuthModalImproved'
import { RankingView } from './components/RankingView'
import { saveProfile, updateUserProfile, deleteUserProfile } from './services/userService'
import { logoutUser } from './services/authService'
import { fetchGlobalChatMessages, sendGlobalMessage, formatTimestamp } from './services/chatService'

type Tab = 'dating' | 'leaderboard' | 'chat' | 'profile'
type AuthMode = 'login' | 'signup' | null

type ChatMessage = {
  id: string
  userId: string
  email: string
  alias: string
  message: string
  timestamp?: any
  createdAt: string
}

type UserProfile = {
  firstName: string
  lastName: string
  alias: string
  bio: string
  age: string
  ethnicity: string
  interests: string
  gender: string
  genderPreference: string // Who they want to see: 'Male', 'Female', 'Both'
  avatarUrl?: string
  galleryUrls: string[]
}

const initialProfile: UserProfile = {
  firstName: '',
  lastName: '',
  alias: '',
  bio: '',
  age: '',
  ethnicity: '',
  interests: '',
  gender: '',
  genderPreference: 'Both',
  avatarUrl: undefined,
  galleryUrls: [],
}

type WordmarkProps = {
  className?: string
}

const DeChicoWordmark = ({ className = '' }: WordmarkProps) => (
  <span className={`dechico-wordmark whitespace-nowrap ${className}`.trim()}>
    <span>De</span>
    <span>Chico</span>
  </span>
)

const App = () => {
  // Authentication state from Firebase
  const { user, profile: firebaseProfile, loading, isLoggedIn } = useAuth()
  
  const [authMode, setAuthMode] = useState<AuthMode>(null)
  const [isOnboarding, setIsOnboarding] = useState(false)
  const [showCongrats, setShowCongrats] = useState(false)
  const [currentTab, setCurrentTab] = useState<Tab>('dating')
  const [profile, setProfile] = useState<UserProfile>(initialProfile)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [chatInput, setChatInput] = useState('')
  const [showProfileArrow, setShowProfileArrow] = useState(false)
  const [pendingProfileArrow, setPendingProfileArrow] = useState(false)

  const displayName = useMemo(() => {
    const fallback =
      [profile.firstName, profile.lastName].filter(Boolean).join(' ') ||
      'New Wildcat'
    return profile.alias.trim() || fallback
  }, [profile])

  const profileComplete = useMemo(() => {
    return (
      profile.galleryUrls.length > 0 &&
      !!(profile.firstName || profile.alias) &&
      !!profile.age &&
      !!profile.gender
    )
  }, [profile.galleryUrls, profile.firstName, profile.alias, profile.age, profile.gender])

  // Load user profile from Firebase when logged in
  useEffect(() => {
    if (firebaseProfile) {
      setProfile({
        firstName: firebaseProfile.firstName || '',
        lastName: firebaseProfile.lastName || '',
        alias: firebaseProfile.alias || '',
        bio: firebaseProfile.bio || '',
        age: firebaseProfile.age || '',
        ethnicity: firebaseProfile.ethnicity || '',
        interests: firebaseProfile.interests || '',
        gender: (firebaseProfile as any).gender || '',
        genderPreference: (firebaseProfile as any).genderPreference || 'Both',
        avatarUrl: firebaseProfile.avatarUrl,
        galleryUrls: firebaseProfile.photos || [],
      })
      
      // Don't show onboarding modal on login - user can complete profile from Profile tab
      // Onboarding only shows after signup (via handleAuthSuccess)
    }
  }, [firebaseProfile])

  const handleAuthSuccess = (isNewUser: boolean = false) => {
    setAuthMode(null)
    // Only show onboarding for new signups, not for login
    if (isNewUser) {
      setIsOnboarding(true)
    }
  }

  const handleAvatarUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    
    // Compress image before saving
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        
        // Resize to max 800px width/height
        let width = img.width
        let height = img.height
        const maxSize = 800
        
        if (width > height && width > maxSize) {
          height = (height * maxSize) / width
          width = maxSize
        } else if (height > maxSize) {
          width = (width * maxSize) / height
          height = maxSize
        }
        
        canvas.width = width
        canvas.height = height
        ctx?.drawImage(img, 0, 0, width, height)
        
        // Compress to JPEG with 0.7 quality
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7)
        
        setProfile((prev) => ({
          ...prev,
          avatarUrl: compressedDataUrl,
        }))
      }
      img.src = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }

  const handleGalleryUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files?.length) return

    Array.from(files).forEach((file) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new Image()
        img.onload = () => {
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')
          
          // Resize to max 800px width/height
          let width = img.width
          let height = img.height
          const maxSize = 800
          
          if (width > height && width > maxSize) {
            height = (height * maxSize) / width
            width = maxSize
          } else if (height > maxSize) {
            width = (width * maxSize) / height
            height = maxSize
          }
          
          canvas.width = width
          canvas.height = height
          ctx?.drawImage(img, 0, 0, width, height)
          
          // Compress to JPEG with 0.7 quality
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7)
          
          setProfile((prev) => {
            const updatedGallery = [...prev.galleryUrls, compressedDataUrl]
            return {
              ...prev,
              galleryUrls: updatedGallery,
              avatarUrl: prev.avatarUrl || updatedGallery[0],
            }
          })
        }
        img.src = e.target?.result as string
      }
      reader.readAsDataURL(file)
    })
  }

  const handleOnboardingSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!profileComplete) {
      alert('Add at least one photo to continue.')
      return
    }
    
    // Save profile to Firebase
    if (user) {
      if (!user.email) {
        alert('Missing email for this account. Please log out and log back in.');
        return;
      }
      try {
        await saveProfile(user.uid, user.email, {
          firstName: profile.firstName,
          lastName: profile.lastName,
          alias: profile.alias,
          bio: profile.bio,
          age: profile.age,
          ethnicity: profile.ethnicity,
          interests: profile.interests,
          photos: profile.galleryUrls,
          avatarUrl: profile.avatarUrl,
        } as any)
        
        setIsOnboarding(false)
        setShowCongrats(true)
        setPendingProfileArrow(true)
      } catch (error) {
        console.error('Error saving profile:', error)
        alert('Failed to save profile. Please try again.')
      }
    }
  }

  const handleSendChat = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!chatInput.trim() || !user) return
    
    try {
      await sendGlobalMessage(user.uid, user.email || '', displayName, chatInput.trim())
      setChatInput('')
      const latest = await fetchGlobalChatMessages()
      setChatMessages(latest)
    } catch (error) {
      console.error('Error sending message:', error)
      alert('Failed to send message. Please try again.')
    }
  }

  // Poll chat messages via backend
  useEffect(() => {
    if (!isLoggedIn) return

    let cancelled = false
    let interval: number | undefined

    const loadMessages = async () => {
      try {
        const messages = await fetchGlobalChatMessages()
        if (!cancelled) {
      setChatMessages(messages)
        }
      } catch (error) {
        console.error('Error fetching chat messages:', error)
      }
    }

    loadMessages()
    interval = window.setInterval(loadMessages, 5000)

    return () => {
      cancelled = true
      if (interval) {
        window.clearInterval(interval)
      }
    }
  }, [isLoggedIn])

  useEffect(() => {
    if (currentTab === 'profile' && showProfileArrow) {
      setShowProfileArrow(false)
    }
    // Hide arrow if profile is complete
    if (profileComplete && showProfileArrow) {
      setShowProfileArrow(false)
    }
  }, [currentTab, showProfileArrow, profileComplete])

  const handleSkipOnboarding = () => {
    setIsOnboarding(false)
    setShowCongrats(true)
  }

  const handleCongratsContinue = () => {
    setShowCongrats(false)
    if (pendingProfileArrow) {
      setShowProfileArrow(true)
      setPendingProfileArrow(false)
    }
  }

  const handleLogout = async () => {
    if (confirm('Are you sure you want to logout?')) {
      try {
        await logoutUser()
        // Reset local state
        setProfile(initialProfile)
        setCurrentTab('dating')
      } catch (error) {
        console.error('Error logging out:', error)
        alert('Failed to logout. Please try again.')
      }
    }
  }

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-dchico-bg flex items-center justify-center">
        <div className="text-dchico-accent text-lg">Loading...</div>
      </div>
    )
  }

  if (!isLoggedIn) {
    return (
      <>
        <LandingPage onShowAuth={(mode) => setAuthMode(mode)} />
        <AuthModal
          mode={authMode}
          onClose={() => setAuthMode(null)}
          onSuccess={handleAuthSuccess}
        />
      </>
    )
  }

  return (
    <div className="min-h-screen bg-dchico-bg text-dchico-text flex">
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        displayName={displayName}
        showProfileArrow={showProfileArrow}
        onLogout={handleLogout}
      />

      <div className="flex-1 flex flex-col min-h-screen">
        <TopBar currentTab={currentTab} displayName={displayName} />
        <main className="flex-1 overflow-y-auto pb-24 lg:pb-0">
          {currentTab === 'dating' && (
            <ComingSoonView
              badge="🔔 Dating unlocks Monday"
              title="Happy DeChico-giving 🦃"
              lines={[
                'Dating goes live Monday when everyone’s back on campus.',
                'Finish your profile now so you’re in the first batch of matches.',
                'Spam Global Chat with the kind of app you want — we’re literally recording everything and building from it.',
              ]}
              primaryLabel="Complete my profile"
              secondaryLabel="Open Global Chat"
              onPrimaryClick={() => setCurrentTab('profile')}
              onSecondaryClick={() => setCurrentTab('chat')}
            />
          )}
          {currentTab === 'leaderboard' && <RankingView />}
          {currentTab === 'chat' && (
            <ChatView
              chatMessages={chatMessages}
              chatInput={chatInput}
              onChangeInput={setChatInput}
              onSend={handleSendChat}
              displayName={displayName}
            />
          )}
          {currentTab === 'profile' && user && (
            <ProfileView 
              profile={profile} 
              setProfile={setProfile} 
              handleAvatarUpload={handleAvatarUpload}
              userId={user.uid}
              userEmail={user.email ?? undefined}
              profileComplete={profileComplete}
              setCurrentTab={setCurrentTab}
            />
          )}
        </main>
      </div>

      <MobileNav currentTab={currentTab} setCurrentTab={setCurrentTab} showProfileArrow={showProfileArrow} />
      <OnboardingModal
        show={isOnboarding}
        profile={profile}
        onClose={() => setIsOnboarding(false)}
        onSubmit={handleOnboardingSubmit}
        onSkip={handleSkipOnboarding}
        handleGalleryUpload={handleGalleryUpload}
        profileComplete={profileComplete}
      />
      <CongratsModal show={showCongrats} onContinue={handleCongratsContinue} />
      {showProfileArrow && <ProfilePointerOverlay />}
    </div>
  )
}

type LandingPageProps = {
  onShowAuth: (mode: AuthMode) => void
}

const LandingPage = ({ onShowAuth }: LandingPageProps) => {
  return (
    <div className="min-h-screen h-screen bg-dchico-bg text-dchico-text flex flex-col overflow-hidden">
      <header className="flex items-center justify-between px-4 sm:px-6 lg:px-10 py-3 sm:py-4 border-b border-dchico-border bg-white/70 backdrop-blur flex-shrink-0 z-10">
        <DeChicoWordmark className="text-xl sm:text-2xl" />
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => onShowAuth('login')}
            className="px-3 py-1.5 sm:px-4 text-xs sm:text-sm rounded-full border border-dchico-border hover:border-dchico-accent transition whitespace-nowrap"
          >
            Log in
          </button>
          <button
            onClick={() => onShowAuth('signup')}
            className="px-4 py-1.5 sm:px-5 text-xs sm:text-sm rounded-full bg-gradient-to-r from-dchico-accent to-dchico-accent-secondary text-white font-semibold shadow-glow hover:brightness-110 transition whitespace-nowrap"
          >
            Sign up
          </button>
        </div>
      </header>

      <main className="flex-1 min-h-0 relative w-full overflow-hidden">
        <video
          className="absolute inset-0 w-full h-full object-cover object-center"
          src="/landingpage.mp4"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          aria-label="Chico State themed walkthrough preview video"
        />
      </main>
    </div>
  )
}

type SidebarProps = {
  currentTab: Tab
  setCurrentTab: (tab: Tab) => void
  displayName: string
  showProfileArrow: boolean
  onLogout: () => void
}

const Sidebar = ({ currentTab, setCurrentTab, displayName, showProfileArrow, onLogout }: SidebarProps) => (
  <aside className="hidden lg:flex flex-col w-64 border-r border-dchico-border bg-white/80 backdrop-blur">
    <div className="px-5 py-5 border-b border-dchico-border flex items-center">
      <DeChicoWordmark className="text-lg" />
    </div>
    <nav className="flex-1 px-3 py-4 space-y-2 text-sm">
      {[
        { label: 'Dating', tab: 'dating' },
        { label: 'Leaderboard', tab: 'leaderboard' },
        { label: 'Global Chat', tab: 'chat' },
      ].map((item) => (
        <button
          key={item.tab}
          onClick={() => setCurrentTab(item.tab as Tab)}
          className={`w-full rounded-xl px-4 py-2 text-left border transition ${
            currentTab === item.tab
              ? 'border-dchico-accent bg-dchico-accent/10 text-dchico-accent'
              : 'border-transparent text-dchico-muted hover:bg-dchico-panel'
          } ${showProfileArrow && item.tab === 'profile' ? 'ring-2 ring-dchico-accent shadow-glow animate-pulse' : ''}`}
        >
          {item.label}
        </button>
      ))}
    </nav>
    <div className="px-4 py-5 border-t border-dchico-border flex items-center gap-3 relative">
      {showProfileArrow && (
        <div className="absolute -left-20 -top-12 flex flex-col items-center text-xs font-semibold text-dchico-accent animate-bounce pointer-events-none">
          <span>Finish profile here</span>
          <svg width="80" height="80" viewBox="0 0 80 80" fill="none" className="text-dchico-accent">
            <path d="M70 10 L20 60" stroke="#8b1b23" strokeWidth="6" strokeLinecap="round" />
            <path d="M18 55 L12 68 L26 62" fill="#8b1b23" />
          </svg>
        </div>
      )}
      <div className="h-10 w-10 rounded-full bg-dchico-panel flex items-center justify-center text-sm font-semibold text-dchico-accent">
        {displayName.charAt(0).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{displayName}</p>
        <div className="flex gap-2">
          <button
            className="text-[12px] text-dchico-muted hover:text-dchico-accent"
            onClick={() => setCurrentTab('profile')}
          >
            View profile
          </button>
          <span className="text-[12px] text-dchico-muted">•</span>
          <button
            className="text-[12px] text-dchico-muted hover:text-red-600"
            onClick={onLogout}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  </aside>
)

type MobileNavProps = {
  currentTab: Tab
  setCurrentTab: (tab: Tab) => void
  showProfileArrow: boolean
}

const MobileNav = ({ currentTab, setCurrentTab, showProfileArrow }: MobileNavProps) => (
  <nav className="lg:hidden fixed bottom-0 inset-x-0 border-t border-dchico-border bg-white/90 backdrop-blur">
    <div className="flex justify-around py-2 text-xs">
      {[
        { label: 'Dating', tab: 'dating' },
        { label: 'Board', tab: 'leaderboard' },
        { label: 'Chat', tab: 'chat' },
        { label: 'Profile', tab: 'profile' },
      ].map((item) => (
        <button
          key={item.tab}
          onClick={() => setCurrentTab(item.tab as Tab)}
          className={`relative flex flex-col items-center gap-0.5 ${
            currentTab === item.tab ? 'text-dchico-accent' : 'text-dchico-muted'
          } ${showProfileArrow && item.tab === 'profile' ? 'animate-pulse text-dchico-accent' : ''}`}
        >
          {showProfileArrow && item.tab === 'profile' && (
            <div className="absolute -top-8 flex flex-col items-center text-[11px] text-dchico-accent animate-bounce pointer-events-none">
              <span>Finish profile</span>
              <span
                className="mt-1 block"
                style={{
                  width: 0,
                  height: 0,
                  borderLeft: '6px solid transparent',
                  borderRight: '6px solid transparent',
                  borderBottom: '10px solid #8b1b23',
                }}
              />
            </div>
          )}
          <span>●</span>
          <span>{item.label}</span>
        </button>
      ))}
    </div>
  </nav>
)

type TopBarProps = {
  currentTab: Tab
  displayName: string
}

const TopBar = ({ currentTab, displayName }: TopBarProps) => {
  const titleMap: Record<Tab, string> = {
    dating: 'Dating',
    leaderboard: 'Chico Brainrot Leaderboard',
    chat: 'Global Chat',
    profile: 'Your Profile',
  }

  const subtitleMap: Record<Tab, string> = {
    dating:
      'Matching unlocks soon. Finish your profile now so you’re ready when we flip the switch.',
    leaderboard:
      'Ranking is paused while we ship verified profiles + chat. Coming soon.',
    chat: 'Anonymous-ish small talk. Don’t be weird in a bad way.',
    profile: 'Alias shows in chat; real details prep you for future matchmaking.',
  }

  return (
    <header className="h-16 border-b border-dchico-border bg-white/80 backdrop-blur flex items-center justify-between px-4 lg:px-8 sticky top-0 z-10">
      <div>
        <h1 className="text-base font-semibold">{titleMap[currentTab]}</h1>
        <p className="text-xs text-dchico-muted">{subtitleMap[currentTab]}</p>
      </div>
      <div className="lg:hidden flex items-center gap-2 text-xs">
        <span className="text-dchico-muted">{displayName}</span>
        <div className="h-8 w-8 rounded-full bg-dchico-panel flex items-center justify-center text-sm font-medium text-dchico-accent">
          {displayName.charAt(0).toUpperCase()}
        </div>
      </div>
    </header>
  )
}

type ComingSoonViewProps = {
  title: string
  description?: string
  lines?: string[]
  extra?: ReactNode
  badge?: string
  onPrimaryClick?: () => void
  primaryLabel?: string
  onSecondaryClick?: () => void
  secondaryLabel?: string
}

const ComingSoonView = ({
  title,
  description,
  lines,
  extra,
  badge,
  onPrimaryClick,
  primaryLabel = 'Hop into Global Chat',
  onSecondaryClick,
  secondaryLabel = 'Tell us what you want',
}: ComingSoonViewProps) => (
  <section className="p-6 lg:p-12 flex items-center justify-center min-h-[70vh]">
    <div className="max-w-4xl w-full">
      <div className="rounded-3xl bg-white/90 border border-dchico-border shadow-xl shadow-dchico-border/25 px-8 py-10 lg:px-12 lg:py-14 flex flex-col items-center text-center gap-5">
        {(badge ?? '🍂 Fall launch • Profiles live, matching next') && (
          <div className="inline-flex items-center gap-2 rounded-full bg-dchico-panel/70 px-4 py-1 text-[11px] uppercase tracking-wide text-dchico-muted">
            <span>{badge ?? '🍂 Fall launch • Profiles live, matching next'}</span>
        </div>
        )}
        <div>
          <h2 className="text-3xl lg:text-4xl font-semibold mb-2">{title}</h2>
          {description && !lines && (
            <p className="text-sm lg:text-base text-dchico-muted max-w-2xl mx-auto">{description}</p>
          )}
        </div>
        {lines && (
          <div className="space-y-2 text-base lg:text-lg text-dchico-muted max-w-2xl">
            {lines.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
        )}
        {!lines && extra && (
          <div className="text-[12px] lg:text-sm text-dchico-muted space-y-2 max-w-2xl">{extra}</div>
        )}
        {!lines && (
          <p className="text-xs text-dchico-muted">
            For now, polish your profile and hang out in global chat. We’ll ping you as soon as this drops.
          </p>
        )}
        {(onPrimaryClick || onSecondaryClick) && (
          <div className="mt-4 flex flex-col sm:flex-row items-center gap-3">
            {onPrimaryClick && (
            <button
                type="button"
                onClick={onPrimaryClick}
                className="inline-flex items-center justify-center rounded-full bg-dchico-accent px-6 py-2.5 text-sm font-semibold text-white shadow-md hover:brightness-110 transition"
            >
                {primaryLabel}
            </button>
            )}
            {onSecondaryClick && (
          <button
                type="button"
                onClick={onSecondaryClick}
                className="inline-flex items-center justify-center rounded-full bg-white text-dchico-accent px-5 py-2 text-sm font-semibold border border-dchico-accent shadow-sm hover:bg-dchico-panel/80 transition"
          >
                {secondaryLabel}
          </button>
            )}
        </div>
        )}
      </div>
    </div>
  </section>
)

type ChatViewProps = {
  chatMessages: ChatMessage[]
  chatInput: string
  onChangeInput: (value: string) => void
  onSend: (event: FormEvent<HTMLFormElement>) => void
  displayName: string
}

const ChatView = ({
  chatMessages,
  chatInput,
  onChangeInput,
  onSend,
  displayName,
}: ChatViewProps) => (
  <section className="flex flex-col h-[calc(100vh-64px)] lg:h-[calc(100vh-64px)]">
    <div className="flex-1 overflow-y-auto p-4 space-y-2">
      {chatMessages.map((message) => {
        const isMe = message.alias === displayName
        return (
          <div key={message.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2 text-xs ${
                isMe
                  ? 'bg-gradient-to-r from-dchico-accent to-dchico-accent-secondary text-white'
                  : 'bg-dchico-panel text-dchico-text'
              }`}
            >
              <div
                className={`font-semibold mb-1 ${
                  isMe ? 'text-white/80' : 'text-dchico-accent-secondary'
                }`}
              >
                {isMe ? 'you' : message.alias}
              </div>
              <p>{message.message}</p>
              <div className="text-[10px] text-dchico-muted mt-1 text-right">
                {formatTimestamp(message.createdAt)}
              </div>
            </div>
          </div>
        )
      })}
    </div>
    <form
      onSubmit={onSend}
      className="border-t border-dchico-border bg-white/90 backdrop-blur px-4 py-3 flex items-center gap-2"
    >
      <input
        value={chatInput}
        onChange={(e) => onChangeInput(e.target.value)}
        placeholder={`Send a message as ${displayName}`}
        className="flex-1 rounded-full bg-white border border-dchico-border px-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-dchico-accent/50"
      />
      <button
        type="submit"
        className="rounded-full bg-gradient-to-r from-dchico-accent to-dchico-accent-secondary px-4 py-2 text-xs font-semibold text-white shadow-glow hover:brightness-110 transition"
      >
        Send
      </button>
    </form>
  </section>
)

type ProfileViewProps = {
  profile: UserProfile
  setProfile: React.Dispatch<React.SetStateAction<UserProfile>>
  handleAvatarUpload: (event: ChangeEvent<HTMLInputElement>) => void
  userId: string
  userEmail?: string
  profileComplete: boolean
  setCurrentTab: (tab: Tab) => void
}

const ProfileView = ({
  profile,
  setProfile,
  handleAvatarUpload,
  userId,
  userEmail,
  profileComplete,
  setCurrentTab,
}: ProfileViewProps) => (
  <section className="p-4 lg:p-8">
    <div className="max-w-2xl space-y-5">
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 rounded-full bg-dchico-panel border border-dchico-border overflow-hidden flex items-center justify-center text-xl font-semibold text-dchico-accent">
          {profile.avatarUrl ? (
            <img src={profile.avatarUrl} alt="Avatar preview" className="h-full w-full object-cover" />
          ) : (
            (profile.alias || profile.firstName || 'D')[0]?.toUpperCase()
          )}
        </div>
        <div>
          <p className="text-sm font-semibold">
            {profile.alias || [profile.firstName, profile.lastName].filter(Boolean).join(' ') || 'New Wildcat'}
          </p>
          <p className="text-xs text-dchico-muted">
            Alias shows in chat. Real name fuels the dating release.
          </p>
        </div>
      </div>

      <div>
        <label className="text-xs text-dchico-muted block mb-1">Update picture</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleAvatarUpload}
          className="w-full text-xs text-dchico-muted file:mr-3 file:rounded-full file:border-0 file:bg-gradient-to-r file:from-dchico-accent file:to-dchico-accent-secondary file:px-4 file:py-1.5 file:text-white file:font-semibold file:cursor-pointer"
        />
      </div>

      <div className="grid gap-4 text-xs sm:grid-cols-2">
        {[
          {
            label: 'First name',
            value: profile.firstName,
            onChange: (value: string) => setProfile((prev) => ({ ...prev, firstName: value })),
          },
          {
            label: 'Last name',
            value: profile.lastName,
            onChange: (value: string) => setProfile((prev) => ({ ...prev, lastName: value })),
          },
          {
            label: 'Alias / nickname',
            value: profile.alias,
            onChange: (value: string) => setProfile((prev) => ({ ...prev, alias: value })),
          },
          {
            label: 'Age',
            value: profile.age,
            onChange: (value: string) => setProfile((prev) => ({ ...prev, age: value })),
          },
          {
            label: 'Ethnicity',
            value: profile.ethnicity,
            onChange: (value: string) => setProfile((prev) => ({ ...prev, ethnicity: value })),
          },
        ].map((field) => (
          <div key={field.label}>
            <label className="block mb-1 text-dchico-muted">{field.label}</label>
            <input
              value={field.value}
              onChange={(e) => field.onChange(e.target.value)}
              className="w-full rounded-xl bg-white border border-dchico-border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-dchico-accent/60"
            />
          </div>
        ))}
        <div className="sm:col-span-2">
          <label className="block mb-1 text-dchico-muted">Bio</label>
          <textarea
            value={profile.bio}
            onChange={(e) => setProfile((prev) => ({ ...prev, bio: e.target.value }))}
            className="w-full rounded-xl bg-white border border-dchico-border px-3 py-2 min-h-[80px] focus:outline-none focus:ring-2 focus:ring-dchico-accent/60"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block mb-1 text-dchico-muted">Interests</label>
          <textarea
            value={profile.interests}
            onChange={(e) => setProfile((prev) => ({ ...prev, interests: e.target.value }))}
            className="w-full rounded-xl bg-white border border-dchico-border px-3 py-2 min-h-[80px] focus:outline-none focus:ring-2 focus:ring-dchico-accent/60"
          />
        </div>
        <div>
          <label className="block mb-1 text-dchico-muted">Gender</label>
          <select
            value={profile.gender}
            onChange={(e) => setProfile((prev) => ({ ...prev, gender: e.target.value }))}
            className="w-full rounded-xl bg-white border border-dchico-border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-dchico-accent/60"
          >
            <option value="">Select gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Non-binary">Non-binary</option>
            <option value="Prefer not to say">Prefer not to say</option>
          </select>
        </div>
        <div>
          <label className="block mb-1 text-dchico-muted">Show me</label>
          <select
            value={profile.genderPreference}
            onChange={(e) => setProfile((prev) => ({ ...prev, genderPreference: e.target.value }))}
            className="w-full rounded-xl bg-white border border-dchico-border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-dchico-accent/60"
          >
            <option value="Male">Men</option>
            <option value="Female">Women</option>
            <option value="Both">Everyone</option>
          </select>
        </div>
      </div>

      <div className="flex gap-3">
        <button 
          onClick={async () => {
            if (userId && userEmail) {
              try {
                await updateUserProfile(userId, userEmail, {
                  firstName: profile.firstName,
                  lastName: profile.lastName,
                  alias: profile.alias,
                  bio: profile.bio,
                  age: profile.age,
                  ethnicity: profile.ethnicity,
                  interests: profile.interests,
                  gender: profile.gender,
                  genderPreference: profile.genderPreference,
                  photos: profile.galleryUrls,
                  avatarUrl: profile.avatarUrl,
                })
                
                alert('Profile saved successfully!')
                
                if (profileComplete) {
                  setCurrentTab('dating')
                }
              } catch (error: any) {
                console.error('Error saving profile:', error)
                alert(`Failed to save profile: ${error.message || 'Unknown error'}`)
              }
            } else {
              alert('User info not found. Please try logging out and back in.')
            }
          }}
          className="rounded-full bg-gradient-to-r from-dchico-accent to-dchico-accent-secondary px-6 py-2 text-sm font-semibold text-white shadow-glow hover:brightness-110 transition"
        >
          Save changes
        </button>

        <button 
          onClick={async () => {
            if (userId) {
              const confirmDelete = window.confirm(
                '⚠️ WARNING: This will permanently delete your account and all data!\n\n' +
                'This includes:\n' +
                '• Your profile\n' +
                '• All photos\n' +
                '• Swipe history\n' +
                '• Matches\n\n' +
                'This action CANNOT be undone!\n\n' +
                'Are you absolutely sure you want to delete your account?'
              )
              
              if (confirmDelete) {
                const doubleCheck = window.confirm(
                  'Last chance! Are you 100% sure?\n\n' +
                  'Type "DELETE" in the next prompt to confirm.'
                )
                
                if (doubleCheck) {
                  const finalConfirm = window.prompt(
                    'Type DELETE (in capital letters) to permanently delete your account:'
                  )
                  
                  if (finalConfirm === 'DELETE') {
                    try {
                      await deleteUserProfile(userId, userEmail || '')
                      await logoutUser()
                      alert('Account deleted successfully.')
                      window.location.reload()
                    } catch (error: any) {
                      console.error('Error deleting account:', error)
                      alert(error.message || 'Failed to delete account.')
                    }
                  } else {
                    alert('Account deletion cancelled. You must type DELETE exactly.')
                  }
                } else {
                  alert('Account deletion cancelled.')
                }
              }
            }
          }}
          className="rounded-full bg-red-600 px-6 py-2 text-sm font-semibold text-white hover:bg-red-700 transition"
        >
          Delete Account
        </button>
      </div>
    </div>
  </section>
)

type OnboardingModalProps = {
  show: boolean
  profile: UserProfile
  onClose: () => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onSkip: () => void
  handleGalleryUpload: (event: ChangeEvent<HTMLInputElement>) => void
  profileComplete: boolean
}

const OnboardingModal = ({
  show,
  profile,
  onClose,
  onSubmit,
  onSkip,
  handleGalleryUpload,
  profileComplete,
}: OnboardingModalProps) => {
  if (!show) return null
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur">
      <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white border border-dchico-border p-6 text-dchico-text shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold">
              Set up your <DeChicoWordmark className="text-lg" /> profile
            </h2>
            <p className="text-xs text-dchico-muted">
              Drop in a few photos to start your Chico State presence. You can fill out the rest later from your profile.
            </p>
          </div>
          <button onClick={onClose} className="text-xl text-dchico-muted hover:text-dchico-accent">
            ×
          </button>
        </div>
        <form onSubmit={onSubmit} className="space-y-6 text-sm">
          <div>
            <label className="text-xs text-dchico-muted block mb-2">Add photos *</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {profile.galleryUrls.map((url, index) => (
                <div
                  key={`${url}-${index}`}
                  className="aspect-square rounded-2xl border border-dchico-border overflow-hidden bg-dchico-panel"
                >
                  <img src={url} alt={`Uploaded ${index + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
              <label className="aspect-square rounded-2xl border border-dchico-border border-dashed flex flex-col items-center justify-center text-xs text-dchico-muted cursor-pointer hover:border-dchico-accent transition">
                <span className="text-2xl">＋</span>
                <span>Add</span>
                <input type="file" accept="image/*" multiple className="hidden" onChange={handleGalleryUpload} />
              </label>
            </div>
          </div>
          <p className="text-xs text-dchico-muted">
            You can add names, bio, and other info later from your profile tab. For now, photos help other Wildcats get a feel for your vibe.
          </p>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onSkip}
              className="rounded-full border border-dchico-border px-4 py-2 text-xs hover:border-dchico-accent transition"
            >
              Skip for now
            </button>
            <button
              type="submit"
              disabled={!profileComplete}
              className={`rounded-full bg-gradient-to-r from-dchico-accent to-dchico-accent-secondary px-5 py-2 text-xs font-semibold text-white shadow-glow hover:brightness-110 transition ${
                !profileComplete ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              Continue
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

type CongratsModalProps = {
  show: boolean
  onContinue: () => void
}

const CongratsModal = ({ show, onContinue }: CongratsModalProps) => {
  if (!show) return null
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 backdrop-blur">
      <div className="w-full max-w-sm rounded-3xl bg-white border border-dchico-border p-6 text-center text-dchico-text shadow-2xl">
        <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-dchico-accent to-dchico-accent-secondary mx-auto mb-3 flex items-center justify-center text-2xl">
          🎉
        </div>
        <h2 className="text-lg font-semibold mb-1">
          Welcome to <DeChicoWordmark className="text-lg" />
        </h2>
        <p className="text-xs text-dchico-muted mb-4">
          Your Chico brainrot journey officially begins. You can tweak your profile anytime from the sidebar or bottom nav.
        </p>
        <button
          onClick={onContinue}
          className="rounded-full bg-gradient-to-r from-dchico-accent to-dchico-accent-secondary px-6 py-2 text-sm font-semibold text-white shadow-glow hover:brightness-110 transition"
        >
          Enter the app
        </button>
      </div>
    </div>
  )
}

const ProfilePointerOverlay = () => {
  return (
    <div className="fixed inset-0 z-30 pointer-events-none">
      <div className="hidden lg:flex w-full h-full items-center justify-center">
        <div className="flex flex-col items-center gap-3 bg-white/90 border border-dchico-border px-5 py-4 rounded-3xl shadow-glow text-dchico-accent">
          <p className="text-sm font-semibold">Finish your profile in the left panel</p>
          <svg width="220" height="150" viewBox="0 0 220 150" fill="none">
            <path d="M210 20 L60 120" stroke="#8b1b23" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M65 110 L45 140 L80 130" fill="#8b1b23" />
          </svg>
        </div>
      </div>
      <div className="lg:hidden flex w-full h-full items-center justify-center">
        <div className="flex flex-col items-center gap-3 bg-white/90 border border-dchico-border px-5 py-4 rounded-3xl shadow-glow text-dchico-accent">
          <p className="text-sm font-semibold">Tap Profile on the bottom nav</p>
          <svg width="140" height="160" viewBox="0 0 140 160" fill="none">
            <path d="M70 10 L70 120" stroke="#8b1b23" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M55 110 L70 140 L85 110" fill="#8b1b23" />
          </svg>
        </div>
      </div>
    </div>
  )
}

export default App

