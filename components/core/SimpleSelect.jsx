import React, { useState } from 'react';
import Select from 'react-select';

const SimpleSelect = ({...props}) => {
  const [selectedOption, setSelectedOption] = useState(null);

  return (
    <div className="form-floating mb-3">
      <Select
        className="basic-single"
        classNamePrefix="select"
        onChange={props.onChange}
        options={props.options}
        name={props.name}
        defaultValue={props.defaultValue}
        isClearable={props.isClearable}
      />
    </div>
  );
}

export default SimpleSelect;