import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { 
  Sparkles, 
  Stars, 
  Moon, 
  Sun, 
  Gem,
  Scroll,
  Telescope,
  Wand2,
  Flame,
  Trophy,
  Target,
  TrendingUp,
  Calendar,
  Droplets,
  Wind,
  Mountain
} from "lucide-react";
import type { UserProfile } from '@/types/user-profile';
import type { Dream } from '@/components/dream-entry';

interface AstrologicalInsightsProps {
  profile: UserProfile;
  dreams?: Dream[];
}

// Moon phase calculation
const getMoonPhase = (date: Date = new Date()): { phase: string; emoji: string; illumination: number; description: string } => {
  // Known new moon: January 6, 2000
  const knownNewMoon = new Date(2000, 0, 6, 18, 14);
  const lunarCycle = 29.53058867; // days
  
  const daysSinceKnown = (date.getTime() - knownNewMoon.getTime()) / (1000 * 60 * 60 * 24);
  const currentCycleDay = ((daysSinceKnown % lunarCycle) + lunarCycle) % lunarCycle;
  const illumination = Math.round((1 - Math.cos((currentCycleDay / lunarCycle) * 2 * Math.PI)) / 2 * 100);
  
  if (currentCycleDay < 1.85) return { phase: "New Moon", emoji: "🌑", illumination, description: "Dreams may be introspective and focused on new beginnings" };
  if (currentCycleDay < 7.38) return { phase: "Waxing Crescent", emoji: "🌒", illumination, description: "Intentions set now may appear in your dreams" };
  if (currentCycleDay < 9.23) return { phase: "First Quarter", emoji: "🌓", illumination, description: "Dreams may feature challenges or decisions" };
  if (currentCycleDay < 14.77) return { phase: "Waxing Gibbous", emoji: "🌔", illumination, description: "Dreams become more vivid and detailed" };
  if (currentCycleDay < 16.61) return { phase: "Full Moon", emoji: "🌕", illumination, description: "Peak dream intensity - lucid dreaming is more likely!" };
  if (currentCycleDay < 22.15) return { phase: "Waning Gibbous", emoji: "🌖", illumination, description: "Dreams may bring gratitude or reflection themes" };
  if (currentCycleDay < 23.99) return { phase: "Last Quarter", emoji: "🌗", illumination, description: "Dreams may help release old patterns" };
  return { phase: "Waning Crescent", emoji: "🌘", illumination, description: "Dreams become more symbolic and mysterious" };
};

