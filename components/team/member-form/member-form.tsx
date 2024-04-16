'use client';

import {useForm} from 'react-hook-form';
import React, {useCallback, useEffect, useState} from 'react';
import {KIND, Notification} from 'baseui/notification';
import {Tooltip} from 'flowbite-react';

import {useSearchParams} from 'next/navigation';
import {BiCaretDown, BiCaretRight, BiHide, BiMinusCircle} from 'react-icons/bi';
import {BsInfoCircle} from 'react-icons/bs';
import classnames from 'classnames';
import {Member} from '@prisma/client';
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
import {Banner} from '../../common/banner';
import {USER_FIRST_INIT_PARAM} from '../../../const/url';
import {WelcomeModal} from '../welcome-modal';
import {useConfirmNotification} from '../../hooks/use-confirm-notification';
import {RadioTrackMode} from './form/radio-track-mode';
import {TIME_PRESETS, WorkHours} from './form/work-hours';
import {DoneScreen} from './done-screen';

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

enum SCREENS {
  FORM,
  DONE,
}
export function MemberForm({editingMember}: CreateMemberProps) {
  const isEditing = Boolean(editingMember);
  const searchParams = useSearchParams();
  const isInitPage = searchParams?.has(USER_FIRST_INIT_PARAM);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const confirmNotification = useConfirmNotification();
  const [displayedScreen, setDisplayedScreen] = useState<SCREENS>(SCREENS.DONE);
  const [createResult, setCreateResult] = useState<null | Member>(null);

  const {send, isLoading, error} = useSendData<EditMemberDataType>(
    isEditing ? `/api/member/${editingMember?.id}` : '/api/member'
  );
  const {handleSubmit, control, setValue, watch, getValues, register, setFocus, getFieldState} =
    useForm({
      reValidateMode: 'onChange',
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

      const {includeDomains, excludeDomains} = dataToSend.settings || {};
      if (typeof includeDomains === 'string' && includeDomains) {
        dataToSend.settings.includeDomains = extractDomains(includeDomains);
      }

      if (typeof excludeDomains === 'string' && excludeDomains) {
        dataToSend.settings.excludeDomains = extractDomains(excludeDomains);
      }

      const res = await send(dataToSend, isEditing ? 'PUT' : 'POST');
      if (!res || (res as ErrorResponse)?.error) {
        console.error('Unknown error', res);
      } else {
        setCreateResult(res as Member);
        setDisplayedScreen(SCREENS.DONE);
      }
    },
    [isEditing, send]
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

  const handleOpenWelcomeModal = () => {
    setShowWelcomeModal(true);
    confirmNotification('welcome');
  };
  const handleCloseWelcomeModal = () => {
    setShowWelcomeModal(false);
  };

  const trackMode = watch('settings.trackMode');
  const settings = watch('settings');
  const domainListsDisabled = trackMode === 'ALL';
  const AdvancedCaredIcon = showAdvanced ? BiCaretDown : BiCaretRight;
  const hasTimeMetadata = Boolean(editingMember?.createdAt || editingMember?.updatedAt);

  const formSectionStyle = 'border border-black border-opacity-[0.08] rounded-lg p-4';
  const textAreaClass = 'bg-stone-50 border-2 border-stone-200 rounded-lg p-4 w-full';

  const textAreaClassWrapper = classnames({
    hidden: domainListsDisabled,
  });

  useEffect(() => {
    if (!domainListsDisabled) {
      const {isTouched} = getFieldState('settings.trackMode');
      if (isTouched) {
        setFocus('settings.includeDomains');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [domainListsDisabled]);

  const isDoneScreen = displayedScreen === SCREENS.DONE;
  const isFormScreen = displayedScreen === SCREENS.FORM;

  return (
    <>
      {isInitPage && (
        <Banner type="success">
          <div className="flex flex-col gap-3">
            <strong className="text-20">
              <span>👋</span> Welcome to TrackerJam!
            </strong>
            <p>Let&apos;s create a first member. It can be for you or your team member.</p>
            <p>
              Read our{' '}
              <span className="pointer underline" role="button" onClick={handleOpenWelcomeModal}>
                Welcome
              </span>{' '}
              message for more details.
            </p>
          </div>

          <WelcomeModal
            isOpen={showWelcomeModal}
            onClose={handleCloseWelcomeModal}
            hideCreateButton={true}
          />
        </Banner>
      )}

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

      {isFormScreen && (
        <form className="flex flex-col gap-y-2" onSubmit={handleSubmit(onSubmit)}>
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
            <div className="py-2">
              <RadioTrackMode control={control} name="settings.trackMode" />
            </div>

            <div className={textAreaClassWrapper}>
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

          <div className="mt-4 flex justify-between">
            {hasTimeMetadata && (
              <Tooltip
                content={
                  <div className="text-12">
                    {Boolean(editingMember?.createdAt) && (
                      <div>Created at {editingMember.createdAt}</div>
                    )}
                    {Boolean(editingMember?.updatedAt) && (
                      <div>Updated at {editingMember.updatedAt}</div>
                    )}
                  </div>
                }
              >
                <BsInfoCircle title="Member metadata" />
              </Tooltip>
            )}
            <Button type="submit" kind="primary" isLoading={isLoading} className="self-end ml-auto">
              {!isEditing && 'Add member'}
              {isEditing && 'Update member'}
            </Button>
          </div>
        </form>
      )}

      {isDoneScreen && <DoneScreen member={createResult} />}
    </>
  );
}
