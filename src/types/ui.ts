// ========================================
// UI COMPONENT TYPES
// ========================================

import React from 'react';

// ========================================
// BASE COMPONENT TYPES
// ========================================

export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
  id?: string;
  'data-testid'?: string;
}

export interface ClickableProps extends BaseComponentProps {
  onClick?: (event: React.MouseEvent) => void;
  disabled?: boolean;
}

export interface FocusableProps extends BaseComponentProps {
  onFocus?: (event: React.FocusEvent) => void;
  onBlur?: (event: React.FocusEvent) => void;
  tabIndex?: number;
}

// ========================================
// MODAL & DIALOG TYPES
// ========================================

export interface ModalProps extends BaseComponentProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
}

export interface DialogProps extends ModalProps {
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  type?: 'info' | 'warning' | 'error' | 'success';
}

// ========================================
// FORM COMPONENT TYPES
// ========================================

export interface FormFieldProps extends BaseComponentProps {
  label: string;
  name: string;
  error?: string;
  required?: boolean;
  helpText?: string;
  disabled?: boolean;
}

export interface InputProps extends FormFieldProps, FocusableProps {
  type: 'text' | 'email' | 'password' | 'number' | 'date' | 'tel' | 'url' | 'search';
  placeholder?: string;
  value?: string | number;
  defaultValue?: string | number;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onInput?: (event: React.FormEvent<HTMLInputElement>) => void;
  min?: number;
  max?: number;
  step?: number;
  pattern?: string;
  autoComplete?: string;
  autoFocus?: boolean;
  readOnly?: boolean;
}

export interface TextareaProps extends FormFieldProps, FocusableProps {
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  rows?: number;
  cols?: number;
  maxLength?: number;
  minLength?: number;
  autoComplete?: string;
  autoFocus?: boolean;
  readOnly?: boolean;
  resize?: 'none' | 'both' | 'horizontal' | 'vertical';
}

export interface SelectProps extends FormFieldProps, FocusableProps {
  value?: string | number;
  defaultValue?: string | number;
  onChange?: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  options: Array<{ value: string | number; label: string; disabled?: boolean }>;
  placeholder?: string;
  multiple?: boolean;
  size?: number;
}

export interface CheckboxProps extends FormFieldProps, ClickableProps, FocusableProps {
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  indeterminate?: boolean;
  value?: string;
}

export interface RadioProps extends FormFieldProps, ClickableProps, FocusableProps {
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  value: string;
}

export interface SwitchProps extends FormFieldProps, ClickableProps {
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  size?: 'sm' | 'md' | 'lg';
}

// ========================================
// BUTTON TYPES
// ========================================

export interface ButtonProps extends ClickableProps, FocusableProps {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'outline' | 'ghost' | 'link';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  type?: 'button' | 'submit' | 'reset';
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  rounded?: boolean;
}

export interface IconButtonProps extends ClickableProps, FocusableProps {
  icon: React.ReactNode;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: ButtonProps['variant'];
  rounded?: boolean;
  tooltip?: string;
  tooltipPosition?: 'top' | 'bottom' | 'left' | 'right';
}

// ========================================
// CARD TYPES
// ========================================

export interface CardProps extends BaseComponentProps {
  variant?: 'default' | 'elevated' | 'outlined' | 'filled';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  hover?: boolean;
  clickable?: boolean;
  onClick?: () => void;
}

export interface CardHeaderProps extends BaseComponentProps {
  title?: string;
  subtitle?: string;
  avatar?: React.ReactNode;
  action?: React.ReactNode;
  divider?: boolean;
}

export interface CardBodyProps extends BaseComponentProps {
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
}

export interface CardFooterProps extends BaseComponentProps {
  divider?: boolean;
  justify?: 'start' | 'center' | 'end' | 'between' | 'around';
}

// ========================================
// LIST & TABLE TYPES
// ========================================

export interface ListProps extends BaseComponentProps {
  variant?: 'default' | 'bordered' | 'striped';
  size?: 'sm' | 'md' | 'lg';
  hover?: boolean;
  selectable?: boolean;
  onSelect?: (item: unknown) => void;
}

export interface ListItemProps extends BaseComponentProps, ClickableProps {
  selected?: boolean;
  disabled?: boolean;
  avatar?: React.ReactNode;
  action?: React.ReactNode;
  divider?: boolean;
}

export interface TableProps extends BaseComponentProps {
  variant?: 'default' | 'bordered' | 'striped' | 'compact';
  size?: 'sm' | 'md' | 'lg';
  hover?: boolean;
  selectable?: boolean;
  sortable?: boolean;
  onSort?: (column: string, direction: 'asc' | 'desc') => void;
  onSelect?: (items: unknown[]) => void;
}

export interface TableColumn<T = unknown> {
  key: string;
  title: string;
  dataIndex: keyof T;
  width?: number | string;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
  render?: (value: unknown, record: T, index: number) => React.ReactNode;
}

