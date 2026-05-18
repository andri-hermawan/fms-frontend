import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { ConfigProvider } from 'antd'
import idID from 'antd/locale/id_ID'
import dayjs from 'dayjs'
import 'dayjs/locale/id'
import relativeTime from 'dayjs/plugin/relativeTime'

import '@/services/http'           // ← daftarkan interceptors
import App from './App'
import queryClient from '@/config/queryClient'
import antdTheme from '@/config/antd.theme'
import 'leaflet/dist/leaflet.css'
import './index.css'

dayjs.locale('id')
dayjs.extend(relativeTime)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ConfigProvider theme={antdTheme} locale={idID}>
        <App />
      </ConfigProvider>
    </QueryClientProvider>
  </React.StrictMode>
)
