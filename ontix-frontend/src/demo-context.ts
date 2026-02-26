export type DemoId = 'twm' | 'carrefour'
export const DEMO_ID: DemoId = window.location.pathname.includes('/carrefour') ? 'carrefour' : 'twm'
