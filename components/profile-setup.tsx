'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Calendar, Sparkles, Target, User, Check } from 'lucide-react';
import { CelestialLogo } from '@/components/celestial-logo';
import { FloatingStars, ConstellationPattern } from '@/components/celestial-icons';
import { useAuth } from '@/components/auth-provider';
import { updateUserProfile } from '@/lib/api/user';
import type { UserProfile, ZodiacSign } from '@/types/user-profile';

const zodiacSigns: Array<
  ZodiacSign & {
    range: { start: [number, number]; end: [number, number] };
  }
> = [
  {
    sign: 'Aries',
    symbol: '♈',
    element: 'Fire',
    traits: ['Bold', 'Energetic', 'Independent'],
    dates: 'March 21 - April 19',
    range: { start: [3, 21], end: [4, 19] },
  },
  {
    sign: 'Taurus',
    symbol: '♉',
    element: 'Earth',
    traits: ['Reliable', 'Patient', 'Practical'],
    dates: 'April 20 - May 20',
    range: { start: [4, 20], end: [5, 20] },
  },
  {
    sign: 'Gemini',
    symbol: '♊',
    element: 'Air',
    traits: ['Curious', 'Adaptable', 'Expressive'],
    dates: 'May 21 - June 20',
    range: { start: [5, 21], end: [6, 20] },
  },
  {
    sign: 'Cancer',
    symbol: '♋',
    element: 'Water',
    traits: ['Nurturing', 'Intuitive', 'Protective'],
    dates: 'June 21 - July 22',
    range: { start: [6, 21], end: [7, 22] },
  },
  {
    sign: 'Leo',
    symbol: '♌',
    element: 'Fire',
    traits: ['Confident', 'Creative', 'Generous'],
    dates: 'July 23 - August 22',
    range: { start: [7, 23], end: [8, 22] },
  },
  {
    sign: 'Virgo',
    symbol: '♍',
    element: 'Earth',
    traits: ['Analytical', 'Helpful', 'Detail-oriented'],
    dates: 'August 23 - September 22',
    range: { start: [8, 23], end: [9, 22] },
  },
  {
    sign: 'Libra',
    symbol: '♎',
    element: 'Air',
    traits: ['Diplomatic', 'Balanced', 'Social'],
    dates: 'September 23 - October 22',
    range: { start: [9, 23], end: [10, 22] },
  },
  {
    sign: 'Scorpio',
    symbol: '♏',
    element: 'Water',
    traits: ['Intense', 'Passionate', 'Mysterious'],
    dates: 'October 23 - November 21',
    range: { start: [10, 23], end: [11, 21] },
  },
  {
    sign: 'Sagittarius',
    symbol: '♐',
    element: 'Fire',
    traits: ['Adventurous', 'Optimistic', 'Free-spirited'],
    dates: 'November 22 - December 21',
    range: { start: [11, 22], end: [12, 21] },
  },
  {
    sign: 'Capricorn',
    symbol: '♑',
    element: 'Earth',
    traits: ['Ambitious', 'Disciplined', 'Responsible'],
    dates: 'December 22 - January 19',
    range: { start: [12, 22], end: [1, 19] },
  },
  {
    sign: 'Aquarius',
    symbol: '♒',
    element: 'Air',
    traits: ['Independent', 'Innovative', 'Humanitarian'],
    dates: 'January 20 - February 18',
    range: { start: [1, 20], end: [2, 18] },
  },
  {
    sign: 'Pisces',
    symbol: '♓',
    element: 'Water',
    traits: ['Compassionate', 'Artistic', 'Intuitive'],
    dates: 'February 19 - March 20',
    range: { start: [2, 19], end: [3, 20] },
  },
];

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

const elements = ['Fire', 'Earth', 'Air', 'Water'];

function calculateZodiacSign(birthDate: string): ZodiacSign {
  const date = new Date(birthDate);
  const month = date.getMonth() + 1;
  const day = date.getDate();

  for (const zodiac of zodiacSigns) {
    const { start, end } = zodiac.range;

    if (zodiac.sign === 'Capricorn') {
      if ((month === 12 && day >= start[1]) || (month === 1 && day <= end[1])) {
        return zodiac;
      }
    } else if (
      (month === start[0] && day >= start[1]) ||
      (month === end[0] && day <= end[1]) ||
      (month > start[0] && month < end[0])
    ) {
      return zodiac;
    }
  }

  return zodiacSigns[0];
}

