module.exports = {
  moduleFileExtensions: ['ts', 'js'],
  transform: {
    '.(ts|tsx)': 'ts-jest',
  },
  globals: {
    'ts-jest': {
      compiler: 'ttypescript',
    },
  },
  testPathIgnorePatterns: [
    '/__data__/',
    '<rootDir>/dist/',
    '<rootDir>/node_modules/',
  ],
};
