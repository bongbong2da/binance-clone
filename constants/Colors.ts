/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */


const primaryBlack = '#0B0E11';
const secondaryBlack = '#1E2329';
const primaryColor = '#F0B90B';
const secondaryColor ='#FCD535';
const greyColor ='#EAECEF';
const primaryWhite = '#FAFAFA';
const white = '#FFFFFF';

const positiveCandleColor = '#00C087';
const negativeCandleColor = '#FF3B30';

export const Colors = {
  light: {
    text: primaryBlack,
    background: primaryWhite,
    tint: primaryColor,
    icon: primaryBlack,
    tabIconDefault: greyColor,
    tabIconSelected: primaryBlack,
  },
  dark: {
    text: primaryWhite,
    background: secondaryBlack,
    tint: primaryColor,
    icon: primaryWhite,
    tabIconDefault: greyColor,
    tabIconSelected: primaryWhite,
  },
  positiveCandleColor,
  negativeCandleColor
};
