// Aggregations
export type AggregationConfig =
    | TermAggregationConfig
    | HistogramAggregationConfig

export type IsActiveFunction = (
    filters: Record<string, Filter>,
    authenticationState: AuthenticationState
) => boolean

export type TermAggregationConfig = {
    type: 'term'
    size?: number
    isActive?: boolean | IsActiveFunction | IsActiveFunction[]
}

export type HistogramAggregationConfig = {
    type: 'histogram'
    interval: number
    isActive?: boolean | IsActiveFunction | IsActiveFunction[]
}

export type AggregationBucket = {
    value: string
    count: number
}

// Authentication
export type AuthenticationState = {
    isAuthenticated: boolean
    isAuthorized: boolean
    isAdmin: boolean
}

// Filters
export type Filter = TermFilter | ExistsFilter | RangeFilter | HistogramFilter

export type TermFilter = {
    type: 'term'
    name: string
    field: string
    values: string[]
}

export type ExistsFilter = {
    type: 'exists'
    name: string
    field: string
}

export type RangeFilter = {
    type: 'range'
    name: string
    field: string
    gte?: number
    lte?: number
}

export type HistogramFilter = {
    type: 'histogram'
    name: string
    field: string
    gte?: number
    lte?: number
}

// Facets
export type FacetConfig =
    | TermFacetConfig
    | DateRangeFacetConfig
    | HistogramFacetConfig

export type TermFacetConfig = {
    label: string
    name: string
    field: string
    type: 'term'
    aggregation?: TermAggregationConfig
    transformFunction?: (value: string) => string
    onExpandedStateChange?: (expanded: boolean) => void
    isVisible?:
        | boolean
        | ((
              filters: Record<string, Filter>,
              aggregations: Record<string, AggregationBucket[]>,
              authenticationState: AuthenticationState
          ) => boolean)
    isOptionVisible?:
        | boolean
        | ((
              option: AggregationBucket,
              filters: Record<string, Filter>,
              aggregations: Record<string, AggregationBucket[]>,
              authenticationState: AuthenticationState
          ) => boolean)
}

export type DateRangeFacetConfig = {
    label: string
    name: string
    field: string
    type: 'daterange'
    onExpandedStateChange?: (expanded: boolean) => void
    isVisible?:
        | boolean
        | ((
              filters: Record<string, Filter>,
              aggregations: Record<string, AggregationBucket[]>,
              authenticationState: AuthenticationState
          ) => boolean)
}

export type HistogramFacetConfig = {
    label: string
    name: string
    field: string
    type: 'histogram'
    aggregation?: HistogramAggregationConfig
    onExpandedStateChange?: (expanded: boolean) => void
    isVisible?:
        | boolean
        | ((
              filters: Record<string, Filter>,
              aggregations: Record<string, AggregationBucket[]>,
              authenticationState: AuthenticationState
          ) => boolean)
}

// Sort
export type SortConfig = {
    field: string
    order: 'asc' | 'desc'
}

export type ConnectionConfig = {
    url: string
    token?: (() => string | undefined) | string
}

export type SearchUICallbackState = {
    filters: Record<string, Filter>
    sort: SortConfig | undefined
    pageNumber: number
    pageSize: number
    searchTerm: string | undefined
}

export type Config = {
    facets?: FacetConfig[]
    include?: Filter[]
    exclude?: Filter[]
    searchFields?: string[]
    sourceFields?: string[]
    trackTotalHits?: boolean
    trackUrlState?: boolean
    connection: ConnectionConfig
    initial?: {
        filters?: Record<string, Filter>
        sort?: SortConfig
        pageNumber?: number
        pageSize?: number
    }
    pageSizeOptions?: number[]
    onStateChange?: (state: SearchUICallbackState) => void
}

// Response
export type SearchResponse = {
    aggregations: Record<string, AggregationResponse>
    hits: {
        hits: Record<string, any>[]
        max_score: number | null
        total: { relation: string; value: number }
    }
    timed_out: boolean
    took: number
}

export type AggregationResponse = {
    buckets: BucketResponse[]
    doc_count_error_upper_bound: number
    sum_other_doc_count: number
}

export type BucketResponse = {
    doc_count: number
    key: string
}

export type SearchParams = {
    sort: SortConfig | undefined
    from: number
    size: number
    searchTerm: string | undefined
}
