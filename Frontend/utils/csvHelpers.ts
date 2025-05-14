import Papa from 'papaparse';

type AcceptedData = string ;

export interface csvMatchExportRow {
    'Supervisor Last Name': AcceptedData;
    'Supervisor First Name': AcceptedData;
    'Supervisor Email': AcceptedData;
    'Student Last Name': AcceptedData;
    'Student First Name': AcceptedData;
    'Student Email': AcceptedData;
}

// The default delimiter for German/Austrian locale is semicolon. If opened in a german excel, it will be formatted correctly
export function exportCsv(data: csvMatchExportRow[], filename = 'export.csv', delimiter = ';'): void {
    const config = {
        columns: ['Supervisor Last Name', 'Supervisor First Name', 'Supervisor Email', 'Student Last Name', 'Student First Name', 'Student Email',],
        delimiter: delimiter,
    }

    const csv = Papa.unparse(data, config);
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
