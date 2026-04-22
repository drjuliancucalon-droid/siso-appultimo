
```jsx
// src/pages/BackupPage.jsx — Coordinador Backup (usa modules/backup)
import React from 'react';
import { BackupMain } from '../modules/backup/components/BackupMain.jsx';
import { useBackup } from '../modules/backup/hooks/useBackup.js';

export default function BackupPage() {
  const backup = useBackup();
  
  return (
    <div className="p-6">
      <BackupMain {...backup} />
    </div>
  );
}
```

