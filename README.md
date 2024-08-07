# Search UI

## SearchUIContext

Search UI utilizes a React context to expose certain Elastic Search/Open Search parameters to the React application. To use the `SearchUIContext`, wrap any components that use the context in the `SearchUIProvider`. Components within the `SearchUIProvider` can use the `useSearchUIContext` hook to get access to the states and functions within the context.

## Development

Search UI uses [JSDoc](https://jsdoc.app/) for typing and [Prettier](https://prettier.io/) for code formatting. A npm script is available to format all project files using Prettier `npm run format`.
