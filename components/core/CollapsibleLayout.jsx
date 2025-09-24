import Tooltip from '@mui/material/Tooltip'
import Zoom from '@mui/material/Zoom'
import styles from '../../css/collapsableFacets.module.css'
import { cls } from '../../lib/utils'

const CollapsibleLayout = ({
    isExpanded,
    setIsExpanded,
    label,
    tooltipText,
    formatVal,
    className,
    children
}) => {
    function formatClassName(label) {
        return `sui-facet__title sui-facet__title--${formatVal(label)}`
    }

    function handleExpandClick() {
        setIsExpanded(!isExpanded)
    }

    return (
        <div className={className}>
            <div className='pt-4 d-flex flex-row'>
                <div className={`sui-facet__${formatVal(label)} flex-grow-1`}>
                    <legend
                        className={cls(
                            formatClassName(label),
                            isExpanded ? styles.facetsHover : styles.contracted
                        )}
                        onClick={handleExpandClick}
                        tabIndex={0}
                    >
                        {label}
                        {tooltipText && (
                            <Tooltip
                                title={tooltipText}
                                placement='top'
                                classes={{ popper: 'snPopover' }}
                                arrow
                                slots={{ transition: Zoom }}
                            >
                                <span>
                                    {' '}
                                    <i className='bi bi-question-circle-fill'></i>
                                </span>
                            </Tooltip>
                        )}
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
        </div>
    )
}

export default CollapsibleLayout
