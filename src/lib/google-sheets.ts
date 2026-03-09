import { google } from 'googleapis';
import type { ReportRow } from './data';

const getAuth = () => {
  const credentialsString = process.env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS;
  if (!credentialsString) {
    throw new Error('GOOGLE_SERVICE_ACCOUNT_CREDENTIALS environment variable not set.');
  }
  try {
    const credentials = JSON.parse(credentialsString);
    return new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });
  } catch (error) {
    console.error('Failed to parse GOOGLE_SERVICE_ACCOUNT_CREDENTIALS:', error);
    throw new Error("Invalid format for GOOGLE_SERVICE_ACCOUNT_CREDENTIALS. Ensure it's a single line with escaped newlines.");
  }
};

const getSheetsClient = () => {
  const auth = getAuth();
  return google.sheets({ version: 'v4', auth });
};

export const getMainSheetData = async (): Promise<ReportRow[]> => {
  try {
    const sheets = getSheetsClient();
    const spreadsheetId = process.env.MAIN_SHEET_ID;
    if (!spreadsheetId) {
      console.error('MAIN_SHEET_ID is not set in environment variables.');
      throw new Error('MAIN_SHEET_ID is not set in environment variables.');
    }
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Sheet1',
    });

    const values = response.data.values;
    if (!values || values.length < 2) {
      return [];
    }

    const headers = values[0].map((h) => String(h).toLowerCase().replace(/\s+/g, ''));
    const findHeaderIndex = (possibleNames: string[]) => {
      for (const name of possibleNames) {
        const index = headers.indexOf(name.replace(/\s+/g, ''));
        if (index !== -1) return index;
      }
      return -1;
    };

    const publisherIndex = findHeaderIndex(['publisher']);
    const networkIdIndex = findHeaderIndex(['network id', 'networkid']);
    const totalRevenueIndex = findHeaderIndex(['total revenue', 'totalrevenue']);
    const commissionIndex = findHeaderIndex([
      'parent to parent commission',
      'parenttoparentcommission',
      'parenttoparent',
    ]);

    if (
      publisherIndex === -1 ||
      networkIdIndex === -1 ||
      totalRevenueIndex === -1 ||
      commissionIndex === -1
    ) {
      console.error('Main sheet is missing one or more required headers.');
      throw new Error(
        'Main sheet is missing one or more required headers (Publisher, Network ID, Total Revenue, Parent to Parent Commission).'
      );
    }

    return values
      .slice(1)
      .map((row): ReportRow | null => {
        const totalRevenue = parseFloat(
          String(row[totalRevenueIndex]).replace(/[^0-9.-]+/g, '')
        );
        const parentToParentCommission = parseFloat(
          String(row[commissionIndex]).replace(/[^0-9.-]+/g, '')
        );
        if (isNaN(totalRevenue) || isNaN(parentToParentCommission)) return null;
        return {
          publisher: row[publisherIndex] ?? '',
          networkId: row[networkIdIndex] ?? '',
          totalRevenue,
          parentToParentCommission,
        };
      })
      .filter((row): row is ReportRow => row !== null);
  } catch (error) {
    console.error('Error fetching main sheet data:', error);
    throw error;
  }
};
