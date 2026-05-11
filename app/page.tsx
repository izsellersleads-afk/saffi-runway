'use client';

import { AvatarCall } from '@runwayml/avatars-react';
import '@runwayml/avatars-react/styles.css';

export default function SaffiPage() {
  return (
    <div style={{ height: '100vh', width: '100vw' }}>
      <AvatarCall
        avatarId="406b979c-0fd3-42e9-9d42-f950406977c2"
        connectUrl="/api/avatar/connect"
      />
    </div>
  );
}