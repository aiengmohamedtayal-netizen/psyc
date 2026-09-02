import { useState, useEffect } from 'react'

/**
 * Custom hook managing the periodic cycle and interval timers for
 * 4-7-8 relaxation and Box Breathing techniques.
 *
 * @param {boolean} isOpen
 */
export function useBreathingCycle(isOpen) {
  const [activeTechnique, setActiveTechnique] = useState('478')
  const [phase, setPhase] = useState('Inhale')
  const [secondsLeft, setSecondsLeft] = useState(4)
  const [cycle, setCycle] = useState(1)
  const [groundingStep, setGroundingStep] = useState(5)
  const [pmrStep, setPmrStep] = useState(1)

  useEffect(() => {
    if (!isOpen) {
      setPhase('Inhale')
      setSecondsLeft(4)
      setCycle(1)
      setGroundingStep(5)
      setPmrStep(1)
      return
    }

    if (activeTechnique === 'grounding' || activeTechnique === 'pmr') {
      return
    }

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev > 1) return prev - 1

        if (activeTechnique === '478') {
          if (phase === 'Inhale') {
            setPhase('Hold')
            return 7
          }
          if (phase === 'Hold') {
            setPhase('Exhale')
            return 8
          }
          setPhase('Inhale')
          setCycle((c) => c + 1)
          return 4
        }

        // Box Breathing (4-4-4-4)
        if (phase === 'Inhale') {
          setPhase('Hold')
          return 4
        }
        if (phase === 'Hold') {
          setPhase('Exhale')
          return 4
        }
        if (phase === 'Exhale') {
          setPhase('Rest')
          return 4
        }
        setPhase('Inhale')
        setCycle((c) => c + 1)
        return 4
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isOpen, phase, activeTechnique])

  return {
    activeTechnique,
    setActiveTechnique,
    phase,
    secondsLeft,
    cycle,
    groundingStep,
    setGroundingStep,
    pmrStep,
    setPmrStep,
  }
}
