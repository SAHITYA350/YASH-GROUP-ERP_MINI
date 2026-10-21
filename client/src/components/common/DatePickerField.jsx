// client/src/components/common/DatePickerField.jsx
import React, { useState, useRef, useEffect } from 'react';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function DatePickerField({
  name,
  value,
  onChange,
  required = false,
  placeholder = 'Select date...',
  className = '',
  includeTime = false,
}) {
  const [showPopup, setShowPopup] = useState(false);
  const containerRef = useRef(null);
  const nativeInputRef = useRef(null);

  // Parse current date or default to today for calendar navigation
  const parsedDate = value ? new Date(value) : new Date();
  const validDate = isNaN(parsedDate.getTime()) ? new Date() : parsedDate;

  const [viewYear, setViewYear] = useState(validDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(validDate.getMonth()); // 0-indexed

  // Close popup when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setShowPopup(false);
      }
    }
    if (showPopup) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showPopup]);

  // Keep calendar view in sync when value changes externally
  useEffect(() => {
    if (value) {
      const d = new Date(value);
      if (!isNaN(d.getTime())) {
        setViewYear(d.getFullYear());
        setViewMonth(d.getMonth());
      }
    }
  }, [value]);

  const handlePrevMonth = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const handleSelectDay = (day) => {
    const pad = (n) => String(n).padStart(2, '0');
    let formatted = `${viewYear}-${pad(viewMonth + 1)}-${pad(day)}`;
    if (includeTime) {
      formatted += 'T10:00';
    }
    onChange?.(formatted);
    setShowPopup(false);
  };

  const handleSelectToday = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    let formatted = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
    if (includeTime) {
      formatted += 'T10:00';
    }
    onChange?.(formatted);
    setViewYear(now.getFullYear());
    setViewMonth(now.getMonth());
    setShowPopup(false);
  };

  const handleClear = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onChange?.('');
    setShowPopup(false);
  };

  const handleCalendarButtonClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // Try native picker first if supported, and also toggle our custom popup
    try {
      if (nativeInputRef.current && typeof nativeInputRef.current.showPicker === 'function') {
        nativeInputRef.current.showPicker();
        return;
      }
    } catch (err) {
      // Fallback to custom popup below
    }
    setShowPopup((prev) => !prev);
  };

  // Generate calendar days
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay(); // 0 is Sun
  const startDayOffset = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1; // Mon is 0
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

  const dayCells = [];
  // Prev month padding
  for (let i = startDayOffset - 1; i >= 0; i--) {
    dayCells.push({ day: daysInPrevMonth - i, isCurrent: false });
  }
  // Current month
  for (let d = 1; d <= daysInMonth; d++) {
    dayCells.push({ day: d, isCurrent: true });
  }
  // Next month padding
  const remaining = (7 - (dayCells.length % 7)) % 7;
  for (let n = 1; n <= remaining; n++) {
    dayCells.push({ day: n, isCurrent: false });
  }

  // Check if a day is the selected date
  const isDaySelected = (day, isCurrent) => {
    if (!isCurrent || !value) return false;
    const parts = value.slice(0, 10).split('-');
    if (parts.length === 3) {
      return (
        Number(parts[0]) === viewYear &&
        Number(parts[1]) === viewMonth + 1 &&
        Number(parts[2]) === day
      );
    }
    return false;
  };

  const yearsRange = [];
  const currentYear = new Date().getFullYear();
  for (let y = currentYear - 3; y <= currentYear + 7; y++) {
    yearsRange.push(y);
  }

  return (
    <div className={`date-field-wrapper ${className}`} ref={containerRef}>
      <div className="date-input-row">
        <input
          ref={nativeInputRef}
          type={includeTime ? 'datetime-local' : 'date'}
          name={name}
          value={value || ''}
          required={required}
          placeholder={placeholder}
          className="date-picker-input-field"
          onChange={(e) => onChange?.(e.target.value)}
        />
        <button
          type="button"
          className="calendar-icon-btn"
          onClick={handleCalendarButtonClick}
          title="Open Calendar to select date and month"
          aria-label="Open Calendar"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
        </button>
      </div>

      {/* POPUP CALENDAR WIDGET */}
      {showPopup && (
        <div className="calendar-dropdown-popup">
          <div className="cal-pop-header">
            <button type="button" className="cal-pop-nav" onClick={handlePrevMonth} title="Previous Month">
              ‹
            </button>
            <div className="cal-pop-selectors">
              <select
                className="cal-pop-select"
                value={viewMonth}
                onChange={(e) => setViewMonth(Number(e.target.value))}
              >
                {MONTH_NAMES.map((m, idx) => (
                  <option key={m} value={idx}>
                    {m}
                  </option>
                ))}
              </select>

              <select
                className="cal-pop-select"
                value={viewYear}
                onChange={(e) => setViewYear(Number(e.target.value))}
              >
                {yearsRange.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
            <button type="button" className="cal-pop-nav" onClick={handleNextMonth} title="Next Month">
              ›
            </button>
          </div>

          <div className="cal-pop-weekdays">
            <span>Mo</span>
            <span>Tu</span>
            <span>We</span>
            <span>Th</span>
            <span>Fr</span>
            <span>Sa</span>
            <span>Su</span>
          </div>

          <div className="cal-pop-days-grid">
            {dayCells.map((c, i) => (
              <button
                key={i}
                type="button"
                className={`cal-pop-day ${c.isCurrent ? 'current-month' : 'other-month'} ${
                  isDaySelected(c.day, c.isCurrent) ? 'selected-day' : ''
                }`}
                disabled={!c.isCurrent}
                onClick={() => c.isCurrent && handleSelectDay(c.day)}
              >
                {c.day}
              </button>
            ))}
          </div>

          <div className="cal-pop-footer">
            <button type="button" className="cal-pop-btn today" onClick={handleSelectToday}>
              Today
            </button>
            {value && (
              <button type="button" className="cal-pop-btn clear" onClick={handleClear}>
                Clear
              </button>
            )}
            <button type="button" className="cal-pop-btn close" onClick={() => setShowPopup(false)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
