import styles from '../../css/collapsableFacets.module.css'

const CollapsibleLayout = ({
    isExpanded,
    setIsExpanded,
    label,
    formatVal,
    children
}) => {
    function formatClassName(label) {
        return `sui-facet__title sui-facet__title--${formatVal(label)}`
    }

    function handleExpandClick() {
        setIsExpanded(!isExpanded)
    }

    return (
        <>
            <div className='pt-4 d-flex flex-row'>
                <div className={`sui-facet__${formatVal(label)} flex-grow-1`}>
                    <legend
                        className={`${formatClassName(label)} ${isExpanded ? styles.facetsHover : styles.contracted}`}
                        onClick={handleExpandClick}
                        tabIndex={0}
                    >
                        {label}
                    </legend>
                </div>
                <div>
                    {isExpanded ? (
                        <i
                            className={`bi bi-chevron-down align-top ${styles.facetsHover}`}
                            onClick={handleExpandClick}
                        />
                    ) : (
                        <i
                            className={`bi bi-chevron-right align-top ${styles.contracted}`}
                            onClick={handleExpandClick}
                        />
                    )}
                </div>
            </div>
            {isExpanded && children}
        </>
    )
}

export default CollapsibleLayout
