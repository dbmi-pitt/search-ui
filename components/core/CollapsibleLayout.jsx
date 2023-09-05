import styles from "../../css/collapsableFacets.module.css";
import { ChevronDown, ChevronRight } from "react-bootstrap-icons";
import { Col, Row } from "react-bootstrap";

const CollapsibleLayout = ({ isExpanded, setIsExpanded, label, formatVal, children }) => {

    function formatClassName(label) {
        return `sui-facet__title sui-facet__title--${formatVal(label)}`
    }

    function handleExpandClick() {
        setIsExpanded(!isExpanded)
    }

    return (
        <Row className={"pt-4"}>
            <Col className={"col-9"}>
                <legend
                    className={`${formatClassName(label)} ${isExpanded ? styles.facetsHover : styles.contracted}`}
                    onClick={handleExpandClick}
                    tabIndex={0}
                >
                    {label}
                </legend>
                {isExpanded && children}
            </Col>
            <Col className={"text-end"}>
                {isExpanded && (
                    <ChevronDown onClick={handleExpandClick} className={`align-top ${styles.facetsHover}`} />
                )}
                {!isExpanded && (
                    <ChevronRight onClick={handleExpandClick} className={`align-top ${styles.contracted}`} />
                )}
            </Col>
        </Row>
    )
}

export default CollapsibleLayout
