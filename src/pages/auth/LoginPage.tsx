import { Form, Input, Button, Typography, Divider } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import type { LoginRequest } from '@/types/auth.types'
import useLogin from './useLogin'

const { Text, Link } = Typography

const LoginPage = () => {
  const [form] = Form.useForm<LoginRequest>()
  const { login, isLoading } = useLogin()

  const handleSubmit = (values: LoginRequest) => {
    // console.log('Login payload:', values) 
    login(values)
  }

  return (
    <>
      <Text type="secondary" style={{ display: 'block', textAlign: 'center', marginBottom: 28 }}>
        Masuk ke akun Anda
      </Text>

      <Form
        form={form}
        initialValues={{
          email: 'andri.hermawan@fms.com',
          password: 'rmk2026',
        }}
        layout="vertical"
        onFinish={handleSubmit}
        requiredMark={false}
        size="large"
      >
        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: 'Email wajib diisi' },
            { type: 'email', message: 'Format email tidak valid' },
          ]}
        >
          <Input
            prefix={<UserOutlined style={{ color: '#bbb' }} />}
            placeholder="nama@perusahaan.com"
            autoComplete="email"
            value="andri.hermawan@fms.com"
            autoFocus
          />
        </Form.Item>

        <Form.Item
          name="password"
          label="Password"
          rules={[
            { required: true, message: 'Password wajib diisi' },
            { min: 6, message: 'Password minimal 6 karakter' },
          ]}
        >
          <Input.Password
            prefix={<LockOutlined style={{ color: '#bbb' }} />}
            placeholder="••••••••"
            autoComplete="current-password"
          />
        </Form.Item>

        <div style={{ textAlign: 'right', marginTop: -16, marginBottom: 16 }}>
          <Link style={{ fontSize: 13 }}>Lupa password?</Link>
        </div>

        <Form.Item style={{ marginBottom: 0 }}>
          <Button
            type="primary"
            htmlType="submit"
            loading={isLoading}
            block
            style={{ height: 44, fontWeight: 500 }}
          >
            {isLoading ? 'Memproses...' : 'Masuk'}
          </Button>
        </Form.Item>
      </Form>

      <Divider style={{ margin: '20px 0' }} />

      <Text type="secondary" style={{ display: 'block', textAlign: 'center', fontSize: 12 }}>
        HORSE © {new Date().getFullYear()}
      </Text>
    </>
  )
}

export default LoginPage
