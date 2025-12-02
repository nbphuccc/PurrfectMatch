module.exports = {
    preset: 'jest-expo',
    transformIgnorePatterns: [
        'node_modules/(?!(jest-)?react-native|@react-native|react-native|@react-navigation|@expo|expo|@unimodules|unimodules|@firebase|firebase)'
    ],
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
    moduleFileExtensions: ['js', 'ts', 'tsx', 'jsx'],
    testMatch: ['**/__tests__/**/*.(test|spec).(js|ts|tsx)'],
};
