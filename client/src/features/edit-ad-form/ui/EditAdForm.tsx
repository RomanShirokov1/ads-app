import { BulbOutlined, DollarOutlined, ReloadOutlined } from '@ant-design/icons';
import {
  Card,
  Form,
  Popover,
  Space,
  Typography,
  message,
} from 'antd';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adsApi } from '@/entities/ad/api/adApi';
import { categoryOptions } from '@/entities/ad/model/constants';
import { paramFieldConfig } from '@/entities/ad/model/field-config';
import type { Ad, EditAdFormValues } from '@/entities/ad/model/types';
import { aiService } from '@/features/ai-tools/api/aiService';
import { draftStorage } from '@/features/edit-ad-form/lib/draftStorage';
import {
  mapAdToFormValues,
  mapFormValuesToUpdatePayload,
} from '@/features/edit-ad-form/lib/form-mappers';
import { useEditedAdsStore } from '@/features/edit-ad-form/lib/useEditedAdsStore';
import { useUnsavedChangesPrompt } from '@/shared/hooks/useUnsavedChangesPrompt';
import { env } from '@/shared/config/env';

import { UiButton, UiInput, UiInputNumber, UiSelect, UiTextArea } from '@/shared/ui/controls';
import { aiPopoverClassName, selectPopupClassName } from '@/shared/ui/overlays';

import styles from './EditAdForm.module.css';
import { DraftAlert } from './components/DraftAlert';

type Props = {
  ad: Ad;
};

type DescriptionSuggestion = {
  description: string;
  suggestions: string[];
};

type PriceSuggestion = {
  price: number;
  rationale: string;
};

type AiRequestState<T> = {
  status: 'idle' | 'loading' | 'success' | 'error';
  open: boolean;
  data: T | null;
  error: string | null;
};

const draftEquals = (left: EditAdFormValues, right: EditAdFormValues) =>
  JSON.stringify(left) === JSON.stringify(right);

const initialAiState = <T,>(): AiRequestState<T> => ({
  status: 'idle',
  open: false,
  data: null,
  error: null,
});

const DRAFT_AUTOSAVE_DEBOUNCE_MS = 400;

