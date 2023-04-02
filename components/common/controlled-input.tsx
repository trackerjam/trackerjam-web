import {Control, Controller} from 'react-hook-form';
import {FormControl} from 'baseui/form-control';
import {Input, type InputProps} from 'baseui/input';
import React from 'react';

type ControlledInputType = {
  control: Control<any>;
  label: string;
  name: string;
  required?: boolean;
  validate?: (data: any) => boolean | string;
  caption?: string;
} & InputProps;

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
        return (
          <FormControl
            label={label}
            error={error?.message || null}
            caption={caption}
            overrides={{
              ControlContainer: {
                style: () => ({
                  marginBottom: 0,
                }),
              },
            }}
          >
            <Input
              onChange={onChange}
              onBlur={onBlur}
              value={value}
              inputRef={ref as unknown as React.RefObject<HTMLInputElement>}
              name={name}
              error={invalid}
              {...rest}
            />
          </FormControl>
        );
      }}
    />
  );
}
