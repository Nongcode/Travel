"use client";

import { useEffect, useRef, useState } from "react";

type Option = {
  value: string;
  label: string;
};

type CustomSelectProps = {
  name: string;
  options: Option[];
  defaultValue?: string; // Comma separated for initial multi values, or single value
  placeholder?: string;
  isMulti?: boolean;
};

export function CustomSelect({
  name,
  options,
  defaultValue = "",
  placeholder = "Chọn trải nghiệm",
  isMulti = false,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  // Parse initial selected values
  const getInitialValues = () => {
    if (!defaultValue) return [];
    if (isMulti) {
      return defaultValue.split(",").map(v => v.trim()).filter(Boolean);
    }
    return [defaultValue];
  };

  const [selectedValues, setSelectedValues] = useState<string[]>(getInitialValues);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleToggle = () => setIsOpen((prev) => !prev);

  const handleSelect = (value: string) => {
    if (isMulti) {
      setSelectedValues((prev) => {
        if (prev.includes(value)) {
          return prev.filter((val) => val !== value);
        } else {
          return [...prev, value];
        }
      });
      // Do not close dropdown on multi select
    } else {
      setSelectedValues([value]);
      setIsOpen(false);
    }
  };

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Close dropdown on Escape key press
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Compute trigger label
  const getTriggerLabel = () => {
    if (selectedValues.length === 0) return placeholder;
    
    const labels = selectedValues
      .map((val) => options.find((opt) => opt.value === val)?.label)
      .filter(Boolean);
      
    if (labels.length === 0) return placeholder;
    return labels.join(", ");
  };

  const isSelected = (value: string) => selectedValues.includes(value);
  const hiddenInputValue = selectedValues.join(", ");

  return (
    <div className="custom-select-container" ref={containerRef}>
      {/* Hidden input to hold the value for form submission */}
      <input type="hidden" name={name} value={hiddenInputValue} />

      <button
        suppressHydrationWarning
        type="button"
        className={`custom-select-trigger ${isOpen ? "open" : ""}`}
        onClick={handleToggle}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="selected-text-label">{getTriggerLabel()}</span>
        <svg
          className="custom-select-chevron"
          width="12"
          height="8"
          viewBox="0 0 12 8"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M1 1.5L6 6.5L11 1.5"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {isOpen && (
        <ul className="custom-select-menu" role="listbox">
          {options.map((option) => (
            <li
              key={option.value}
              className={`custom-select-option ${
                isSelected(option.value) ? "selected" : ""
              }`}
              role="option"
              aria-selected={isSelected(option.value)}
              onClick={() => handleSelect(option.value)}
            >
              {isMulti && (
                <input
                  type="checkbox"
                  className="multi-select-checkbox"
                  checked={isSelected(option.value)}
                  readOnly
                  style={{ marginRight: "10px", cursor: "pointer" }}
                />
              )}
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

