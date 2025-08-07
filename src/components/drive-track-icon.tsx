"use client";

import React from 'react';
import Image from 'next/image';

const DriveTrackIcon = ({ className }: { className?: string }) => (
  <Image
    src={`/images/drive-track-logo.png?v=${new Date().getTime()}`}
    alt="Drive-Track Logo - Steering Wheel"
    width={32}
    height={32}
    className={className}
    data-ai-hint="steering wheel"
  />
);

export default DriveTrackIcon;
