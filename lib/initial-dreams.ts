import type { Dream } from '@/components/dream-entry';

export const INITIAL_DREAMS: Dream[] = [
  {
    id: '1',
    date: '2025-10-26T00:00:00.000Z',
    title: 'Flying over mountains',
    mood: 'peaceful',
    description:
      'I was gliding effortlessly above snow-capped mountains at sunset. The air felt crisp and the sky painted in shades of purple and gold.',
    analysis: 'This dream suggests a desire for freedom and perspective in your life.',
    tags: ['flying', 'mountains', 'sunset'],
    lucidity: true,
  },
  {
    id: '2',
    date: '2025-10-25T00:00:00.000Z',
    title: 'Ocean waves',
    mood: 'calm',
    description:
      'I stood by a quiet shoreline at night, listening to rhythmic waves while constellations shimmered above. The water glowed softly.',
    analysis: 'Water often represents emotions; calm waves suggest emotional balance.',
    tags: ['ocean', 'night', 'stars'],
    lucidity: false,
  },
];
