import React from 'react'
import { appendClassName } from '../util/view'

/**
 * @typedef {Object} LayoutSidebarProps
 * @property {string} className - The CSS class name for the sidebar.
 * @property {React.ReactNode} children - The child elements to be rendered inside the sidebar.
 */

/**
 * LayoutSidebar component that renders a sidebar with optional toggle functionality.
 *
 * @param {LayoutSidebarProps} props - Properties to configure the layout.
 * @returns {JSX.Element} The rendered sidebar component.
 */
export default function LayoutSidebar({ className, children }) {
    const [isSidebarToggled, setIsSidebarToggled] = React.useState(false)

    /**
     * Toggles the sidebar open or closed.
     */
    function toggleSidebar() {
        setIsSidebarToggled(!isSidebarToggled)
    }

    /**
     * Renders a toggle button if there are children elements.
     *
     * @param {string} label - The label for the toggle button.
     * @returns {React.ReactNode | null} The toggle button element or null if no children are present.
     */
    function renderToggleButton(label) {
        if (!this.props.children) return null

        return (
            <button
                hidden
                type='button'
                className='sui-layout-sidebar-toggle'
                onClick={toggleSidebar}
            >
                {label}
            </button>
        )
    }

    return (
        <>
            {renderToggleButton('Show Filters')}
            <div
                className={appendClassName(
                    className,
                    isSidebarToggled ? `${className}--toggled` : ''
                )}
            >
                {renderToggleButton('Save Filters')}
                {children}
            </div>
        </>
    )
}
