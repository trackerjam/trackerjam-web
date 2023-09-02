'use client';

import {FormControl} from 'baseui/form-control';
import {useForm} from 'react-hook-form';
import React, {useCallback, useState} from 'react';
import {Notification, KIND} from 'baseui/notification';

import {useRouter} from 'next/navigation';
import {Textarea} from 'baseui/textarea';
import {BiHide, BiCaretRight, BiCaretDown} from 'react-icons/bi';
import {ControlledInput} from '../../common/controlled-input';
import {useSendData} from '../../hooks/use-send-data';
import {ControlledCheckbox} from '../../common/controlled-checkbox';
import {extractDomains} from '../../../utils/extract-domains';
import {CreateMemberDataType, EditMemberDataType} from '../../../types/member';
import {Button} from '../../common/button';
import {DEFAULT_SETTINGS_IDLE_TIME_SEC} from '../../../const/team';
import {ErrorResponse} from '../../../types/api';
import {RadioTrackMode} from './form/radio-track-mode';

type CreateMemberProps = {
  editingMember?: undefined | EditMemberDataType;
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
    showTrackMode: true,
    showActivityTime: true,
    showDomainsCount: true,
    showSessionsCount: true,
  },
};

export function AddMember({editingMember}: CreateMemberProps) {
  const isEditing = Boolean(editingMember);
  const router = useRouter();

  const {send, isLoading, error} = useSendData<EditMemberDataType>(
    `/api/member/${isEditing ? editingMember?.id : ''}`
  );
  const {handleSubmit, control, reset, setValue, watch} = useForm({
    reValidateMode: 'onBlur',
    defaultValues: editingMember || defaultValues,
  });
  const [excludedListShown, setExcludedListShown] = useState(false);
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

      const res = await send(dataToSend, isEditing ? 'PUT' : 'POST');
      if (!res || (res as ErrorResponse)?.error) {
        console.error('Unknown error', res);
      } else {
        reset();
        await router.push('/team');
      }
    },
    [isEditing, reset, router, send]
  );

  const handleDomainInput = (key: 'includeDomains' | 'excludeDomains', value: string) => {
    const domains = extractDomains(value);
    setValue(`settings.${key}`, domains);
  };

  const formSectionStyle = 'border border-black border-opacity-[0.08] rounded-lg p-4';

  const trackMode = watch('settings.trackMode');
  const domainListsDisabled = trackMode === 'ALL';
  const AdvancedCaredIcon = showAdvanced ? BiCaretDown : BiCaretRight;

  const radioControlOverrides = {
    Caption: {
      style: {
        opacity: domainListsDisabled ? 0.2 : 1,
      },
    },
  };

  const checkboxOverrides = {
    Label: {
      style: {
        fontWeight: '300',
      },
    },
  };

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
          <FormControl
            caption="List of domains, separated by comma (i.e. google.com, amazon.com, bbc.co.uk)"
            disabled={domainListsDisabled}
            overrides={radioControlOverrides}
          >
            <Textarea
              onChange={(e) => handleDomainInput('includeDomains', e.target.value)}
            ></Textarea>
          </FormControl>
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
            Exclude some domains
          </Button>
        )}
        {excludedListShown && (
          <div className={formSectionStyle}>
            <FormControl
              label="Exclude domains"
              caption="Excluded domains and subdomains separated by comma (i.e. mail.google.com)"
            >
              <Textarea
                onChange={(e) => handleDomainInput('excludeDomains', e.target.value)}
              ></Textarea>
            </FormControl>
            <div className="text-right">
              <Button type="button" onClick={() => setExcludedListShown(false)}>
                Hide field
              </Button>
            </div>
          </div>
        )}
      </div>

      <h3 className="text-20 leading-tight mt-4 font-bold mb-2.5">Extension settings</h3>

      <div className={formSectionStyle}>
        <h4 className="leading-tight font-medium mb-4 text-16">Let member see</h4>
        <div className="flex flex-col gap-2">
          <ControlledCheckbox
            control={control}
            name="settings.showTrackMode"
            label="Track mode settings"
            overrides={checkboxOverrides}
          />

          <ControlledCheckbox
            control={control}
            name="settings.showActivityTime"
            label="Total activity time"
            overrides={checkboxOverrides}
          />

          <ControlledCheckbox
            control={control}
            name="settings.showDomainsCount"
            label="Domains count"
            overrides={checkboxOverrides}
          />

          <ControlledCheckbox
            control={control}
            name="settings.showSessionsCount"
            label="Sessions count"
            overrides={checkboxOverrides}
          />
        </div>
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
        <Button type="submit" kind="primary">
          {!isEditing && 'Add member'}
          {isEditing && 'Update member'}
        </Button>
      </div>
    </form>
  );
}
