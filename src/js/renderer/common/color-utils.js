import * as d3 from "d3";

export default class ColorUtils {
    static getProbabilityColor(probability, args) {
        // const isLightTheme = window.matchMedia?.('(prefers-color-scheme: light)').matches;

        const lightness = args?.lightness ?? 0.5; // isLightTheme ? 0.65 : 0.5;
        const saturation = args?.saturation ?? 0.7; // isLightTheme ? 0.9 : 0.7;
        const opacity = args?.opacity ?? 1;
        // blue (0%) → purple (50%) → red (100%)
        const interpolator = d3.interpolateHsl(
            d3.hsl(240, saturation, lightness, opacity),  // blue (hue=240°)
            d3.hsl(360, saturation, lightness, opacity)   // red (hue=360°)
        );

        // Correct to make 50% purple (~270°).
        // easing-function for not linear transition
        const easedProbability = probability < 0.5
            ? probability * 0.6  // slowing down the first half
            : 0.3 + (probability - 0.5) * 1.4; // speeding up the second

        return interpolator(easedProbability);
    }

    //static #getProbabilityColor(probability) {
    //   // 120 - red
    //   const hue = Math.round(probability * 120);
    //   return `hsla(${hue}, 70%, 50%)`;
    // }
}