// Calculate dream streaks and achievements
const calculateDreamStats = (dreams: Dream[]) => {
  if (!dreams || dreams.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      totalDreams: 0,
      lucidCount: 0,
      lucidRate: 0,
      moodDistribution: {} as Record<string, number>,
      tagFrequency: {} as Record<string, number>,
      achievements: [] as { id: string; name: string; emoji: string; description: string; unlocked: boolean }[]
    };
  }

  // Sort dreams by date
  const sortedDreams = [...dreams].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  // Calculate streaks
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 1;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Check if dreamed today or yesterday to start streak
  const mostRecentDate = new Date(sortedDreams[0].date);
  mostRecentDate.setHours(0, 0, 0, 0);
  const daysSinceLastDream = Math.floor((today.getTime() - mostRecentDate.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysSinceLastDream <= 1) {
    currentStreak = 1;
    for (let i = 1; i < sortedDreams.length; i++) {
      const prevDate = new Date(sortedDreams[i - 1].date);
      const currDate = new Date(sortedDreams[i].date);
      prevDate.setHours(0, 0, 0, 0);
      currDate.setHours(0, 0, 0, 0);
      const dayDiff = Math.floor((prevDate.getTime() - currDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (dayDiff === 1) {
        currentStreak++;
      } else if (dayDiff === 0) {
        // Same day, continue
      } else {
        break;
      }
    }
  }
  
  // Calculate longest streak
  tempStreak = 1;
  for (let i = 1; i < sortedDreams.length; i++) {
    const prevDate = new Date(sortedDreams[i - 1].date);
    const currDate = new Date(sortedDreams[i].date);
    prevDate.setHours(0, 0, 0, 0);
    currDate.setHours(0, 0, 0, 0);
    const dayDiff = Math.floor((prevDate.getTime() - currDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (dayDiff === 1) {
      tempStreak++;
    } else if (dayDiff > 1) {
      longestStreak = Math.max(longestStreak, tempStreak);
      tempStreak = 1;
    }
  }
  longestStreak = Math.max(longestStreak, tempStreak, currentStreak);
  
  // Calculate stats
  const lucidCount = dreams.filter(d => d.lucidity).length;
  const lucidRate = Math.round((lucidCount / dreams.length) * 100);
  
  // Mood distribution
  const moodDistribution: Record<string, number> = {};
  dreams.forEach(d => {
    if (d.mood) {
      moodDistribution[d.mood] = (moodDistribution[d.mood] || 0) + 1;
    }
  });
  
  // Tag frequency
  const tagFrequency: Record<string, number> = {};
  dreams.forEach(d => {
    (d.tags || []).forEach(tag => {
      tagFrequency[tag] = (tagFrequency[tag] || 0) + 1;
    });
  });
  
  // Achievements
  const achievements = [
    { id: "first_dream", name: "First Dream", emoji: "🌟", description: "Record your first dream", unlocked: dreams.length >= 1 },
    { id: "week_streak", name: "Lunar Week", emoji: "🌙", description: "7-day dream streak", unlocked: longestStreak >= 7 },
    { id: "month_streak", name: "Moon Cycle Master", emoji: "🌕", description: "30-day dream streak", unlocked: longestStreak >= 30 },
    { id: "lucid_first", name: "Awakened Dreamer", emoji: "👁️", description: "Record a lucid dream", unlocked: lucidCount >= 1 },
    { id: "lucid_10", name: "Dream Walker", emoji: "🚀", description: "10 lucid dreams", unlocked: lucidCount >= 10 },
    { id: "dreams_10", name: "Star Collector", emoji: "⭐", description: "Record 10 dreams", unlocked: dreams.length >= 10 },
    { id: "dreams_50", name: "Constellation Builder", emoji: "✨", description: "Record 50 dreams", unlocked: dreams.length >= 50 },
    { id: "dreams_100", name: "Galaxy Creator", emoji: "🌌", description: "Record 100 dreams", unlocked: dreams.length >= 100 },
  ];
  
  return {
    currentStreak,
    longestStreak,
    totalDreams: dreams.length,
    lucidCount,
    lucidRate,
    moodDistribution,
    tagFrequency,
    achievements
  };
};

interface Insight {
  title: string;
  content: string;
  type: "daily" | "weekly" | "monthly" | "personality" | "compatibility";
  icon: React.ComponentType<{ className?: string }>;
}

export const AstrologicalInsights = ({ profile, dreams = [] }: AstrologicalInsightsProps) => {
  const [selectedInsight, setSelectedInsight] = useState<"daily" | "weekly" | "monthly" | "personality" | "compatibility">("daily");
  
  const moonPhase = useMemo(() => getMoonPhase(), []);
  const dreamStats = useMemo(() => calculateDreamStats(dreams), [dreams]);
  
  // Get element icon
  const getElementIcon = (element: string) => {
    switch (element) {
      case "Fire": return Flame;
      case "Water": return Droplets;
      case "Air": return Wind;
      case "Earth": return Mountain;
      default: return Sparkles;
    }
  };
  
  const ElementIcon = getElementIcon(profile.zodiacSign.element);

  // Generate insights based on zodiac sign
  const generateInsights = (profile: UserProfile): Record<Insight['type'], Insight> => {
    const sign = profile.zodiacSign.sign;
    const element = profile.zodiacSign.element;
    const traits = profile.zodiacSign.traits;

    const dailyInsights = {
      "Aries": "Today's fiery energy aligns perfectly with your ambitious nature. Your dreams may feature themes of leadership and new beginnings. Pay attention to red-colored imagery in your dreams.",
      "Taurus": "The earth's grounding energy supports your practical dreams tonight. You may find yourself dreaming of gardens, comfort, or material abundance. Green hues could be significant.",
      "Gemini": "Your curious mind is especially active today. Expect dreams filled with communication, travel, or learning. Multiple scenarios or conversations may feature prominently.",
      "Cancer": "The moon's influence heightens your intuitive dreams. Family, home, or water-related imagery may appear. Trust your emotional responses to dream symbols.",
      "Leo": "Your creative fire burns bright today. Dreams of performance, recognition, or sunny landscapes may visit you. Golden colors could hold special meaning.",
      "Virgo": "Your analytical nature brings clarity to your dream world. Organized, detailed dreamscapes or problem-solving scenarios may emerge. Focus on practical symbols.",
      "Libra": "Balance and harmony feature in your dreams today. Relationships, art, or beautiful settings may appear. Pay attention to symmetrical patterns or partnerships.",
      "Scorpio": "Deep transformation is stirring in your subconscious. Intense, mysterious dreams with themes of rebirth or hidden knowledge may surface. Dark waters hold wisdom.",
      "Sagittarius": "Adventure calls to you in the dream realm. Expect journeys, philosophical insights, or foreign landscapes. Purple and blue may carry special significance.",
      "Capricorn": "Your ambitious spirit manifests in structured dreams. Mountain climbing, achievements, or ancient wisdom may feature. Earth tones guide your interpretation.",
      "Aquarius": "Innovation flows through your dreams tonight. Futuristic scenarios, groups of people, or unusual inventions may appear. Electric blue brings insight.",
      "Pisces": "Your psychic sensitivity is heightened. Mystical, oceanic, or spiritually profound dreams await. Water imagery and iridescent colors hold deep meaning."
    };

    const weeklyInsights = {
      "Aries": "This week, your dreams are charged with initiating energy. Mars encourages you to pay attention to dreams about starting new projects or leading others. Your natural courage may manifest as heroic dream scenarios.",
      "Taurus": "Venus blesses your dream realm with beauty and abundance this week. Dreams of luxury, nature, or sensual experiences may increase. Your dreams could reveal what truly brings you comfort and security.",
      "Gemini": "Mercury enhances your dream communication this week. Expect vivid conversations, learning experiences, or information exchanges in your dreams. Your twin nature may create dreams with dual perspectives.",
      "Cancer": "The Moon's cycles deeply affect your dreams this week. Emotional themes, family connections, or nurturing scenarios may dominate. Your dreams could reveal your deepest needs for security and care.",
      "Leo": "The Sun illuminates your creative dream potential this week. Dreams of performance, creativity, or being in the spotlight may occur. Your generous heart may manifest as dreams of giving or inspiring others.",
      "Virgo": "Mercury supports your analytical dream work this week. Organized, helpful, or healing dreams may appear. Your attention to detail could reveal important symbolic patterns in your dream journal.",
      "Libra": "Venus harmonizes your dream relationships this week. Partnership themes, artistic inspiration, or beauty-focused dreams may increase. Your desire for balance may create dreams of justice or fairness.",
      "Scorpio": "Pluto's transformative power intensifies your dreams this week. Deep psychological themes, mystery, or regeneration may feature prominently. Your intuitive powers are especially strong in dream interpretation.",
      "Sagittarius": "Jupiter expands your dream horizons this week. Philosophical insights, travel dreams, or higher learning may dominate. Your optimistic nature could manifest as adventure-filled dreamscapes.",
      "Capricorn": "Saturn structures your dream work this week. Achievement-oriented dreams, responsibility themes, or ancestral wisdom may appear. Your practical nature helps ground mystical dream experiences.",
      "Aquarius": "Uranus electrifies your dream innovation this week. Unusual, futuristic, or humanitarian dreams may occur. Your independent spirit may create dreams of freedom or social change.",
      "Pisces": "Neptune enhances your mystical dreams this week. Spiritual, artistic, or emotionally profound dreams increase. Your compassionate nature may manifest as healing or service-oriented dream themes."
    };

    const monthlyInsights = {
      "Aries": "This month, your pioneering spirit leads you into uncharted dream territories. Fire element dreams may feature prominently - volcanoes, campfires, or solar imagery. Your cardinal energy initiates new dream cycles.",
      "Taurus": "Earth energy grounds your monthly dream patterns. Gardens, crystals, or mountain landscapes may appear frequently. Your fixed nature creates stable, recurring dream themes that build over time.",
      "Gemini": "Air currents carry diverse dream messages this month. Expect variety in your dreamscapes - from sky-high adventures to intellectual conversations. Your mutable nature adapts to changing dream symbolism.",
      "Cancer": "Water themes flow through your monthly dream cycle. Oceans, rivers, or rain may carry emotional messages. Your cardinal water energy initiates emotional healing through dream work.",
      "Leo": "Fire illuminates your monthly dream stage. Performance dreams, sunny settings, or royal imagery may dominate. Your fixed fire energy creates dramatic, memorable dream experiences.",
      "Virgo": "Earth's practical wisdom guides your monthly dreams. Healing, service, or organized environments may feature. Your mutable earth energy helps you analyze and integrate dream lessons.",
      "Libra": "Air brings balance to your monthly dream patterns. Partnership themes, artistic visions, or harmonious settings increase. Your cardinal air energy initiates relationship healing through dreams.",
      "Scorpio": "Water's depths reveal monthly mysteries in your dreams. Transformation, hidden knowledge, or intense emotional themes dominate. Your fixed water energy creates profound, lasting dream memories.",
      "Sagittarius": "Fire fuels your monthly dream adventures. Foreign lands, teaching scenarios, or philosophical insights may appear. Your mutable fire energy adapts spiritual wisdom through diverse dream experiences.",
      "Capricorn": "Earth provides structure for your monthly dream work. Achievement dreams, ancient wisdom, or mountain symbolism may recur. Your cardinal earth energy builds lasting spiritual foundations through dreams.",
      "Aquarius": "Air innovation charges your monthly dream evolution. Group dynamics, humanitarian themes, or futuristic visions may increase. Your fixed air energy creates revolutionary dream insights.",
      "Pisces": "Water's compassion flows through your monthly dreams. Spiritual guidance, artistic inspiration, or healing themes dominate. Your mutable water energy dissolves boundaries between dreams and spiritual reality."
    };

    const personalityInsights = {
      "Aries": `As an ${sign}, your ${traits.join(', ').toLowerCase()} nature manifests in bold, action-oriented dreams. Your fire element creates passionate dreamscapes where you often lead or initiate change. Dreams of competition, new beginnings, or physical challenges align with your Aries energy.`,
      "Taurus": `Your ${traits.join(', ').toLowerCase()} ${sign} nature creates stable, sensual dreams. Earth element grounds your dream experiences in beauty, comfort, and material abundance. Dreams of gardens, luxury, or peaceful settings reflect your Venus-ruled desires.`,
      "Gemini": `As a ${traits.join(', ').toLowerCase()} ${sign}, your air element creates dynamic, communicative dreams. Multiple storylines, conversations, or learning scenarios often appear. Your Mercury influence brings intellectual curiosity to dream interpretation.`,
      "Cancer": `Your ${traits.join(', ').toLowerCase()} ${sign} nature channels water element emotions into deeply meaningful dreams. Family, home, or nostalgic themes often dominate. Your Moon connection enhances psychic dream experiences.`,
      "Leo": `As a ${traits.join(', ').toLowerCase()} ${sign}, your fire element creates dramatic, creative dreams. Performance, recognition, or solar imagery often appears. Your Sun-ruled nature brings warmth and generosity to dream relationships.`,
      "Virgo": `Your ${traits.join(', ').toLowerCase()} ${sign} nature creates organized, healing-focused dreams. Earth element grounds your analytical approach to dream symbolism. Mercury's influence brings clarity to dream interpretation.`,
      "Libra": `As a ${traits.join(', ').toLowerCase()} ${sign}, your air element creates harmonious, relationship-focused dreams. Partnership themes, artistic beauty, or balanced scenarios often appear. Venus brings love and aesthetics to your dream world.`,
      "Scorpio": `Your ${traits.join(', ').toLowerCase()} ${sign} nature channels water element intensity into transformative dreams. Mystery, rebirth, or hidden knowledge often features. Pluto's influence creates profound psychological dream experiences.`,
      "Sagittarius": `As a ${traits.join(', ').toLowerCase()} ${sign}, your fire element creates adventurous, philosophical dreams. Travel, teaching, or foreign cultures often appear. Jupiter's influence expands your dream horizons.`,
      "Capricorn": `Your ${traits.join(', ').toLowerCase()} ${sign} nature creates structured, achievement-oriented dreams. Earth element grounds ambitious dreamscapes in practical wisdom. Saturn's influence brings discipline to dream work.`,
      "Aquarius": `As a ${traits.join(', ').toLowerCase()} ${sign}, your air element creates innovative, humanitarian dreams. Group dynamics, futuristic scenarios, or social change often features. Uranus brings unexpected insights to dream interpretation.`,
      "Pisces": `Your ${traits.join(', ').toLowerCase()} ${sign} nature channels water element compassion into mystical dreams. Spiritual guidance, artistic inspiration, or oceanic imagery often appears. Neptune enhances psychic dream abilities.`
    };

    const compatibilityInsights = {
      "Fire": "Fire signs (Aries, Leo, Sagittarius) share your passionate dream energy. Earth signs ground your fiery visions, while Air signs fuel your creative flames. Water signs may create steamy, emotional dream encounters.",
      "Earth": "Earth signs (Taurus, Virgo, Capricorn) understand your practical dream wisdom. Water signs nourish your grounded visions, while Fire signs energize your stable dreams. Air signs may scatter your focused dream work.",
      "Air": "Air signs (Gemini, Libra, Aquarius) harmonize with your intellectual dream nature. Fire signs energize your mental dreams, while Earth signs ground your airy visions. Water signs add emotional depth to your logical dreams.",
      "Water": "Water signs (Cancer, Scorpio, Pisces) flow with your emotional dream currents. Earth signs provide stable foundations for your fluid dreams, while Air signs bring mental clarity. Fire signs may evaporate your sensitive dream work."
    };

    return {
      daily: {
        title: "Today's Cosmic Dream Guidance",
        content: dailyInsights[sign as keyof typeof dailyInsights] || dailyInsights["Aries"],
        type: "daily" as const,
        icon: Sun
      },
      weekly: {
        title: "This Week's Astrological Dream Patterns", 
        content: weeklyInsights[sign as keyof typeof weeklyInsights] || weeklyInsights["Aries"],
        type: "weekly" as const,
        icon: Moon
      },
      monthly: {
        title: "Monthly Celestial Dream Cycle",
        content: monthlyInsights[sign as keyof typeof monthlyInsights] || monthlyInsights["Aries"],
        type: "monthly" as const,
        icon: Stars
      },
      personality: {
        title: `Your ${sign} Dream Personality`,
        content: personalityInsights[sign as keyof typeof personalityInsights] || personalityInsights["Aries"],
        type: "personality" as const,
        icon: Gem
      },
      compatibility: {
        title: "Dream Element Compatibility",
        content: compatibilityInsights[element as keyof typeof compatibilityInsights] || compatibilityInsights["Fire"],
        type: "compatibility" as const,
        icon: Wand2
      }
    };
  };

  const insights = generateInsights(profile);

  const insightTypes = [
    { id: "daily" as const, label: "Daily", icon: Sun },
    { id: "weekly" as const, label: "Weekly", icon: Moon },
    { id: "monthly" as const, label: "Monthly", icon: Stars },
    { id: "personality" as const, label: "Personality", icon: Gem },
    { id: "compatibility" as const, label: "Compatibility", icon: Wand2 }
  ];

  const currentInsight = insights[selectedInsight];

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <motion.div
        className="text-center mb-8"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center justify-center gap-3 mb-4">
          <Sparkles className="h-8 w-8 text-purple-400" />
          <h1 className="text-3xl text-white">Astrological Insights</h1>
          <Telescope className="h-8 w-8 text-pink-400" />
        </div>
        <p className="text-purple-200/80 max-w-2xl mx-auto">
          Explore the cosmic connections between your {profile.zodiacSign.sign} nature and your dream world. 
          Ancient wisdom meets modern dream analysis through the lens of the stars.
        </p>
      </motion.div>

      {/* Zodiac Display */}
      <motion.div
        className="text-center mb-8"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        <div className="inline-flex items-center gap-4 px-6 py-3 bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-indigo-600/20 backdrop-blur-md border border-white/20 rounded-2xl">
          <span className="text-4xl">{profile.zodiacSign.symbol}</span>
          <div className="text-left">
            <h2 className="text-xl text-white">{profile.zodiacSign.sign}</h2>
            <p className="text-purple-300/80 text-sm">{profile.zodiacSign.element} Element</p>
          </div>
        </div>
      </motion.div>

      {/* ==================== NEW FEATURES ==================== */}
      
      {/* Moon Phase & Dream Stats Row */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.6 }}
      >
        {/* Moon Phase Tracker */}
        <div className="bg-gradient-to-br from-indigo-900/50 via-purple-900/40 to-blue-900/50 backdrop-blur-md border border-indigo-400/30 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="text-5xl">{moonPhase.emoji}</div>
            <div>
              <h3 className="text-white text-lg font-medium">{moonPhase.phase}</h3>
              <p className="text-indigo-300/80 text-sm">{moonPhase.illumination}% illuminated</p>
            </div>
          </div>
          <div className="mb-3">
            <div className="h-2 bg-indigo-900/50 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-indigo-400 to-purple-400"
                initial={{ width: 0 }}
                animate={{ width: `${moonPhase.illumination}%` }}
                transition={{ duration: 1, delay: 0.5 }}
              />
            </div>
          </div>
          <p className="text-purple-200/70 text-sm italic">
            {moonPhase.description}
          </p>
          <div className="mt-3 pt-3 border-t border-white/10">
            <p className="text-indigo-300/60 text-xs">
              🌙 As a {profile.zodiacSign.sign}, the {moonPhase.phase.toLowerCase()} enhances your {profile.zodiacSign.element.toLowerCase()} dream energy
            </p>
          </div>
        </div>

        {/* Dream Streak Tracker */}
        <div className="bg-gradient-to-br from-amber-900/40 via-orange-900/30 to-yellow-900/40 backdrop-blur-md border border-amber-400/30 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/30 rounded-lg">
                <Flame className="h-6 w-6 text-amber-300" />
              </div>
              <div>
                <h3 className="text-white text-lg font-medium">Dream Streak</h3>
                <p className="text-amber-300/80 text-sm">Keep the fire alive!</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-4xl font-bold text-amber-300">{dreamStats.currentStreak}</p>
              <p className="text-amber-400/60 text-xs">days</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-white/5 rounded-lg p-2">
              <p className="text-xl font-semibold text-orange-300">{dreamStats.longestStreak}</p>
              <p className="text-orange-400/60 text-xs">Best Streak</p>
            </div>
            <div className="bg-white/5 rounded-lg p-2">
              <p className="text-xl font-semibold text-yellow-300">{dreamStats.totalDreams}</p>
              <p className="text-yellow-400/60 text-xs">Total Dreams</p>
            </div>
            <div className="bg-white/5 rounded-lg p-2">
              <p className="text-xl font-semibold text-amber-300">{dreamStats.lucidRate}%</p>
              <p className="text-amber-400/60 text-xs">Lucid Rate</p>
            </div>
          </div>
          {dreamStats.currentStreak >= 3 && (
            <div className="mt-3 pt-3 border-t border-white/10 text-center">
              <p className="text-amber-300/80 text-sm">🔥 You&apos;re on fire! Keep dreaming!</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Achievements Section */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
      >
        <div className="flex items-center gap-3 mb-4">
          <Trophy className="h-6 w-6 text-yellow-400" />
          <h3 className="text-xl text-white">Cosmic Achievements</h3>
          <span className="text-purple-300/60 text-sm">
            ({dreamStats.achievements.filter(a => a.unlocked).length}/{dreamStats.achievements.length} unlocked)
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {dreamStats.achievements.map((achievement) => (
            <motion.div
              key={achievement.id}
              className={`relative p-4 rounded-xl border text-center transition-all ${
                achievement.unlocked
                  ? "bg-gradient-to-br from-yellow-500/20 to-amber-500/20 border-yellow-400/40"
                  : "bg-white/5 border-white/10 opacity-50"
              }`}
              whileHover={{ scale: achievement.unlocked ? 1.05 : 1 }}
            >
              <div className={`text-3xl mb-2 ${achievement.unlocked ? "" : "grayscale"}`}>
                {achievement.emoji}
              </div>
              <p className={`text-sm font-medium ${achievement.unlocked ? "text-yellow-200" : "text-gray-400"}`}>
                {achievement.name}
              </p>
              <p className="text-xs text-purple-300/50 mt-1">{achievement.description}</p>
              {achievement.unlocked && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Zodiac Dream Statistics */}
      {dreamStats.totalDreams > 0 && (
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.6 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="h-6 w-6 text-cyan-400" />
            <h3 className="text-xl text-white">Your {profile.zodiacSign.sign} Dream Patterns</h3>
          </div>
          <div className="bg-gradient-to-br from-cyan-900/30 via-teal-900/20 to-emerald-900/30 backdrop-blur-md border border-cyan-400/20 rounded-2xl p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Mood Analysis */}
              <div>
                <h4 className="text-cyan-300 text-sm font-medium mb-3 flex items-center gap-2">
                  <ElementIcon className="h-4 w-4" /> Mood Patterns
                </h4>
                <div className="space-y-2">
                  {Object.entries(dreamStats.moodDistribution)
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 4)
                    .map(([mood, count]) => {
                      const percentage = Math.round((count / dreamStats.totalDreams) * 100);
                      const moodEmojis: Record<string, string> = {
                        happy: "😊", sad: "😢", anxious: "😰", peaceful: "😌", 
                        excited: "🤩", confused: "😵", neutral: "😐", scared: "😨"
                      };
                      return (
                        <div key={mood} className="flex items-center gap-2">
                          <span className="text-lg">{moodEmojis[mood] || "💭"}</span>
                          <span className="text-purple-200 text-sm capitalize w-20">{mood}</span>
                          <div className="flex-1 h-2 bg-cyan-900/30 rounded-full overflow-hidden">
                            <motion.div 
                              className="h-full bg-gradient-to-r from-cyan-400 to-teal-400"
                              initial={{ width: 0 }}
                              animate={{ width: `${percentage}%` }}
                              transition={{ duration: 0.8, delay: 0.5 }}
                            />
                          </div>
                          <span className="text-cyan-300/70 text-xs w-10 text-right">{percentage}%</span>
                        </div>
                      );
                    })}
                  {Object.keys(dreamStats.moodDistribution).length === 0 && (
                    <p className="text-purple-300/50 text-sm">No mood data yet</p>
                  )}
                </div>
              </div>
              
              {/* Top Tags */}
              <div>
                <h4 className="text-emerald-300 text-sm font-medium mb-3 flex items-center gap-2">
                  <Target className="h-4 w-4" /> Top Dream Themes
                </h4>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(dreamStats.tagFrequency)
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 8)
                    .map(([tag, count]) => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-emerald-500/20 border border-emerald-400/30 rounded-full text-emerald-200 text-sm"
                      >
                        #{tag} <span className="text-emerald-400/60">×{count}</span>
                      </span>
                    ))}
                  {Object.keys(dreamStats.tagFrequency).length === 0 && (
                    <p className="text-purple-300/50 text-sm">No tags yet - add tags to your dreams!</p>
                  )}
                </div>
                
                {/* Lucid Dreams by Zodiac */}
                <div className="mt-4 p-3 bg-white/5 rounded-xl">
                  <p className="text-purple-200 text-sm">
                    <span className="text-cyan-300">{dreamStats.lucidCount}</span> of your dreams were lucid
                    {dreamStats.lucidRate > 15 && (
                      <span className="text-emerald-400"> — exceptional for a {profile.zodiacSign.sign}! ✨</span>
                    )}
                    {dreamStats.lucidRate > 0 && dreamStats.lucidRate <= 15 && (
                      <span className="text-purple-300/70"> — your {profile.zodiacSign.element} energy supports lucid awareness</span>
                    )}
                    {dreamStats.lucidRate === 0 && (
                      <span className="text-purple-300/70"> — {profile.zodiacSign.element} signs often develop lucidity gradually</span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
      
      {/* ==================== END NEW FEATURES ====================  */}

      {/* Insight Type Selector */}
      <motion.div
        className="flex flex-wrap justify-center gap-3 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
      >
        {insightTypes.map((type) => {
          const IconComponent = type.icon;
          const isActive = selectedInsight === type.id;
          
          return (
            <motion.button
              key={type.id}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 ${
                isActive
                  ? "bg-purple-600 text-white shadow-lg border border-purple-400"
                  : "bg-white/10 text-purple-200 hover:bg-white/20 border border-white/20"
              }`}
              onClick={() => setSelectedInsight(type.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <IconComponent className="h-4 w-4" />
              <span className="text-sm">{type.label}</span>
            </motion.button>
          );
        })}
      </motion.div>

      {/* Main Insight Display */}
      {currentInsight && (
        <motion.div
          key={selectedInsight}
          className="bg-gradient-to-br from-purple-900/40 via-indigo-900/40 to-purple-900/40 backdrop-blur-md border border-white/20 rounded-3xl p-8 shadow-2xl mb-8"
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -30, scale: 0.95 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <currentInsight.icon className="h-6 w-6 text-purple-400" />
            <h3 className="text-2xl text-white">{currentInsight.title}</h3>
          </div>
          
          <div className="prose prose-invert max-w-none">
            <p className="text-purple-100/90 text-lg leading-relaxed">
              {currentInsight.content}
            </p>
          </div>

        </motion.div>
      )}

      {/* Astrological Information Grid */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
      >
        {/* Element Info */}
        <motion.div
          className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-md border border-white/20 rounded-2xl p-6"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-500/30 rounded-lg">
              <Sparkles className="h-5 w-5 text-blue-200" />
            </div>
            <h3 className="text-white">Element Wisdom</h3>
          </div>
          <p className="text-blue-200/80 text-sm mb-3">
            Your {profile.zodiacSign.element} element influences dream themes, emotional responses, and symbolic interpretations.
          </p>
          <div className="text-blue-300 text-xs">
            Element: {profile.zodiacSign.element}
          </div>
        </motion.div>

        {/* Traits Info */}
        <motion.div
          className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-md border border-white/20 rounded-2xl p-6"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-500/30 rounded-lg">
              <Gem className="h-5 w-5 text-green-200" />
            </div>
            <h3 className="text-white">Core Traits</h3>
          </div>
          <p className="text-green-200/80 text-sm mb-3">
            Your natural traits shape dream scenarios, character interactions, and personal symbolism.
          </p>
          <div className="flex flex-wrap gap-1">
            {profile.zodiacSign.traits.map((trait) => (
              <span key={trait} className="px-2 py-1 bg-white/10 rounded text-green-300 text-xs">
                {trait}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Dream Goals Connection */}
        <motion.div
          className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-md border border-white/20 rounded-2xl p-6"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-500/30 rounded-lg">
              <Scroll className="h-5 w-5 text-purple-200" />
            </div>
            <h3 className="text-white">Goal Alignment</h3>
          </div>
          <p className="text-purple-200/80 text-sm mb-3">
            Your {profile.zodiacSign.sign} nature supports {(profile.dreamGoals || []).length} specific dream goals through cosmic energy.
          </p>
          <div className="text-purple-300 text-xs">
            Active Goals: {(profile.dreamGoals || []).length}/3
          </div>
        </motion.div>
      </motion.div>

      {/* Disclaimer */}
      <motion.div
        className="text-center mt-8 p-4 bg-white/5 border border-white/10 rounded-xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7, duration: 0.6 }}
      >
        <p className="text-purple-300/60 text-sm">
          ✨ Astrological insights are for entertainment and self-reflection purposes. 
          Trust your intuition when interpreting dream symbolism and cosmic connections. ✨
        </p>
      </motion.div>
    </div>
  );
};
