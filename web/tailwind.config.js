/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0B0F14',
        side: '#0F141A',
        panel: '#111820',
        card: '#161F2A',
        line: '#24303D',
        txt: '#E6EDF3',
        sub: '#8B98A5',
        cyan: { DEFAULT: '#22D3EE' },
        violet: { DEFAULT: '#7C3AED' },
        ok: '#22C55E',
        warn: '#F59E0B',
        err: '#EF4444',
      },
      fontFamily: {
        sans: ['Inter', 'HarmonyOS Sans SC', 'Source Han Sans SC', 'PingFang SC', 'Microsoft YaHei', 'sans-serif'],
        mono: ['JetBrains Mono', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [],
}
