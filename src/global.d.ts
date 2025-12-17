/// <reference types="next" />
/// <reference types="next/image-types/global" />

// CSS modules
declare module "*.module.css" {
  const classes: { readonly [key: string]: string }
  export default classes
}

declare module "*.module.scss" {
  const classes: { readonly [key: string]: string }
  export default classes
}

declare module "*.module.sass" {
  const classes: { readonly [key: string]: string }
  export default classes
}

// CSS imports
declare module "*.css"
declare module "*.scss"
declare module "*.sass"
declare module "*.less"

// Images
declare module "*.png"
declare module "*.jpg"
declare module "*.jpeg"
declare module "*.gif"
declare module "*.webp"
declare module "*.avif"
declare module "*.ico"
declare module "*.bmp"
declare module "*.svg"

// Fonts
declare module "*.woff"
declare module "*.woff2"
declare module "*.eot"
declare module "*.ttf"
declare module "*.otf"

// Global types
declare global {
  interface Window {
    speechSynthesis: SpeechSynthesis
  }
}

export {}