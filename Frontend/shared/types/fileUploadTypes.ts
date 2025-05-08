interface SimilarityEntry {
    field1: string;
    field2: string;
    similarity_score: number;
}

export interface TagSimilarityData {
    tags: string[];
    similarities: SimilarityEntry[];
}

export interface CsvRow {
    [header: string]: string;
}

export type ParsedCsv = CsvRow[];

export type Base64Image = string
