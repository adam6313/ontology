/**
 * Demo Mode — router that dynamically loads the correct demo data
 * based on the current URL pathname.
 *
 * Import this file in main.tsx to activate: import './demo'
 */
import { DEMO_ID } from './demo-context'

if (DEMO_ID === 'carrefour') {
  await import('./demo-carrefour')
} else {
  await import('./demo-twm')
}
