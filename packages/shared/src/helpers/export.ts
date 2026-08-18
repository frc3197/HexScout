function escapeCSVField(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  const stringValue = String(value);

  const hasQuotes = stringValue.includes('"');
  const hasCommas = stringValue.includes(',');
  const hasNewlines = stringValue.includes('\n') || stringValue.includes('\r');

  if (hasQuotes || hasCommas || hasNewlines) {
    const escapedQuotes = hasQuotes ? stringValue.replace(/"/g, '""') : stringValue;
    return `"${escapedQuotes}"`;
  }

  return stringValue;
}

export function convertDrizzleToCSV<T extends Record<string, unknown>>(
  data: T[],
  explicitHeaders?: (keyof T & string)[]
): string {
  if (!data || data.length === 0) {
    return '';
  }

  const headers = explicitHeaders ?? (Object.keys(data[0]) as (keyof T & string)[]);

  const csvRows: string[] = [];

  csvRows.push(headers.map(header => escapeCSVField(header)).join(','));

  for (const row of data) {
    const rowValues = headers.map(headerKey => {
      const rawValue = row[headerKey];
      return escapeCSVField(rawValue);
    });

    csvRows.push(rowValues.join(','));
  }

  return csvRows.join('\n');
}
