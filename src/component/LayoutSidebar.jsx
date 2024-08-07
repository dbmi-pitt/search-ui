import React from 'react'
import { appendClassName } from '../util/view'

/**
 * @typedef {Object} LayoutSidebarProps
 * @property {string} className - The CSS class name for the sidebar.
 * @property {React.ReactNode} children - The child elements to be rendered inside the sidebar.
 */

/**
 * @typedef {Object} LayoutSidebarState
 * @property {boolean} isSidebarToggled - Indicates whether the sidebar is toggled open or closed.
 */

/**
 * LayoutSidebar component that renders a sidebar with toggle functionality.
 *
 * @extends {React.Component<LayoutSidebarProps, LayoutSidebarState>}
 */
export default class LayoutSidebar extends React.Component {
    /**
     * Creates an instance of LayoutSidebar.
     *
     * @param {LayoutSidebarProps} props - The properties for the LayoutSidebar component.
     */
    constructor(props) {
        super(props)
        this.state = { isSidebarToggled: false }
    }

    /**
     * Toggles the sidebar open or closed.
     */
    toggleSidebar = () => {
        this.setState(({ isSidebarToggled }) => ({
            isSidebarToggled: !isSidebarToggled
        }))
    }

    /**
     * Renders a toggle button if there are children elements.
     *
     * @param {string} label - The label for the toggle button.
     * @returns {React.ReactNode | null} The toggle button element or null if no children are present.
     */
    renderToggleButton = (label) => {
        if (!this.props.children) return null

        return (
            <button
                hidden
                type='button'
                className='sui-layout-sidebar-toggle'
                onClick={this.toggleSidebar}
            >
                {label}
            </button>
        )
    }

    /**
     * Renders the LayoutSidebar component.
     *
     * @returns {React.ReactNode} The rendered sidebar component.
     */
    render() {
        const { className, children } = this.props
        const { isSidebarToggled } = this.state

        const classes = appendClassName(
            className,
            isSidebarToggled ? `${className}--toggled` : ''
        )

        return (
            <>
                {this.renderToggleButton('Show Filters')}
                <div className={classes}>
                    {this.renderToggleButton('Save Filters')}
                    {children}
                </div>
            </>
        )
    }
}
