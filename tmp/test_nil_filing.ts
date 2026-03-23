import { fileNilReturn } from '../lib/kra-client';

async function testFiling() {
    console.log('--- KRA Nil Return Filing Test (Sandbox) ---');
    
    // Using a dummy PIN for sandbox testing
    const testData = {
        TaxpayerPIN: 'A000000000Z',
        ObligationCode: '001',
        Month: '03',
        Year: '2026'
    };

    try {
        console.log('Calling fileNilReturn...');
        const result = await fileNilReturn(testData);
        console.log('✅ Filing Success:', JSON.stringify(result, null, 2));
    } catch (error) {
        console.error('❌ Filing Failed:', error);
    }
}

testFiling();
