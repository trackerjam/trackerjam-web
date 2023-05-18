import {useStyletron} from 'baseui';
import {
  HeadingSmall as Title,
  HeadingXSmall as SubTitle,
  LabelMedium as SectionTitle,
} from 'baseui/typography';
import {FormControl} from 'baseui/form-control';
import {Button, KIND as ButtonKind, SIZE as ButtonSize} from 'baseui/button';
import {useForm} from 'react-hook-form';
import React, {useCallback, useState} from 'react';
import {Notification, KIND} from 'baseui/notification';
import Head from 'next/head';
import {useRouter} from 'next/router';
import {Textarea} from 'baseui/textarea';
import {Member} from '@prisma/client';
import {BiHide, BiCaretRight, BiCaretDown} from 'react-icons/bi';
import {Checkbox, LABEL_PLACEMENT} from 'baseui/checkbox';
import {ControlledInput} from '../../common/controlled-input';
import {useSendData} from '../../hooks/use-send-data';
import {RadioTrackMode} from './form/radio-track-mode';

type SettingsType = {
  trackMode: 'all' | 'limited';
  idleTime: string;
};
export type FormDataType = Partial<Member> & Partial<SettingsType>;

type CreateProductProps = {
  editingProduct?: undefined | Partial<FormDataType>;
};

const defaultValues: FormDataType = {
  name: '',
  description: '',
  email: '',
  trackMode: 'all',
  idleTime: '10', // TODO convert
};

export function CreateProduct({editingProduct}: CreateProductProps) {
  const isEditing = Boolean(editingProduct);
  const router = useRouter();
  const [css, theme] = useStyletron();
  const {send, isLoading, error} = useSendData<FormDataType>(
    `/api/member/${isEditing ? editingProduct?.id : ''}`
  );
  const {handleSubmit, control, reset, watch} = useForm({
    reValidateMode: 'onBlur',
    defaultValues: editingProduct || defaultValues,
  });
  const [excludedListShown, setExcludedListShown] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const onSubmit = useCallback(
    async (formData: Partial<FormDataType>) => {
      let dataToSend: FormDataType = {};

      if (isEditing) {
        dataToSend = {...formData};
        delete dataToSend.id;
      } else {
        dataToSend = {
          ...formData,
        };
      }

      const res = await send(dataToSend, isEditing ? 'PUT' : 'POST');
      if (!res && 'error' in res) {
        console.error('Unknown error', res);
      } else {
        reset();
        await router.push('/team');
      }
    },
    [isEditing, reset, router, send]
  );

  const formBoxStyle = css({
    display: 'flex',
  });

  const formStyle = css({
    width: 'min(700px, 100%)',
    display: 'flex',
    flexDirection: 'column',
    gap: theme.sizing.scale100,
    [theme.mediaQuery.large]: {
      padding: theme.sizing.scale800,
      flexShrink: 0,
      gap: theme.sizing.scale300,
    },
  });

  const formSectionStyle = css({
    ...theme.borders.border200,
    padding: theme.sizing.scale600,
    borderRadius: theme.borders.radius300,
  });

  const buttonBoxStyle = css({
    marginTop: theme.sizing.scale600,
    display: 'flex',
    justifyContent: 'flex-end',
  });

  const formTitleStyle = css({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  });

  const extensionSettingsCheckboxesStyle = css({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.sizing.scale300,
  });

  const title = `${isEditing ? 'Update' : 'Add a new'} team member`;
  const trackMode = watch('trackMode');
  const domainListsDisabled = trackMode === 'all';
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
    <div>
      <Head>
        <title>{title}</title>
      </Head>

      <div className={formBoxStyle}>
        <form onSubmit={handleSubmit(onSubmit)} className={formStyle}>
          <Title marginBottom="scale600" marginTop={0} className={formTitleStyle}>
            {title}
          </Title>

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

            <ControlledInput label="Title" control={control} name="title" disabled={isLoading} />

            <ControlledInput
              label="Email"
              control={control}
              name="description"
              placeholder=""
              type="email"
              disabled={isLoading}
              caption="We will send them the tracking key"
            />
          </div>

          <SubTitle marginBottom="scale400" marginTop="scale600">
            Tracking mode
          </SubTitle>

          <div className={formSectionStyle}>
            <RadioTrackMode control={control} name="trackMode" />
            <div>
              <FormControl
                caption="List of domains, separated by comma (i.e. google.com, amazon.com, bbc.co.uk)"
                disabled={domainListsDisabled}
                overrides={radioControlOverrides}
              >
                <Textarea></Textarea>
              </FormControl>
            </div>
          </div>

          <div>
            {!excludedListShown && (
              <Button
                startEnhancer={BiHide}
                size={ButtonSize.compact}
                kind={ButtonKind.tertiary}
                onClick={() => setExcludedListShown(true)}
              >
                Exclude some domains
              </Button>
            )}
            {excludedListShown && (
              <div className={formSectionStyle}>
                <FormControl
                  label="Exclude domains"
                  caption="Excluded domains and subdomains separated by comma (i.e. mail.google.com)"
                >
                  <Textarea></Textarea>
                </FormControl>
              </div>
            )}
          </div>

          <SubTitle marginBottom="scale400" marginTop="scale600">
            Extension settings
          </SubTitle>

          <div className={formSectionStyle}>
            <SectionTitle marginBottom="scale600">Let member see</SectionTitle>
            <div className={extensionSettingsCheckboxesStyle}>
              <Checkbox
                checked={false}
                labelPlacement={LABEL_PLACEMENT.right}
                overrides={checkboxOverrides}
              >
                Track mode settings
              </Checkbox>
              <Checkbox
                checked={false}
                labelPlacement={LABEL_PLACEMENT.right}
                overrides={checkboxOverrides}
              >
                Total activity time
              </Checkbox>
              <Checkbox
                checked={false}
                labelPlacement={LABEL_PLACEMENT.right}
                overrides={checkboxOverrides}
              >
                Domains count
              </Checkbox>
              <Checkbox
                checked={false}
                labelPlacement={LABEL_PLACEMENT.right}
                overrides={checkboxOverrides}
              >
                Session count
              </Checkbox>
            </div>
          </div>

          <SubTitle
            marginBottom="scale400"
            marginTop="scale600"
            onClick={() => setShowAdvanced((cur) => !cur)}
            overrides={{
              Block: {
                style: {
                  display: 'flex',
                  alignItems: 'center',
                  gap: theme.sizing.scale200,
                  cursor: 'pointer',
                  marginRight: 'auto',
                  borderBottom: '1px dashed transparent',
                  ':hover': {
                    borderBottom: '1px dashed #999',
                  },
                },
              },
            }}
          >
            Advanced <AdvancedCaredIcon title="" />
          </SubTitle>

          {showAdvanced && (
            <div className={formSectionStyle}>
              <ControlledInput
                label="Idle time in seconds"
                control={control}
                name="idleTime"
                placeholder=""
                type="number"
                disabled={isLoading}
              />
            </div>
          )}

          <div className={buttonBoxStyle}>
            <Button
              type="submit"
              isLoading={isLoading}
              overrides={{
                BaseButton: {
                  style: {
                    backgroundColor: theme.colors.backgroundPositive,
                  },
                },
              }}
            >
              {!isEditing && 'Add member'}
              {isEditing && 'Update member'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
