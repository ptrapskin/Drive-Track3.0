"use client";

import React from 'react';
import Image from 'next/image';

const DriveTrackIcon = ({ className }: { className?: string }) => (
  <Image
    src="/images/drive-track-logo.png"
    alt="Drive-Track Logo"
    width={32}
    height={32}
    className={className}
    data-ai-hint="steering wheel"
  />
);

export default DriveTrackIcon;
