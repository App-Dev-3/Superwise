import Papa from 'papaparse';

type AcceptedData = string | number;

interface CsvRecord {
    [key: string]: AcceptedData;
}

export function exportCsv(data: CsvRecord[], filename = 'export.csv'): void {
    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
