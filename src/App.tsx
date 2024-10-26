import Encoding from './components/encoding'
import Header from './components/header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card'
import { Github } from 'lucide-react'
import { useTheme } from '@/components/theme-provider'
import { ModeToggle } from './components/mode-toggle'
import Particles from './components/ui/particles'
import { useEffect, useState } from 'react'
import logo from './assets/logo.svg'

function App() {
  const { theme } = useTheme()
  const [color, setColor] = useState('#ffffff')
  const [enabledParticles, setEnabledParticles] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    enabledParticles ? setColor(theme === 'dark' ? '#ffffff' : '#000000') : setColor(theme === 'dark' ? '#000000' : '#ffffff')
  }, [theme, enabledParticles])

  return (
    <div className='flex flex-col justify-center items-center h-full gap-6'>
      <Header>
        <div className='flex items-center justify-center gap-2'>
          <div className='p-2 text-muted-foreground cursor-pointer' onClick={() => setEnabledParticles(!enabledParticles)}>
            <img src={logo} width={28} height={28} />
          </div>
          <h1 className='font-bold text-2xl'>Data Encoding Techniques</h1>
        </div>
        <div className='flex gap-8 justify-center items-center'>
          <ModeToggle />
          <a href='https://github.com/HoneyHanny/encoding-techniques'>
            <div className='rounded-full border p-2.5 shadow'>
              <Github width={16} height={16} />
            </div>
          </a>
        </div>
      </Header>
      <Card className='w-full max-w-4xl'>
        <CardHeader>
          <CardTitle>CS 323</CardTitle>
          <CardDescription>Data Communications and Networking</CardDescription>
        </CardHeader>
        <CardContent className='flex flex-col'>
          <p className='font-bold mt-1'>Laboratory Exercise 9</p>
          <p>
            <span className='font-semibold'>Name:</span> Hans Emmanuel E. Duran
          </p>
          <p>
            <span className='font-semibold'>Section:</span> F2
          </p>
          <p>
            <span className='font-semibold'>Year:</span> 4
          </p>
        </CardContent>
      </Card>
      <Encoding />
      <Particles className='absolute inset-0' quantity={100} ease={80} color={color} refresh />
    </div>
  )
}

export default App
