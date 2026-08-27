import ReactDOM from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { ConfigProvider } from 'antd'
import idID from 'antd/locale/id_ID'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/id'

import rmkoLogo from '@/assets/rmko/RMKO_logo.svg'

import '@/services/http'
import App from './App'
import queryClient from '@/config/queryClient'
import antdTheme from '@/config/antd.theme'

import 'leaflet/dist/leaflet.css'
import 'leaflet-draw/dist/leaflet.draw.css'

import './index.css'

// Set favicon dari logo aplikasi
const favicon = document.createElement('link')
favicon.rel = 'icon'
favicon.type = 'image/svg+xml'
favicon.href = rmkoLogo
document.head.appendChild(favicon)

dayjs.locale('id')
dayjs.extend(relativeTime)

ReactDOM.createRoot(
  document.getElementById('root')!,
).render(
  <QueryClientProvider client={queryClient}>
    <ConfigProvider
      theme={antdTheme}
      locale={idID}
    >
      <App />
    </ConfigProvider>
  </QueryClientProvider>,
)