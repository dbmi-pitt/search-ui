import React, { useState, useEffect } from "react";
import FieldGroup from "./FieldGroup";
import TextField from "./TextField";
import TextArea from "./TextArea";
import GeneralOption from "./Option";
import SimpleSelect from "./SimpleSelect";
import MultiSelection from "./MultiSelection";
import { default as ReactSelect } from "react-select";
//import makeAnimated from "react-select/animated";
//import Select from 'react-select'
import { useForm } from "react-hook-form";
import Link from "next/link";
import "@elastic/react-search-ui-views/lib/styles/styles.css";
import 'bootstrap/dist/css/bootstrap.css';


const fieldMeetsCondition = (values) => (field) => {
  if (field.conditional && field.conditional.field) {
    const segments = field.conditional.field.split("_");
    const fieldId = segments[segments.length - 1];
    return values[fieldId] === field.conditional.value;
  }
  return true;
};

const Form = (props) => {
  const { register, formState: { errors }, reset} = useForm();
  // const { register } = useState(props.register)
  // const { reset } = useState(props.reset)
  // const { errors } = useState(props.errors)
  //const [initdata, setInitData] = useState(props.data)
  const [editMode, setEditMode] = useState(props.mode)

  // state to track the current page ID of the form
  const [page, setPage] = useState(props.page);
  const [FORM_FIELD_DEF, setFormFieldDef] = useState(props.FORM_FIELD_DEF)

  // state to track the current form data that will be displayed
  const [currentPageData, setCurrentPageData] = useState(FORM_FIELD_DEF[page]);

  // track the values of the form fields
  const [values, setValues] = useState(props.data);
  const [selectedOption, setSelectedOption] = useState(null);

  // this effect will run when the `page` changes
  useEffect(() => {
    console.log('FORM2:  form state has changed...')
    const upcomingPageData = FORM_FIELD_DEF[page];
    setCurrentPageData(upcomingPageData);
    // setValues((currentValues) => {
    //   const newValues = FORM_FIELD_DEF[page].fields.reduce((obj, field) => {
    //     if (field.component === "field_group") {
    //       for (const subField of field.fields) {
    //         obj[subField._uid] = "";
    //       }
    //     } else {
    //       obj[field._uid] = "";
    //     }

    //     return obj;
    //   }, {});

    //   return Object.assign({}, newValues, currentValues);
    // });
  }, []);

  // const reload = (data) => {
  //   setValues(data)
  // }

  useEffect(() => {
        // reset form with user data
        console.log("FORM2: values have changed...")
       setValues(props.data)
    }, [props.data]);


  // callback provided to components to update the main list of form values
  const fieldchanged = (fieldId, value) => {
    console.log('fieldchanged',fieldId, value)
    // use a callback to find the field in the value list and update it
    setValues((currentValues) => {
      currentValues[fieldId] = value;
      return currentValues;
    });

    // this just fakes that we've updated the `currentPageData` to force a re-render in React
    setCurrentPageData((currentPageData) => {
      return Object.assign({}, currentPageData);
    });
  };


  const onSubmit = (e) => {
    e.preventDefault();
      console.log('Form OnSubmit', e)
    // todo - send data somewhere
    //console.log(e.currentTarget.elements)
    props.onsubmit({data: values, mode: editMode})
  
    //console.log('Submitted Values', values)
  };

//setSelectedOption(selected)
// use a callback to find the field in the value list and update it
//     setValues((currentValues) => {
//       currentValues[event.name] = selected[0];
//       return currentValues;
//     });

  return (
    <div className="sui-layout">
        <div className="sui-layout-header">
            <div className="sui-layout-header__inner">
			    <form id="submitForm" onSubmit={onSubmit}>
			      {currentPageData.fields
			        .filter(fieldMeetsCondition(values))
			        .map((field) => {
			        console.log(field)
			          switch (field.component) {
			            case "field_group":
			              return (
			                <FieldGroup
			                  id={field._uid}
			                  key={field._uid}
			                  field={field}
			                  fieldchanged={fieldchanged}
			                  // should probably only slice out the required values, but ¯\_(ツ)_/¯
			                  values={values}
			                />
			              );
			            case "options":
			              return (
			                <GeneralOption
			                  register={register}
			                  id={field._uid}
			                  key={field._uid}
			                  field={field}
			                  fieldchanged={fieldchanged}
			                  value={values[field._uid]}
			                  required={field.required}
			                />
			              );
			            case "singleselection":
			                return (<div key={field._uid}>
			                    <SimpleSelect
			                        name={field.field}
			                        isClearable={true}
			                        options={field.options}
			                        defaultValue={field.defaultValue}
			                        data={values[field._uid]}/>
			                  </div>
			                  )
			            case "multiselection":
			                return (<div key={field._uid}>
			                    <MultiSelection label={field.label}
			                        register={register}
			                        name={field._uid}
			                        options={field.options}
			                        defaultValue={values[field._uid]}
			                        fieldchanged={fieldchanged}
			                        required={field.required}
			                        helpMessage={field.help_message}
			                    />
			                  </div>

			                  )
			            case "textarea":
			             return (<div key={field._uid}>
			                <TextArea
			                  register={register}
			                  errors={errors}
			                  key={field._uid}
			                  name={field._uid}
			                  field={field}
			                  fieldchanged={fieldchanged}
			                  value={values[field._uid]}
			                  rows={field.rows}
			                  required={field.required}
			                  type={field.type}
			                />
			                </div>
			              );
			            case "anchor":
			              return (
			                <div key={field._uid}>
			                  <label className="form-label">{field.label}:</label>
			                  <a href={values[field._uid]} target="_blank">{"   "}{values[field._uid]}</a>
			                </div>
			                );
			            default:
			              return (
			                <TextField
			                  register={register}
			                  errors={errors}
			                  key={field._uid}
			                  name={field._uid}
			                  field={field}
			                  entity_type={field.entity_type}
			                  fieldchanged={fieldchanged}
			                  value={values[field._uid]}
			                  required={field.required}
			                  type={field.type}
			                />
			              );
			          }
			        })}
			        <hr />
			          <div className="btn-group text-right" role="group">
			      <button className="btn btn-primary" type="submit">Submit</button>
			      <Link href="/search" passHref>
			       <button className="btn btn-secondary" type="button">Cancel</button>
			      </Link>
			      </div>
			    </form>
			</div>
		</div>
    </div>
  );
};

// useful if this is a directed form wit multiple page navigation
  // const navigatePages = (direction) => () => {
  //   const findNextPage = (page) => {
  //     const upcomingPageData = FORM_FIELD_DEF[page];
  //     if (upcomingPageData.conditional && upcomingPageData.conditional.field) {
  //       // we're going to a conditional page, make sure it's the right one
  //       const segments = upcomingPageData.conditional.field.split("_");
  //       const fieldId = segments[segments.length - 1];

  //       const fieldToMatchValue = values[fieldId];

  //       if (fieldToMatchValue !== upcomingPageData.conditional.value) {
  //         // if we didn't find a match, try the next page
  //         return findNextPage(direction === "next" ? page + 1 : page - 1);
  //       }
  //     }
  //     // all tests for the page we want to go to pass, so go to it
  //     return page;
  //   };

  //   setPage(findNextPage(direction === "next" ? page + 1 : page - 1));
  // };

  // const nextPage = navigatePages("next");
  // const prevPage = navigatePages("prev");
export default Form;
