import React from 'react';
import { getMethodColor } from '../../lib/format';

export function EndpointTag({ method, endpoint }: { method: string; endpoint: string }) {
  const methodStyle = getMethodColor(method);

  return (
    <div className="inline-flex items-center gap-2 font-mono text-xs">
      <span className={`px-1.5 py-0.5 rounded font-semibold border ${methodStyle}`}>
        {method.toUpperCase()}
      </span>
      <span className="text-text font-medium">{endpoint}</span>
    </div>
  );
}
