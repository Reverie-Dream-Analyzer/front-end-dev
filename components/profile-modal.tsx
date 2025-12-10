'use client';

import { useState, useEffect } from 'react';
import { X, User, Calendar, Flame, Droplets, Wind, Mountain, Target, Save, Loader2 } from 'lucide-react';
import { useAuth } from '@/components/auth-provider';
import { updateUserProfile } from '@/lib/api/user';
import type { UserProfile, ZodiacSign } from '@/types/user-profile';

type ProfileModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const elements = ['Fire', 'Earth', 'Air', 'Water'] as const;
const elementIcons: Record<string, React.ReactNode> = {
  Fire: <Flame className="h-4 w-4" />,
  Earth: <Mountain className="h-4 w-4" />,
  Air: <Wind className="h-4 w-4" />,
  Water: <Droplets className="h-4 w-4" />,
};

const dreamGoalOptions = [
  'Increase lucid dreaming frequency',
  'Better dream recall',
  'Overcome nightmares',
  'Explore creativity through dreams',
  'Find personal insights',
  'Spiritual growth and connection',
  'Problem-solving through dreams',
  'Emotional healing',
];

const zodiacSigns: Array<ZodiacSign & { range: { start: [number, number]; end: [number, number] } }> = [
  { sign: 'Aries', symbol: '♈', element: 'Fire', traits: ['Bold', 'Energetic', 'Independent'], dates: 'March 21 - April 19', range: { start: [3, 21], end: [4, 19] } },
  { sign: 'Taurus', symbol: '♉', element: 'Earth', traits: ['Reliable', 'Patient', 'Practical'], dates: 'April 20 - May 20', range: { start: [4, 20], end: [5, 20] } },
  { sign: 'Gemini', symbol: '♊', element: 'Air', traits: ['Curious', 'Adaptable', 'Expressive'], dates: 'May 21 - June 20', range: { start: [5, 21], end: [6, 20] } },
  { sign: 'Cancer', symbol: '♋', element: 'Water', traits: ['Nurturing', 'Intuitive', 'Protective'], dates: 'June 21 - July 22', range: { start: [6, 21], end: [7, 22] } },
  { sign: 'Leo', symbol: '♌', element: 'Fire', traits: ['Confident', 'Creative', 'Generous'], dates: 'July 23 - August 22', range: { start: [7, 23], end: [8, 22] } },
  { sign: 'Virgo', symbol: '♍', element: 'Earth', traits: ['Analytical', 'Helpful', 'Detail-oriented'], dates: 'August 23 - September 22', range: { start: [8, 23], end: [9, 22] } },
  { sign: 'Libra', symbol: '♎', element: 'Air', traits: ['Diplomatic', 'Balanced', 'Social'], dates: 'September 23 - October 22', range: { start: [9, 23], end: [10, 22] } },
  { sign: 'Scorpio', symbol: '♏', element: 'Water', traits: ['Intense', 'Passionate', 'Mysterious'], dates: 'October 23 - November 21', range: { start: [10, 23], end: [11, 21] } },
  { sign: 'Sagittarius', symbol: '♐', element: 'Fire', traits: ['Adventurous', 'Optimistic', 'Free-spirited'], dates: 'November 22 - December 21', range: { start: [11, 22], end: [12, 21] } },
  { sign: 'Capricorn', symbol: '♑', element: 'Earth', traits: ['Ambitious', 'Disciplined', 'Responsible'], dates: 'December 22 - January 19', range: { start: [12, 22], end: [1, 19] } },
  { sign: 'Aquarius', symbol: '♒', element: 'Air', traits: ['Independent', 'Innovative', 'Humanitarian'], dates: 'January 20 - February 18', range: { start: [1, 20], end: [2, 18] } },
  { sign: 'Pisces', symbol: '♓', element: 'Water', traits: ['Compassionate', 'Artistic', 'Intuitive'], dates: 'February 19 - March 20', range: { start: [2, 19], end: [3, 20] } },
];

