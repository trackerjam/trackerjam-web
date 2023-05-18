import {Radio, RadioGroup, type RadioProps} from 'baseui/radio';
import React from 'react';
import {Control, Controller} from 'react-hook-form';
import {LABEL_PLACEMENT} from 'baseui/checkbox';

type ControlledRadioType = {
  control: Control<any>;
  name: string;
  required?: boolean;
  validate?: (data: any) => boolean | string;
} & RadioProps;

export function RadioTrackMode({control, name, required, validate}: ControlledRadioType) {
  const rules = {required} as Record<string, boolean | string | unknown>;
  if (validate) {
    rules.validate = validate;
  }

  return (
    <Controller
      control={control}
      rules={rules}
      name={name}
      render={({field}) => (
        <RadioGroup {...field}>
          <Radio required value="all" labelPlacement={LABEL_PLACEMENT.right}>
            Track All Domains
          </Radio>
          <Radio required value="limited" labelPlacement={LABEL_PLACEMENT.right}>
            Track Specific Domains
          </Radio>
        </RadioGroup>
      )}
    />
  );
}
