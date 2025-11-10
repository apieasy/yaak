import { clear } from '@tauri-apps/plugin-clipboard-manager';
import * as m from 'motion/react-m';
import React, { useState } from 'react';
import { Button } from './core/Button';
import { Icon } from './core/Icon';
import { showDialog } from '../lib/dialog';
import { ImportCurlDialog } from './ImportCurlDialog';

export function ImportCurl() {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <m.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.5 }}
    >
      <Button
        size="2xs"
        variant="border"
        color="success"
        className="rounded-full"
        rightSlot={<Icon icon="import" size="sm" />}
        isLoading={isLoading}
        title="Import Curl command from clipboard"
        onClick={async () => {
          setIsLoading(true);
          try {
            showDialog({
              id: 'import-curl',
              title: 'Import cURL command',
              size: 'md',
              render: ImportCurlDialog,
              onClose: async () => {
                await clear();
              },
            });
          } catch (e) {
            console.log('Failed to import curl', e);
          } finally {
            setIsLoading(false);
          }
        }}
      >
        Import Curl
      </Button>
    </m.div>
  );
}
