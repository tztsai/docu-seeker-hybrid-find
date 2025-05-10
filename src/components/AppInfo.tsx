import React from 'react';
import { ENV_CONFIG } from '@/config/env';
import { Code } from '@/components/ui/code';

const AppInfo: React.FC = () => {
  return (
    <div className="text-xs text-gray-500 mt-8 flex justify-center">
      <span>
        MongoDB Search App v{ENV_CONFIG.appVersion} •{' '}
        <Code>{ENV_CONFIG.isProduction ? 'Production' : 'Development'}</Code>
      </span>
    </div>
  );
};

export default AppInfo;
