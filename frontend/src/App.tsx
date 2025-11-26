import { useEffect, useMemo, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'

type Tab = 'dating' | 'leaderboard' | 'chat' | 'profile'
type AuthMode = 'login' | 'signup' | null

type ChatMessage = {
  id: number
  author: string
  text: string
  time: string
}

type UserProfile = {
  firstName: string
  lastName: string
  alias: string
  bio: string
  age: string
  ethnicity: string
  interests: string
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
  avatarUrl: undefined,
  galleryUrls: [],
}

const seedMessages: ChatMessage[] = [
  {
    id: 1,
    author: 'wildcat_01',
    text: 'Anyone else surviving on Costco samples this week?',
    time: '7:32 pm',
  },
  {
    id: 2,
    author: 'csu_ghost',
    text: 'Global chat feels safer than running into your ex at the BMU 💀',
    time: '7:35 pm',
  },
  {
    id: 3,
    author: 'parkour_prof',
    text: 'Need a duo for midnight library sprint + Jack’s karaoke after?',
    time: '7:48 pm',
  },
]

const leaderboardItems = [
  '2am Jack’s karaoke with people you barely know',
  'Costco runs in pajamas before a midterm',
  'Accidentally matching outfits with half your CS lab',
  'Seeing your HCOM prof at Safeway at midnight',
  'Trying to study at Bidwell but ending up in a friend’s hammock',
]

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
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [authMode, setAuthMode] = useState<AuthMode>(null)
  const [isOnboarding, setIsOnboarding] = useState(false)
  const [showCongrats, setShowCongrats] = useState(false)
  const [currentTab, setCurrentTab] = useState<Tab>('dating')
  const [profile, setProfile] = useState<UserProfile>(initialProfile)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(seedMessages)
  const [chatInput, setChatInput] = useState('')
  const [leaderboardVotes, setLeaderboardVotes] = useState(
    leaderboardItems.map(() => Math.floor(Math.random() * 5) + 1),
  )
  const [showProfileArrow, setShowProfileArrow] = useState(false)
  const [pendingProfileArrow, setPendingProfileArrow] = useState(false)

  const displayName = useMemo(() => {
    const fallback =
      [profile.firstName, profile.lastName].filter(Boolean).join(' ') ||
      'New Wildcat'
    return profile.alias.trim() || fallback
  }, [profile])

  const profileComplete = useMemo(() => {
    return profile.galleryUrls.length > 0
  }, [profile.galleryUrls])

  const handleFakeAuth = () => {
    setIsLoggedIn(true)
    setAuthMode(null)
    setIsOnboarding(true)
  }

  const handleAvatarUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      setProfile((prev) => ({
        ...prev,
        avatarUrl: reader.result as string,
      }))
    }
    reader.readAsDataURL(file)
  }

  const handleGalleryUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files?.length) return

    Array.from(files).forEach((file) => {
      const reader = new FileReader()
      reader.onload = () => {
        const imageData = reader.result as string
        setProfile((prev) => {
          const updatedGallery = [...prev.galleryUrls, imageData]
          return {
            ...prev,
            galleryUrls: updatedGallery,
            avatarUrl: prev.avatarUrl || updatedGallery[0],
          }
        })
      }
      reader.readAsDataURL(file)
    })
  }

  const handleOnboardingSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!profileComplete) {
      alert('Add at least one photo to continue.')
      return
    }
    setIsOnboarding(false)
    setShowCongrats(true)
    setPendingProfileArrow(true)
  }

  const handleSendChat = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!chatInput.trim()) return
    const now = new Date()
    const time = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
    setChatMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        author: displayName,
        text: chatInput.trim(),
        time,
      },
    ])
    setChatInput('')
  }

  const handleVote = (index: number) => {
    setLeaderboardVotes((prev) =>
      prev.map((value, i) => (i === index ? value + 1 : value)),
    )
  }

  useEffect(() => {
    if (currentTab === 'profile' && showProfileArrow) {
      setShowProfileArrow(false)
    }
  }, [currentTab, showProfileArrow])

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

  if (!isLoggedIn) {
    return (
      <>
        <LandingPage onShowAuth={(mode) => setAuthMode(mode)} />
        <AuthModal
          mode={authMode}
          onClose={() => setAuthMode(null)}
          onSubmit={handleFakeAuth}
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
      />

      <div className="flex-1 flex flex-col min-h-screen">
        <TopBar currentTab={currentTab} displayName={displayName} />
        <main className="flex-1 overflow-y-auto">
          {currentTab === 'dating' && (
            <DatingView profileComplete={profileComplete} onEdit={() => setCurrentTab('profile')} />
          )}
          {currentTab === 'leaderboard' && (
            <LeaderboardView votes={leaderboardVotes} onVote={handleVote} />
          )}
          {currentTab === 'chat' && (
            <ChatView
              chatMessages={chatMessages}
              chatInput={chatInput}
              onChangeInput={setChatInput}
              onSend={handleSendChat}
              displayName={displayName}
            />
          )}
          {currentTab === 'profile' && (
            <ProfileView profile={profile} setProfile={setProfile} handleAvatarUpload={handleAvatarUpload} />
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
    <div className="min-h-screen bg-dchico-bg text-dchico-text flex flex-col">
      <header className="flex items-center justify-between px-6 sm:px-10 py-4 border-b border-dchico-border bg-white/70 backdrop-blur">
        <DeChicoWordmark className="text-2xl" />
        <div className="flex items-center gap-3 text-sm">
          <button
            onClick={() => onShowAuth('login')}
            className="px-4 py-1.5 rounded-full border border-dchico-border hover:border-dchico-accent transition"
          >
            Log in
          </button>
          <button
            onClick={() => onShowAuth('signup')}
            className="px-5 py-1.5 rounded-full bg-gradient-to-r from-dchico-accent to-dchico-accent-secondary text-white font-semibold shadow-glow hover:brightness-110 transition"
          >
            Sign up
          </button>
        </div>
      </header>

      <main className="flex-1">
        <video
          className="w-full h-full object-cover"
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

type AuthModalProps = {
  mode: AuthMode
  onClose: () => void
  onSubmit: () => void
}

const AuthModal = ({ mode, onClose, onSubmit }: AuthModalProps) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [verificationCodeInput, setVerificationCodeInput] = useState('')
  const [generatedCode, setGeneratedCode] = useState<string | null>(null)
  const [codeStatus, setCodeStatus] = useState('')
  const [isSendingCode, setIsSendingCode] = useState(false)

  if (!mode) return null
  const isSignup = mode === 'signup'

  const handleSendCode = () => {
    if (!email.trim()) {
      alert('Enter your Chico State email first.')
      return
    }
    setIsSendingCode(true)
    setTimeout(() => {
      const code = Math.floor(100000 + Math.random() * 900000).toString()
      setGeneratedCode(code)
      setCodeStatus(`Code sent to ${email}. (Demo code: ${code})`)
      setIsSendingCode(false)
    }, 600)
  }

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/50 backdrop-blur">
      <div className="w-full max-w-md rounded-3xl bg-white border border-dchico-border p-6 shadow-2xl text-dchico-text">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-lg font-semibold">
              {isSignup ? (
                <>
                  Join <DeChicoWordmark className="text-lg" />
                </>
              ) : (
                'Welcome back'
              )}
            </h2>
            <p className="text-xs text-dchico-muted mt-1">
              Use your <span className="font-mono">@csuchico.edu</span> email. Exclusive Chico State only.
            </p>
          </div>
          <button onClick={onClose} className="text-xl text-dchico-muted hover:text-dchico-accent">
            ×
          </button>
        </div>
        <form
          className="space-y-3 text-sm"
          onSubmit={(event) => {
            event.preventDefault()
            if (isSignup) {
              if (!generatedCode) {
                alert('Send the verification code to your email first.')
                return
              }
              if (verificationCodeInput.trim() !== generatedCode) {
                alert('Verification code is incorrect.')
                return
              }
            }
            onSubmit()
            setEmail('')
            setPassword('')
            setName('')
            setVerificationCodeInput('')
            setGeneratedCode(null)
            setCodeStatus('')
          }}
        >
          {isSignup && (
            <div>
              <label className="text-xs text-dchico-muted block mb-1">Name</label>
              <input
                className="w-full rounded-xl bg-white border border-dchico-border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-dchico-accent/60"
                placeholder="Sterling Jinwoo"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          )}
          <div>
            <label className="text-xs text-dchico-muted block mb-1">
              Chico State email (@csuchico.edu)
            </label>
            <div className="flex gap-2">
              <input
                type="email"
                required
                className="flex-1 rounded-xl bg-white border border-dchico-border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-dchico-accent/60"
                placeholder="you@csuchico.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {isSignup && (
                <button
                  type="button"
                  onClick={handleSendCode}
                  className="rounded-xl border border-dchico-border px-3 py-2 text-xs font-semibold hover:border-dchico-accent transition disabled:opacity-50"
                  disabled={isSendingCode}
                >
                  {generatedCode ? 'Resend code' : 'Send code'}
                </button>
              )}
            </div>
            {isSignup && (
              <p className="text-[11px] text-dchico-muted mt-1">
                {codeStatus || 'We’ll email you a 6-digit code to verify you’re a Wildcat.'}
              </p>
            )}
          </div>
          {isSignup && (
            <div>
              <label className="text-xs text-dchico-muted block mb-1">Verification code</label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                className="w-full rounded-xl bg-white border border-dchico-border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-dchico-accent/60 tracking-[0.3em] text-center"
                placeholder="123456"
                value={verificationCodeInput}
                onChange={(e) => setVerificationCodeInput(e.target.value.replace(/\D/g, ''))}
              />
            </div>
          )}
          <div>
            <label className="text-xs text-dchico-muted block mb-1">Password</label>
            <input
              type="password"
              required
              className="w-full rounded-xl bg-white border border-dchico-border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-dchico-accent/60"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="w-full mt-2 rounded-xl bg-gradient-to-r from-dchico-accent to-dchico-accent-secondary py-2 text-sm font-semibold text-white shadow-glow hover:brightness-110 transition"
          >
            {isSignup ? 'Create account' : 'Log in'}
          </button>
        </form>
        <p className="mt-3 text-[11px] text-dchico-muted">
          By continuing you confirm you’re a current Chico State student and agree to the{' '}
          <a
            href="/tersofuse.txt"
            target="_blank"
            rel="noopener noreferrer"
            className="text-dchico-accent underline hover:text-dchico-accent-secondary"
          >
            Terms of Use
          </a>
          .
        </p>
      </div>
    </div>
  )
}

