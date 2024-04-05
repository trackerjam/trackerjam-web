import {Control, Controller} from 'react-hook-form';
import React from 'react';
import classnames from 'classnames';

type ControlledInputType = {
  control: Control<any>;
  label: string;
  name: string;
  required?: boolean;
  validate?: (data: any) => boolean | string;
  caption?: string;
  disabled?: boolean;
  type?: string;
  placeholder?: string;
};

export function ControlledInput({
  control,
  name,
  required,
  label,
  validate,
  caption,
  ...rest
}: ControlledInputType) {
  const rules = {required} as Record<string, boolean | string | unknown>;
  if (validate) {
    rules.validate = validate;
  }

  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({field: {onChange, onBlur, value, name, ref}, fieldState: {invalid, error}}) => {
        const hasError = Boolean(error || invalid);
        const className = classnames(
          'mt-1 bg-stone-100 border-2 rounded-lg py-2 px-4 w-full focus:bg-stone-50 outline-none transition-colors duration-200 ease-in-out',
          {
            'focus:border-red-500 shadow-lg shadow-red-200': hasError,
            'border-stone-200 focus:border-stone-400': !hasError,
          }
        );

        return (
          <div className="my-1">
            <label className="text-14 font-medium">{label}</label>
            <input
              className={className}
              onChange={onChange}
              onBlur={onBlur}
              value={value}
              name={name}
              ref={ref}
              {...rest}
            />
            {Boolean(caption) && <span className="text-12 text-gray-400">{caption}</span>}
            {Boolean(error) && <p className="text-red-500 text-14">{error?.message}</p>}
          </div>
        );
      }}
    />
  );
}
