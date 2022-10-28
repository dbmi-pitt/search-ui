import React, { Fragment } from "react";


const GeneralOptions = ({ field, fieldchanged, value }) => {
  return (
    <div>
      
      <label htmlFor={field._uid}>{field.label}</label><br />
      {field.options.map((option, index) => {
        return (
          <Fragment key={option.value}>
            <label htmlFor={option.value} className="form-label">
              <input
                className="form-check-input"
                type={field.type}
                id={option.value}
                name={field._uid}
                value={option.value}
                checked={value === option.value}
                onChange={(e) => {
                  fieldchanged(field._uid, e.target.value);
                }}
              />
              {" "}{option.label}
            </label>
            {index < field.options.length - 1 && <br />}
          </Fragment>
        );
      })}
    </div>
  );
};

export default GeneralOptions;
