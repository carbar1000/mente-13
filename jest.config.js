/** @type {import('jest').Config} */
export default {
  verbose: true,
  testEnvironment: 'jsdom',
  globals: {
    "BABEL_ENV": "test"
  },
};