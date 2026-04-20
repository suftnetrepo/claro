import { palettes } from 'fluent-styles'

export type ThemeKey = 'forest' | 'ocean' | 'sunset' | 'midnight'

export interface AppColors {
  // Brand
  primary:       string
  primaryDark:   string
  primaryLight:  string
  accent:        string
  // Backgrounds
  bg:            string
  bgCard:        string
  bgInput:       string
  bgMuted:       string
  // Text
  textPrimary:   string
  textSecondary: string
  textMuted:     string
  textOnDark:    string
  // Transaction types
  income:        string
  expense:       string
  transfer:      string
  incomeLight:   string
  expenseLight:  string
  transferLight: string
  // Borders
  border:        string
  borderFocus:   string
  // Status
  success:       string
  warning:       string
  error:         string
  info:          string
  // PIN
  pinFilled:     string
  pinEmpty:      string
  pinError:      string
  // Misc
  white:         string
}

// ─── Forest (default green) ───────────────────────────────────────────────────
export const ForestTheme: AppColors = {
  primary:       palettes.green[700],
  primaryDark:   palettes.green[900],
  primaryLight:  palettes.green[400],
  accent:        palettes.green[100],
  bg:            palettes.warmGray[100],
  bgCard:        palettes.white,
  bgInput:       palettes.warmGray[100],
  bgMuted:       palettes.warmGray[200],
  textPrimary:   palettes.gray[900],
  textSecondary: palettes.gray[600],
  textMuted:     palettes.gray[400],
  textOnDark:    palettes.white,
  income:        palettes.green[800],
  expense:       palettes.red[800],
  transfer:      palettes.blue[800],
  incomeLight:   palettes.green[50],
  expenseLight:  palettes.red[50],
  transferLight: palettes.blue[50],
  border:        palettes.warmGray[200],
  borderFocus:   palettes.green[700],
  success:       palettes.green[700],
  warning:       palettes.amber[600],
  error:         palettes.red[700],
  info:          palettes.blue[600],
  pinFilled:     palettes.green[700],
  pinEmpty:      palettes.warmGray[300],
  pinError:      palettes.red[700],
  white:         palettes.white,
}

// ─── Ocean (blue) ─────────────────────────────────────────────────────────────
export const OceanTheme: AppColors = {
  primary:       palettes.blue[700],
  primaryDark:   palettes.blue[900],
  primaryLight:  palettes.blue[400],
  accent:        palettes.blue[50],
  bg:            palettes.blueGray[100],
  bgCard:        palettes.white,
  bgInput:       palettes.blueGray[100],
  bgMuted:       palettes.blueGray[200],
  textPrimary:   palettes.blueGray[900],
  textSecondary: palettes.blueGray[600],
  textMuted:     palettes.blueGray[400],
  textOnDark:    palettes.white,
  income:        palettes.teal[700],
  expense:       palettes.red[700],
  transfer:      palettes.indigo[700],
  incomeLight:   palettes.teal[50],
  expenseLight:  palettes.red[50],
  transferLight: palettes.indigo[50],
  border:        palettes.blueGray[200],
  borderFocus:   palettes.blue[700],
  success:       palettes.teal[700],
  warning:       palettes.amber[600],
  error:         palettes.red[700],
  info:          palettes.blue[600],
  pinFilled:     palettes.blue[700],
  pinEmpty:      palettes.blueGray[300],
  pinError:      palettes.red[700],
  white:         palettes.white,
}

// ─── Sunset (orange/amber) ────────────────────────────────────────────────────
export const SunsetTheme: AppColors = {
  primary:       palettes.orange[700],
  primaryDark:   palettes.orange[900],
  primaryLight:  palettes.orange[400],
  accent:        palettes.orange[50],
  bg:            palettes.warmGray[100],
  bgCard:        palettes.white,
  bgInput:       palettes.warmGray[100],
  bgMuted:       palettes.warmGray[200],
  textPrimary:   palettes.warmGray[900],
  textSecondary: palettes.warmGray[600],
  textMuted:     palettes.warmGray[400],
  textOnDark:    palettes.white,
  income:        palettes.green[700],
  expense:       palettes.red[700],
  transfer:      palettes.blue[700],
  incomeLight:   palettes.green[50],
  expenseLight:  palettes.red[50],
  transferLight: palettes.blue[50],
  border:        palettes.warmGray[200],
  borderFocus:   palettes.orange[700],
  success:       palettes.green[700],
  warning:       palettes.amber[500],
  error:         palettes.red[700],
  info:          palettes.blue[600],
  pinFilled:     palettes.orange[700],
  pinEmpty:      palettes.warmGray[300],
  pinError:      palettes.red[700],
  white:         palettes.white,
}

// ─── Midnight (dark mode) ─────────────────────────────────────────────────────
export const MidnightTheme: AppColors = {
  primary:       palettes.indigo[400],
  primaryDark:   palettes.indigo[600],
  primaryLight:  palettes.indigo[300],
  accent:        palettes.indigo[900],
  bg:            palettes.blueGray[900],
  bgCard:        palettes.blueGray[800],
  bgInput:       palettes.blueGray[700],
  bgMuted:       palettes.blueGray[700],
  textPrimary:   palettes.blueGray[50],
  textSecondary: palettes.blueGray[300],
  textMuted:     palettes.blueGray[500],
  textOnDark:    palettes.white,
  income:        palettes.emerald[400],
  expense:       palettes.red[400],
  transfer:      palettes.blue[400],
  incomeLight:   palettes.emerald[900],
  expenseLight:  palettes.red[900],
  transferLight: palettes.blue[900],
  border:        palettes.blueGray[700],
  borderFocus:   palettes.indigo[400],
  success:       palettes.emerald[400],
  warning:       palettes.amber[400],
  error:         palettes.red[400],
  info:          palettes.blue[400],
  pinFilled:     palettes.indigo[400],
  pinEmpty:      palettes.blueGray[600],
  pinError:      palettes.red[400],
  white:         palettes.white,
}

export const THEMES: Record<ThemeKey, AppColors> = {
  forest:   ForestTheme,
  ocean:    OceanTheme,
  sunset:   SunsetTheme,
  midnight: MidnightTheme,
}

export const THEME_META: Record<ThemeKey, { label: string; emoji: string; preview: string[] }> = {
  forest:   { label: 'Forest',   emoji: '🌿', preview: [palettes.green[700],  palettes.green[400],  palettes.warmGray[50]] },
  ocean:    { label: 'Ocean',    emoji: '🌊', preview: [palettes.blue[700],   palettes.blue[400],   palettes.blueGray[50]] },
  sunset:   { label: 'Sunset',   emoji: '🌅', preview: [palettes.orange[700], palettes.orange[400], palettes.warmGray[50]] },
  midnight: { label: 'Midnight', emoji: '🌙', preview: [palettes.indigo[400], palettes.indigo[300], palettes.blueGray[900]] },
}
