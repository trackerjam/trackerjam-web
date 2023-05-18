import {Radio, type RadioProps} from 'baseui/radio';
import React from 'react';
import {Control, Controller} from 'react-hook-form';

type ControlledRadioType = {
  control: Control<any>;
  label: string;
  name: string;
  required?: boolean;
  validate?: (data: any) => boolean | string;
} & RadioProps;

export function ControlledRadio({
  control,
  name,
  required,
  label,
  validate,
  ...rest
}: ControlledRadioType) {
  const rules = {required} as Record<string, boolean | string | unknown>;
  if (validate) {
    rules.validate = validate;
  }

  return (
    <Controller
      control={control}
      rules={rules}
      name={name}
      render={({field: {onChange, onBlur, value, name, ref}, fieldState: {invalid}}) => (
        <Radio
          inputRef={ref as unknown as React.RefObject<HTMLInputElement>}
          checked={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          name={name}
          error={invalid}
          overrides={{
            Label: {
              style: ({$theme}) => ({
                color: invalid ? $theme.colors.contentNegative : $theme.colors.contentPrimary,
              }),
            },
          }}
          {...rest}
        >
          {label}
        </Radio>
      )}
    />
  );
}
