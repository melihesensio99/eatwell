import { Platform } from 'react-native';

export const colors = {
  cream: '#F6EBD8', paper: '#FFF8EC', espresso: '#2B211C', orange: '#C85A32',
  mustard: '#D6A928', teal: '#4C8580', coral: '#D97962', plum: '#704052', line: 'rgba(43,33,28,.16)',
};

export const type = {
  body: Platform.select({ ios: 'Avenir Next', android: 'sans-serif', default: 'System' }),
  display: Platform.select({ ios: 'Georgia', android: 'serif', default: 'Georgia' }),
};
