/**
 * Project: EasyInvoice
 * File: main.tsx
 * Description: 应用入口文件
 * Author: Ja4tin (ja4tin@hotmail.com)
 * Date: 2026-02-04
 * License: MIT
 */

import './polyfills'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { MobileUpload } from '@/features/mobile/MobileUpload'

const isMobileUpload = window.location.pathname === '/mobile-upload';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isMobileUpload ? <MobileUpload /> : <App />}
  </StrictMode>,
)
