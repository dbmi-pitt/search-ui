// Aggregations
export type Aggregation = TermAggregation | HistogramAggregation

export type TermAggregation = {
    type: 'term'
    isActive?: boolean | ((filters: Filter[]) => boolean)
    size?: number
}

export type HistogramAggregation = {
    type: 'histogram'
    isActive?: boolean | ((filters: Filter[]) => boolean)
    interval: number
}

export type AggregationBucket = {
    value: string
    count: number
}

// Filters
export type Filter = TermFilter | ExistsFilter | RangeFilter | HistogramFilter

export type TermFilter = {
    type: 'term'
    field: string
    value: string
}

export type ExistsFilter = {
    type: 'exists'
    field: string
}

export type RangeFilter = {
    type: 'range'
    field: string
    gte?: number
    lte?: number
}

export type HistogramFilter = {
    type: 'histogram'
    field: string
    gte?: number
    lte?: number
}

// Facets
export type FacetType = 'term' | 'range' | 'histogram'

export type FacetConfig = {
    label: string
    name: string
    field: string
    type: FacetType
    aggregation?: Aggregation
    transformFunction?: (value: string) => string
    isVisible?:
        | boolean
        | ((
              filters: Record<string, Filter>,
              aggregations: Record<string, AggregationBucket[]>
          ) => boolean)
    isOptionVisible?:
        | boolean
        | ((
              option: AggregationBucket,
              filters: Record<string, Filter>,
              aggregations: Record<string, AggregationBucket[]>
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

export type Config = {
    facets?: FacetConfig[]
    include?: Filter[]
    exclude?: Filter[]
    sourceFields?: string[]
    trackTotalHits?: boolean
    connection: ConnectionConfig
    initial?: {
        filters?: Record<string, Filter>
        sort?: SortConfig
        pageNumber?: number
        pageSize?: number
    }
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
}
