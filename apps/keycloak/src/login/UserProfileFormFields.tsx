import type { Attribute } from 'keycloakify/login/KcContext';
import {
  type FormAction,
  type FormFieldError,
  getButtonToDisplayForMultivaluedAttributeField,
  useUserProfileForm,
} from 'keycloakify/login/lib/useUserProfileForm';
import type { UserProfileFormFieldsProps } from 'keycloakify/login/UserProfileFormFieldsProps';
import { assert } from 'keycloakify/tools/assert';
import { useIsPasswordRevealed } from 'keycloakify/tools/useIsPasswordRevealed';
import { Eye, EyeOff } from 'lucide-react';
import { Fragment, useEffect } from 'react';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import type { I18n } from './i18n';
import type { KcContext } from './KcContext';

export default function UserProfileFormFields(props: UserProfileFormFieldsProps<KcContext, I18n>) {
  const { kcContext, i18n, onIsFormSubmittableValueChange, doMakeUserConfirmPassword, BeforeField, AfterField } = props;

  const { advancedMsg } = i18n;

  const {
    formState: { formFieldStates, isFormSubmittable },
    dispatchFormAction,
  } = useUserProfileForm({ kcContext, i18n, doMakeUserConfirmPassword });

  useEffect(() => {
    onIsFormSubmittableValueChange(isFormSubmittable);
  }, [isFormSubmittable, onIsFormSubmittableValueChange]);

  const groupNameRef = { current: '' };

  return (
    <FieldGroup>
      {formFieldStates.map(({ attribute, displayableErrors, valueOrValues }) => (
        <Fragment key={attribute.name}>
          <GroupLabel attribute={attribute} groupNameRef={groupNameRef} i18n={i18n} />
          {BeforeField !== undefined && (
            <BeforeField
              attribute={attribute}
              dispatchFormAction={dispatchFormAction}
              displayableErrors={displayableErrors}
              valueOrValues={valueOrValues}
              kcClsx={() => ''}
              i18n={i18n}
            />
          )}
          <Field
            style={{
              display:
                attribute.annotations.inputType === 'hidden' ||
                (attribute.name === 'password-confirm' && !doMakeUserConfirmPassword)
                  ? 'none'
                  : undefined,
            }}
          >
            <FieldLabel htmlFor={attribute.name}>
              {advancedMsg(attribute.displayName ?? '')}
              {attribute.required && <span className="ml-0.5 text-destructive">*</span>}
            </FieldLabel>
            <div>
              {attribute.annotations.inputHelperTextBefore !== undefined && (
                <p
                  id={`form-help-text-before-${attribute.name}`}
                  className="mb-1 text-muted-foreground text-xs"
                  aria-live="polite"
                >
                  {advancedMsg(attribute.annotations.inputHelperTextBefore)}
                </p>
              )}
              <InputFieldByType
                attribute={attribute}
                valueOrValues={valueOrValues}
                displayableErrors={displayableErrors}
                dispatchFormAction={dispatchFormAction}
                i18n={i18n}
              />
              <FieldErrors attribute={attribute} displayableErrors={displayableErrors} fieldIndex={undefined} />
              {attribute.annotations.inputHelperTextAfter !== undefined && (
                <p
                  id={`form-help-text-after-${attribute.name}`}
                  className="mt-1 text-muted-foreground text-xs"
                  aria-live="polite"
                >
                  {advancedMsg(attribute.annotations.inputHelperTextAfter)}
                </p>
              )}
              {AfterField !== undefined && (
                <AfterField
                  attribute={attribute}
                  dispatchFormAction={dispatchFormAction}
                  displayableErrors={displayableErrors}
                  valueOrValues={valueOrValues}
                  kcClsx={() => ''}
                  i18n={i18n}
                />
              )}
            </div>
          </Field>
        </Fragment>
      ))}
    </FieldGroup>
  );
}

function GroupLabel(props: { attribute: Attribute; groupNameRef: { current: string }; i18n: I18n }) {
  const { attribute, groupNameRef, i18n } = props;
  const { advancedMsg } = i18n;

  if (attribute.group?.name !== groupNameRef.current) {
    groupNameRef.current = attribute.group?.name ?? '';

    if (groupNameRef.current !== '') {
      assert(attribute.group !== undefined);

      const groupDisplayHeader = attribute.group.displayHeader ?? '';
      const groupHeaderText = groupDisplayHeader !== '' ? advancedMsg(groupDisplayHeader) : attribute.group.name;
      const groupDisplayDescription = attribute.group.displayDescription ?? '';

      return (
        <div
          {...Object.fromEntries(
            Object.entries(attribute.group.html5DataAnnotations).map(([key, value]) => [`data-${key}`, value]),
          )}
        >
          <p className="font-semibold text-base text-foreground">{groupHeaderText}</p>
          {groupDisplayDescription !== '' && (
            <p className="mt-0.5 text-muted-foreground text-sm">{advancedMsg(groupDisplayDescription)}</p>
          )}
        </div>
      );
    }
  }

  return null;
}