export function ProfileSetup() {
  const router = useRouter();
  const { user, completeProfile } = useAuth();

  useEffect(() => {
    if (!user) {
      router.replace('/auth/signin');
    } else if (user.hasProfile) {
      router.replace('/dashboard');
    }
  }, [router, user]);

  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [birthday, setBirthday] = useState('');
  const [favoriteElement, setFavoriteElement] = useState('');
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [calculatedZodiac, setCalculatedZodiac] = useState<ZodiacSign | null>(null);

  const remainingSelectionSlots = useMemo(() => 3 - selectedGoals.length, [selectedGoals.length]);

  const handleBirthdayChange = (date: string) => {
    setBirthday(date);

    if (date) {
      setCalculatedZodiac(calculateZodiacSign(date));
    } else {
      setCalculatedZodiac(null);
    }
  };

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

  const [isSaving, setIsSaving] = useState(false);

  const handleComplete = async () => {
    if (!user || !name || !birthday || !favoriteElement || selectedGoals.length === 0 || !calculatedZodiac) {
      return;
    }

    const profile: UserProfile = {
      name,
      birthday,
      favoriteElement,
      dreamGoals: selectedGoals,
      zodiacSign: calculatedZodiac,
    };

    setIsSaving(true);
    try {
      if (user.id) {
        await updateUserProfile(user.id, {
          birthdate: birthday,
          favorite_element: favoriteElement.toLowerCase(), // Backend expects lowercase
          dream_goals: selectedGoals,
        });
      }
    } catch (error) {
      console.warn('Failed to save profile to backend:', error);
    } finally {
      setIsSaving(false);
    }

    completeProfile(profile);
    router.replace('/dashboard');
  };

  if (!user || user.hasProfile) {
    return null;
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 py-12">
      <motion.div
        className="w-full max-w-2xl"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="text-center mb-8">
          <motion.div
            className="flex justify-center mb-4"
            initial={{ opacity: 0, rotate: -180 }}
            animate={{ opacity: 1, rotate: 0 }}
            transition={{ duration: 0.8 }}
          >
            <CelestialLogo className="transform scale-125" />
          </motion.div>

          <motion.h1
            className="text-3xl text-white mb-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            Create Your Celestial Profile
          </motion.h1>

          <motion.p
            className="text-purple-200/80"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            Let&apos;s set up your personalized dream journey
          </motion.p>

          <motion.div
            className="flex justify-center mt-6 mb-8"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4].map((stepNumber) => (
                <div key={stepNumber} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all duration-300 ${
                      step >= stepNumber ? 'bg-purple-500 text-white' : 'bg-white/20 text-purple-300'
                    }`}
                  >
                    {stepNumber}
                  </div>
                  {stepNumber < 4 && (
                    <div
                      className={`w-8 h-0.5 mx-2 transition-all duration-300 ${
                        step > stepNumber ? 'bg-purple-500' : 'bg-white/20'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        <motion.div
          className="relative bg-gradient-to-br from-purple-900/40 via-indigo-900/40 to-purple-900/40 backdrop-blur-md border border-white/20 rounded-3xl p-8 shadow-2xl"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <User className="h-6 w-6 text-purple-400" />
                <h2 className="text-xl text-white">What&apos;s your name?</h2>
              </div>

              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-300/60 focus:outline-none focus:border-purple-400/60 transition-colors duration-300"
                placeholder="Enter your first name"
                autoFocus
              />

              <div className="flex justify-end mt-6">
                <motion.button
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => setStep(2)}
                  disabled={!name.trim()}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Continue
                </motion.button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <Calendar className="h-6 w-6 text-purple-400" />
                <h2 className="text-xl text-white">When were you born?</h2>
              </div>

              <input
                type="date"
                value={birthday}
                onChange={(event) => handleBirthdayChange(event.target.value)}
                max={new Date().toISOString().split('T')[0]}
                min="1900-01-01"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-purple-400/60 transition-colors duration-300"
                autoFocus
              />

              {calculatedZodiac && (
                <motion.div
                  className="mt-6 p-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/30 rounded-xl"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-3xl">{calculatedZodiac.symbol}</span>
                    <div>
                      <h3 className="text-white text-lg">{calculatedZodiac.sign}</h3>
                      <p className="text-purple-200/80 text-sm">{calculatedZodiac.dates}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-purple-300 text-sm">Element:</span>
                    <span className="text-white text-sm">{calculatedZodiac.element}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {calculatedZodiac.traits.map((trait) => (
                      <span key={trait} className="px-2 py-1 bg-white/10 rounded-lg text-purple-200 text-sm">
                        {trait}
                      </span>
                    ))}
                  </div>
                </motion.div>
              )}

              <div className="flex justify-between mt-6">
                <motion.button
                  className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors duration-300"
                  onClick={() => setStep(1)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Back
                </motion.button>
                <motion.button
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => setStep(3)}
                  disabled={!birthday || !calculatedZodiac}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Continue
                </motion.button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <Sparkles className="h-6 w-6 text-purple-400" />
                <h2 className="text-xl text-white">Choose your favorite element</h2>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {elements.map((element) => (
                  <motion.button
                    key={element}
                    className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                      favoriteElement === element
                        ? 'border-purple-400 bg-purple-500/20 text-white'
                        : 'border-white/20 bg-white/5 text-purple-200 hover:border-white/40 hover:bg-white/10'
                    }`}
                    onClick={() => setFavoriteElement(element)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-2">
                        {element === 'Fire' && '🔥'}
                        {element === 'Earth' && '🌍'}
                        {element === 'Air' && '💨'}
                        {element === 'Water' && '🌊'}
                      </div>
                      <span>{element}</span>
                    </div>
                  </motion.button>
                ))}
              </div>

              <div className="flex justify-between mt-6">
                <motion.button
                  className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors duration-300"
                  onClick={() => setStep(2)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Back
                </motion.button>
                <motion.button
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => setStep(4)}
                  disabled={!favoriteElement}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Continue
                </motion.button>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <Target className="h-6 w-6 text-purple-400" />
                <h2 className="text-xl text-white">What are your dream goals?</h2>
                <span className="text-purple-300/80 text-sm">(Select up to 3)</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                {dreamGoalOptions.map((goal) => {
                  const isSelected = selectedGoals.includes(goal);
                  const canSelect = isSelected || remainingSelectionSlots > 0;

                  return (
                    <motion.button
                      key={goal}
                      className={`p-3 rounded-xl border text-left transition-all duration-300 flex items-center gap-3 ${
                        isSelected
                          ? 'border-purple-400 bg-purple-500/20 text-white'
                          : canSelect
                          ? 'border-white/20 bg-white/5 text-purple-200 hover:border-white/40 hover:bg-white/10'
                          : 'border-white/10 bg-white/5 text-purple-300/50 cursor-not-allowed'
                      }`}
                      onClick={() => canSelect && toggleGoal(goal)}
                      disabled={!canSelect}
                      whileHover={canSelect ? { scale: 1.02 } : {}}
                      whileTap={canSelect ? { scale: 0.98 } : {}}
                    >
                      <div
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                          isSelected ? 'border-purple-400 bg-purple-400' : 'border-white/30'
                        }`}
                      >
                        {isSelected && <Check className="h-3 w-3 text-white" />}
                      </div>
                      <span className="text-sm">{goal}</span>
                    </motion.button>
                  );
                })}
              </div>

              <div className="mt-4 text-center">
                <span className="text-purple-300/80 text-sm">{selectedGoals.length}/3 goals selected</span>
              </div>

              <div className="flex justify-between mt-6">
                <motion.button
                  className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors duration-300"
                  onClick={() => setStep(3)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Back
                </motion.button>
                <motion.button
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:from-purple-500 hover:via-pink-500 hover:to-indigo-500 text-white rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                  onClick={handleComplete}
                  disabled={selectedGoals.length === 0 || !calculatedZodiac}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Complete Profile
                </motion.button>
              </div>
            </motion.div>
          )}

          <div className="absolute -top-4 -left-4 opacity-30">
            <FloatingStars />
          </div>
          <div className="absolute -bottom-4 -right-4 opacity-30">
            <ConstellationPattern />
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