export const EditAdForm = ({ ad }: Props) => {
  const [form] = Form.useForm<EditAdFormValues>();
  const navigate = useNavigate();
  const markAdAsEdited = useEditedAdsStore((state) => state.markAdAsEdited);

  const initialValues = useMemo(() => mapAdToFormValues(ad), [ad]);
  const [initialDraftSnapshot] = useState<EditAdFormValues | null>(() => draftStorage.get(ad.id));
  const [showDraftAlert, setShowDraftAlert] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [descriptionAi, setDescriptionAi] =
    useState<AiRequestState<DescriptionSuggestion>>(initialAiState);
  const [priceAi, setPriceAi] = useState<AiRequestState<PriceSuggestion>>(initialAiState);

  const bootstrappedRef = useRef(false);
  const draftVisibilityResolvedRef = useRef(false);
  const category = Form.useWatch('category', form) ?? ad.category;
  const allValues = Form.useWatch([], form);
  const titleValue = Form.useWatch('title', form);
  const priceValue = Form.useWatch('price', form);
  const descriptionValue = Form.useWatch('description', form);

  const hasDescription = Boolean(descriptionValue?.trim());
  const canSubmit = Boolean(titleValue?.trim()) && priceValue !== null && priceValue !== undefined;
  const isAiConfigured = Boolean(env.ollamaUrl.trim());
  const aiDisabledHint = 'Р В Р в‚¬Р В РЎвЂќР В Р’В°Р В Р’В¶Р В РЎвЂР РЋРІР‚С™Р В Р’Вµ VITE_OLLAMA_URL Р В Р вЂ  .env';

  useUnsavedChangesPrompt(isDirty);

  useEffect(() => {
    form.setFieldsValue(initialValues);
    bootstrappedRef.current = true;
    setIsDirty(false);
  }, [form, initialValues]);

  useEffect(() => {
    if (draftVisibilityResolvedRef.current) {
      return;
    }

    draftVisibilityResolvedRef.current = true;
    setShowDraftAlert(
      Boolean(initialDraftSnapshot) &&
        !draftEquals(initialDraftSnapshot as EditAdFormValues, initialValues),
    );
  }, [initialDraftSnapshot, initialValues]);

  useEffect(() => {
    if (!bootstrappedRef.current || !allValues) {
      return;
    }

    const normalizedValues = {
      ...allValues,
      category: allValues.category ?? ad.category,
      params: allValues.params ?? {},
    } as EditAdFormValues;
    const nextIsDirty = !draftEquals(normalizedValues, initialValues);

    setIsDirty(nextIsDirty);

    const timeoutId = window.setTimeout(() => {
      if (nextIsDirty) {
        draftStorage.set(ad.id, normalizedValues);
        return;
      }

      draftStorage.clear(ad.id);
    }, DRAFT_AUTOSAVE_DEBOUNCE_MS);

    return () => window.clearTimeout(timeoutId);
  }, [ad.category, ad.id, allValues, initialValues]);

  const handleRestoreDraft = () => {
    if (!initialDraftSnapshot) {
      return;
    }

    form.setFieldsValue(initialDraftSnapshot);
    setShowDraftAlert(false);
    message.success('Р В Р’В§Р В Р’ВµР РЋР вЂљР В Р вЂ¦Р В РЎвЂўР В Р вЂ Р В РЎвЂР В РЎвЂќ Р В Р вЂ Р В РЎвЂўР РЋР С“Р РЋР С“Р РЋРІР‚С™Р В Р’В°Р В Р вЂ¦Р В РЎвЂўР В Р вЂ Р В Р’В»Р В Р’ВµР В Р вЂ¦');
  };

  const handleDiscardDraft = () => {
    draftStorage.clear(ad.id);

    form.setFieldsValue(initialValues);
    setShowDraftAlert(false);
    message.info('Р В Р’В§Р В Р’ВµР РЋР вЂљР В Р вЂ¦Р В РЎвЂўР В Р вЂ Р В РЎвЂР В РЎвЂќ Р РЋРЎвЂњР В РўвЂР В Р’В°Р В Р’В»Р РЋРІР‚ВР В Р вЂ¦');
  };

  const handleCancel = () => {
    if (
      isDirty &&
      !window.confirm(
        'Р В РІР‚СћР РЋР С“Р РЋРІР‚С™Р РЋР Р‰ Р В Р вЂ¦Р В Р’ВµР РЋР С“Р В РЎвЂўР РЋРІР‚В¦Р РЋР вЂљР В Р’В°Р В Р вЂ¦Р РЋРІР‚ВР В Р вЂ¦Р В Р вЂ¦Р РЋРІР‚в„–Р В Р’Вµ Р В РЎвЂР В Р’В·Р В РЎВР В Р’ВµР В Р вЂ¦Р В Р’ВµР В Р вЂ¦Р В РЎвЂР РЋР РЏ. Р В РІР‚в„ўР РЋРІР‚в„–Р В РІвЂћвЂ“Р РЋРІР‚С™Р В РЎвЂ Р В Р’В±Р В Р’ВµР В Р’В· Р РЋР С“Р В РЎвЂўР РЋРІР‚В¦Р РЋР вЂљР В Р’В°Р В Р вЂ¦Р В Р’ВµР В Р вЂ¦Р В РЎвЂР РЋР РЏ?',
      )
    ) {
      return;
    }

    navigate(`/ads/${ad.id}`);
  };

  const getCurrentValues = async () => {
    const values = await form.validateFields();

    return {
      ...values,
      params: values.params ?? {},
    };
  };

  const handleGenerateDescription = async () => {
    setDescriptionAi((state) => ({
      ...state,
      status: 'loading',
      open: false,
      error: null,
    }));

    try {
      const values = await getCurrentValues();
      const result = await aiService.generateDescription(values);

      setDescriptionAi({
        status: 'success',
        open: true,
        data: result,
        error: null,
      });
    } catch (error) {
      setDescriptionAi({
        status: 'error',
        open: true,
        data: null,
        error:
          error instanceof Error
            ? error.message
            : 'Р В РЎСџР РЋР вЂљР В РЎвЂўР В РЎвЂР В Р’В·Р В РЎвЂўР РЋРІвЂљВ¬Р В Р’В»Р В Р’В° Р В РЎвЂўР РЋРІвЂљВ¬Р В РЎвЂР В Р’В±Р В РЎвЂќР В Р’В° Р В РЎвЂ”Р РЋР вЂљР В РЎвЂ Р В Р’В·Р В Р’В°Р В РЎвЂ”Р РЋР вЂљР В РЎвЂўР РЋР С“Р В Р’Вµ Р В РЎвЂќ AI',
      });
    }
  };

  const handleEstimatePrice = async () => {
    setPriceAi((state) => ({
      ...state,
      status: 'loading',
      open: false,
      error: null,
    }));

    try {
      const values = await getCurrentValues();
      const result = await aiService.estimatePrice(values);

      setPriceAi({
        status: 'success',
        open: true,
        data: result,
        error: null,
      });
    } catch (error) {
      setPriceAi({
        status: 'error',
        open: true,
        data: null,
        error:
          error instanceof Error
            ? error.message
            : 'Р В РЎСџР РЋР вЂљР В РЎвЂўР В РЎвЂР В Р’В·Р В РЎвЂўР РЋРІвЂљВ¬Р В Р’В»Р В Р’В° Р В РЎвЂўР РЋРІвЂљВ¬Р В РЎвЂР В Р’В±Р В РЎвЂќР В Р’В° Р В РЎвЂ”Р РЋР вЂљР В РЎвЂ Р В Р’В·Р В Р’В°Р В РЎвЂ”Р РЋР вЂљР В РЎвЂўР РЋР С“Р В Р’Вµ Р В РЎвЂќ AI',
      });
    }
  };

  const handleSubmit = async (values: EditAdFormValues) => {
    setSubmitting(true);

    try {
      await adsApi.updateAd(ad.id, mapFormValuesToUpdatePayload(values));
      draftStorage.clear(ad.id);
      setIsDirty(false);
      setShowDraftAlert(false);
      markAdAsEdited(ad.id);
      message.success('Р В Р’ВР В Р’В·Р В РЎВР В Р’ВµР В Р вЂ¦Р В Р’ВµР В Р вЂ¦Р В РЎвЂР РЋР РЏ Р РЋР С“Р В РЎвЂўР РЋРІР‚В¦Р РЋР вЂљР В Р’В°Р В Р вЂ¦Р В Р’ВµР В Р вЂ¦Р РЋРІР‚в„–');
      navigate(`/ads/${ad.id}`);
    } catch (error) {
      message.error(
        error instanceof Error
          ? error.message
          : 'Р В РЎСљР В Р’Вµ Р РЋРЎвЂњР В РўвЂР В Р’В°Р В Р’В»Р В РЎвЂўР РЋР С“Р РЋР Р‰ Р РЋР С“Р В РЎвЂўР РЋРІР‚В¦Р РЋР вЂљР В Р’В°Р В Р вЂ¦Р В РЎвЂР РЋРІР‚С™Р РЋР Р‰ Р В РЎвЂўР В Р’В±Р РЋР вЂ°Р РЋР РЏР В Р вЂ Р В Р’В»Р В Р’ВµР В Р вЂ¦Р В РЎвЂР В Р’Вµ',
      );
    } finally {
      setSubmitting(false);
    }
  };

  const priceButtonLabel =
    priceAi.status === 'loading'
      ? 'Р В РІР‚в„ўР РЋРІР‚в„–Р В РЎвЂ”Р В РЎвЂўР В Р’В»Р В Р вЂ¦Р РЋР РЏР В Р’ВµР РЋРІР‚С™Р РЋР С“Р РЋР РЏ Р В Р’В·Р В Р’В°Р В РЎвЂ”Р РЋР вЂљР В РЎвЂўР РЋР С“'
      : priceAi.status === 'idle'
        ? 'Р В Р в‚¬Р В Р’В·Р В Р вЂ¦Р В Р’В°Р РЋРІР‚С™Р РЋР Р‰ Р РЋР вЂљР РЋРІР‚в„–Р В Р вЂ¦Р В РЎвЂўР РЋРІР‚РЋР В Р вЂ¦Р РЋРЎвЂњР РЋР вЂ№ Р РЋРІР‚В Р В Р’ВµР В Р вЂ¦Р РЋРЎвЂњ'
        : 'Р В РЎСџР В РЎвЂўР В Р вЂ Р РЋРІР‚С™Р В РЎвЂўР РЋР вЂљР В РЎвЂР РЋРІР‚С™Р РЋР Р‰ Р В Р’В·Р В Р’В°Р В РЎвЂ”Р РЋР вЂљР В РЎвЂўР РЋР С“';

  const descriptionButtonLabel =
    descriptionAi.status === 'loading'
      ? 'Р В РІР‚в„ўР РЋРІР‚в„–Р В РЎвЂ”Р В РЎвЂўР В Р’В»Р В Р вЂ¦Р РЋР РЏР В Р’ВµР РЋРІР‚С™Р РЋР С“Р РЋР РЏ Р В Р’В·Р В Р’В°Р В РЎвЂ”Р РЋР вЂљР В РЎвЂўР РЋР С“'
      : descriptionAi.status === 'idle'
        ? hasDescription
          ? 'Р В Р в‚¬Р В Р’В»Р РЋРЎвЂњР РЋРІР‚РЋР РЋРІвЂљВ¬Р В РЎвЂР РЋРІР‚С™Р РЋР Р‰ Р В РЎвЂўР В РЎвЂ”Р В РЎвЂР РЋР С“Р В Р’В°Р В Р вЂ¦Р В РЎвЂР В Р’Вµ'
          : 'Р В РЎСџР РЋР вЂљР В РЎвЂР В РўвЂР РЋРЎвЂњР В РЎВР В Р’В°Р РЋРІР‚С™Р РЋР Р‰ Р В РЎвЂўР В РЎвЂ”Р В РЎвЂР РЋР С“Р В Р’В°Р В Р вЂ¦Р В РЎвЂР В Р’Вµ'
        : 'Р В РЎСџР В РЎвЂўР В Р вЂ Р РЋРІР‚С™Р В РЎвЂўР РЋР вЂљР В РЎвЂР РЋРІР‚С™Р РЋР Р‰ Р В Р’В·Р В Р’В°Р В РЎвЂ”Р РЋР вЂљР В РЎвЂўР РЋР С“';

  return (
    <Card className={styles.card} title={'Р В Р’В Р В Р’ВµР В РўвЂР В Р’В°Р В РЎвЂќР РЋРІР‚С™Р В РЎвЂР РЋР вЂљР В РЎвЂўР В Р вЂ Р В Р’В°Р В Р вЂ¦Р В РЎвЂР В Р’Вµ Р В РЎвЂўР В Р’В±Р РЋР вЂ°Р РЋР РЏР В Р вЂ Р В Р’В»Р В Р’ВµР В Р вЂ¦Р В РЎвЂР РЋР РЏ'}>
      {showDraftAlert ? (
        <DraftAlert onRestore={handleRestoreDraft} onDiscard={handleDiscardDraft} />
      ) : null}

      <Form<EditAdFormValues> form={form} layout="vertical" onFinish={handleSubmit} requiredMark>
        <section className={styles.section}>
          <Form.Item
            className={styles.fieldCompact}
            label={'Р В РЎв„ўР В Р’В°Р РЋРІР‚С™Р В Р’ВµР В РЎвЂ“Р В РЎвЂўР РЋР вЂљР В РЎвЂР РЋР РЏ'}
            name="category"
            rules={[{ required: true, message: 'Р В РІР‚в„ўР РЋРІР‚в„–Р В Р’В±Р В Р’ВµР РЋР вЂљР В РЎвЂР РЋРІР‚С™Р В Р’Вµ Р В РЎвЂќР В Р’В°Р РЋРІР‚С™Р В Р’ВµР В РЎвЂ“Р В РЎвЂўР РЋР вЂљР В РЎвЂР РЋР вЂ№' }]}>
            <UiSelect compact popupClassName={selectPopupClassName} options={categoryOptions} />
          </Form.Item>
        </section>

        <section className={styles.section}>
          <Form.Item
            className={styles.fieldCompact}
            label={'Р В РЎСљР В Р’В°Р В Р’В·Р В Р вЂ Р В Р’В°Р В Р вЂ¦Р В РЎвЂР В Р’Вµ'}
            name="title"
            rules={[
              {
                required: true,
                message: 'Р В РЎСљР В Р’В°Р В Р’В·Р В Р вЂ Р В Р’В°Р В Р вЂ¦Р В РЎвЂР В Р’Вµ Р В РўвЂР В РЎвЂўР В Р’В»Р В Р’В¶Р В Р вЂ¦Р В РЎвЂў Р В Р’В±Р РЋРІР‚в„–Р РЋРІР‚С™Р РЋР Р‰ Р В Р’В·Р В Р’В°Р В РЎвЂ”Р В РЎвЂўР В Р’В»Р В Р вЂ¦Р В Р’ВµР В Р вЂ¦Р В РЎвЂў',
              },
              {
                whitespace: true,
                message: 'Р В РЎСљР В Р’В°Р В Р’В·Р В Р вЂ Р В Р’В°Р В Р вЂ¦Р В РЎвЂР В Р’Вµ Р В РўвЂР В РЎвЂўР В Р’В»Р В Р’В¶Р В Р вЂ¦Р В РЎвЂў Р В Р’В±Р РЋРІР‚в„–Р РЋРІР‚С™Р РЋР Р‰ Р В Р’В·Р В Р’В°Р В РЎвЂ”Р В РЎвЂўР В Р’В»Р В Р вЂ¦Р В Р’ВµР В Р вЂ¦Р В РЎвЂў',
              },
            ]}>
            <UiInput compact allowClear placeholder={'Р В РЎСљР В Р’В°Р В РЎвЂ”Р РЋР вЂљР В РЎвЂР В РЎВР В Р’ВµР РЋР вЂљ, MacBook Pro 16"'} />
          </Form.Item>

          <div className={styles.priceRow}>
            <Form.Item
              className={styles.fieldCompact}
              label={'Р В Р’В¦Р В Р’ВµР В Р вЂ¦Р В Р’В°'}
              name="price"
              rules={[{ required: true, message: 'Р В Р в‚¬Р В РЎвЂќР В Р’В°Р В Р’В¶Р В РЎвЂР РЋРІР‚С™Р В Р’Вµ Р РЋРІР‚В Р В Р’ВµР В Р вЂ¦Р РЋРЎвЂњ' }]}>
              <UiInputNumber compact min={0} precision={0} style={{ width: '100%' }} />
            </Form.Item>

            <Popover
              trigger="click"
              open={priceAi.open}
              placement="topLeft"
              overlayClassName={aiPopoverClassName}
              onOpenChange={(open) => setPriceAi((state) => ({ ...state, open }))}
              content={
                priceAi.status === 'success' && priceAi.data ? (
                  <div className={styles.aiPopoverContent}>
                    <Typography.Text strong>{'Р В РЎвЂєР РЋРІР‚С™Р В Р вЂ Р В Р’ВµР РЋРІР‚С™ AI:'}</Typography.Text>
                    <Typography.Paragraph className={styles.aiParagraph}>
                      {'Р В Р’В Р В Р’ВµР В РЎвЂќР В РЎвЂўР В РЎВР В Р’ВµР В Р вЂ¦Р В РўвЂР В РЎвЂўР В Р вЂ Р В Р’В°Р В Р вЂ¦Р В Р вЂ¦Р В Р’В°Р РЋР РЏ Р РЋРІР‚В Р В Р’ВµР В Р вЂ¦Р В Р’В°:'}{' '}
                      {new Intl.NumberFormat('ru-RU').format(priceAi.data.price)} {'Р Р†РІР‚С™Р вЂ¦'}
                    </Typography.Paragraph>
                    <Typography.Paragraph className={styles.aiParagraph}>
                      {priceAi.data.rationale}
                    </Typography.Paragraph>
                    <Space size={8}>
                      <UiButton
                        type="primary"
                        size="small"
                        onClick={() => {
                          form.setFieldValue('price', priceAi.data?.price);
                          setPriceAi((state) => ({ ...state, open: false }));
                        }}>
                        {'Р В РЎСџР РЋР вЂљР В РЎвЂР В РЎВР В Р’ВµР В Р вЂ¦Р В РЎвЂР РЋРІР‚С™Р РЋР Р‰'}
                      </UiButton>
                      <UiButton
                        tone="secondary"
                        size="small"
                        onClick={() => setPriceAi((state) => ({ ...state, open: false }))}>
                        {'Р В РІР‚вЂќР В Р’В°Р В РЎвЂќР РЋР вЂљР РЋРІР‚в„–Р РЋРІР‚С™Р РЋР Р‰'}
                      </UiButton>
                    </Space>
                  </div>
                ) : (
                  <div className={styles.aiPopoverContent}>
                    <Typography.Text className={styles.aiErrorTitle}>
                      {'Р В РЎСџР РЋР вЂљР В РЎвЂўР В РЎвЂР В Р’В·Р В РЎвЂўР РЋРІвЂљВ¬Р В Р’В»Р В Р’В° Р В РЎвЂўР РЋРІвЂљВ¬Р В РЎвЂР В Р’В±Р В РЎвЂќР В Р’В° Р В РЎвЂ”Р РЋР вЂљР В РЎвЂ Р В Р’В·Р В Р’В°Р В РЎвЂ”Р РЋР вЂљР В РЎвЂўР РЋР С“Р В Р’Вµ Р В РЎвЂќ AI'}
                    </Typography.Text>
                    <Typography.Paragraph className={styles.aiParagraph}>
                      {priceAi.error ??
                        'Р В РЎСџР В РЎвЂўР В РЎвЂ”Р РЋР вЂљР В РЎвЂўР В Р’В±Р РЋРЎвЂњР В РІвЂћвЂ“Р РЋРІР‚С™Р В Р’Вµ Р В РЎвЂ”Р В РЎвЂўР В Р вЂ Р РЋРІР‚С™Р В РЎвЂўР РЋР вЂљР В РЎвЂР РЋРІР‚С™Р РЋР Р‰ Р В Р’В·Р В Р’В°Р В РЎвЂ”Р РЋР вЂљР В РЎвЂўР РЋР С“ Р В РЎвЂР В Р’В»Р В РЎвЂ Р В Р’В·Р В Р’В°Р В РЎвЂќР РЋР вЂљР РЋРІР‚в„–Р РЋРІР‚С™Р РЋР Р‰ Р РЋРЎвЂњР В Р вЂ Р В Р’ВµР В РўвЂР В РЎвЂўР В РЎВР В Р’В»Р В Р’ВµР В Р вЂ¦Р В РЎвЂР В Р’Вµ.'}
                    </Typography.Paragraph>
                    <UiButton
                      tone="secondary"
                      size="small"
                      onClick={() => setPriceAi((state) => ({ ...state, open: false }))}>
                      {'Р В РІР‚вЂќР В Р’В°Р В РЎвЂќР РЋР вЂљР РЋРІР‚в„–Р РЋРІР‚С™Р РЋР Р‰'}
                    </UiButton>
                  </div>
                )
              }>
              <UiButton
                tone="ai"
                icon={priceAi.status === 'loading' ? <ReloadOutlined spin /> : <DollarOutlined />}
                loading={priceAi.status === 'loading'}
                disabled={!isAiConfigured || priceAi.status === 'loading'}
                title={!isAiConfigured ? aiDisabledHint : undefined}
                onClick={handleEstimatePrice}>
                {priceButtonLabel}
              </UiButton>
            </Popover>
          </div>
        </section>

        <section className={styles.section}>
          <Typography.Title className={styles.sectionTitle} level={5}>
            {'Р В РўС’Р В Р’В°Р РЋР вЂљР В Р’В°Р В РЎвЂќР РЋРІР‚С™Р В Р’ВµР РЋР вЂљР В РЎвЂР РЋР С“Р РЋРІР‚С™Р В РЎвЂР В РЎвЂќР В РЎвЂ'}
          </Typography.Title>

          {paramFieldConfig[category].map((field) => (
            <Form.Item
              className={styles.fieldCompact}
              key={field.name}
              label={field.label}
              name={['params', field.name]}>
              {field.type === 'select' ? (
                <UiSelect compact popupClassName={selectPopupClassName} allowClear options={field.options} />
              ) : field.type === 'number' ? (
                <UiInputNumber compact min={field.min} style={{ width: '100%' }} />
              ) : (
                <UiInput compact allowClear />
              )}
            </Form.Item>
          ))}
        </section>

        <section className={styles.section}>
          <Form.Item
            className={styles.descriptionField}
            label={'Р В РЎвЂєР В РЎвЂ”Р В РЎвЂР РЋР С“Р В Р’В°Р В Р вЂ¦Р В РЎвЂР В Р’Вµ'}
            name="description">
            <UiTextArea formStyle
              rows={4}
              maxLength={1000}
              showCount
              placeholder={
                'Р В Р’В Р В Р’В°Р РЋР С“Р РЋР С“Р В РЎвЂќР В Р’В°Р В Р’В¶Р В РЎвЂР РЋРІР‚С™Р В Р’Вµ Р В РЎвЂў Р РЋРІР‚С™Р В РЎвЂўР В Р вЂ Р В Р’В°Р РЋР вЂљР В Р’Вµ, Р РЋР С“Р В РЎвЂўР РЋР С“Р РЋРІР‚С™Р В РЎвЂўР РЋР РЏР В Р вЂ¦Р В РЎвЂР В РЎвЂ Р В РЎвЂ Р РЋРЎвЂњР РЋР С“Р В Р’В»Р В РЎвЂўР В Р вЂ Р В РЎвЂР РЋР РЏР РЋРІР‚В¦ Р РЋР С“Р В РўвЂР В Р’ВµР В Р’В»Р В РЎвЂќР В РЎвЂ'
              }
            />
          </Form.Item>

          <Popover
            trigger="click"
            open={descriptionAi.open}
            placement="topLeft"
            overlayClassName={aiPopoverClassName}
            onOpenChange={(open) => setDescriptionAi((state) => ({ ...state, open }))}
            content={
              descriptionAi.status === 'success' && descriptionAi.data ? (
                <div className={styles.aiPopoverContent}>
                  <Typography.Text strong>{'Р В РЎвЂєР РЋРІР‚С™Р В Р вЂ Р В Р’ВµР РЋРІР‚С™ AI:'}</Typography.Text>
                  <Typography.Paragraph className={styles.aiParagraph}>
                    {descriptionAi.data.description}
                  </Typography.Paragraph>
                  {descriptionAi.data.suggestions.map((suggestion) => (
                    <Typography.Paragraph key={suggestion} className={styles.aiParagraphMuted}>
                      {'Р Р†Р вЂљРЎС›'} {suggestion}
                    </Typography.Paragraph>
                  ))}
                  <Space size={8}>
                    <UiButton
                      type="primary"
                      size="small"
                      onClick={() => {
                        if (descriptionAi.data) {
                          form.setFieldValue('description', descriptionAi.data.description);
                        }

                        setDescriptionAi((state) => ({ ...state, open: false }));
                      }}>
                      {'Р В РЎСџР РЋР вЂљР В РЎвЂР В РЎВР В Р’ВµР В Р вЂ¦Р В РЎвЂР РЋРІР‚С™Р РЋР Р‰'}
                    </UiButton>
                    <UiButton
                      tone="secondary"
                      size="small"
                      onClick={() => setDescriptionAi((state) => ({ ...state, open: false }))}>
                      {'Р В РІР‚вЂќР В Р’В°Р В РЎвЂќР РЋР вЂљР РЋРІР‚в„–Р РЋРІР‚С™Р РЋР Р‰'}
                    </UiButton>
                  </Space>
                </div>
              ) : (
                <div className={styles.aiPopoverContent}>
                  <Typography.Text className={styles.aiErrorTitle}>
                    {'Р В РЎСџР РЋР вЂљР В РЎвЂўР В РЎвЂР В Р’В·Р В РЎвЂўР РЋРІвЂљВ¬Р В Р’В»Р В Р’В° Р В РЎвЂўР РЋРІвЂљВ¬Р В РЎвЂР В Р’В±Р В РЎвЂќР В Р’В° Р В РЎвЂ”Р РЋР вЂљР В РЎвЂ Р В Р’В·Р В Р’В°Р В РЎвЂ”Р РЋР вЂљР В РЎвЂўР РЋР С“Р В Р’Вµ Р В РЎвЂќ AI'}
                  </Typography.Text>
                  <Typography.Paragraph className={styles.aiParagraph}>
                    {descriptionAi.error ??
                      'Р В РЎСџР В РЎвЂўР В РЎвЂ”Р РЋР вЂљР В РЎвЂўР В Р’В±Р РЋРЎвЂњР В РІвЂћвЂ“Р РЋРІР‚С™Р В Р’Вµ Р В РЎвЂ”Р В РЎвЂўР В Р вЂ Р РЋРІР‚С™Р В РЎвЂўР РЋР вЂљР В РЎвЂР РЋРІР‚С™Р РЋР Р‰ Р В Р’В·Р В Р’В°Р В РЎвЂ”Р РЋР вЂљР В РЎвЂўР РЋР С“ Р В РЎвЂР В Р’В»Р В РЎвЂ Р В Р’В·Р В Р’В°Р В РЎвЂќР РЋР вЂљР РЋРІР‚в„–Р РЋРІР‚С™Р РЋР Р‰ Р РЋРЎвЂњР В Р вЂ Р В Р’ВµР В РўвЂР В РЎвЂўР В РЎВР В Р’В»Р В Р’ВµР В Р вЂ¦Р В РЎвЂР В Р’Вµ.'}
                  </Typography.Paragraph>
                  <UiButton
                    tone="secondary"
                    size="small"
                    onClick={() => setDescriptionAi((state) => ({ ...state, open: false }))}>
                    {'Р В РІР‚вЂќР В Р’В°Р В РЎвЂќР РЋР вЂљР РЋРІР‚в„–Р РЋРІР‚С™Р РЋР Р‰'}
                  </UiButton>
                </div>
              )
            }>
            <UiButton
              tone="ai"
              icon={descriptionAi.status === 'loading' ? <ReloadOutlined spin /> : <BulbOutlined />}
              loading={descriptionAi.status === 'loading'}
              disabled={!isAiConfigured || descriptionAi.status === 'loading'}
              title={!isAiConfigured ? aiDisabledHint : undefined}
              onClick={handleGenerateDescription}>
              {descriptionButtonLabel}
            </UiButton>
          </Popover>
        </section>

        <div className={styles.footerActions}>
          <UiButton
            type="primary"
            htmlType="submit"
            loading={submitting}
            disabled={!canSubmit || submitting}>
            {'Р В Р Р‹Р В РЎвЂўР РЋРІР‚В¦Р РЋР вЂљР В Р’В°Р В Р вЂ¦Р В РЎвЂР РЋРІР‚С™Р РЋР Р‰'}
          </UiButton>
          <UiButton tone="secondary" onClick={handleCancel}>{'Р В РЎвЂєР РЋРІР‚С™Р В РЎВР В Р’ВµР В Р вЂ¦Р В РЎвЂР РЋРІР‚С™Р РЋР Р‰'}</UiButton>
        </div>
      </Form>
    </Card>
  );
};
