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
  const pki: typeof pki;
  const asn1: any;
  const pkcs12: any;
  const util: any;
}

declare module 'node-forge' {
  export = nodeForge;
}
