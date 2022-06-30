import React, { useRef } from "react";
import { useForm } from "react-hook-form";
import { ErrorMessage } from "@hookform/error-message";

//const Field = ({ field, fieldChanged, type, value }) => {
const TextArea = ({...props}) => {
    //console.log('Field',props)
    const theRef = useRef();
    // var help_message = ""
    // try {
    //     help_message = props.field.help_message
    // } catch (e) { }

    return (
        <div className="form-floating mb-3">
            <textarea {...props}
                className={`form-control ${props.entity_type}`}
                type={props.type || props.field.component}
                id={props.field._uid}
                name={props.field._uid}
                value={props.value}
                rows={props.rows}
                onChange={e => props.fieldchanged(props.field._uid, e.target.value)}
            />
             <label htmlFor={props.field._uid}>{props.field.label}</label>
             <small id="{props.field._uid}_Help" className="form-text text-muted">{props.field.help_message}</small>
        </div>
    );
};

export default TextArea;