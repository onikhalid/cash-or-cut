'use client'

import * as React from 'react';

import { checkIsIOS, disableIOSTextFieldZoom } from '@/lib/inputs';

export function IOSWrapper({
  children,
}: {
  children: React.ReactNode;
}) {

  React.useEffect(() => {
    // Check if the current device is iOS and disable text field zooming.
    if (checkIsIOS()) {
      disableIOSTextFieldZoom();
    }
  }, []);

  return (
    <>
     
      {children}
    </>
  );
}
