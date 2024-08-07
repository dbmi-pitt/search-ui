import React from 'react'
import { appendClassName } from '../util/view'
import LayoutSidebar from './LayoutSidebar'

/**
 * @typedef {Object} LayoutProps
 * @property {string} [className] - Additional class names to apply to the layout.
 * @property {React.ReactNode} [children] - Child elements to render within the layout.
 * @property {React.ReactNode} [header] - Content to render in the header section.
 * @property {React.ReactNode} [bodyContent] - Main content to render in the body section.
 * @property {React.ReactNode} [bodyFooter] - Content to render in the footer of the body section.
 * @property {React.ReactNode} [bodyHeader] - Content to render in the header of the body section.
 * @property {React.ReactNode} [sideContent] - Content to render in the sidebar section.
 */

/**
 * Layout component to structure the main layout of the application.
 *
 * @param {LayoutProps} props - Properties to configure the layout.
 * @returns {JSX.Element} The rendered layout component.
 */
export default function Layout({
    className,
    children,
    header,
    bodyContent,
    bodyFooter,
    bodyHeader,
    sideContent
}) {
    return (
        <div className={appendClassName('sui-layout', className)}>
            <div className='sui-layout-header'>
                <div className='sui-layout-header__inner'>{header}</div>
            </div>
            <div className='sui-layout-body'>
                <div className='sui-layout-body__inner'>
                    <LayoutSidebar className='sui-layout-sidebar'>
                        {sideContent}
                    </LayoutSidebar>
                    <div className='sui-layout-main'>
                        <div className='sui-layout-main-header'>
                            <div className='sui-layout-main-header__inner'>
                                {bodyHeader}
                            </div>
                        </div>
                        <div className='sui-layout-main-body'>
                            {children || bodyContent}
                        </div>
                        <div className='sui-layout-main-footer'>
                            {bodyFooter}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
