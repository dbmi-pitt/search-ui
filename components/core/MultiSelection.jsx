import React, { useState, useEffect, useRef } from "react";
import { MultiSelect } from "react-multi-select-component";
import { convertListToArray } from "../../lib/utils";
import log from "loglevel";

const MultiSelection = (props) => {
  const [selected, setSelected] = useState([]);
 // const [help_message, setHelpMessage] = useState("")
  //const theRef = useRef()

  useEffect(() => {

      // this will initialize the selected items; 
      // kind of fools the widget to render data one time
      if (props.defaultValue) {

        //setSelected(props.defaultValue)
        if (typeof props.defaultValue === 'string') {
          var str_array = convertListToArray(props.defaultValue)
          setSelected(str_array)
           //log.trace("init ms data", str_array)
        } else {
          setSelected(props.defaultValue)
        }
     }
      // try {
      //   help_message = props.field.help_message
      // } catch (e) { }
  }, []);  // This empty array represents an empty list of dependencies


  const handleChange = (v) => {

      // update the value so it can render the selected option
      setSelected(v)

      // then pass it back to the form (parent) so it can keep track of the changes
      props.fieldchanged(props.name, v)
  }

  return (
    <div>
      <label>{props.label}</label>
      <MultiSelect
        {...props}
        //ref={theRef}
        options={props.options}
        value={selected}
        onChange={handleChange}
        labelledBy="Select"
      />
      <small id="{props.name}_Help" className="form-text text-muted">{props.helpMessage}</small>
    </div>
  );
};

export default MultiSelection;