import React from "react";
import TextField from "./TextField";

const FieldGroup = ({ field, fieldchanged, values }) => {
  const fields = field.fields;

  return (
    <fieldset key={field._uid}>
        <label htmlFor={field._uid}>{field.label}</label>
      {fields.map((field) => {
        return (
          <TextField
            key={field._uid}
            field={field}
            fieldchanged={fieldchanged}
            value={values[field._uid]}
          />
        );
      })}
    </fieldset>
  );
};

export default FieldGroup;