type SidebarProps = {
  currentTab: Tab
  setCurrentTab: (tab: Tab) => void
  displayName: string
  showProfileArrow: boolean
}

const Sidebar = ({ currentTab, setCurrentTab, displayName, showProfileArrow }: SidebarProps) => (
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
        <button
          className="text-[12px] text-dchico-muted hover:text-dchico-accent"
          onClick={() => setCurrentTab('profile')}
        >
          View profile
        </button>
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
      'Finish your profile now. Real matchmaking starts after Thanksgiving when school is open.',
    leaderboard:
      'Rank the freakiest things you all secretly love or hate about Chico.',
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

type DatingViewProps = {
  profileComplete: boolean
  onEdit: () => void
}

const DatingView = ({ profileComplete, onEdit }: DatingViewProps) => {
  if (!profileComplete) {
    return (
      <section className="p-4 lg:p-8">
        <div className="max-w-xl rounded-2xl border border-amber-500/40 bg-[#fff3e5] p-5">
          <h2 className="text-sm font-semibold mb-1">Complete your profile to unlock dating</h2>
          <p className="text-xs text-[#8a5224] mb-3">
            We need at least a picture, name (or alias), and age before we start any Chico State dating chaos.
          </p>
          <button
            onClick={onEdit}
            className="rounded-full bg-amber-500 text-white px-4 py-1.5 text-xs font-semibold hover:brightness-110 transition"
          >
            Go to profile
          </button>
        </div>
      </section>
    )
  }

  return (
    <section className="p-4 lg:p-8 space-y-4">
      <div className="max-w-2xl rounded-2xl border border-dchico-border bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold mb-2">Real matchmaking starts after Thanksgiving 🦃</h2>
        <p className="text-xs text-dchico-muted mb-3">
          When school is open again, we’ll test out Chico-only swipes, prompts, and mini-events. For now, hang in global chat and make sure your profile actually looks like you.
        </p>
        <ul className="text-xs text-dchico-muted list-disc pl-4 space-y-1">
          <li>Matches are restricted to verified @csuchico.edu accounts.</li>
          <li>Alias keeps you playful in chat, but dating requires real info.</li>
          <li>Expect limited-time “Costco run” or “BMU sighting” match events.</li>
        </ul>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 max-w-2xl">
        {['Finish your prompts', 'Drop into global chat', 'Start a leaderboard debate', 'Verify your phone before launch'].map(
          (item) => (
            <div
              key={item}
              className="rounded-2xl border border-dchico-border bg-white p-4 text-xs text-dchico-muted shadow-sm"
            >
              {item}
            </div>
          ),
        )}
      </div>
    </section>
  )
}

type LeaderboardViewProps = {
  votes: number[]
  onVote: (index: number) => void
}

const LeaderboardView = ({ votes, onVote }: LeaderboardViewProps) => (
  <section className="p-4 lg:p-8 space-y-4">
    <p className="text-xs text-dchico-muted max-w-xl">
      Rank the freakiest things only Wildcats understand. Votes reset when you refresh, so spam wisely.
    </p>
    <div className="space-y-3">
      {leaderboardItems.map((item, index) => (
        <div
          key={item}
          className="flex items-center justify-between gap-3 rounded-2xl border border-dchico-border bg-white px-4 py-3 shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-dchico-panel flex items-center justify-center text-xs text-dchico-accent">
              #{index + 1}
            </div>
            <p className="text-sm text-dchico-text">{item}</p>
          </div>
          <button
            onClick={() => onVote(index)}
            className="rounded-full bg-dchico-panel px-3 py-1 text-xs hover:brightness-105 transition text-dchico-accent"
          >
            ▲ {votes[index]}
          </button>
        </div>
      ))}
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
        const isMe = message.author === displayName
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
                {isMe ? 'you' : message.author}
              </div>
              <p>{message.text}</p>
              <div className="text-[10px] text-dchico-muted mt-1 text-right">{message.time}</div>
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
}

const ProfileView = ({
  profile,
  setProfile,
  handleAvatarUpload,
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
      </div>

      <button className="rounded-full bg-gradient-to-r from-dchico-accent to-dchico-accent-secondary px-6 py-2 text-sm font-semibold text-white shadow-glow hover:brightness-110 transition">
        Save changes
      </button>
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