export interface TableRowProps extends BaseComponentProps {
  selected?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  onSelect?: (checked: boolean) => void;
}

// ========================================
// NAVIGATION TYPES
// ========================================

export interface NavItemProps extends BaseComponentProps, ClickableProps {
  active?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  badge?: string | number;
  href?: string;
  target?: string;
  rel?: string;
}

export interface SidebarProps extends BaseComponentProps {
  collapsed?: boolean;
  collapsible?: boolean;
  onCollapse?: (collapsed: boolean) => void;
  width?: number | string;
  collapsedWidth?: number | string;
}

export interface SidebarItemProps extends NavItemProps {
  level?: number;
  hasChildren?: boolean;
  expanded?: boolean;
  onToggle?: () => void;
}

export interface BreadcrumbProps extends BaseComponentProps {
  items: Array<{
    label: string;
    href?: string;
    icon?: React.ReactNode;
  }>;
  separator?: React.ReactNode;
  maxItems?: number;
}

// ========================================
// FEEDBACK TYPES
// ========================================

export interface ToastProps extends BaseComponentProps {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  duration?: number;
  closable?: boolean;
  onClose?: () => void;
  action?: React.ReactNode;
}

export interface AlertProps extends BaseComponentProps {
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message?: string;
  closable?: boolean;
  onClose?: () => void;
  action?: React.ReactNode;
  banner?: boolean;
}

export interface ProgressProps extends BaseComponentProps {
  percent: number;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'line' | 'circle';
  status?: 'success' | 'exception' | 'active';
  strokeWidth?: number;
  showInfo?: boolean;
  strokeColor?: string;
  trailColor?: string;
}

export interface SkeletonProps extends BaseComponentProps {
  variant?: 'text' | 'circular' | 'rectangular';
  width?: number | string;
  height?: number | string;
  animation?: 'pulse' | 'wave' | 'none';
}

// ========================================
// LAYOUT TYPES
// ========================================

export interface ContainerProps extends BaseComponentProps {
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  center?: boolean;
}

export interface GridProps extends BaseComponentProps {
  columns?: number | string;
  gap?: number | string;
  rowGap?: number | string;
  columnGap?: number | string;
  alignItems?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
  justifyItems?: 'start' | 'center' | 'end' | 'stretch';
}

export interface GridItemProps extends BaseComponentProps {
  span?: number | string;
  start?: number | string;
  end?: number | string;
  order?: number;
}

export interface FlexProps extends BaseComponentProps {
  direction?: 'row' | 'row-reverse' | 'col' | 'col-reverse';
  wrap?: 'nowrap' | 'wrap' | 'wrap-reverse';
  justify?: 'start' | 'end' | 'center' | 'between' | 'around' | 'evenly';
  align?: 'start' | 'end' | 'center' | 'baseline' | 'stretch';
  gap?: number | string;
}

// ========================================
// ANIMATION & TRANSITION TYPES
// ========================================

export interface TransitionProps extends BaseComponentProps {
  in?: boolean;
  appear?: boolean;
  timeout?: number | { enter: number; exit: number };
  unmountOnExit?: boolean;
  mountOnEnter?: boolean;
  onEnter?: () => void;
  onEntering?: () => void;
  onEntered?: () => void;
  onExit?: () => void;
  onExiting?: () => void;
  onExited?: () => void;
}

export interface AnimationProps extends BaseComponentProps {
  animation: string;
  duration?: number;
  delay?: number;
  iterationCount?: number | 'infinite';
  direction?: 'normal' | 'reverse' | 'alternate' | 'alternate-reverse';
  timingFunction?: 'ease' | 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';
  fillMode?: 'none' | 'forwards' | 'backwards' | 'both';
}

// ========================================
// THEME & STYLING TYPES
// ========================================

export interface ThemeProviderProps extends BaseComponentProps {
  theme: 'light' | 'dark' | 'system';
  defaultTheme?: 'light' | 'dark';
  storageKey?: string;
  enableSystem?: boolean;
  disableTransitionOnChange?: boolean;
}

export interface ColorModeProps extends BaseComponentProps {
  value: 'light' | 'dark';
  onChange: (value: 'light' | 'dark') => void;
  options?: Array<{ value: 'light' | 'dark'; label: string; icon: React.ReactNode }>;
}

// ========================================
// UTILITY TYPES
// ========================================

export interface ResponsiveProps<T> {
  base: T;
  sm?: T;
  md?: T;
  lg?: T;
  xl?: T;
  '2xl'?: T;
}

export interface BreakpointProps {
  sm?: boolean;
  md?: boolean;
  lg?: boolean;
  xl?: boolean;
  '2xl'?: boolean;
}

export interface ConditionalProps {
  show?: boolean;
  hide?: boolean;
  if?: boolean;
  unless?: boolean;
}
