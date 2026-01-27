export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      colors: {
        devfile: {
          primary: '#4A90E2',
          secondary: '#50E3C2',
          accent: '#F5A623'
        }
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms')
  ],
}
