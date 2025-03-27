// __mocks__/lucide-react.ts
import React from 'react'

const createIconMock = (name: string) => 
  function IconMock(props: any) {
    return React.createElement('svg', {
      'data-testid': `icon-${name}`,
      ...props
    })
  }

export const X = createIconMock('x')
export const Plus = createIconMock('plus')
export const Calendar = createIconMock('calendar')
export const Users = createIconMock('users')
export const XCircle = createIconMock('xcircle')