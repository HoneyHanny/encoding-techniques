'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { ChartContainer } from '@/components/ui/chart'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts'
import { RadioGroup, RadioGroupItem } from './ui/radio-group'
import { useTheme } from './theme-provider'

type EncodingType = 'NRZ-L' | 'NRZ-I' | 'Bipolar AMI' | 'Pseudoternary' | 'Manchester' | 'Differential Manchester'

type Y = -1 | 0 | 1
type X = '|' | 'initial' | 1 | 0 | '1' | '0'

interface TimePoint {
  time: X
  'NRZ-L': Y
  'NRZ-I': Y
  'Bipolar AMI': Y
  Pseudoternary: Y
  Manchester: Y
  'Differential Manchester': Y
}

const invert = (data: Y): Y => {
  return data === 1 ? -1 : data === -1 ? 1 : data
}

// #region Generate Encoding Data
const generateEncodingData = (binary: string, initialSignal: Y): TimePoint[] => {
  if (binary.length === 0) {
    return [
      {
        time: 0,
        'NRZ-L': 0,
        'NRZ-I': 0,
        'Bipolar AMI': 0,
        Pseudoternary: 0,
        Manchester: 0,
        'Differential Manchester': 0,
      },
    ]
  }

  const data: TimePoint[] = []
  let nrzI: Y = initialSignal
  let bipolarAMI: Y = initialSignal
  let pseudoternary: Y = initialSignal
  let diffManchester: Y = initialSignal

  const transitionDiffManchesterMid = (): Y => {
    diffManchester = invert(diffManchester)
    return diffManchester
  }

  // Add initial point for potential transitions at the start
  const initialPoint: TimePoint = {
    time: 'initial',
    // 'NRZ-L': parseInt(binary[0]) ? 1 : -1,
    'NRZ-L': initialSignal,
    'NRZ-I': nrzI,
    'Bipolar AMI': bipolarAMI,
    Pseudoternary: pseudoternary,
    // Manchester: parseInt(binary[0]) ? -1 : 1,
    Manchester: initialSignal,
    'Differential Manchester': diffManchester,
  }
  data.push(initialPoint)

  // // Update states for next bit
  // if (parseInt(binary[0]) === 1) {
  //   nrzI = invert(nrzI)
  //   bipolarAMI = invert(bipolarAMI)
  // } else {
  //   pseudoternary = invert(pseudoternary)
  //   diffManchester = invert(diffManchester)
  // }

  for (let i = 0; i < binary.length; i++) {
    const bit = parseInt(binary[i])

    // Update states for next bit
    if (bit === 1) {
      nrzI = invert(nrzI)
      bipolarAMI = invert(bipolarAMI)
    } else {
      pseudoternary = invert(pseudoternary)
      diffManchester = invert(diffManchester)
    }

    // Start of bit
    const startPoint: TimePoint = {
      time: '|',
      'NRZ-L': bit ? 1 : -1,
      'NRZ-I': nrzI,
      'Bipolar AMI': bit ? bipolarAMI : 0,
      Pseudoternary: bit ? 0 : pseudoternary,
      Manchester: bit ? -1 : 1,
      'Differential Manchester': diffManchester,
    }

    // Only push the start point if it's different from the previous point
    if (i === 0 || JSON.stringify(startPoint) !== JSON.stringify(data[data.length - 1])) {
      data.push(startPoint)
    }

    // Middle of bit
    const midPoint: TimePoint = {
      time: bit as X,
      'NRZ-L': startPoint['NRZ-L'],
      'NRZ-I': startPoint['NRZ-I'],
      'Bipolar AMI': startPoint['Bipolar AMI'],
      Pseudoternary: startPoint['Pseudoternary'],
      Manchester: invert(startPoint['Manchester']),
      'Differential Manchester': transitionDiffManchesterMid(),
    }
    data.push(midPoint)
  }

  // Add final point to complete the last cycle
  const finalPoint: TimePoint = {
    time: '|',
    'NRZ-L': data[data.length - 1]['NRZ-L'],
    'NRZ-I': data[data.length - 1]['NRZ-I'],
    'Bipolar AMI': data[data.length - 1]['Bipolar AMI'],
    Pseudoternary: data[data.length - 1]['Pseudoternary'],
    Manchester: data[data.length - 1]['Manchester'],
    'Differential Manchester': data[data.length - 1]['Differential Manchester'],
  }
  data.push(finalPoint)

  return data
}

