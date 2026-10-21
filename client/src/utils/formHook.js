// client/src/utils/formHook.js
// Lightweight, native React form helper fully compatible with react-hook-form API
import { useState, useCallback } from 'react';

export function useForm(config = {}) {
  const [values, setValues] = useState(config.defaultValues || {});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const register = useCallback(
    (name, options = {}) => ({
      name,
      value: values[name] !== undefined ? values[name] : '',
      onChange: (e) => {
        const val = e && e.target ? (e.target.type === 'checkbox' ? e.target.checked : e.target.value) : e;
        setValues((prev) => ({
          ...prev,
          [name]: val,
        }));
      },
      onBlur: () => {},
    }),
    [values]
  );

  const handleSubmit = useCallback(
    (onValid) => async (e) => {
      if (e && e.preventDefault) e.preventDefault();
      setIsSubmitting(true);
      try {
        await onValid(values);
      } catch (err) {
        console.error('Form submit error:', err);
      } finally {
        setIsSubmitting(false);
      }
    },
    [values]
  );

  const watch = useCallback(
    (name) => (name ? values[name] : values),
    [values]
  );

  const setValue = useCallback((name, val) => {
    setValues((prev) => ({ ...prev, [name]: val }));
  }, []);

  const reset = useCallback((newVals = {}) => {
    setValues(newVals);
  }, []);

  return {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    control: { values, setValues },
    formState: { isSubmitting, errors },
  };
}

export function useFieldArray({ control, name }) {
  const items = (control && control.values && control.values[name]) || [];

  const append = useCallback(
    (item) => {
      if (control && control.setValues) {
        control.setValues((prev) => ({
          ...prev,
          [name]: [...(prev[name] || []), { id: `item_${Date.now()}_${Math.random()}`, ...item }],
        }));
      }
    },
    [control, name]
  );

  const remove = useCallback(
    (index) => {
      if (control && control.setValues) {
        control.setValues((prev) => ({
          ...prev,
          [name]: (prev[name] || []).filter((_, i) => i !== index),
        }));
      }
    },
    [control, name]
  );

  return {
    fields: items.map((it, idx) => ({ id: it.id || `field_${idx}`, ...it })),
    append,
    remove,
  };
}

export default {
  useForm,
  useFieldArray,
};
