declare namespace nodeForge {
  namespace pki {
    interface Certificate {
      [key: string]: any;
      subject: {
        getField(name: string): any;
      };
      issuer: {
        getField(name: string): any;
      };
      validity: {
        notBefore: Date;
        notAfter: Date;
      };
      serialNumber: string;
      isIssuer(cert: Certificate): boolean;
      siginfo?: {
        algorithmOid: string;
      };
      signatureOid?: string;
    }
    interface PrivateKey {
      [key: string]: any;
    }
    const oids: any;
    function certificateFromPem(pem: string): Certificate;
    function decryptRsaPrivateKey(pem: string, password?: string): PrivateKey;
    function privateKeyFromPem(pem: string): PrivateKey;
    function certificateFromAsn1(asn1: any): Certificate;
  }
  namespace asn1 {
    function fromDer(der: string | Uint8Array): any;
    function toDer(asn1: any): any;
  }
  namespace pkcs12 {
    function pkcs12FromAsn1(asn1: any, password?: string): any;
    function toPkcs12Asn1(key: any, certs: any[], password: string, options?: any): any;
  }
  namespace pkcs7 {
    function messageFromAsn1(asn1: any): any;
  }
  namespace util {
    function createBuffer(data?: any, encoding?: string): any;
  }
  const pki: typeof pki;
  const asn1: typeof asn1;
  const pkcs12: typeof pkcs12;
  const pkcs7: typeof pkcs7;
  const util: typeof util;
}

declare module 'node-forge' {
  export = nodeForge;
}