function FieldErrors(props: {
  attribute: Attribute;
  displayableErrors: FormFieldError[];
  fieldIndex: number | undefined;
}) {
  const { attribute, fieldIndex } = props;
  const displayableErrors = props.displayableErrors.filter((e) => e.fieldIndex === fieldIndex);

  if (displayableErrors.length === 0) {
    return null;
  }

  return (
    <FieldError
      id={`input-error-${attribute.name}${fieldIndex === undefined ? '' : `-${fieldIndex}`}`}
      aria-live="polite"
    >
      {displayableErrors.map(({ errorMessage }, i, arr) => (
        <Fragment key={i}>
          {errorMessage}
          {arr.length - 1 !== i && <br />}
        </Fragment>
      ))}
    </FieldError>
  );
}

type InputFieldByTypeProps = {
  attribute: Attribute;
  valueOrValues: string | string[];
  displayableErrors: FormFieldError[];
  dispatchFormAction: React.Dispatch<FormAction>;
  i18n: I18n;
};

function InputFieldByType(props: InputFieldByTypeProps) {
  const { attribute, valueOrValues } = props;

  switch (attribute.annotations.inputType) {
    case 'hidden':
      return <input type="hidden" name={attribute.name} value={valueOrValues as string} />;
    case 'textarea':
      return <TextareaTag {...props} />;
    case 'select':
    case 'multiselect':
      return <SelectTag {...props} />;
    case 'select-radiobuttons':
    case 'multiselect-checkboxes':
      return <InputTagSelects {...props} />;
    default: {
      if (Array.isArray(valueOrValues)) {
        return (
          <>
            {valueOrValues.map((...[, i]) => (
              <InputTag key={i} {...props} fieldIndex={i} />
            ))}
          </>
        );
      }

      const inputNode = <InputTag {...props} fieldIndex={undefined} />;

      if (attribute.name === 'password' || attribute.name === 'password-confirm') {
        return (
          <PasswordWrapper passwordInputId={attribute.name} i18n={props.i18n}>
            {inputNode}
          </PasswordWrapper>
        );
      }

      return inputNode;
    }
  }
}