// #region Component
export default function Component() {
  const theme = useTheme()

  const stroke =
    theme.theme === 'light'
      ? '#d4d4d8'
      : theme.theme === 'dark'
      ? '#3f3f46'
      : window.matchMedia('(prefers-color-scheme: dark)').matches
      ? '#3f3f46'
      : '#d4d4d8'

  const [initialSignal, setInitialSignal] = useState<string>('1')
  const [binary, setBinary] = useState('10110')
  const [data, setData] = useState<TimePoint[]>([])
  const [selectedEncodings, setSelectedEncodings] = useState<EncodingType[]>([
    'NRZ-L',
    'NRZ-I',
    'Bipolar AMI',
    'Pseudoternary',
    'Manchester',
    'Differential Manchester',
  ])

  useEffect(() => {
    setData(generateEncodingData(binary, parseInt(initialSignal) as Y))
  }, [binary, initialSignal])

  const encodingTypes: EncodingType[] = ['NRZ-L', 'NRZ-I', 'Bipolar AMI', 'Pseudoternary', 'Manchester', 'Differential Manchester']

  const toggleEncoding = (encoding: EncodingType) => {
    setSelectedEncodings(prev => (prev.includes(encoding) ? prev.filter(e => e !== encoding) : [...prev, encoding]))
  }

  return (
    <Card className='w-full max-w-4xl'>
      <CardHeader className='text-center'>
        <CardTitle>Signal Encoding Techniques Visualization</CardTitle>
        <CardDescription>Enter a binary number and select encoding techniques to visualize</CardDescription>
      </CardHeader>
      <CardContent>
        <div className='mb-4 flex gap-24 px-12'>
          <div>
            <Label htmlFor='initial-bit'>Initial Signal</Label>
            <RadioGroup id='initial-bit' className='flex gap-4 items-center mt-2' value={initialSignal} onValueChange={setInitialSignal}>
              <>
                <RadioGroupItem value={'1'} id='high' />
                <Label htmlFor='high'>1</Label>
              </>
              <>
                <RadioGroupItem value={'-1'} id='low' />
                <Label htmlFor='low'>-1</Label>
              </>
            </RadioGroup>
          </div>
          <div className='flex-1'>
            <Label htmlFor='binary-input'>Binary Input</Label>
            <Input
              id='binary-input'
              value={binary}
              onChange={e => setBinary(e.target.value.replace(/[^01]/g, ''))}
              placeholder='Enter binary number'
            />
          </div>
        </div>
        <div className='mb-4 flex flex-wrap gap-4 justify-center'>
          {encodingTypes.map(type => (
            <div key={type} className='flex items-center space-x-2'>
              <Checkbox id={type} checked={selectedEncodings.includes(type)} onCheckedChange={() => toggleEncoding(type)} />
              <Label htmlFor={type}>{type}</Label>
            </div>
          ))}
        </div>
        <ResponsiveContainer width='100%' height={350}>
          <ChartContainer
            config={Object.fromEntries(
              encodingTypes.map((type, index) => [type.toLowerCase().replace(' ', '-'), { label: type, color: `hsl(var(--chart-${index + 1}))` }])
            )}
          >
            <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray='10 10' stroke={stroke} />
              <XAxis dataKey='time' />
              <YAxis domain={[-2, 2]} ticks={[-1, 0, 1]} />
              {selectedEncodings.map(type => (
                <Line
                  key={type}
                  type='stepAfter'
                  dataKey={type}
                  stroke={`var(--color-${type.toLowerCase().replace(' ', '-')})`}
                  dot={false}
                  isAnimationActive={true}
                />
              ))}
            </LineChart>
          </ChartContainer>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
