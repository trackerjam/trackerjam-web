'use client';

import {useForm} from 'react-hook-form';
import React, {useCallback, useState} from 'react';
import {KIND, Notification} from 'baseui/notification';

import {useRouter} from 'next/navigation';
import {BiCaretDown, BiCaretRight, BiHide, BiMinusCircle} from 'react-icons/bi';
import {ControlledInput} from '../../common/controlled-input';
import {useSendData} from '../../hooks/use-send-data';
import {extractDomains} from '../../../utils/extract-domains';
import type {
  CreateMemberDataType,
  EditMemberDataType,
  WorkHoursDaysType,
} from '../../../types/member';
import {Button} from '../../common/button';
import {DEFAULT_SETTINGS_IDLE_TIME_SEC} from '../../../const/team';
import {ErrorResponse} from '../../../types/api';
import {DAY} from '../../../const/member';
import {RadioTrackMode} from './form/radio-track-mode';
import {TIME_PRESETS, WorkHours} from './form/work-hours';

type CreateMemberProps = {
  editingMember?: undefined | null | EditMemberDataType;
};

const defaultValues: CreateMemberDataType = {
  name: '',
  email: '',
  title: '',
  settings: {
    trackMode: 'ALL',
    idleTime: DEFAULT_SETTINGS_IDLE_TIME_SEC,
    includeDomains: [],
    excludeDomains: [],
    workHours: {
      days: {...TIME_PRESETS[0].days},
      time: {...TIME_PRESETS[0].time},
    },
  },
};

export function MemberForm({editingMember}: CreateMemberProps) {
  const isEditing = Boolean(editingMember);
  const router = useRouter();

  const {send, isLoading, error} = useSendData<EditMemberDataType>(
    isEditing ? `/api/member/${editingMember?.id}` : '/api/member'
  );
  const {handleSubmit, control, setValue, watch, getValues, register} = useForm({
    reValidateMode: 'onBlur',
    defaultValues: editingMember || defaultValues,
  });
  const [excludedListShown, setExcludedListShown] = useState(
    Boolean(editingMember?.settings.excludeDomains?.length)
  );
  const [showAdvanced, setShowAdvanced] = useState(false);

  const onSubmit = useCallback(
    async (formData: Partial<CreateMemberDataType>) => {
      let dataToSend: EditMemberDataType;

      if (isEditing) {
        dataToSend = {...formData};
        delete dataToSend.id;
      } else {
        dataToSend = {
          ...formData,
        };
      }

      if (dataToSend.settings?.includeDomains) {
        dataToSend.settings.includeDomains = extractDomains(dataToSend.settings.includeDomains);
      }

      if (dataToSend.settings?.excludeDomains) {
        dataToSend.settings.excludeDomains = extractDomains(dataToSend.settings.excludeDomains);
      }

      const res = await send(dataToSend, isEditing ? 'PUT' : 'POST');
      if (!res || (res as ErrorResponse)?.error) {
        console.error('Unknown error', res);
      } else {
        await router.push('/team');
      }
    },
    [isEditing, router, send]
  );

  const handleWorkHoursDaySet = (day: DAY, value: boolean) => {
    const newVal: WorkHoursDaysType = getValues('settings.workHours.days');
    if (value) {
      newVal[day] = value;
    } else {
      delete newVal[day];
    }
    setValue('settings.workHours.days', newVal);
  };

  const handleWorkHoursTimeSet = (label: 'startTime' | 'endTime', value: string) => {
    const newVal = getValues('settings.workHours.time');
    newVal[label] = value;
    setValue('settings.workHours.time', newVal);
  };

  const formSectionStyle = 'border border-black border-opacity-[0.08] rounded-lg p-4';

  const trackMode = watch('settings.trackMode');
  const settings = watch('settings');
  const domainListsDisabled = trackMode === 'ALL';
  const AdvancedCaredIcon = showAdvanced ? BiCaretDown : BiCaretRight;

  const textAreaClass = 'bg-gray-100 rounded-lg p-4 w-full';

  return (
    <form className="flex flex-col gap-y-2" onSubmit={handleSubmit(onSubmit)}>
      {Boolean(error) && (
        <Notification
          kind={KIND.negative}
          closeable
          overrides={{
            Body: {style: {width: 'auto'}},
          }}
        >
          <b>Error:</b> {error}
        </Notification>
      )}

      <div className={formSectionStyle}>
        <ControlledInput
          label="Name *"
          required
          control={control}
          name="name"
          disabled={isLoading}
        />

        <ControlledInput
          label="Title"
          control={control}
          name="title"
          disabled={isLoading}
          type="text"
        />

        <ControlledInput
          label="Email"
          control={control}
          name="email"
          type="email"
          disabled={isLoading}
          caption="We will send them the tracking key"
        />
      </div>

      <h3 className="text-20 leading-tight mt-4 font-bold mb-2.5">Tracking mode</h3>

      <div className={formSectionStyle}>
        <RadioTrackMode control={control} name="settings.trackMode" />
        <div>
          <textarea
            {...register('settings.includeDomains')}
            className={textAreaClass}
            disabled={domainListsDisabled}
          />
          <span className="text-12 text-gray-400">
            List of domains, separated by comma (i.e. google.com, amazon.com, bbc.co.uk)
          </span>
        </div>
      </div>

      <div>
        {!excludedListShown && (
          <Button
            className="inline-flex"
            kind="transparent"
            type="button"
            onClick={() => setExcludedListShown(true)}
          >
            <BiHide className="mr-2" />
            Exclude domains
          </Button>
        )}
        {excludedListShown && (
          <div className={formSectionStyle}>
            <label htmlFor="textarea-exclude-domains" className="font-medium mb-3 block">
              Excluded domains
            </label>
            <textarea
              {...register('settings.excludeDomains')}
              className={textAreaClass}
              id="textarea-exclude-domains"
            />
            <span className="text-12 text-gray-400">
              Excluded domains and subdomains separated by comma (i.e. mail.google.com)
            </span>
            <div className="text-right">
              <Button
                type="button"
                kind="transparent"
                onClick={() => {
                  setValue('settings.excludeDomains', []);
                  setExcludedListShown(false);
                }}
                title="Don't use this field"
              >
                <BiMinusCircle title="" className="mr-1" /> Remove
              </Button>
            </div>
          </div>
        )}
      </div>

      <h3 className="text-20 leading-tight mt-4 font-bold mb-2.5">Work Hours</h3>

      <div className={formSectionStyle}>
        <WorkHours
          value={settings?.workHours}
          onDaysChange={handleWorkHoursDaySet}
          onTimeChange={handleWorkHoursTimeSet}
        />
      </div>

      <button
        className="flex self-start items-center space-x-1.5 text-20 leading-snug font-bold mt-4 border-b border-dashed border-transparent hover:border-black transition-colors duration-200"
        type="button"
        onClick={() => setShowAdvanced((cur) => !cur)}
      >
        Advanced <AdvancedCaredIcon title="" />
      </button>

      {showAdvanced && (
        <div className={formSectionStyle}>
          <ControlledInput
            label="Idle time in seconds"
            control={control}
            name="settings.idleTime"
            placeholder=""
            type="number"
            disabled={isLoading}
          />
        </div>
      )}

      <div className="mt-4 flex justify-end">
        <Button type="submit" kind="primary" isLoading={isLoading}>
          {!isEditing && 'Add member'}
          {isEditing && 'Update member'}
        </Button>
      </div>
    </form>
  );
}
