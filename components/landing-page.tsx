"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Brain,
  Stars,
  Sparkles,
  BarChart3,
  AlarmClock,
  Edit3,
  Plus,
  History,
  ArrowRight,
  Zap,
  Heart,
  Shield,
} from "lucide-react";
import { CelestialLogo } from "./celestial-logo";
import { CelestialBackground } from "./celestial-background";
import { Cormorant_Garamond } from "next/font/google";
const cormorant = Cormorant_Garamond({ weight: ["400", "700"], subsets: ["latin"] });


interface LandingPageProps {
  onGetStarted: () => void;
  dreamCount: number;
  buttonText?: string;
}

export const LandingPage = ({ onGetStarted, dreamCount, buttonText = "Start Your Journey" }: LandingPageProps) => {
  const features = [
    {
      icon: Plus,
      title: "Record Dreams",
      description: "Remember your dreams with detailed entries that include mood summary and tags.",
      color: "from-purple-500/20 to-indigo-500/20",
      borderColor: "border-purple-400/30",
    },
    {
      icon: History,
      title: "View Dream History",
      description: "Browse, search, and revisit your entire collection of recorded dreams.",
      color: "from-blue-500/20 to-cyan-500/20",
      borderColor: "border-blue-400/30",
    },
    {
      icon: Edit3,
      title: "Edit/Update Dreams",
      description: "Modify existing dreams, add forgotten details, or update tags and moods.",
      color: "from-orange-500/20 to-amber-500/20",
      borderColor: "border-orange-400/30",
    },
    {
      icon: BarChart3,
      title: "Pattern Analysis",
      description: "Discover insights about your dream patterns, moods, and lucidity trends.",
      color: "from-green-500/20 to-emerald-500/20",
      borderColor: "border-green-400/30",
    },
    {
      icon: Sparkles,
      title: "Fun Insights",
      description: "Get entertaining interpretations and amusing observations about your dreams.",
      color: "from-pink-500/20 to-rose-500/20",
      borderColor: "border-pink-400/30",
    },
    {
      icon: AlarmClock,
      title: "Dream Alarms",
      description: "Set multiple morning alarms to help remember and record dreams upon waking.",
      color: "from-indigo-500/20 to-violet-500/20",
      borderColor: "border-indigo-400/30",
    },
  ];

  const [hoveredFeature, setHoveredFeature] = React.useState<number | null>(null);

  const benefits = [
    {
      icon: Brain,
      title: "Enhanced Dream Recall",
      description: "Regular recording improves your ability to remember dreams.",
    },
    {
      icon: Heart,
      title: "Self-Discovery",
      description: "Gain insights into your subconscious mind and emotions.",
    },
    {
      icon: Stars,
      title: "Lucid Dream Training",
      description: "Track and improve your lucid dreaming abilities.",
    },
    {
      icon: Shield,
      title: "Private & Secure",
      description: "All your data is stored locally on your device.",
    },
  ];

  return (
    <>
      {/* Background lives in a fixed layer so it sits behind the page content */}
      <CelestialBackground />

  <div className="relative z-10 max-w-6xl mx-auto">
      {/* Hero Section */}
      <motion.div
        className="text-center mb-16"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        {/* Logo and Title */}
        <div className="flex items-center justify-center gap-6 mb-8">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          >
            <CelestialLogo className="transform scale-150" />
          </motion.div>
          <div>
            <motion.h1
              className={`${cormorant.className} text-5xl md:text-6xl bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent mb-2`}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              Reverie
            </motion.h1>
            <motion.p
              className={`${cormorant.className} text-xl text-purple-300/80`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7, duration: 0.8 }}
            >
              Your Personal Dream Analysis Journal
            </motion.p>
          </div>
        </div>

        {/* Description */}
        <motion.div
          className="max-w-3xl mx-auto mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.8 }}
        >
          <p className="text-lg text-purple-200/90 mb-6 leading-relaxed">
            Embark on a journey through your subconscious mind with our comprehensive dream tracking 
            and analysis platform. Record, analyze, and discover the hidden patterns in your dreams 
            while maintaining a beautiful celestial journal that grows with every nights adventure.
          </p>
          <p className="text-lg text-purple-200/90 mb-6 leading-relaxed">
            Whether you are exploring lucid dreaming, seeking self-discovery, or simply curious about 
            your dream patterns, Reverie provides the tools you need to understand your sleeping mind.
          </p>
        </motion.div>

        {/* Stats */}
        {dreamCount > 0 && (
          <motion.div
            className="flex items-center justify-center gap-8 mb-8"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.1, duration: 0.6 }}
          >
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-6 py-3">
              <div className="text-2xl text-white mb-1">{dreamCount}</div>
              <div className="text-purple-200/80 text-sm">Dreams Recorded</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-6 py-3">
              <div className="text-2xl text-white mb-1">∞</div>
              <div className="text-purple-200/80 text-sm">Possibilities</div>
            </div>
          </motion.div>
        )}

        {/* CTA Button */}
        <motion.button
          className="group bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:from-purple-500 hover:via-pink-500 hover:to-indigo-500 text-white px-8 py-4 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-2xl hover:shadow-purple-500/25 border border-white/20"
          onClick={onGetStarted}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <div className="flex items-center gap-3">
            <Zap className="h-5 w-5" />
            <span className="text-lg">{buttonText}</span>
            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
          </div>
        </motion.button>
      </motion.div>

      {/* Features Grid */}
      <motion.section
        className="mb-16"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.8 }}
      >
        <div className="text-center mb-12">
          <h2 className={`${cormorant.className} text-4xl text-white mb-4`}>Powerful Features</h2>
          <p className="text-purple-200/90 max-w-2xl mx-auto">
            Everything you need to capture, analyze, and understand your dreams in one celestial platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <motion.div
                key={feature.title}
                className={`bg-gradient-to-br ${feature.color} backdrop-blur-md border ${feature.borderColor} rounded-2xl p-6 hover:shadow-2xl transition-all duration-300 group`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index, duration: 0.6 }}
                whileHover={{ scale: 1.02 }}
                onHoverStart={() => setHoveredFeature(index)}
                onHoverEnd={() => setHoveredFeature(null)}
              >
                <div className="flex items-center gap-3 mb-4">
                  <motion.div
                    className="p-3 bg-white/10 rounded-xl transition-colors duration-300"
                    animate={
                      hoveredFeature === index
                        ? {
                            backgroundColor: "rgba(255, 255, 255, 0.2)",
                            boxShadow: "0 0 18px rgba(255, 255, 255, 0.25)",
                          }
                        : {
                            backgroundColor: "rgba(255, 255, 255, 0.1)",
                            boxShadow: "0 0 0 rgba(0, 0, 0, 0)",
                          }
                    }
                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                  >
                    <motion.span
                      animate={{
                        filter:
                          hoveredFeature === index
                            ? "drop-shadow(0 0 10px rgba(255, 255, 255, 0.6))"
                            : "drop-shadow(0 0 0 rgba(0, 0, 0, 0))",
                        opacity: hoveredFeature === index ? 1 : 0.9,
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      <IconComponent
                        className={`h-6 w-6 transition-colors duration-300 ${
                          hoveredFeature === index ? "text-white" : "text-white/90"
                        }`}
                      />
                    </motion.span>
                  </motion.div>
                  <h3 className="text-white text-lg">{feature.title}</h3>
                </div>
                <p className="text-white/80">{feature.description}</p>
              </motion.div>
            );
          })}
        </div>
      </motion.section>

      {/* Benefits Section */}
      <motion.section
        className="mb-16"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.8 }}
      >
        <div className="text-center mb-12">
          <h2 className={`${cormorant.className} text-4xl text-white mb-4`}>Why Track Your Dreams?</h2>
          <p className="text-purple-200/90 max-w-2xl mx-auto">
            Discover the profound benefits of maintaining a consistent dream journal and unlock insights into your inner world.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {benefits.map((benefit, index) => {
            const IconComponent = benefit.icon;
            return (
              <motion.div
                key={benefit.title}
                className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300"
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl">
                    <IconComponent className="h-6 w-6 text-purple-200" />
                  </div>
                  <div>
                    <h3 className="text-white text-lg mb-2">{benefit.title}</h3>
                    <p className="text-purple-200/80">{benefit.description}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.section>

      {/* How It Works */}
      <motion.section
        className="mb-16"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.8 }}
      >
        <div className="text-center mb-12">
          <h2 className={`${cormorant.className} text-4xl text-white mb-4`}>How It Works</h2>
          <p className="text-purple-200/80 max-w-2xl mx-auto">
            Simple steps to start your dream tracking journey tonight.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              step: "1",
              title: "Set Your Alarms",
              description: "Configure morning alarms to remind you to record dreams immediately upon waking.",
              icon: AlarmClock,
            },
            {
              step: "2",
              title: "Record Your Dreams",
              description: "Capture dream details including description, mood, tags, and lucidity status.",
              icon: Plus,
            },
            {
              step: "3",
              title: "Discover Patterns",
              description: "Analyze your dream data to uncover fascinating insights and trends.",
              icon: BarChart3,
            },
          ].map((step, index) => {
            const IconComponent = step.icon;
            return (
              <motion.div
                key={step.step}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index, duration: 0.6 }}
              >
                <div className="relative mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white text-xl">{step.step}</span>
                  </div>
                  <div className="absolute -top-2 -right-2 p-2 bg-white/10 rounded-full">
                    <IconComponent className="h-4 w-4 text-purple-300" />
                  </div>
                </div>
                <h3 className="text-white text-lg mb-3">{step.title}</h3>
                <p className="text-purple-200/80">{step.description}</p>
              </motion.div>
            );
          })}
        </div>
      </motion.section>

      {/* Final CTA */}
      <motion.section
        className="text-center bg-gradient-to-br from-purple-600/10 via-pink-600/10 to-indigo-600/10 backdrop-blur-md border border-white/10 rounded-3xl p-12"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.9, duration: 0.8 }}
      >
        <div className="flex items-center justify-center gap-4 mb-6">
          <h2 className={`${cormorant.className} text-4xl text-white mb-4`}>Begin Your Dream Journey Tonight</h2>
        </div>
        <p className="text-purple-200/80 mb-8 max-w-2xl mx-auto">
          Your dreams are waiting to be discovered. Start building your celestial dream collection 
          and unlock the mysteries of your sleeping mind.
        </p>
        <motion.button
          className="group bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:from-purple-500 hover:via-pink-500 hover:to-indigo-500 text-white px-8 py-4 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-2xl hover:shadow-purple-500/25 border border-white/20"
          onClick={onGetStarted}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <div className="flex items-center gap-3">
            <Zap className="h-5 w-5" />
            <span className="text-lg">Get Started Now</span>
            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
          </div>
        </motion.button>
      </motion.section>
    </div>
      </>
  );
};

export default LandingPage;
