import {useStyletron} from 'baseui';
import {LabelLarge as Title} from 'baseui/typography';
import {FormControl} from 'baseui/form-control';
import {Button} from 'baseui/button';
import {LABEL_PLACEMENT} from 'baseui/checkbox';
import {useForm} from 'react-hook-form';
import React, {useCallback} from 'react';
import {Notification, KIND} from 'baseui/notification';
import Head from 'next/head';
import {useRouter} from 'next/router';
import {RadioGroup} from 'baseui/radio';
import {Textarea} from 'baseui/textarea';
import {Member} from '@prisma/client';
import {ControlledInput} from '../common/controlled-input';
import {useSendData} from '../hooks/use-send-data';
import {ControlledRadio} from '../common/controlled-radio';

const ADDITIONAL_FIELDS_SHOWN = false;

export type FormDataType = Partial<Member>;

type CreateProductProps = {
  editingProduct?: undefined | Partial<FormDataType>;
};

const defaultValues: FormDataType = {
  name: '',
  description: '',
  email: '',
};

export function CreateProduct({editingProduct}: CreateProductProps) {
  const isEditing = Boolean(editingProduct);
  const router = useRouter();
  const [css, theme] = useStyletron();
  const {send, isLoading, error} = useSendData<FormDataType>(
    `/api/member/${isEditing ? editingProduct?.id : ''}`
  );
  const {handleSubmit, control, reset} = useForm({
    reValidateMode: 'onBlur',
    defaultValues: editingProduct || defaultValues,
  });

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

  const title = `${isEditing ? 'Update' : 'Add a new'} team member`;

  return (
    <div>
      <Head>
        <title>{title}</title>
      </Head>

      <div className={formBoxStyle}>
        <form onSubmit={handleSubmit(onSubmit)} className={formStyle}>
          <Title marginBottom="scale600" className={formTitleStyle}>
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

          <ControlledInput
            label="Name *"
            required
            control={control}
            name="name"
            caption="Person name"
            disabled={isLoading}
          />

          <ControlledInput
            label="Title"
            control={control}
            name="title"
            caption="Job title"
            disabled={isLoading}
          />

          <ControlledInput
            label="Description"
            control={control}
            name="description"
            caption="Any details, visible only to you"
            maxLength={255}
            disabled={isLoading}
          />

          <ControlledInput
            label="Person email"
            control={control}
            name="description"
            placeholder=""
            type="email"
            disabled={isLoading}
            caption="We will send them the tracking key"
          />

          {ADDITIONAL_FIELDS_SHOWN && (
            <>
              <RadioGroup name="trackType" value="trackAll">
                <ControlledRadio
                  control={control}
                  required
                  name="trackAll"
                  value="trackAll"
                  labelPlacement={LABEL_PLACEMENT.right}
                  disabled={isLoading}
                  label="Track all tabs"
                />
                <ControlledRadio
                  control={control}
                  required
                  name="trackDomains"
                  value="trackDomains"
                  labelPlacement={LABEL_PLACEMENT.right}
                  disabled={isLoading}
                  label="Track specific domains"
                />
              </RadioGroup>

              <FormControl label="List domains to track">
                <Textarea></Textarea>
              </FormControl>
            </>
          )}

          <div className={buttonBoxStyle}>
            <Button type="submit" isLoading={isLoading}>
              {!isEditing && 'Add member'}
              {isEditing && 'Update member'}
            </Button>{' '}
          </div>
        </form>
      </div>
    </div>
  );
}
