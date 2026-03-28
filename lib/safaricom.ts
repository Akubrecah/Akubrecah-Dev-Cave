import { Buffer } from 'buffer';

const getEnv = (key: string, defaultValue: string = ''): string => {
  const value = process.env[key] || defaultValue;
  return value.trim().replace(/^["']|["']$/g, '');
};

export type TransactionType = 'CustomerPayBillOnline' | 'CustomerBuyGoodsOnline';

export interface STKPushParams {
  phoneNumber: string;
  amount: number;
  accountReference: string;
  transactionDesc: string;
  transactionType?: TransactionType;
}

export class SafaricomService {
  private get BASE_URL() {
    return getEnv('SAFARICOM_ENV', 'sandbox') === 'sandbox' 
      ? 'https://sandbox.safaricom.co.ke'
      : 'https://api.safaricom.co.ke';
  }

  private get CONSUMER_KEY() { return getEnv('SAFARICOM_CONSUMER_KEY'); }
  private get CONSUMER_SECRET() { return getEnv('SAFARICOM_CONSUMER_SECRET'); }
  private get BUSINESS_SHORTCODE() { return getEnv('SAFARICOM_BUSINESS_SHORTCODE', '174379'); }
  private get PASSKEY() { return getEnv('SAFARICOM_PASSKEY'); }
  private get CALLBACK_URL() { return getEnv('SAFARICOM_CALLBACK_URL'); }

  private static instance: SafaricomService;
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  private constructor() {}

  public static getInstance(): SafaricomService {
    if (!SafaricomService.instance) {
      SafaricomService.instance = new SafaricomService();
    }
    return SafaricomService.instance;
  }

  /**
   * Generates or returns a cached OAuth access token
   */
  async getAccessToken(): Promise<string> {
    const now = Date.now();
    if (this.accessToken && this.tokenExpiry > now) {
      return this.accessToken;
    }

    const auth = Buffer.from(`${this.CONSUMER_KEY}:${this.CONSUMER_SECRET}`).toString('base64');
    
    try {
      const response = await fetch(`${this.BASE_URL}/oauth/v1/generate?grant_type=client_credentials`, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Accept': 'application/json',
          'Cache-Control': 'no-cache',
        },
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Safaricom OAuth Failed (${response.status} ${response.statusText}): ${errorData}`);
      }

      const data = await response.json();
      this.accessToken = data.access_token;
      // Buffer by 60 seconds
      this.tokenExpiry = now + (parseInt(data.expires_in) * 1000) - 60000;
      return this.accessToken!;
    } catch (error) {
      console.error('Safaricom OAuth Error:', error);
      throw error;
    }
  }

  /**
   * Initiates an M-Pesa Express (STK Push)
   */
  async stkPush(params: STKPushParams) {
    const token = await this.getAccessToken();
    const timestamp = this.getTimestamp();
    const password = Buffer.from(`${this.BUSINESS_SHORTCODE}${this.PASSKEY}${timestamp}`).toString('base64');

    const body = {
      BusinessShortCode: this.BUSINESS_SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: params.transactionType || 'CustomerPayBillOnline',
      Amount: Math.round(params.amount),
      PartyA: params.phoneNumber,
      PartyB: this.BUSINESS_SHORTCODE,
      PhoneNumber: params.phoneNumber,
      CallBackURL: this.CALLBACK_URL,
      AccountReference: params.accountReference,
      TransactionDesc: params.transactionDesc
    };

    try {
      const response = await fetch(`${this.BASE_URL}/mpesa/stkpush/v1/processrequest`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Safaricom STK Push Error:', error);
      throw error;
    }
  }

  /**
   * Queries the status of an M-Pesa transaction
   */
  async queryTransactionStatus(checkoutRequestId: string) {
    const token = await this.getAccessToken();
    const timestamp = this.getTimestamp();
    const password = Buffer.from(`${this.BUSINESS_SHORTCODE}${this.PASSKEY}${timestamp}`).toString('base64');

    const body = {
      BusinessShortCode: this.BUSINESS_SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      CheckoutRequestID: checkoutRequestId
    };

    try {
      const response = await fetch(`${this.BASE_URL}/mpesa/stkpushquery/v1/query`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      return await response.json();
    } catch (error) {
      console.error('Safaricom Query Error:', error);
      throw error;
    }
  }

  /**
   * Queries Account Balance
   */
  async getAccountBalance(initiator: string, securityCredential: string, commandId: string = 'AccountBalance') {
    const token = await this.getAccessToken();
    
    const body = {
      Initiator: initiator,
      SecurityCredential: securityCredential,
      CommandID: commandId,
      PartyA: this.BUSINESS_SHORTCODE,
      IdentifierType: '4',
      Remarks: 'Balance Query',
      QueueTimeOutURL: this.CALLBACK_URL,
      ResultURL: this.CALLBACK_URL,
    };

    try {
      const response = await fetch(`${this.BASE_URL}/mpesa/accountbalance/v1/query`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      return await response.json();
    } catch (error) {
      console.error('Safaricom Balance Error:', error);
      throw error;
    }
  }

  /**
   * IoT SIM Activation
   */
  async activateSIM(msisdn: string, vpnGroup: string, username: string) {
    const token = await this.getAccessToken();
    
    const body = {
      msisdn,
      vpnGroup,
      username
    };

    try {
      const response = await fetch(`${this.BASE_URL}/simportal/v1/simactivation`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      return await response.json();
    } catch (error) {
      console.error('Safaricom SIM Activation Error:', error);
      throw error;
    }
  }

  private getTimestamp(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}${month}${day}${hours}${minutes}${seconds}`;
  }
}

export const safaricom = SafaricomService.getInstance();
