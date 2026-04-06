import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
  },
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => {
      const translations = {
        'about.story_p7': 'I want it to actually work.',
        'about.story_intro_label': 'My story',
        'about.story_lead': 'Understanding, building, and pushing ideas until they truly work.',
        'about.story_year_present': 'Now',
        'about.story_block_1_title': 'From understanding to building',
        'about.story_block_2_title': 'Technology lived firsthand',
        'about.story_block_3_title': 'What I do today',
        'about.story_short_1': 'I started in Pedagogy.',
        'about.story_short_2': 'Forums, servers, and Raspberry Pi shaped my foundation.',
        'about.story_short_3': 'Today I build full stack applications and integrate AI.',
        'about.tab_diff': 'Difference',
        'about.diff_panel_title': 'What makes me different',
        'about.diff_panel_subtitle': 'A practical and thoughtful way of building.',
        'about.diff_detail_title': 'Detail',
        'about.diff_detail': 'I care about details.',
        'about.diff_selflearner_title': 'Self learner',
        'about.diff_selflearner': 'I keep learning constantly.',
        'about.diff_pedagogy_title': 'Pedagogy',
        'about.diff_pedagogy': 'I explain complex things clearly.',
      };

      return translations[key] ?? key;
    },
    i18n: { language: 'en', resolvedLanguage: 'en' },
  }),
}));

import ProfileStorySection from './ProfileStorySection';

describe('ProfileStorySection', () => {
  it('renderiza el timeline narrativo también en inglés', () => {
    render(<ProfileStorySection />);

    expect(screen.getByText('My story')).toBeInTheDocument();
    expect(screen.getByText('From understanding to building')).toBeInTheDocument();
    expect(screen.getByText('Technology lived firsthand')).toBeInTheDocument();
    expect(screen.getByText('What I do today')).toBeInTheDocument();
    expect(screen.getByText('Now')).toBeInTheDocument();
  });
});
