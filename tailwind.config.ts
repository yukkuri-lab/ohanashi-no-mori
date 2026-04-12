import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          50:  '#f0f7f2',
          100: '#d9edde',
          200: '#afd4ba',
          300: '#7db994',
          400: '#4d9e6e',
          500: '#3a8058',
          600: '#2d6645',
          700: '#224f35',
          800: '#183a26',
          900: '#0f2619',
        },
        cream: {
          50:  '#fdfaf3',
          100: '#faf6ea',
          200: '#f4ecd4',
          300: '#ece0bb',
        },
        bark: {
          400: '#a0724a',
          500: '#8b5e3c',
          600: '#6b4423',
        },
      },
      fontFamily: {
        maru: ['var(--font-maru)', '"Hiragino Maru Gothic Pro"', 'sans-serif'],
      },
      keyframes: {
        floatY: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':       { transform: 'translateY(-10px)' },
        },
        fadeInUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        popIn: {
          '0%':   { opacity: '0', transform: 'scale(0.8)' },
          '70%':  { transform: 'scale(1.05)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        titleReveal: {
          '0%':   { opacity: '0', transform: 'scale(0.5) translateY(20px)' },
          '60%':  { transform: 'scale(1.12) translateY(-4px)' },
          '80%':  { transform: 'scale(0.97) translateY(2px)' },
          '100%': { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(40px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        // アリさんが右から歩いてきて中央で止まるアニメーション
        walkInFromRight: {
          '0%':   { transform: 'translateX(110vw) scaleX(-1)', opacity: '0' },
          '4%':   { opacity: '1' },
          '15%':  { transform: 'translateX(85vw) translateY(-6px) scaleX(-1)' },
          '28%':  { transform: 'translateX(62vw) translateY(0px) scaleX(-1)' },
          '41%':  { transform: 'translateX(42vw) translateY(-6px) scaleX(-1)' },
          '54%':  { transform: 'translateX(24vw) translateY(0px) scaleX(-1)' },
          '67%':  { transform: 'translateX(11vw) translateY(-6px) scaleX(-1)' },
          '78%':  { transform: 'translateX(3vw)  translateY(0px) scaleX(-1)' },
          // 中央に到着・向きを戻してぴたっと止まる
          '86%':  { transform: 'translateX(0) scaleX(-1)' },
          '100%': { transform: 'translateX(0) scaleX(1)', opacity: '1' },
        },
      },
      animation: {
        floatY:          'floatY 3s ease-in-out infinite',
        fadeInUp:        'fadeInUp 0.5s ease-out both',
        popIn:           'popIn 0.4s ease-out both',
        slideUp:         'slideUp 0.5s ease-out both',
        walkInFromRight: 'walkInFromRight 1.8s ease-out both',
        titleReveal:     'titleReveal 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) both',
      },
    },
  },
  plugins: [],
}
export default config
