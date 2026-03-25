import { Button, Input, InputNumber, Select } from 'antd';
import type { ButtonProps, InputProps, InputNumberProps, SelectProps } from 'antd';
import type { ComponentProps } from 'react';

import styles from './controls.module.css';

const cx = (...classNames: Array<string | undefined | false>) =>
  classNames.filter(Boolean).join(' ');

type UiButtonVariant = 'default' | 'secondary' | 'ai';

type UiButtonProps = ButtonProps & {
  tone?: UiButtonVariant;
};

export const UiButton = ({ tone = 'default', className, ...props }: UiButtonProps) => {
  const toneClassName =
    tone === 'secondary'
      ? styles.secondaryButton
      : tone === 'ai'
        ? styles.aiButton
        : undefined;

  return <Button {...props} className={cx(toneClassName, className)} />;
};

type UiInputProps = InputProps & {
  compact?: boolean;
};

export const UiInput = ({ compact = false, className, ...props }: UiInputProps) => (
  <Input {...props} className={cx(compact && styles.compactInput, className)} />
);

type UiInputNumberProps = InputNumberProps & {
  compact?: boolean;
};

export const UiInputNumber = ({ compact = false, className, ...props }: UiInputNumberProps) => (
  <InputNumber {...props} className={cx(compact && styles.compactInputNumber, className)} />
);

type UiSelectProps = SelectProps & {
  compact?: boolean;
};

export const UiSelect = ({ compact = false, className, ...props }: UiSelectProps) => (
  <Select {...props} className={cx(compact && styles.compactSelect, className)} />
);

type UiTextAreaProps = ComponentProps<typeof Input.TextArea> & {
  formStyle?: boolean;
};

export const UiTextArea = ({ formStyle = false, className, ...props }: UiTextAreaProps) => (
  <Input.TextArea {...props} className={cx(formStyle && styles.formTextArea, className)} />
);