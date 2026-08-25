interface ColorTheme {
  background1: string;
  background2: string;
  background3: string;
  background4: string;

  foreground1: string;
  foreground2: string;
  foreground3: string;
  foreground4: string;

  red: string;
  blue: string;
  yellow: string;
  orange: string;
  green: string;
  indigo: string;
  purple: string;
  pink: string;
  white: string;
  black: string;
}

export class DarkTheme implements ColorTheme {
  background1 = '#0f172a';
  background2 = '#1e293b';
  background3 = '#334155';
  background4 = '#475569';

  foreground1 = '#f8fafc';
  foreground2 = '#e2e8f0';
  foreground3 = '#cbd5e1';
  foreground4 = '#94a3b8';

  red = '#f87171';
  blue = '#60a5fa';
  yellow = '#facc15';
  orange = '#fb923c';
  green = '#4ade80';
  indigo = '#818cf8';
  purple = '#c084fc';
  pink = '#f472b6';
  white = '#ffffff';
  black = '#000000';
}

export class LightTheme implements ColorTheme {
  background1 = '#ffffff';
  background2 = '#f8fafc';
  background3 = '#f1f5f9';
  background4 = '#e2e8f0';

  foreground1 = '#0f172a';
  foreground2 = '#1e293b';
  foreground3 = '#475569';
  foreground4 = '#64748b';

  red = '#dc2626';
  blue = '#2563eb';
  yellow = '#ca8a04';
  orange = '#ea580c';
  green = '#16a34a';
  indigo = '#4f46e5';
  purple = '#9333ea';
  pink = '#db2777';
  white = '#ffffff';
  black = '#000000';
  
}