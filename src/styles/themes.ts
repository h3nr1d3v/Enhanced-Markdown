import { Theme } from '../types';

export const themes: Theme[] = [
  {
    name: 'Light Pastel',
    className: 'theme-light-pastel',
    bgColor: 'bg-[#f5f5f5]',
    textColor: 'text-gray-800',
    accentColor: 'bg-[#b5c9c3]'
  },
  {
    name: 'Soft Lavender',
    className: 'theme-soft-lavender',
    bgColor: 'bg-[#f3e5f5]',
    textColor: 'text-gray-900',
    accentColor: 'bg-[#ce93d8]'
  },
  {
    name: 'Mint Dream',
    className: 'theme-mint-dream',
    bgColor: 'bg-[#e0f2f1]',
    textColor: 'text-gray-900',
    accentColor: 'bg-[#80cbc4]'
  },
  {
    name: 'Peach Cream',
    className: 'theme-peach-cream',
    bgColor: 'bg-[#fbe9e7]',
    textColor: 'text-gray-900',
    accentColor: 'bg-[#ffab91]'
  }
];

export const viewModes = [
  {
    name: 'Blog',
    className: 'prose-blog'
  },
  {
    name: 'Wiki',
    className: 'prose-wiki'
  },
  {
    name: 'Portfolio',
    className: 'prose-portfolio'
  }
];