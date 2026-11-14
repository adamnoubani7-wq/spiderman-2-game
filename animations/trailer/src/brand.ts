import { continueRender, delayRender, staticFile } from 'remotion';

// Stick Science Lab tokens (DESIGN.md stage 1), taken from the reel, thumbnail and icon.
export const C = {
  ink: '#221c22', inkDim: '#5f5862', red: '#d8312b', blue: '#2457c9', sky: '#6cc6ff',
  yellow: '#ffe14d', paper: '#f7f4ee',
};
export const POP = 'Poppins, "Helvetica Neue", Arial, sans-serif';
export const INTER = 'Inter, "Helvetica Neue", Arial, sans-serif';

// Load the fonts once before any frame renders.
const handle = delayRender('brand fonts', { timeoutInMilliseconds: 120000 });
Promise.all(
  [
    new FontFace('Poppins', `url(${staticFile('fonts/Poppins-Bold.ttf')})`, { weight: '700' }),
    new FontFace('Inter', `url(${staticFile('fonts/inter-500-normal.woff2')})`, { weight: '500' }),
    new FontFace('Inter', `url(${staticFile('fonts/inter-600-normal.woff2')})`, { weight: '600' }),
  ].map((f) => f.load().then((ff) => document.fonts.add(ff))),
).then(() => continueRender(handle), () => continueRender(handle));
