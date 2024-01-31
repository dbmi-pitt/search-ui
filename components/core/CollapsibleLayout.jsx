import styles from "../../css/collapsableFacets.module.css";
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
            <Col className={`col-10 sui-facet__${formatVal(label)}`}>
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
                    <i onClick={handleExpandClick} className={`bi bi-chevron-down align-top ${styles.facetsHover}`} />
                )}
                {!isExpanded && (
                    <i onClick={handleExpandClick} className={`bi bi-chevron-right align-top ${styles.contracted}`} />
                )}
            </Col>
        </Row>
    )
}

export default CollapsibleLayout
