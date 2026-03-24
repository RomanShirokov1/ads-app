import { BulbOutlined, DollarOutlined, ReloadOutlined } from '@ant-design/icons';
import { Alert, Button, Card, Form, Input, InputNumber, Popover, Select, Space, Typography, message } from 'antd';
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
import styles from './EditAdForm.module.css';

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

export const EditAdForm = ({ ad }: Props) => {
  const [form] = Form.useForm<EditAdFormValues>();
  const navigate = useNavigate();
  const markAdAsEdited = useEditedAdsStore(state => state.markAdAsEdited);

  const initialValues = useMemo(() => mapAdToFormValues(ad), [ad]);
  const [draftAvailable, setDraftAvailable] = useState<EditAdFormValues | null>(
    () => draftStorage.get(ad.id),
  );
  const [isDirty, setIsDirty] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [descriptionAi, setDescriptionAi] = useState<AiRequestState<DescriptionSuggestion>>(initialAiState);
  const [priceAi, setPriceAi] = useState<AiRequestState<PriceSuggestion>>(initialAiState);

  const bootstrappedRef = useRef(false);
  const category = Form.useWatch('category', form) ?? ad.category;
  const allValues = Form.useWatch([], form);
  const titleValue = Form.useWatch('title', form);
  const priceValue = Form.useWatch('price', form);
  const descriptionValue = Form.useWatch('description', form);

  const hasDescription = Boolean(descriptionValue?.trim());
  const canSubmit = Boolean(titleValue?.trim()) && priceValue !== null && priceValue !== undefined;
  const isAiConfigured = Boolean(env.ollamaUrl.trim());
  const aiDisabledHint = 'Укажите VITE_OLLAMA_URL в .env';

  useUnsavedChangesPrompt(isDirty);

  useEffect(() => {
    form.setFieldsValue(initialValues);
    bootstrappedRef.current = true;
    setIsDirty(false);
  }, [form, initialValues]);

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
        setDraftAvailable(draftStorage.get(ad.id));
        return;
      }

      draftStorage.clear(ad.id);
      setDraftAvailable(null);
    }, 300);
    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [ad.category, ad.id, allValues, initialValues]);

  const handleRestoreDraft = () => {
    if (!draftAvailable) {
      return;
    }

    form.setFieldsValue(draftAvailable);
    message.success('Черновик восстановлен');
  };

  const handleDiscardDraft = () => {
    draftStorage.clear(ad.id);
    setDraftAvailable(null);
    form.setFieldsValue(initialValues);
    message.info('Черновик удалён');
  };

  const handleCancel = () => {
    if (isDirty && !window.confirm('Есть несохранённые изменения. Выйти без сохранения?')) {
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
    setDescriptionAi(state => ({
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
        error: error instanceof Error ? error.message : 'Произошла ошибка при запросе к AI',
      });
    }
  };

  const handleEstimatePrice = async () => {
    setPriceAi(state => ({
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
        error: error instanceof Error ? error.message : 'Произошла ошибка при запросе к AI',
      });
    }
  };

  const handleSubmit = async (values: EditAdFormValues) => {
    setSubmitting(true);

    try {
      await adsApi.updateAd(ad.id, mapFormValuesToUpdatePayload(values));
      draftStorage.clear(ad.id);
      setIsDirty(false);
      markAdAsEdited(ad.id);
      message.success('Изменения сохранены');
      navigate(`/ads/${ad.id}`);
    } catch (error) {
      message.error(error instanceof Error ? error.message : 'Не удалось сохранить объявление');
    } finally {
      setSubmitting(false);
    }
  };

  const priceButtonLabel =
    priceAi.status === 'loading'
      ? 'Выполняется запрос'
      : priceAi.status === 'idle'
        ? 'Узнать рыночную цену'
        : 'Повторить запрос';

  const descriptionButtonLabel =
    descriptionAi.status === 'loading'
      ? 'Выполняется запрос'
      : descriptionAi.status === 'idle'
        ? hasDescription
          ? 'Улучшить описание'
          : 'Придумать описание'
        : 'Повторить запрос';

  const normalizedCurrentValues = allValues
    ? ({
        ...allValues,
        category: allValues.category ?? ad.category,
        params: allValues.params ?? {},
      } as EditAdFormValues)
    : null;

  const showDraftAlert =
    Boolean(draftAvailable) &&
    !draftEquals(draftAvailable as EditAdFormValues, initialValues) &&
    (!normalizedCurrentValues || !draftEquals(draftAvailable as EditAdFormValues, normalizedCurrentValues));

  return (
    <Card className={styles.card} title={'Редактирование объявления'}>
      {showDraftAlert ? (
        <Alert
          className={styles.draftAlert}
          type="warning"
          showIcon
          message={'Найден черновик'}
          description={'Можно восстановить локально сохранённые изменения или сбросить их.'}
          action={
            <Space wrap>
              <Button size="small" onClick={handleRestoreDraft}>
                {'Восстановить'}
              </Button>
              <Button size="small" onClick={handleDiscardDraft}>
                {'Сбросить'}
              </Button>
            </Space>
          }
        />
      ) : null}

      <Form<EditAdFormValues>
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        requiredMark
      >
        <section className={styles.section}>
          <Form.Item
            className={styles.fieldCompact}
            label={'Категория'}
            name="category"
            rules={[{ required: true, message: 'Выберите категорию' }]}
          >
            <Select options={categoryOptions} />
          </Form.Item>
        </section>

        <section className={styles.section}>
          <Form.Item
            className={styles.fieldCompact}
            label={'Название'}
            name="title"
            rules={[
              { required: true, message: 'Название должно быть заполнено' },
              { whitespace: true, message: 'Название должно быть заполнено' },
            ]}
          >
            <Input allowClear placeholder={'Например, MacBook Pro 16"'} />
          </Form.Item>

          <div className={styles.priceRow}>
            <Form.Item
              className={styles.fieldCompact}
              label={'Цена'}
              name="price"
              rules={[{ required: true, message: 'Укажите цену' }]}
            >
              <InputNumber min={0} precision={0} style={{ width: '100%' }} />
            </Form.Item>

            <Popover
              trigger="click"
              open={priceAi.open}
              placement="topLeft"
              onOpenChange={open => setPriceAi(state => ({ ...state, open }))}
              content={
                priceAi.status === 'success' && priceAi.data ? (
                  <div className={styles.aiPopoverContent}>
                    <Typography.Text strong>{'Ответ AI:'}</Typography.Text>
                    <Typography.Paragraph className={styles.aiParagraph}>
                      {'Рекомендованная цена:'} {new Intl.NumberFormat('ru-RU').format(priceAi.data.price)} {'₽'}
                    </Typography.Paragraph>
                    <Typography.Paragraph className={styles.aiParagraph}>
                      {priceAi.data.rationale}
                    </Typography.Paragraph>
                    <Space size={8}>
                      <Button
                        type="primary"
                        size="small"
                        onClick={() => {
                          form.setFieldValue('price', priceAi.data?.price);
                          setPriceAi(state => ({ ...state, open: false }));
                        }}
                      >
                        {'Применить'}
                      </Button>
                      <Button size="small" onClick={() => setPriceAi(state => ({ ...state, open: false }))}>
                        {'Закрыть'}
                      </Button>
                    </Space>
                  </div>
                ) : (
                  <div className={styles.aiPopoverContent}>
                    <Typography.Text className={styles.aiErrorTitle}>{'Произошла ошибка при запросе к AI'}</Typography.Text>
                    <Typography.Paragraph className={styles.aiParagraph}>
                      {priceAi.error ?? 'Попробуйте повторить запрос или закрыть уведомление.'}
                    </Typography.Paragraph>
                    <Button size="small" onClick={() => setPriceAi(state => ({ ...state, open: false }))}>
                      {'Закрыть'}
                    </Button>
                  </div>
                )
              }
            >
              <Button
                className={styles.aiButton}
                icon={priceAi.status === 'loading' ? <ReloadOutlined spin /> : <DollarOutlined />}
                loading={priceAi.status === 'loading'}
                disabled={!isAiConfigured || priceAi.status === 'loading'}
                title={!isAiConfigured ? aiDisabledHint : undefined}
                onClick={handleEstimatePrice}
              >
                {priceButtonLabel}
              </Button>
            </Popover>
          </div>
        </section>

        <section className={styles.section}>
          <Typography.Title className={styles.sectionTitle} level={5}>
            {'Характеристики'}
          </Typography.Title>

          {paramFieldConfig[category].map(field => (
            <Form.Item
              className={styles.fieldCompact}
              key={field.name}
              label={field.label}
              name={['params', field.name]}
            >
              {field.type === 'select' ? (
                <Select allowClear options={field.options} />
              ) : field.type === 'number' ? (
                <InputNumber min={field.min} style={{ width: '100%' }} />
              ) : (
                <Input allowClear />
              )}
            </Form.Item>
          ))}
        </section>

        <section className={styles.section}>
          <Form.Item className={styles.descriptionField} label={'Описание'} name="description">
            <Input.TextArea
              rows={4}
              maxLength={1000}
              showCount
              placeholder={'Расскажите о товаре, состоянии и условиях сделки'}
            />
          </Form.Item>

          <Popover
            trigger="click"
            open={descriptionAi.open}
            placement="topLeft"
            onOpenChange={open => setDescriptionAi(state => ({ ...state, open }))}
            content={
              descriptionAi.status === 'success' && descriptionAi.data ? (
                <div className={styles.aiPopoverContent}>
                  <Typography.Text strong>{'Ответ AI:'}</Typography.Text>
                  <Typography.Paragraph className={styles.aiParagraph}>
                    {descriptionAi.data.description}
                  </Typography.Paragraph>
                  {descriptionAi.data.suggestions.map(suggestion => (
                    <Typography.Paragraph key={suggestion} className={styles.aiParagraphMuted}>
                      {'•'} {suggestion}
                    </Typography.Paragraph>
                  ))}
                  <Space size={8}>
                    <Button
                      type="primary"
                      size="small"
                      onClick={() => {
                        if (descriptionAi.data) {
                          form.setFieldValue('description', descriptionAi.data.description);
                        }

                        setDescriptionAi(state => ({ ...state, open: false }));
                      }}
                    >
                      {'Применить'}
                    </Button>
                    <Button size="small" onClick={() => setDescriptionAi(state => ({ ...state, open: false }))}>
                      {'Закрыть'}
                    </Button>
                  </Space>
                </div>
              ) : (
                <div className={styles.aiPopoverContent}>
                  <Typography.Text className={styles.aiErrorTitle}>{'Произошла ошибка при запросе к AI'}</Typography.Text>
                  <Typography.Paragraph className={styles.aiParagraph}>
                    {descriptionAi.error ?? 'Попробуйте повторить запрос или закрыть уведомление.'}
                  </Typography.Paragraph>
                  <Button size="small" onClick={() => setDescriptionAi(state => ({ ...state, open: false }))}>
                    {'Закрыть'}
                  </Button>
                </div>
              )
            }
          >
            <Button
              className={styles.aiButton}
              icon={descriptionAi.status === 'loading' ? <ReloadOutlined spin /> : <BulbOutlined />}
              loading={descriptionAi.status === 'loading'}
              disabled={!isAiConfigured || descriptionAi.status === 'loading'}
              title={!isAiConfigured ? aiDisabledHint : undefined}
              onClick={handleGenerateDescription}
            >
              {descriptionButtonLabel}
            </Button>
          </Popover>
        </section>

        <div className={styles.footerActions}>
          <Button
            type="primary"
            htmlType="submit"
            loading={submitting}
            disabled={!canSubmit || submitting}
          >
            {'Сохранить'}
          </Button>
          <Button onClick={handleCancel}>{'Отменить'}</Button>
        </div>
      </Form>
    </Card>
  );
};
