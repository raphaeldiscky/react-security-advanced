module.exports = () => ({
  plugins: [require('tailwindcss')],
  purge: ['./src/**/*.js', './src/**/*.jsx', './src/**/*.ts', './src/**/*.tsx'],
  theme: {},
  variants: {},
});