function calculateZodiacSign(birthDate: string): ZodiacSign {
  const date = new Date(birthDate);
  const month = date.getMonth() + 1;
  const day = date.getDate();

  for (const zodiac of zodiacSigns) {
    const { start, end } = zodiac.range;
    if (zodiac.sign === 'Capricorn') {
      if ((month === 12 && day >= start[1]) || (month === 1 && day <= end[1])) {
        return { sign: zodiac.sign, symbol: zodiac.symbol, element: zodiac.element, traits: zodiac.traits, dates: zodiac.dates };
      }
    } else if (
      (month === start[0] && day >= start[1]) ||
      (month === end[0] && day <= end[1]) ||
      (month > start[0] && month < end[0])
    ) {
      return { sign: zodiac.sign, symbol: zodiac.symbol, element: zodiac.element, traits: zodiac.traits, dates: zodiac.dates };
    }
  }
  const aries = zodiacSigns[0];
  return { sign: aries.sign, symbol: aries.symbol, element: aries.element, traits: aries.traits, dates: aries.dates };
}

export function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const { user, completeProfile, token } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [name, setName] = useState('');
  const [birthday, setBirthday] = useState('');
  const [favoriteElement, setFavoriteElement] = useState('');
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);

  // Helper to extract user_id from JWT token if not available in user object
  const getUserId = (): string | null => {
    if (user?.id) return user.id;
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.user_id || null;
    } catch {
      return null;
    }
  };

  // Initialize form with current profile data
  useEffect(() => {
    if (user?.profile) {
      setName(user.profile.name || '');
      setBirthday(user.profile.birthday || '');
      setFavoriteElement(user.profile.favoriteElement || '');
      setSelectedGoals(user.profile.dreamGoals || []);
    }
  }, [user?.profile, isOpen]);

  if (!isOpen || !user?.profile) return null;

  const profile = user.profile;
  const zodiacSign = birthday ? calculateZodiacSign(birthday) : profile.zodiacSign;

  const toggleGoal = (goal: string) => {
    setSelectedGoals((prev) => {
      if (prev.includes(goal)) {
        return prev.filter((item) => item !== goal);
      }
      if (prev.length >= 3) {
        return prev;
      }
      return [...prev, goal];
    });
  };

  const handleSave = async () => {
    const userId = getUserId();
    
    if (!userId) {
      console.error('User ID is missing:', user);
      setError('Unable to save: User ID not found. Please log out and log back in.');
      return;
    }
    if (!name || !birthday || !favoriteElement || selectedGoals.length === 0) {
      setError('Please fill in all fields.');
      return;
    }

    setIsSaving(true);
    setSaveSuccess(false);
    setError(null);

    try {
      console.log('Saving profile for user:', userId, {
        birthdate: birthday,
        favorite_element: favoriteElement.toLowerCase(),
        dream_goals: selectedGoals,
      });
      
      const result = await updateUserProfile(userId, {
        birthdate: birthday,
        favorite_element: favoriteElement.toLowerCase(),
        dream_goals: selectedGoals,
      });
      
      console.log('Profile save result:', result);

      // Update local profile
      const newZodiac = calculateZodiacSign(birthday);
      const updatedProfile: UserProfile = {
        name,
        birthday,
        favoriteElement,
        dreamGoals: selectedGoals,
        zodiacSign: newZodiac,
      };
      completeProfile(updatedProfile);
      
      setSaveSuccess(true);
      setIsEditing(false);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to save profile:', error);
      setError(error instanceof Error ? error.message : 'Failed to save profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset to original values
    if (user?.profile) {
      setName(user.profile.name || '');
      setBirthday(user.profile.birthday || '');
      setFavoriteElement(user.profile.favoriteElement || '');
      setSelectedGoals(user.profile.dreamGoals || []);
    }
    setIsEditing(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-white/20 bg-gradient-to-br from-indigo-950/95 via-purple-950/95 to-slate-950/95 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <h2 className="text-xl font-semibold text-white">Your Celestial Profile</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-white/60 transition hover:bg-white/10 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[70vh] overflow-y-auto p-6">
          {saveSuccess && (
            <div className="mb-4 rounded-xl bg-green-500/20 border border-green-400/30 px-4 py-3 text-center text-green-200">
              ✓ Profile saved successfully!
            </div>
          )}

          {error && (
            <div className="mb-4 rounded-xl bg-red-500/20 border border-red-400/30 px-4 py-3 text-center text-red-200">
              {error}
            </div>
          )}

          <div className="space-y-6">
            {/* Zodiac Display */}
            <div className="flex items-center gap-4 rounded-2xl bg-white/5 p-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 text-3xl">
                {zodiacSign.symbol}
              </div>
              <div>
                <p className="text-lg font-semibold text-white">{zodiacSign.sign}</p>
                <p className="text-sm text-purple-200/70">{zodiacSign.dates}</p>
                <p className="mt-1 text-xs text-purple-300/60">{zodiacSign.traits.join(' • ')}</p>
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-purple-200/80">
                <User className="h-4 w-4" />
                Display Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/40 focus:border-purple-400 focus:outline-none focus:ring-1 focus:ring-purple-400"
                  placeholder="Your name"
                />
              ) : (
                <p className="rounded-xl bg-white/5 px-4 py-3 text-white">{profile.name}</p>
              )}
            </div>

            {/* Birthday */}
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-purple-200/80">
                <Calendar className="h-4 w-4" />
                Birthday
              </label>
              {isEditing ? (
                <input
                  type="date"
                  value={birthday}
                  onChange={(e) => setBirthday(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  min="1900-01-01"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-purple-400 focus:outline-none focus:ring-1 focus:ring-purple-400"
                />
              ) : (
                <p className="rounded-xl bg-white/5 px-4 py-3 text-white">
                  {new Date(profile.birthday).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              )}
            </div>

            {/* Favorite Element */}
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-purple-200/80">
                {elementIcons[favoriteElement || profile.favoriteElement] || <Flame className="h-4 w-4" />}
                Favorite Element
              </label>
              {isEditing ? (
                <div className="grid grid-cols-4 gap-2">
                  {elements.map((element) => (
                    <button
                      key={element}
                      type="button"
                      onClick={() => setFavoriteElement(element)}
                      className={`flex flex-col items-center gap-1 rounded-xl border p-3 transition ${
                        favoriteElement === element
                          ? 'border-purple-400 bg-purple-500/20 text-purple-200'
                          : 'border-white/10 bg-white/5 text-white/60 hover:border-white/20 hover:bg-white/10'
                      }`}
                    >
                      {elementIcons[element]}
                      <span className="text-xs">{element}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="flex items-center gap-2 rounded-xl bg-white/5 px-4 py-3 text-white">
                  {elementIcons[profile.favoriteElement]}
                  {profile.favoriteElement}
                </p>
              )}
            </div>

            {/* Dream Goals */}
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-purple-200/80">
                <Target className="h-4 w-4" />
                Dream Goals {isEditing && <span className="text-xs text-purple-300/60">(select up to 3)</span>}
              </label>
              {isEditing ? (
                <div className="flex flex-wrap gap-2">
                  {dreamGoalOptions.map((goal) => (
                    <button
                      key={goal}
                      type="button"
                      onClick={() => toggleGoal(goal)}
                      disabled={!selectedGoals.includes(goal) && selectedGoals.length >= 3}
                      className={`rounded-full px-3 py-1.5 text-xs transition ${
                        selectedGoals.includes(goal)
                          ? 'bg-purple-500/30 text-purple-200 border border-purple-400/50'
                          : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed'
                      }`}
                    >
                      {goal}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {profile.dreamGoals.map((goal) => (
                    <span
                      key={goal}
                      className="rounded-full bg-purple-500/20 px-3 py-1.5 text-xs text-purple-200"
                    >
                      {goal}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 border-t border-white/10 px-6 py-4">
          {isEditing ? (
            <>
              <button
                type="button"
                onClick={handleCancel}
                className="rounded-xl border border-white/20 px-4 py-2 text-sm font-medium text-white/70 transition hover:bg-white/10 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving || !name || !birthday || !favoriteElement || selectedGoals.length === 0}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 px-4 py-2 text-sm font-medium text-white transition hover:from-purple-600 hover:to-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Changes
                  </>
                )}
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 px-4 py-2 text-sm font-medium text-white transition hover:from-purple-600 hover:to-indigo-600"
            >
              Edit Profile
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
