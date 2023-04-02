import {Checkbox, type CheckboxProps} from 'baseui/checkbox';
import React from 'react';
import {Control, Controller} from 'react-hook-form';

type ControlledCheckboxType = {
  control: Control<any>;
  label: string;
  name: string;
  required?: boolean;
  validate?: (data: any) => boolean | string;
} & CheckboxProps;

export function ControlledCheckbox({
  control,
  name,
  required,
  label,
  validate,
  ...rest
}: ControlledCheckboxType) {
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
        <Checkbox
          inputRef={ref as unknown as React.RefObject<HTMLInputElement>}
          checked={value}
          onChange={onChange}
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
        </Checkbox>
      )}
    />
  );
}