function PasswordWrapper(props: { passwordInputId: string; i18n: I18n; children: React.ReactElement }) {
  const { passwordInputId, i18n, children } = props;
  const { msgStr } = i18n;
  const { isPasswordRevealed, toggleIsPasswordRevealed } = useIsPasswordRevealed({ passwordInputId });

  return (
    <div className="relative">
      {children}
      <button
        type="button"
        className="-translate-y-1/2 absolute top-1/2 right-3 text-muted-foreground transition-colors hover:text-foreground"
        aria-label={msgStr(isPasswordRevealed ? 'hidePassword' : 'showPassword')}
        aria-controls={passwordInputId}
        onClick={toggleIsPasswordRevealed}
      >
        {isPasswordRevealed ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}

function InputTag(props: InputFieldByTypeProps & { fieldIndex: number | undefined }) {
  const { attribute, fieldIndex, dispatchFormAction, valueOrValues, i18n, displayableErrors } = props;
  const { advancedMsgStr } = i18n;

  const hasError = displayableErrors.find((e) => e.fieldIndex === fieldIndex) !== undefined;

  return (
    <>
      <Input
        type={(() => {
          const { inputType } = attribute.annotations;
          if (inputType?.startsWith('html5-')) {
            return inputType.slice(6);
          }
          return inputType ?? 'text';
        })()}
        id={attribute.name}
        name={attribute.name}
        value={(() => {
          if (fieldIndex !== undefined) {
            assert(Array.isArray(valueOrValues));
            return valueOrValues[fieldIndex];
          }
          assert(typeof valueOrValues === 'string');
          return valueOrValues;
        })()}
        aria-invalid={hasError}
        disabled={attribute.readOnly}
        autoComplete={attribute.autocomplete}
        placeholder={
          attribute.annotations.inputTypePlaceholder === undefined
            ? undefined
            : advancedMsgStr(attribute.annotations.inputTypePlaceholder)
        }
        pattern={attribute.annotations.inputTypePattern}
        size={
          attribute.annotations.inputTypeSize === undefined
            ? undefined
            : parseInt(`${attribute.annotations.inputTypeSize}`, 10)
        }
        maxLength={
          attribute.annotations.inputTypeMaxlength === undefined
            ? undefined
            : parseInt(`${attribute.annotations.inputTypeMaxlength}`, 10)
        }
        minLength={
          attribute.annotations.inputTypeMinlength === undefined
            ? undefined
            : parseInt(`${attribute.annotations.inputTypeMinlength}`, 10)
        }
        max={attribute.annotations.inputTypeMax}
        min={attribute.annotations.inputTypeMin}
        step={attribute.annotations.inputTypeStep}
        {...Object.fromEntries(
          Object.entries(attribute.html5DataAnnotations ?? {}).map(([key, value]) => [`data-${key}`, value]),
        )}
        onChange={(event) =>
          dispatchFormAction({
            action: 'update',
            name: attribute.name,
            valueOrValues: (() => {
              if (fieldIndex !== undefined) {
                assert(Array.isArray(valueOrValues));
                return valueOrValues.map((v, i) => (i === fieldIndex ? event.target.value : v));
              }
              return event.target.value;
            })(),
          })
        }
        onBlur={() => dispatchFormAction({ action: 'focus lost', name: attribute.name, fieldIndex })}
      />
      {fieldIndex !== undefined && (
        <>
          <FieldErrors attribute={attribute} displayableErrors={displayableErrors} fieldIndex={fieldIndex} />
          <AddRemoveButtonsMultiValuedAttribute
            attribute={attribute}
            values={valueOrValues as string[]}
            fieldIndex={fieldIndex}
            dispatchFormAction={dispatchFormAction}
            i18n={i18n}
          />
        </>
      )}
    </>
  );
}

function AddRemoveButtonsMultiValuedAttribute(props: {
  attribute: Attribute;
  values: string[];
  fieldIndex: number;
  dispatchFormAction: React.Dispatch<Extract<FormAction, { action: 'update' }>>;
  i18n: I18n;
}) {
  const { attribute, values, fieldIndex, dispatchFormAction, i18n } = props;
  const { msg } = i18n;
  const { hasAdd, hasRemove } = getButtonToDisplayForMultivaluedAttributeField({ attribute, values, fieldIndex });
  const idPostfix = `-${attribute.name}-${fieldIndex + 1}`;

  return (
    <>
      {hasRemove && (
        <>
          <button
            id={`kc-remove${idPostfix}`}
            type="button"
            className="text-destructive text-xs hover:underline"
            onClick={() =>
              dispatchFormAction({
                action: 'update',
                name: attribute.name,
                valueOrValues: values.filter((_, i) => i !== fieldIndex),
              })
            }
          >
            {msg('remove')}
          </button>
          {hasAdd && <span className="mx-1 text-muted-foreground">|</span>}
        </>
      )}
      {hasAdd && (
        <button
          id={`kc-add${idPostfix}`}
          type="button"
          className="text-primary text-xs hover:underline"
          onClick={() =>
            dispatchFormAction({
              action: 'update',
              name: attribute.name,
              valueOrValues: [...values, ''],
            })
          }
        >
          {msg('addValue')}
        </button>
      )}
    </>
  );
}

function TextareaTag(props: InputFieldByTypeProps) {
  const { attribute, dispatchFormAction, displayableErrors, valueOrValues } = props;
  assert(typeof valueOrValues === 'string');

  return (
    <textarea
      id={attribute.name}
      name={attribute.name}
      className="h-24 w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive dark:bg-input/30"
      aria-invalid={displayableErrors.length !== 0}
      disabled={attribute.readOnly}
      cols={
        attribute.annotations.inputTypeCols === undefined
          ? undefined
          : parseInt(`${attribute.annotations.inputTypeCols}`, 10)
      }
      rows={
        attribute.annotations.inputTypeRows === undefined
          ? undefined
          : parseInt(`${attribute.annotations.inputTypeRows}`, 10)
      }
      maxLength={
        attribute.annotations.inputTypeMaxlength === undefined
          ? undefined
          : parseInt(`${attribute.annotations.inputTypeMaxlength}`, 10)
      }
      value={valueOrValues}
      onChange={(event) =>
        dispatchFormAction({ action: 'update', name: attribute.name, valueOrValues: event.target.value })
      }
      onBlur={() => dispatchFormAction({ action: 'focus lost', name: attribute.name, fieldIndex: undefined })}
    />
  );
}

function SelectTag(props: InputFieldByTypeProps) {
  const { attribute, dispatchFormAction, displayableErrors, i18n, valueOrValues } = props;
  const isMultiple = attribute.annotations.inputType === 'multiselect';

  const options = (() => {
    const { inputOptionsFromValidation } = attribute.annotations;
    if (inputOptionsFromValidation !== undefined) {
      const validator = (attribute.validators as Record<string, { options?: string[] }>)[inputOptionsFromValidation];
      if (validator?.options !== undefined) {
        return validator.options;
      }
    }
    return attribute.validators.options?.options ?? [];
  })();

  return (
    <select
      id={attribute.name}
      name={attribute.name}
      className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30"
      aria-invalid={displayableErrors.length !== 0}
      disabled={attribute.readOnly}
      multiple={isMultiple}
      size={
        attribute.annotations.inputTypeSize === undefined
          ? undefined
          : parseInt(`${attribute.annotations.inputTypeSize}`, 10)
      }
      value={valueOrValues}
      onChange={(event) =>
        dispatchFormAction({
          action: 'update',
          name: attribute.name,
          valueOrValues: isMultiple ? Array.from(event.target.selectedOptions).map((o) => o.value) : event.target.value,
        })
      }
      onBlur={() => dispatchFormAction({ action: 'focus lost', name: attribute.name, fieldIndex: undefined })}
    >
      {!isMultiple && <option value="" />}
      {options.map((option) => (
        <option key={option} value={option}>
          {inputLabel(i18n, attribute, option)}
        </option>
      ))}
    </select>
  );
}

function InputTagSelects(props: InputFieldByTypeProps) {
  const { attribute, dispatchFormAction, i18n, valueOrValues, displayableErrors } = props;
  const { inputType } = attribute.annotations;
  assert(inputType === 'select-radiobuttons' || inputType === 'multiselect-checkboxes');
  const type = inputType === 'select-radiobuttons' ? 'radio' : 'checkbox';

  const options = (() => {
    const { inputOptionsFromValidation } = attribute.annotations;
    if (inputOptionsFromValidation !== undefined) {
      const validator = (attribute.validators as Record<string, { options?: string[] }>)[inputOptionsFromValidation];
      if (validator?.options !== undefined) {
        return validator.options;
      }
    }
    return attribute.validators.options?.options ?? [];
  })();

  return (
    <div className="flex flex-col gap-2">
      {options.map((option) => (
        <label key={option} className="flex cursor-pointer items-center gap-2 text-sm">
          <input
            type={type}
            id={`${attribute.name}-${option}`}
            name={attribute.name}
            value={option}
            className="h-4 w-4 border-border accent-primary"
            aria-invalid={displayableErrors.length !== 0}
            disabled={attribute.readOnly}
            checked={Array.isArray(valueOrValues) ? valueOrValues.includes(option) : valueOrValues === option}
            onChange={(event) =>
              dispatchFormAction({
                action: 'update',
                name: attribute.name,
                valueOrValues: (() => {
                  const isChecked = event.target.checked;
                  if (Array.isArray(valueOrValues)) {
                    const newValues = [...valueOrValues];
                    if (isChecked) {
                      newValues.push(option);
                    } else {
                      newValues.splice(newValues.indexOf(option), 1);
                    }
                    return newValues;
                  }
                  return isChecked ? option : '';
                })(),
              })
            }
            onBlur={() => dispatchFormAction({ action: 'focus lost', name: attribute.name, fieldIndex: undefined })}
          />
          <span className={attribute.readOnly ? 'opacity-50' : ''}>{inputLabel(i18n, attribute, option)}</span>
        </label>
      ))}
    </div>
  );
}

function inputLabel(i18n: I18n, attribute: Attribute, option: string) {
  const { advancedMsg } = i18n;
  if (attribute.annotations.inputOptionLabels !== undefined) {
    return advancedMsg(attribute.annotations.inputOptionLabels[option] ?? option);
  }
  if (attribute.annotations.inputOptionLabelsI18nPrefix !== undefined) {
    return advancedMsg(`${attribute.annotations.inputOptionLabelsI18nPrefix}.${option}`);
  }
  return option;
}
