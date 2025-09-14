# Whiskr

A React Native app built with Expo and TypeScript.

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm or yarn
- Expo CLI (optional, but recommended)
- iOS Simulator (for iOS development)
- Android Studio (for Android development)

### Installation

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm start
   ```

### Available Scripts

- `npm start` - Start the Expo development server
- `npm run android` - Run on Android device/emulator
- `npm run ios` - Run on iOS device/simulator
- `npm run web` - Run in web browser
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors automatically
- `npm run format` - Format code with Prettier
- `npm run type-check` - Run TypeScript type checking

### Project Structure

```
whiskr/
├── App.tsx              # Main app component
├── assets/              # Images, fonts, and other assets
├── components/          # Reusable components
├── screens/             # Screen components
├── navigation/          # Navigation configuration
├── utils/               # Utility functions
└── types/               # TypeScript type definitions
```

### Development

This project uses:

- **Expo** for React Native development
- **TypeScript** for type safety
- **ESLint** for code linting
- **Prettier** for code formatting
- **React Navigation** for navigation

### Building for Production

To build for production:

1. **iOS**: Use EAS Build or build locally with Xcode
2. **Android**: Use EAS Build or build locally with Android Studio
3. **Web**: Run `npm run web` and build the web output

For more information, visit the [Expo documentation](https://docs.expo.dev/).
