import { useState } from 'react'
export function App() {
  const [count, setCount] = useState(0)
  return (
    <>
      This is provided by the Web Extension.
      <br />
      Current count is {count}
      <br />
      <button children="-1" onClick={() => setCount((count) => count - 1)} />
      <br />
      <button children="+1" onClick={() => setCount((count) => count + 1)} />
    </>
  )
}
