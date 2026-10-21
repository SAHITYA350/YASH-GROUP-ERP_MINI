import React from 'react';
import { ArrowRight } from 'lucide-react';

export default function Stepper({ steps }) {
  if (!steps || steps.length === 0) return null;

  return (
    <div className="stepper-container">
      {steps.map((step, idx) => (
        <React.Fragment key={idx}>
          <div className="step-item">
            <div className="step-num">{idx + 1}</div>
            <div className="step-info">
              <span className="step-title">{step.title}</span>
              <span className="step-sub">{step.sub}</span>
            </div>
          </div>
          {idx < steps.length - 1 && <span className="step-divider">→</span>}
        </React.Fragment>
      ))}
    </div>
  );
}
