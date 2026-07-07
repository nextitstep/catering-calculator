import { createDarkTheme, createLightTheme, type BrandVariants, type Theme } from '@fluentui/react-components';

const brand: BrandVariants = {
  10: '#010b14',
  20: '#011b2f',
  30: '#022a49',
  40: '#033a64',
  50: '#03497f',
  60: '#02599b',
  70: '#0268b7',
  80: '#0078d4',
  90: '#0a8aec',
  100: '#2699f1',
  110: '#4ba7ed',
  120: '#6fb5ea',
  130: '#93c3e8',
  140: '#b3d2e9',
  150: '#d1e1ec',
  160: '#eaeff3',
};

export const lightTheme: Theme = createLightTheme(brand);
export const darkTheme: Theme = createDarkTheme(brand);

darkTheme.colorBrandForeground1 = brand[110];
darkTheme.colorBrandForeground2 = brand[120];
