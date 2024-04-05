import {Radio, Label} from 'flowbite-react';
import React from 'react';
import {Control, Controller} from 'react-hook-form';

type ControlledRadioType = {
  control: Control<any>;
  name: string;
  required?: boolean;
  validate?: (data: any) => boolean | string;
};

export function RadioTrackMode({control, name, required, validate}: ControlledRadioType) {
  const rules: Record<string, any> = {};
  if (required) {
    rules.required = 'This field is required'; // Add a custom message if needed
  }
  if (validate) {
    rules.validate = validate;
  }

  return (
    <Controller
      control={control}
      rules={rules}
      name={name}
      defaultValue="ALL"
      render={({field: {onChange, value, ...props}}) => (
        <fieldset className="flex max-w-md flex-col gap-1">
          <div className="flex items-center gap-2">
            <Radio
              color="black"
              id="tracking-mode-all"
              {...props}
              name={name}
              value="ALL"
              checked={value === 'ALL'}
              onChange={onChange}
            />
            <Label htmlFor="tracking-mode-all">Track All Domains</Label>
          </div>
          <div className="flex items-center gap-2">
            <Radio
              id="tracking-mode-limited"
              {...props}
              name={name}
              value="LIMITED"
              checked={value === 'LIMITED'}
              onChange={onChange}
            />
            <Label htmlFor="tracking-mode-limited">Track Specific Domains</Label>
          </div>
        </fieldset>
      )}
    />
  );
}
